from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrganizationViewSet, InvitationDetailView, AcceptInvitationView

router = DefaultRouter()
router.register(r'organizations', OrganizationViewSet, basename='organization')

urlpatterns = [
    path('', include(router.urls)),
    # Invitation endpoints - no auth required to view
    path(
        'invitations/<str:token>/',
        InvitationDetailView.as_view(),
        name='invitation-detail'
    ),
    path(
        'invitations/<str:token>/accept/',
        AcceptInvitationView.as_view(),
        name='invitation-accept'
    ),
]