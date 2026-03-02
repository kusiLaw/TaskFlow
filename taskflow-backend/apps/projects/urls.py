from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet,
    BoardViewSet,
    BoardListViewSet,
    TaskViewSet,
    CommentViewSet,
    AttachmentViewSet,
    LabelViewSet,
    ActivityViewSet,
    generate_presigned_upload_url,
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'lists', BoardListViewSet, basename='boardlist')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'attachments', AttachmentViewSet, basename='attachment')
router.register(r'labels', LabelViewSet, basename='label')
router.register(r'activities', ActivityViewSet, basename='activity')


urlpatterns = [
    path('', include(router.urls)),
    path('upload/presigned-url/', generate_presigned_upload_url, name='presigned-upload-url'),

]