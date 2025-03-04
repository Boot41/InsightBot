from django.urls import path
from rest_framework import routers
from .views import ConnectionViewSet, execute_raw_sql, get_database_schema

router = routers.DefaultRouter()
router.register(r'connections', ConnectionViewSet)

urlpatterns = [
    path('raw-sql/', execute_raw_sql, name='execute_raw_sql'),
    path('database-schema/', get_database_schema, name='get_database_schema'),
] + router.urls
