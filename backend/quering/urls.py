from django.urls import path
from .views import add_movie

urlpatterns = [
    path('add/', add_movie, name='add_movie'),
]
