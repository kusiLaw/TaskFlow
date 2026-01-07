from django.db import models
from django.contrib.auth import get_user_model
from django.utils.text import slugify
import uuid

User = get_user_model()


class Organization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='organizations/', null=True, blank=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='owned_organizations'
    )
    members = models.ManyToManyField(
        User, through='OrganizationMember', related_name='organizations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'organizations'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self.generate_unique_slug()
        super().save(*args, **kwargs)

    def generate_unique_slug(self):
        """Generate a unique slug from the organization name"""
        base_slug = slugify(self.name)
        if not base_slug:
            base_slug = 'organization'
        
        slug = base_slug
        counter = 1
        
        # Keep trying until we find a unique slug
        while Organization.objects.filter(slug=slug).exists():
            slug = f'{base_slug}-{counter}'
            counter += 1
        
        return slug


class OrganizationMember(models.Model):
    class Role(models.TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='memberships'
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'organization_members'
        unique_together = [['organization', 'user']]
        ordering = ['joined_at']

    def __str__(self):
        return f'{self.user.email} - {self.organization.name} ({self.role})'


class Invitation(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        EXPIRED = 'expired', 'Expired'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name='invitations'
    )
    email = models.EmailField()
    role = models.CharField(
        max_length=20,
        choices=OrganizationMember.Role.choices,
        default=OrganizationMember.Role.MEMBER
    )
    token = models.CharField(max_length=100, unique=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    invited_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'invitations'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.email} -> {self.organization.name} ({self.status})'

    def is_valid(self):
        from django.utils import timezone
        return (
            self.status == self.Status.PENDING and
            self.expires_at > timezone.now()
        )