from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Project, ProjectMember, Board, Activity ,BoardList, Task,Label, Comment, Attachment
from apps.accounts.serializers import UserSerializer

User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectMember
        fields = ['id', 'user', 'role', 'joined_at']

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'color', 'status', 'owner', 
                  'created_at', 'updated_at', 'member_count', 'task_count', 'user_role']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.count()
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            membership = ProjectMember.objects.filter(
                project=obj,
                user=request.user
            ).first()
            return membership.role if membership else None
        return None
    
    def create(self, validated_data):
        request = self.context['request']
        organization = request.organization
        
        # Validate organization exists
        if not organization:
            raise serializers.ValidationError({
                'organization': 'Organization context is required. Please select an organization.'
            })
        
        validated_data['organization'] = organization
        validated_data['owner'] = request.user
        
        # Create project
        project = Project.objects.create(**validated_data)
        
        # Add owner as member
        ProjectMember.objects.create(
            project=project,
            user=request.user,
            role=ProjectMember.Role.OWNER
        )
        
        # Create default board with default lists
        board = Board.objects.create(
            project=project,
            name='Main Board',
            position=0
        )
        
        default_lists = ['To Do', 'In Progress', 'In Review', 'Done']
        for idx, list_name in enumerate(default_lists):
            BoardList.objects.create(
                board=board,
                name=list_name,
                position=idx
            )
        
        return project

class ProjectDetailSerializer(ProjectSerializer):
    members = ProjectMemberSerializer(source='projectmember_set', many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['members']

class LabelSerializer(serializers.ModelSerializer):
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Label
        fields = ['id', 'name', 'color', 'project', 'task_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()

class TaskSerializer(serializers.ModelSerializer):
    assignees = UserSerializer(many=True, read_only=True)
    assignee_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    created_by = UserSerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()
    attachment_count = serializers.SerializerMethodField()
    labels = LabelSerializer(many=True, read_only=True)
    label_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'priority', 'status', 'position',
            'board_list', 'project', 'assignees', 'assignee_ids', 'created_by',
            'due_date', 'completed_at', 'created_at', 'updated_at',
            'comment_count', 'attachment_count', 'labels', 'label_ids', 'is_overdue'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_comment_count(self, obj):
        return obj.comments.count()
    
    def get_attachment_count(self, obj):
        return obj.attachments.count()
    
    def get_is_overdue(self, obj):
        if obj.due_date and not obj.completed_at:
            from django.utils import timezone
            return obj.due_date < timezone.now()
        return False
    
    def create(self, validated_data):
        assignee_ids = validated_data.pop('assignee_ids', [])
        label_ids = validated_data.pop('label_ids', [])
        validated_data['created_by'] = self.context['request'].user
        
        task = Task.objects.create(**validated_data)
        
        if assignee_ids:
            assignees = User.objects.filter(id__in=assignee_ids)
            task.assignees.set(assignees)
        
        if label_ids:
            labels = Label.objects.filter(id__in=label_ids)
            task.labels.set(labels)
        
        return task
    
    def update(self, instance, validated_data):
        assignee_ids = validated_data.pop('assignee_ids', None)
        label_ids = validated_data.pop('label_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if assignee_ids is not None:
            assignees = User.objects.filter(id__in=assignee_ids)
            instance.assignees.set(assignees)
        
        if label_ids is not None:
            labels = Label.objects.filter(id__in=label_ids)
            instance.labels.set(labels)
        
        return instance

class BoardListSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BoardList
        fields = ['id', 'name', 'position', 'board', 'tasks', 'task_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()


class BoardSerializer(serializers.ModelSerializer):
    lists = BoardListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Board
        fields = ['id', 'name', 'description', 'position', 'project', 'lists', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'task', 'parent', 'replies', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.all(), many=True).data
        return []
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return Comment.objects.create(**validated_data)


class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Attachment
        fields = ['id', 'file', 'file_url', 'filename', 'file_size', 'content_type', 'uploaded_by', 'task', 'created_at']
        read_only_fields = ['id', 'file_url', 'created_at']
    
    def get_file_url(self, obj):
        """Return the file URL (signed if using S3)"""
        return obj.get_file_url()
    
    def create(self, validated_data):
        # Handle both direct upload and S3 upload
        file = validated_data.get('file')
        
        if file:
            validated_data['uploaded_by'] = self.context['request'].user
            validated_data['filename'] = file.name
            validated_data['file_size'] = file.size
            validated_data['content_type'] = file.content_type
        else:
            # S3 upload case - data comes from frontend
            validated_data['uploaded_by'] = self.context['request'].user
        
        return Attachment.objects.create(**validated_data)

class ActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    task_title = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id', 'action', 'description', 'metadata',
            'user', 'task', 'task_title', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_task_title(self, obj):
        if obj.task:
            return obj.task.title
        return None