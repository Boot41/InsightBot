from django.db import models
from django.utils import timezone

# Create your models here.

class Connection(models.Model):
    connection_name = models.CharField(max_length=255, unique=True)
    hostname = models.CharField(max_length=255)
    port = models.IntegerField(default=5432)
    dbname = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    last_connected_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.connection_name} ({self.dbname}@{self.hostname})"
