from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q

from .models import Project, ProjectMember, Board, BoardList, Task, Comment, Attachment
from .serializers import (
    ProjectSerializer,
    ProjectDetailSerializer,
    BoardSerializer,
    BoardListSerializer,
    TaskSerializer,
    CommentSerializer,
    AttachmentSerializer,
)
from .permissions import IsProjectMember, CanEditProject


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        # Filter by organization from middleware
        if not self.request.organization:
            return Project.objects.none()
        
        return Project.objects.filter(
            organization=self.request.organization
        ).prefetch_related('members', 'owner')
    
    @action(detail=True, methods=['post'], permission_classes=[CanEditProject])
    def add_member(self, request, pk=None):
        """Add a member to the project"""
        project = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role', ProjectMember.Role.EDITOR)
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user is in organization
        if not request.organization.members.filter(id=user_id).exists():
            return Response(
                {'error': 'User is not a member of this organization'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member, created = ProjectMember.objects.get_or_create(
            project=project,
            user_id=user_id,
            defaults={'role': role}
        )
        
        if not created:
            return Response(
                {'error': 'User is already a member of this project'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({'message': 'Member added successfully'}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)',
            permission_classes=[CanEditProject])
    def remove_member(self, request, pk=None, user_id=None):
        """Remove a member from the project"""
        project = self.get_object()
        
        member = get_object_or_404(ProjectMember, project=project, user_id=user_id)
        
        if member.role == ProjectMember.Role.OWNER:
            return Response(
                {'error': 'Cannot remove project owner'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response({'message': 'Member removed successfully'}, status=status.HTTP_200_OK)


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Board.objects.filter(project_id=project_id).prefetch_related('lists__tasks')
        return Board.objects.none()


class BoardListViewSet(viewsets.ModelViewSet):
    serializer_class = BoardListSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        board_id = self.request.query_params.get('board')
        if board_id:
            return BoardList.objects.filter(board_id=board_id).prefetch_related('tasks')
        return BoardList.objects.none()
    
    @action(detail=True, methods=['patch'])
    def reorder(self, request, pk=None):
        """Reorder a list"""
        board_list = self.get_object()
        new_position = request.data.get('position')
        
        if new_position is None:
            return Response({'error': 'position is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        board_list.position = new_position
        board_list.save()
        
        return Response(self.get_serializer(board_list).data)


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        queryset = Task.objects.all()
        
        project_id = self.request.query_params.get('project')
        board_list_id = self.request.query_params.get('board_list')
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if board_list_id:
            queryset = queryset.filter(board_list_id=board_list_id)
        
        return queryset.prefetch_related('assignees', 'created_by')
    
    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        """Move a task to a different list and/or position"""
        task = self.get_object()
        
        new_list_id = request.data.get('board_list_id')
        new_position = request.data.get('position')
        
        if new_list_id:
            task.board_list_id = new_list_id
        if new_position is not None:
            task.position = new_position
        
        task.save()
        
        return Response(self.get_serializer(task).data)


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            # Only get top-level comments (replies are nested in serializer)
            return Comment.objects.filter(task_id=task_id, parent=None)
        return Comment.objects.none()


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return Attachment.objects.filter(task_id=task_id)
        return Attachment.objects.none()