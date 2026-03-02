from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Project, ProjectMember, Board, BoardList, Task, Comment, Attachment


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'organization', 'owner', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['name', 'description']


@admin.register(ProjectMember)
class ProjectMemberAdmin(admin.ModelAdmin):
    list_display = ['user', 'project', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ['name', 'project', 'position', 'created_at']


@admin.register(BoardList)
class BoardListAdmin(admin.ModelAdmin):
    list_display = ['name', 'board', 'position', 'created_at']


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'priority', 'status', 'created_by', 'created_at']
    list_filter = ['priority', 'status', 'created_at']
    search_fields = ['title', 'description']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'task', 'created_at']


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ['filename', 'task', 'uploaded_by', 'created_at']