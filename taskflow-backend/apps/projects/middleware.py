import logging
from urllib.parse import parse_qsl
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

User = get_user_model()


@database_sync_to_async
def get_user_from_token(token_string):
    """Get user from JWT access token string"""
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from rest_framework_simplejwt.exceptions import TokenError

        token = AccessToken(token_string)
        user_id = token.payload.get('user_id')

        if not user_id:
            return AnonymousUser()

        user = User.objects.get(id=user_id)
        return user

    except Exception as e:
        logger.debug(f"WebSocket auth failed: {e}")
        return AnonymousUser()


def get_cookie_from_scope(scope, cookie_name):
    """Extract a specific cookie value from the WebSocket scope headers"""
    headers = dict(scope.get('headers', []))
    cookie_header = headers.get(b'cookie', b'').decode('utf-8', errors='ignore')

    if not cookie_header:
        return None

    # Parse cookies
    cookies = {}
    for part in cookie_header.split(';'):
        part = part.strip()
        if '=' in part:
            key, _, value = part.partition('=')
            cookies[key.strip()] = value.strip()

    return cookies.get(cookie_name)


class TokenAuthMiddleware:
    """WebSocket middleware that authenticates via HTTP-only cookie"""

    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope['type'] == 'websocket':
            # Try cookie first (HTTP-only cookie)
            token = get_cookie_from_scope(scope, 'access_token')

            if token:
                logger.debug("WebSocket: Found access_token cookie")
                scope['user'] = await get_user_from_token(token)
            else:
                # Fallback: try query string token
                query_string = scope.get('query_string', b'').decode('utf-8')
                params = dict(parse_qsl(query_string))
                token = params.get('token')

                if token:
                    logger.debug("WebSocket: Found token in query string")
                    scope['user'] = await get_user_from_token(token)
                else:
                    logger.debug("WebSocket: No token found, setting AnonymousUser")
                    scope['user'] = AnonymousUser()

            # Log result
            user = scope.get('user', AnonymousUser())
            if user and user.is_authenticated:
                logger.debug(f"WebSocket: Authenticated as {user.email}")
            else:
                logger.debug("WebSocket: Not authenticated")

        return await self.app(scope, receive, send)