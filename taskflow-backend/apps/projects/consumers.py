import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from .models import ProjectMember


class ProjectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.project_group_name = f'project_{self.project_id}'
        self.user = self.scope.get('user', AnonymousUser())

        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        is_member = await self.check_project_membership(self.user, self.project_id)
        if not is_member:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(
            self.project_group_name,
            self.channel_name
        )

        await self.accept()

        await self.channel_layer.group_send(
            self.project_group_name,
            {
                'type': 'user_presence',
                'action': 'joined',
                'user_id': str(self.user.id),  # Convert UUID to string
                'user_name': str(self.user.full_name),
            }
        )

    async def disconnect(self, close_code):
        if hasattr(self, 'user') and self.user and self.user.is_authenticated:
            try:
                await self.channel_layer.group_send(
                    self.project_group_name,
                    {
                        'type': 'user_presence',
                        'action': 'left',
                        'user_id': str(self.user.id),  # Convert UUID to string
                        'user_name': str(self.user.full_name),
                    }
                )
            except Exception:
                pass

        if hasattr(self, 'project_group_name'):
            try:
                await self.channel_layer.group_discard(
                    self.project_group_name,
                    self.channel_name
                )
            except Exception:
                pass

    async def receive(self, text_data):
        if not self.user or not self.user.is_authenticated:
            return

        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == 'task_update':
                await self.channel_layer.group_send(
                    self.project_group_name,
                    {
                        'type': 'task_update',
                        'task': data.get('task'),
                        'action': data.get('action'),
                        'user_id': str(self.user.id),
                    }
                )
            elif message_type == 'comment_added':
                await self.channel_layer.group_send(
                    self.project_group_name,
                    {
                        'type': 'comment_added',
                        'comment': data.get('comment'),
                        'task_id': data.get('task_id'),
                        'user_id': str(self.user.id),
                    }
                )
        except json.JSONDecodeError:
            pass
        except Exception as e:
            print(f"WebSocket receive error: {e}")

    async def task_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'task': event.get('task'),
            'action': event.get('action'),
            'user_id': event.get('user_id', ''),
        }))

    async def comment_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'comment_added',
            'comment': event.get('comment'),
            'task_id': event.get('task_id'),
            'user_id': event.get('user_id', ''),
        }))

    async def user_presence(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_presence',
            'action': event.get('action'),
            'user_id': event.get('user_id', ''),
            'user_name': event.get('user_name', ''),
        }))

    @database_sync_to_async
    def check_project_membership(self, user, project_id):
        return ProjectMember.objects.filter(
            project_id=project_id,
            user=user
        ).exists()