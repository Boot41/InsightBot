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
import os
from groq import Groq

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


@api_view(['POST'])
def generate_sql_query(request):
    try:
        natural_language = request.data.get('natural_language')
        if not natural_language:
            return Response({'error': 'Natural language query is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get database schema for context
        db_config = request.data.get('db_config', {})
        if not db_config:
            db_config = {
                'name': 'querydb',
                'user': 'user',
                'password': 'password',
                'host': 'querydb',
                'port': '5432'
            }

        # Get schema information
        schema_info = get_db_schema(db_config)
        
        # Format schema for prompt
        schema_description = "Database Schema:\n"
        for schema_name, tables in schema_info.items():
            schema_description += f"Schema: {schema_name}\n"
            for table_name, columns in tables.items():
                schema_description += f"Table: {table_name}\n"
                for column in columns:
                    schema_description += f"  - {column['column_name']} ({column['data_type']})"
                    if column['is_nullable'] == 'YES':
                        schema_description += " NULL"
                    schema_description += "\n"
            schema_description += "\n"

        # Initialize Groq client
        client = Groq(api_key=os.environ.get('GROQ_API_KEY'))

        # Create the prompt
        prompt = f"""Given the following database schema:

    {schema_description}

    Convert this natural language query to SQL:
    "{natural_language}"

    Respond with ONLY the SQL query, no explanations or additional text. Make sure the query is valid PostgreSQL syntax."""

        # Generate SQL query using Groq
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a SQL expert that converts natural language to SQL queries. Only respond with the SQL query, no explanations."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="mixtral-8x7b-32768",
            temperature=0,
            max_tokens=1000,
        )

        # Extract the generated SQL query
        sql_query = chat_completion.choices[0].message.content.strip()

        return Response({
            'sql_query': sql_query,
            'schema': schema_info
        })

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

def get_db_schema(db_config):
    """Helper function to get database schema"""
    try:
        # Extract credentials
        dbname = db_config.get('name')
        user = db_config.get('user')
        password = db_config.get('password')
        host = db_config.get('host')
        port = db_config.get('port', '5432')

        if not all([dbname, user, password, host]):
            raise ValueError('Incomplete database credentials')

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

                return schema_info

        finally:
            conn.close()

    except Exception as e:
        raise Exception(f'Error getting database schema: {str(e)}')