from apps.organizations.models import Organization


class TenantMiddleware:
    """
    Middleware to set the current organization based on request headers.
    This ensures all queries are scoped to the correct organization.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Get organization from header or session
        org_id = request.headers.get('X-Organization-ID')
        
        if org_id and request.user.is_authenticated:
            try:
                organization = Organization.objects.get(
                    id=org_id,
                    members=request.user
                )
                request.organization = organization
            except Organization.DoesNotExist:
                request.organization = None
        else:
            request.organization = None
        
        response = self.get_response(request)
        return response