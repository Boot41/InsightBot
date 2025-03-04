from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ConnectionViewSet, execute_raw_sql

router = DefaultRouter()
router.register(r'connections', ConnectionViewSet)

urlpatterns = [
    path('raw-sql/', execute_raw_sql, name='execute_raw_sql'),
] + router.urls
