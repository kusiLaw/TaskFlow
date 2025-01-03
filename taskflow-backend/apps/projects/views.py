from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
from django.core.serializers.json import DjangoJSONEncoder
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Project,Label, Activity ,ProjectMember, Board, BoardList, Task, Comment, Attachment

from .serializers import (
    ProjectSerializer,
    ProjectDetailSerializer,
    BoardSerializer,
    BoardListSerializer,
    TaskSerializer,
    CommentSerializer,
    AttachmentSerializer,
    LabelSerializer,
    ActivitySerializer,
)
from .permissions import IsProjectMember, CanEditProject
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import boto3
from botocore.exceptions import ClientError
import uuid
from rest_framework import parsers
from .utils import log_activity
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_presigned_upload_url(request):
    """
    Generate a pre-signed URL for direct upload to S3
    This is more efficient than uploading through Django
    """
    filename = request.data.get('filename')
    content_type = request.data.get('content_type')
    
    if not filename or not content_type:
        return Response(
            {'error': 'filename and content_type are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate unique filename
    file_extension = filename.split('.')[-1] if '.' in filename else ''
    unique_filename = f'attachments/{uuid.uuid4()}.{file_extension}'
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )
        
        # Generate pre-signed POST URL
        presigned_post = s3_client.generate_presigned_post(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Key=unique_filename,
            Fields={'Content-Type': content_type},
            Conditions=[
                {'Content-Type': content_type},
                ['content-length-range', 0, 10485760]  # Max 10MB
            ],
            ExpiresIn=3600  # 1 hour
        )
        
        return Response({
            'url': presigned_post['url'],
            'fields': presigned_post['fields'],
            'file_key': unique_filename,
        })
    except ClientError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def serialize_for_broadcast(data):
    """
    Convert data to JSON-safe format.
    Handles UUID, Decimal, datetime, and other non-serializable types.
    """
    return json.loads(json.dumps(data, cls=DjangoJSONEncoder))

def broadcast_task_update(project_id, task_data, action):
    """Broadcast task updates via WebSocket"""
    try:
        channel_layer = get_channel_layer()
        if not channel_layer:
            return

        # Convert all data to JSON-safe format (fixes UUID serialization)
        safe_data = serialize_for_broadcast(dict(task_data))

        async_to_sync(channel_layer.group_send)(
            f'project_{project_id}',
            {
                'type': 'task_update',
                'task': safe_data,
                'action': action,
                'user_id': safe_data.get('created_by', {}).get('id', '') if isinstance(safe_data.get('created_by'), dict) else '',
            }
        )
    except Exception as e:
        # Don't let broadcast failure break the API response
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Broadcast error: {e}")

class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Disable pagination for projects
    
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

    def create(self, request, *args, **kwargs):
        logger.info(f"Create project request data: {request.data}")
        logger.info(f"Request organization: {request.organization}")
        
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            logger.error(f"Project creation error: {str(e)}")
            logger.error(f"Serializer errors: {serializer.errors if 'serializer' in locals() else 'N/A'}")
            raise

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
    pagination_class = None

    def get_queryset(self):
        queryset = Task.objects.all()
        project_id = self.request.query_params.get('project')
        board_list_id = self.request.query_params.get('board_list')
        search = self.request.query_params.get('search')
        priority = self.request.query_params.get('priority')
        assignee = self.request.query_params.get('assignee')
        overdue = self.request.query_params.get('overdue')

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if board_list_id:
            queryset = queryset.filter(board_list_id=board_list_id)
        if search:
            from django.db.models import Q
            queryset = queryset.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )
        if priority:
            queryset = queryset.filter(priority=priority)
        if assignee:
            queryset = queryset.filter(assignees__id=assignee)
        if overdue and overdue.lower() == 'true':
            from django.utils import timezone
            queryset = queryset.filter(
                due_date__lt=timezone.now(),
                completed_at__isnull=True
            )

        return queryset.prefetch_related(
            'assignees', 'labels'
        ).select_related('created_by', 'board_list', 'project')

    def perform_create(self, serializer):
        task = serializer.save()

        # Log activity
        log_activity(
            project=task.project,
            user=self.request.user,
            action=Activity.Action.TASK_CREATED,
            description=f'created task',
            task=task
        )

        # Broadcast
        try:
            broadcast_task_update(
                str(task.project_id),
                self.get_serializer(task).data,
                'created'
            )
        except Exception as e:
            pass

    def perform_update(self, serializer):
        old_title = serializer.instance.title
        task = serializer.save()

        # Log activity
        log_activity(
            project=task.project,
            user=self.request.user,
            action=Activity.Action.TASK_UPDATED,
            description=f'updated task',
            task=task
        )

        # Broadcast
        try:
            broadcast_task_update(
                str(task.project_id),
                self.get_serializer(task).data,
                'updated'
            )
        except Exception as e:
            pass

    def perform_destroy(self, instance):
        project = instance.project
        task_id = str(instance.id)
        task_title = instance.title

        # Log activity before deletion
        log_activity(
            project=project,
            user=self.request.user,
            action=Activity.Action.TASK_DELETED,
            description=f'deleted task "{task_title}"',
        )

        instance.delete()

        # Broadcast deletion
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                async_to_sync(channel_layer.group_send)(
                    f'project_{project.id}',
                    {
                        'type': 'task_update',
                        'task': {'id': task_id},
                        'action': 'deleted',
                        'user_id': str(self.request.user.id),
                    }
                )
        except Exception:
            pass

    @action(detail=True, methods=['patch'])
    def move(self, request, pk=None):
        task = self.get_object()
        old_list_name = task.board_list.name

        new_list_id = request.data.get('board_list_id')
        new_position = request.data.get('position')

        if new_list_id:
            task.board_list_id = new_list_id
        if new_position is not None:
            task.position = int(new_position)

        task.save()

        # Log activity if list changed
        if new_list_id and str(task.board_list_id) == new_list_id:
            log_activity(
                project=task.project,
                user=request.user,
                action=Activity.Action.TASK_MOVED,
                description=f'moved task from "{old_list_name}" to "{task.board_list.name}"',
                task=task
            )

        serializer = self.get_serializer(task)

        # Broadcast
        try:
            broadcast_task_update(
                str(task.project_id),
                serializer.data,
                'moved'
            )
        except Exception as e:
            pass

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data})

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
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    
    def get_queryset(self):
        task_id = self.request.query_params.get('task')
        if task_id:
            return Attachment.objects.filter(task_id=task_id).select_related('uploaded_by')
        return Attachment.objects.none()
    
    def create(self, request, *args, **kwargs):
        # Support both direct file upload and S3 reference
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        attachment = serializer.save()
        
        # Broadcast attachment added via WebSocket
        task = attachment.task
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'project_{task.project_id}',
            {
                'type': 'attachment_added',
                'attachment': self.get_serializer(attachment).data,
                'task_id': str(task.id),
            }
        )
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class LabelViewSet(viewsets.ModelViewSet):
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    
    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        if project_id:
            return Label.objects.filter(project_id=project_id)
        return Label.objects.none()

class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        project_id = self.request.query_params.get('project')
        task_id = self.request.query_params.get('task')

        if not project_id and not task_id:
            return Activity.objects.none()

        queryset = Activity.objects.all()

        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        return queryset.select_related('user', 'task').order_by('-created_at')[:50]