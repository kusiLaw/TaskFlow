from rest_framework import permissions
from .models import OrganizationMember


class IsOrganizationMember(permissions.BasePermission):
    """
    Check if user is a member of the organization
    """
    def has_object_permission(self, request, view, obj):
        return OrganizationMember.objects.filter(
            organization=obj,
            user=request.user
        ).exists()


class IsOrganizationAdmin(permissions.BasePermission):
    """
    Check if user is an admin or owner of the organization
    """
    def has_object_permission(self, request, view, obj):
        membership = OrganizationMember.objects.filter(
            organization=obj,
            user=request.user
        ).first()
        
        if not membership:
            return False
        
        return membership.role in [
            OrganizationMember.Role.OWNER,
            OrganizationMember.Role.ADMIN
        ]