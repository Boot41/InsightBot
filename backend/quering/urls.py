from django.urls import path
from .views import add_movie
from . import views

urlpatterns = [
    path('add/', add_movie, name='add_movie'),
    path('execute-sql/', views.execute_raw_sql, name='execute_raw_sql'),
]
