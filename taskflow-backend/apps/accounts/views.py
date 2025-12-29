from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import get_user_model
from django.conf import settings
from datetime import datetime, timedelta

from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
)

User = get_user_model()


def set_auth_cookies(response, access_token, refresh_token):
    """Helper function to set authentication cookies"""
    cookie_settings = getattr(settings, 'SIMPLE_JWT', {})
    
    # Access token cookie
    response.set_cookie(
        key=cookie_settings.get('AUTH_COOKIE', 'access_token'),
        value=access_token,
        max_age=int(cookie_settings.get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=60)).total_seconds()),
        secure=cookie_settings.get('AUTH_COOKIE_SECURE', False),
        httponly=cookie_settings.get('AUTH_COOKIE_HTTP_ONLY', True),
        samesite=cookie_settings.get('AUTH_COOKIE_SAMESITE', 'Lax'),
        domain=cookie_settings.get('AUTH_COOKIE_DOMAIN', None),
        path=cookie_settings.get('AUTH_COOKIE_PATH', '/'),
    )
    
    # Refresh token cookie
    response.set_cookie(
        key=cookie_settings.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
        value=refresh_token,
        max_age=int(cookie_settings.get('REFRESH_TOKEN_LIFETIME', timedelta(days=7)).total_seconds()),
        secure=cookie_settings.get('AUTH_COOKIE_SECURE', False),
        httponly=cookie_settings.get('AUTH_COOKIE_HTTP_ONLY', True),
        samesite=cookie_settings.get('AUTH_COOKIE_SAMESITE', 'Lax'),
        domain=cookie_settings.get('AUTH_COOKIE_DOMAIN', None),
        path=cookie_settings.get('AUTH_COOKIE_PATH', '/'),
    )


def clear_auth_cookies(response):
    """Helper function to clear authentication cookies"""
    cookie_settings = getattr(settings, 'SIMPLE_JWT', {})
    
    response.delete_cookie(
        key=cookie_settings.get('AUTH_COOKIE', 'access_token'),
        path=cookie_settings.get('AUTH_COOKIE_PATH', '/'),
        domain=cookie_settings.get('AUTH_COOKIE_DOMAIN', None),
        samesite=cookie_settings.get('AUTH_COOKIE_SAMESITE', 'Lax'),
    )
    
    response.delete_cookie(
        key=cookie_settings.get('AUTH_COOKIE_REFRESH', 'refresh_token'),
        path=cookie_settings.get('AUTH_COOKIE_PATH', '/'),
        domain=cookie_settings.get('AUTH_COOKIE_DOMAIN', None),
        samesite=cookie_settings.get('AUTH_COOKIE_SAMESITE', 'Lax'),
    )


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        response = Response({
            'user': UserSerializer(user).data,
            'message': 'Registration successful'
        }, status=status.HTTP_201_CREATED)
        
        # Set cookies
        set_auth_cookies(response, str(refresh.access_token), str(refresh))
        
        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        response = Response({
            'user': serializer.validated_data['user'],
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
        
        # Set cookies
        set_auth_cookies(
            response,
            serializer.validated_data['access'],
            serializer.validated_data['refresh']
        )
        
        return response


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Try to blacklist the refresh token
            refresh_token = request.COOKIES.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except TokenError:
            pass
        except Exception as e:
            pass
        
        response = Response(
            {'message': 'Successfully logged out'},
            status=status.HTTP_200_OK
        )
        
        # Clear cookies
        clear_auth_cookies(response)
        
        return response


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            return Response(
                {'error': 'Refresh token not found'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            # If rotation is enabled, get new refresh token
            if settings.SIMPLE_JWT.get('ROTATE_REFRESH_TOKENS'):
                refresh.set_jti()
                refresh.set_exp()
                new_refresh_token = str(refresh)
            else:
                new_refresh_token = refresh_token
            
            response = Response(
                {'message': 'Token refreshed'},
                status=status.HTTP_200_OK
            )
            
            # Set new cookies
            set_auth_cookies(response, access_token, new_refresh_token)
            
            return response
            
        except TokenError as e:
            return Response(
                {'error': 'Invalid or expired refresh token'},
                status=status.HTTP_401_UNAUTHORIZED
            )


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UpdateProfileView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UpdateProfileSerializer
    
    def get_object(self):
        return self.request.user