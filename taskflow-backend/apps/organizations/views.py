from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from rest_framework.views import APIView

from .models import Organization, OrganizationMember, Invitation
from .serializers import (
    OrganizationSerializer,
    OrganizationDetailSerializer,
    OrganizationMemberSerializer,
    InvitationSerializer,
    AcceptInvitationSerializer,
    UpdateMemberRoleSerializer,
)
from .permissions import IsOrganizationMember, IsOrganizationAdmin


User = get_user_model()


class OrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrganizationDetailSerializer
        return OrganizationSerializer
    
    def get_queryset(self):
        return Organization.objects.filter(members=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a new organization"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create organization
        organization = serializer.save(owner=request.user)
        
        # Add creator as owner member
        OrganizationMember.objects.create(
            organization=organization,
            user=request.user,
            role=OrganizationMember.Role.OWNER
        )
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            OrganizationSerializer(organization).data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    def update(self, request, *args, **kwargs):
        """Update organization - only admins/owner"""
        instance = self.get_object()
        
        # Check if user is admin or owner
        member = OrganizationMember.objects.filter(
            organization=instance,
            user=request.user
        ).first()
        
        if not member or member.role not in [
            OrganizationMember.Role.OWNER,
            OrganizationMember.Role.ADMIN
        ]:
            return Response(
                {'error': 'Only admins can update organization settings.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().update(request, *args, **kwargs)
    
    def destroy(self, request, *args, **kwargs):
        """Delete organization - only owner"""
        instance = self.get_object()
        
        # Check if user is owner
        member = OrganizationMember.objects.filter(
            organization=instance,
            user=request.user,
            role=OrganizationMember.Role.OWNER
        ).first()
        
        if not member:
            return Response(
                {'error': 'Only the owner can delete an organization.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        return super().destroy(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'], permission_classes=[IsOrganizationAdmin])
    def invite(self, request, pk=None):
        """Invite a user to the organization"""
        organization = self.get_object()
        serializer = InvitationSerializer(
            data=request.data,
            context={'request': request, 'organization': organization}
        )
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if already a member
            try:
                user = User.objects.get(email=email)
                if OrganizationMember.objects.filter(
                    organization=organization, user=user
                ).exists():
                    return Response(
                        {'error': 'User is already a member.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except User.DoesNotExist:
                pass
            
            # Check for existing pending invitation
            existing = Invitation.objects.filter(
                organization=organization,
                email=email,
                status=Invitation.Status.PENDING
            ).first()
            
            if existing and existing.is_valid():
                invitation = existing
            else:
                invitation = serializer.save(
                    organization=organization,
                    invited_by=request.user
                )
            
            # Send email (optional - will print to console in development)
            from django.core.mail import send_mail
            from django.conf import settings
            
            invite_url = f"{settings.FRONTEND_URL}/invite/{invitation.token}"
            
            try:
                send_mail(
                    subject=f"You're invited to join {organization.name} on TaskFlow",
                    message=f"""
Hi there!

{request.user.full_name or request.user.email} has invited you to join {organization.name} on TaskFlow.

Click the link below to accept your invitation:
{invite_url}

This invitation expires in 7 days.

If you didn't expect this invitation, you can ignore this email.

The TaskFlow Team
                    """,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=True,
                )
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to send invite email: {e}")
            
            return Response({
                'message': f'Invitation sent to {email}',
                'invitation': InvitationSerializer(invitation).data,
                'invite_url': invite_url,
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[IsOrganizationMember])
    def members(self, request, pk=None):
        """List organization members"""
        organization = self.get_object()
        members = OrganizationMember.objects.filter(
            organization=organization
        ).select_related('user')
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='members/(?P<member_id>[^/.]+)', 
            permission_classes=[IsOrganizationAdmin])
    def update_member_role(self, request, pk=None, member_id=None):
        """Update a member's role"""
        organization = self.get_object()
        member = get_object_or_404(
            OrganizationMember, id=member_id, organization=organization
        )
        
        if member.role == OrganizationMember.Role.OWNER:
            return Response(
                {'error': 'Cannot change the role of the organization owner.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = UpdateMemberRoleSerializer(data=request.data)
        if serializer.is_valid():
            member.role = serializer.validated_data['role']
            member.save()
            return Response(OrganizationMemberSerializer(member).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'], url_path='members/(?P<member_id>[^/.]+)',
            permission_classes=[IsOrganizationAdmin])
    def remove_member(self, request, pk=None, member_id=None):
        """Remove a member from the organization"""
        organization = self.get_object()
        member = get_object_or_404(
            OrganizationMember, id=member_id, organization=organization
        )
        
        if member.role == OrganizationMember.Role.OWNER:
            return Response(
                {'error': 'Cannot remove the organization owner.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response(
            {'message': 'Member removed successfully.'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave an organization"""
        organization = self.get_object()
        member = get_object_or_404(
            OrganizationMember, organization=organization, user=request.user
        )
        
        if member.role == OrganizationMember.Role.OWNER:
            return Response(
                {'error': 'Owner cannot leave. Transfer ownership first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response(
            {'message': 'You have left the organization.'},
            status=status.HTTP_200_OK
        )

class InvitationDetailView(APIView):
    """Get invitation details by token - no auth required"""
    permission_classes = [permissions.AllowAny]

    def get(self, request, token):
        try:
            invitation = Invitation.objects.select_related(
                'organization', 'invited_by'
            ).get(token=token)

            if not invitation.is_valid():
                return Response(
                    {'error': 'This invitation has expired or already been used.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            return Response({
                'id': str(invitation.id),
                'email': invitation.email,
                'role': invitation.role,
                'organization': {
                    'id': str(invitation.organization.id),
                    'name': invitation.organization.name,
                },
                'invited_by': {
                    'name': invitation.invited_by.full_name,
                    'email': invitation.invited_by.email,
                },
                'expires_at': invitation.expires_at,
            })
        except Invitation.DoesNotExist:
            return Response(
                {'error': 'Invalid invitation link.'},
                status=status.HTTP_404_NOT_FOUND
            )


class AcceptInvitationView(APIView):
    """Accept invitation - requires authentication"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, token):
        try:
            invitation = Invitation.objects.select_related('organization').get(
                token=token
            )

            if not invitation.is_valid():
                return Response(
                    {'error': 'This invitation has expired or already been used.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Add user to organization
            member, created = OrganizationMember.objects.get_or_create(
                organization=invitation.organization,
                user=request.user,
                defaults={'role': invitation.role}
            )

            if not created:
                return Response(
                    {'error': 'You are already a member of this organization.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark invitation as accepted
            invitation.status = Invitation.Status.ACCEPTED
            invitation.save()

            return Response({
                'message': f'Welcome to {invitation.organization.name}!',
                'organization': {
                    'id': str(invitation.organization.id),
                    'name': invitation.organization.name,
                }
            })

        except Invitation.DoesNotExist:
            return Response(
                {'error': 'Invalid invitation link.'},
                status=status.HTTP_404_NOT_FOUND
            )