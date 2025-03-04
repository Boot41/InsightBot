from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Movie
from .serializers import MovieSerializer
from django.db import connections
from django.conf import settings
import os
import psycopg2
import psycopg2.extras

# Create your views here.

@api_view(['POST'])
def add_movie(request):
    if request.method == 'POST':
        serializer = MovieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def execute_raw_sql(request):
    try:
        # Extract query and database credentials from request
        query = request.data.get('query')
        db_config = request.data.get('db_config', {})

        if not query:
            return Response({'error': 'Query parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

        # If no db_config provided, use default querydb credentials
        if not db_config:
            db_config = {
                'name': 'querydb',
                'user': 'user',
                'password': 'password',
                'host': 'querydb',
                'port': '5432'
            }

        # Extract credentials
        dbname = db_config.get('name')
        user = db_config.get('user')
        password = db_config.get('password')
        host = db_config.get('host')
        port = db_config.get('port', '5432')

        if not all([dbname, user, password, host]):
            return Response({'error': 'Incomplete database credentials'}, status=status.HTTP_400_BAD_REQUEST)

        # Create connection
        conn = psycopg2.connect(
            dbname=dbname,
            user=user,
            password=password,
            host=host,
            port=port
        )

        try:
            with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cursor:
                cursor.execute(query)
                conn.commit()

                # If the query is a SELECT statement
                if query.strip().upper().startswith('SELECT'):
                    rows = cursor.fetchall()
                    if cursor.description:
                        columns = [desc[0] for desc in cursor.description]
                        results = [dict(zip(columns, row)) for row in rows]
                        return Response({'results': results})
                    return Response({'results': []})

                # For other queries (INSERT, UPDATE, DELETE)
                affected_rows = cursor.rowcount
                return Response({'affected_rows': affected_rows})

        finally:
            conn.close()

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
