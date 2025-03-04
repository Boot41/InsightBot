from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .models import Connection
from .serializers import ConnectionSerializer
from rest_framework.decorators import api_view
import psycopg2
import psycopg2.extras
import json

# Create your views here.

class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer

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


@api_view(['POST'])
def get_database_schema(request):
    try:
        db_config = request.data.get('db_config', {})

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
                cursor.execute("""
                    SELECT 
                        table_schema,
                        table_name,
                        column_name,
                        data_type,
                        is_nullable,
                        column_default
                    FROM 
                        information_schema.columns
                    WHERE 
                        table_schema NOT IN ('information_schema', 'pg_catalog')
                    ORDER BY
                        table_schema,
                        table_name,
                        ordinal_position;
                """)
                columns_data = cursor.fetchall()

                schema_info = {}
                for column in columns_data:
                    table_schema = column['table_schema']
                    table_name = column['table_name']
                    if table_schema not in schema_info:
                        schema_info[table_schema] = {}
                    if table_name not in schema_info[table_schema]:
                        schema_info[table_schema][table_name] = []
                    schema_info[table_schema][table_name].append({
                        'column_name': column['column_name'],
                        'data_type': column['data_type'],
                        'is_nullable': column['is_nullable'],
                        'column_default': column['column_default']
                    })

                return Response({'schema': schema_info})

        finally:
            conn.close()

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)