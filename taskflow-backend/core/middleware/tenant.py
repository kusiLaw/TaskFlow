import logging
from apps.organizations.models import Organization
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.conf import settings

logger = logging.getLogger(__name__)


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Set default
        request.organization = None
        
        org_id = request.headers.get('X-Organization-ID')
        
        if not org_id:
            logger.debug(f"TenantMiddleware - No X-Organization-ID header for {request.path}")
            return self.get_response(request)
        
        # Authenticate user manually using JWT from cookie
        user = self._get_user_from_request(request)
        
        if user and user.is_authenticated:
            try:
                organization = Organization.objects.get(
                    id=org_id,
                    members=user
                )
                request.organization = organization
                logger.debug(f"TenantMiddleware - Set org: {organization.name} for user: {user.email}")
            except Organization.DoesNotExist:
                logger.warning(f"TenantMiddleware - Org {org_id} not found or user {user} not member")
            except Exception as e:
                logger.error(f"TenantMiddleware - Error: {str(e)}")
        else:
            logger.debug(f"TenantMiddleware - User not authenticated for {request.path}")
        
        return self.get_response(request)
    
    def _get_user_from_request(self, request):
        """Authenticate user from JWT cookie or Authorization header"""
        # Try cookie first
        from apps.accounts.authentication import CookieJWTAuthentication
        
        try:
            auth = CookieJWTAuthentication()
            result = auth.authenticate(request)
            if result:
                user, token = result
                return user
        except Exception:
            pass
        
        # Try Authorization header as fallback
        try:
            auth = JWTAuthentication()
            result = auth.authenticate(request)
            if result:
                user, token = result
                return user
        except Exception:
            pass
        
        return None