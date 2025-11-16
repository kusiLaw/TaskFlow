import os

env = os.environ.get('DJANGO_ENV', 'development')

if env == 'production':
    from .custom_settings.production import *
else:
    from .custom_settings.development import *