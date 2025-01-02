import logging
from .models import Activity, Project

logger = logging.getLogger(__name__)


def log_activity(project, user, action, description, task=None, metadata=None):
    """Helper function to log activities"""
    try:
        # Handle project being an ID string or object
        if isinstance(project, str):
            project = Project.objects.get(id=project)

        activity = Activity.objects.create(
            project=project,
            user=user,
            action=action,
            description=description,
            task=task,
            metadata=metadata or {}
        )
        logger.info(f"Activity logged: {action} by {user.email} on project {project.name}")
        return activity
    except Exception as e:
        logger.error(f"Failed to log activity: {e}")
        return None