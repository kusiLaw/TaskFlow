from rest_framework import serializers
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta
from .models import Organization, OrganizationMember, Invitation
from apps.accounts.serializers import UserSerializer
import uuid



class OrganizationMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = OrganizationMember
        fields = ['id', 'user', 'role', 'joined_at']


class OrganizationSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Organization
        fields = [
            'id', 'name', 'slug', 'description', 'avatar', 'owner',
            'created_at', 'updated_at', 'member_count', 'user_role'
        ]
        read_only_fields = ['id', 'slug', 'owner', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = OrganizationMember.objects.filter(
                organization=obj,
                user=request.user
            ).first()
            return membership.role if membership else None
        return None
    
    # def create(self, validated_data):
    #     user = self.context['request'].user
        
    #     # Generate unique slug
    #     base_slug = slugify(validated_data['name'])
    #     slug = base_slug
    #     counter = 1
    #     while Organization.objects.filter(slug=slug).exists():
    #         slug = f"{base_slug}-{counter}"
    #         counter += 1
        
    #     validated_data['slug'] = slug
    #     validated_data['owner'] = user
        
    #     organization = Organization.objects.create(**validated_data)
        
    #     # Add owner as member
    #     OrganizationMember.objects.create(
    #         organization=organization,
    #         user=user,
    #         role=OrganizationMember.Role.OWNER
    #     )
        
    #     return organization


class OrganizationDetailSerializer(OrganizationSerializer):
    members = OrganizationMemberSerializer(source='organizationmember_set', many=True, read_only=True)
    
    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + ['members']

class InvitationSerializer(serializers.ModelSerializer):
    invited_by = UserSerializer(read_only=True)
    organization_name = serializers.CharField(
        source='organization.name', read_only=True
    )
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = Invitation
        fields = [
            'id', 'email', 'role', 'status', 'token',
            'invited_by', 'organization_name',
            'created_at', 'expires_at', 'is_expired'
        ]
        read_only_fields = ['id', 'token', 'status', 'created_at', 'expires_at']

    def get_is_expired(self, obj):
        return not obj.is_valid()

    def validate_email(self, value):
        return value.lower().strip()

    def create(self, validated_data):
        validated_data['token'] = str(uuid.uuid4())
        validated_data['expires_at'] = timezone.now() + timedelta(days=7)
        return super().create(validated_data)

class AcceptInvitationSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    
    def validate_token(self, value):
        try:
            invitation = Invitation.objects.get(token=value)
            if not invitation.is_valid():
                raise serializers.ValidationError("This invitation has expired or is no longer valid.")
        except Invitation.DoesNotExist:
            raise serializers.ValidationError("Invalid invitation token.")
        
        return value

class UpdateMemberRoleSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=OrganizationMember.Role.choices)
    