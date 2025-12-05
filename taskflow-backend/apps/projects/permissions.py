from rest_framework import permissions
from .models import ProjectMember, Project, Task


class IsProjectMember(permissions.BasePermission):
    """
    Check if user is a member of the project
    """
    def has_object_permission(self, request, view, obj):
        # Determine the project based on object type
        if isinstance(obj, Project):
            project = obj
        elif hasattr(obj, 'project'):
            project = obj.project
        elif hasattr(obj, 'task'):
            project = obj.task.project
        else:
            return False
        
        return ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).exists()


class CanEditProject(permissions.BasePermission):
    """
    Check if user can edit the project (owner or editor)
    """
    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Project):
            project = obj
        else:
            return False
        
        membership = ProjectMember.objects.filter(
            project=project,
            user=request.user
        ).first()
        
        if not membership:
            return False
        
        return membership.role in [
            ProjectMember.Role.OWNER,
            ProjectMember.Role.EDITOR
        ]