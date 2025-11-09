import os

env = os.environ.get('DJANGO_ENV', 'development')

if env == 'production':
    from .settings.production import *
else:
    from .settings.development import *