from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

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
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrganizationDetailSerializer
        return OrganizationSerializer
    
    def get_queryset(self):
        return Organization.objects.filter(members=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsOrganizationAdmin])
    def invite(self, request, pk=None):
        """Invite a user to the organization"""
        organization = self.get_object()
        serializer = InvitationSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Check if user is already a member
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                if OrganizationMember.objects.filter(organization=organization, user=user).exists():
                    return Response(
                        {'error': 'User is already a member of this organization.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except User.DoesNotExist:
                pass  # User doesn't exist yet, invitation will work
            
            # Check for existing pending invitation
            existing = Invitation.objects.filter(
                organization=organization,
                email=email,
                status=Invitation.Status.PENDING
            ).first()
            
            if existing and existing.is_valid():
                return Response(
                    {'error': 'An invitation has already been sent to this email.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            invitation = serializer.save()
            
            # TODO: Send invitation email
            # send_invitation_email(invitation)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def accept_invitation(self, request):
        """Accept an organization invitation"""
        serializer = AcceptInvitationSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            invitation = get_object_or_404(Invitation, token=token)
            
            if not invitation.is_valid():
                return Response(
                    {'error': 'This invitation has expired or is no longer valid.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add user to organization
            OrganizationMember.objects.get_or_create(
                organization=invitation.organization,
                user=request.user,
                defaults={'role': invitation.role}
            )
            
            # Mark invitation as accepted
            invitation.status = Invitation.Status.ACCEPTED
            invitation.save()
            
            return Response({
                'message': 'Invitation accepted successfully.',
                'organization': OrganizationSerializer(invitation.organization).data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[IsOrganizationMember])
    def members(self, request, pk=None):
        """List organization members"""
        organization = self.get_object()
        members = OrganizationMember.objects.filter(organization=organization).select_related('user')
        serializer = OrganizationMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], url_path='members/(?P<member_id>[^/.]+)', 
            permission_classes=[IsOrganizationAdmin])
    def update_member_role(self, request, pk=None, member_id=None):
        """Update a member's role"""
        organization = self.get_object()
        member = get_object_or_404(OrganizationMember, id=member_id, organization=organization)
        
        # Don't allow changing owner role
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
        member = get_object_or_404(OrganizationMember, id=member_id, organization=organization)
        
        # Don't allow removing owner
        if member.role == OrganizationMember.Role.OWNER:
            return Response(
                {'error': 'Cannot remove the organization owner.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response({'message': 'Member removed successfully.'}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave an organization"""
        organization = self.get_object()
        member = get_object_or_404(OrganizationMember, organization=organization, user=request.user)
        
        if member.role == OrganizationMember.Role.OWNER:
            return Response(
                {'error': 'Organization owner cannot leave. Please transfer ownership first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        member.delete()
        return Response({'message': 'You have left the organization.'}, status=status.HTTP_200_OK)