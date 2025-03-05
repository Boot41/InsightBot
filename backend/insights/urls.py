from django.urls import path
from rest_framework import routers
from .views import ConnectionViewSet, execute_raw_sql, get_database_schema, generate_sql_query, generate_visualization_data

router = routers.DefaultRouter()
router.register(r'connections', ConnectionViewSet)

urlpatterns = [
    path('raw-sql/', execute_raw_sql, name='execute_raw_sql'),
    path('database-schema/', get_database_schema, name='get_database_schema'),
    path('generate-sql/', generate_sql_query, name='generate_sql_query'),
    path('generate-visualizations/', generate_visualization_data, name='generate_visualization_data'),
] + router.urls
