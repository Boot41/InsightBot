import json
from django.test import TestCase, RequestFactory
from unittest.mock import patch
from rest_framework.response import Response

# Import your view functions and viewset from insights/views.py
from insights.views import (
    execute_raw_sql,
    get_database_schema,
    generate_sql_query,
    generate_visualization_data,
    ConnectionViewSet
)

# ---------------------------------------------------------------------
# Dummy/Fake Classes for External Dependencies
# ---------------------------------------------------------------------
class FakeDictCursor:
    def __init__(self):
        self.rowcount = 0
        self._data = []
        self.description = None

    def execute(self, query):
        if "information_schema.columns" in query:
            # Simulate a schema query returning one dictionary row.
            self._data = [
                {
                    "table_schema": "public",
                    "table_name": "test_table",
                    "column_name": "id",
                    "data_type": "integer",
                    "is_nullable": "NO",
                    "column_default": None
                }
            ]
            self.rowcount = 1
            # Provide a dummy description (list of 1-tuples with column names)
            self.description = [
                ("table_schema",),
                ("table_name",),
                ("column_name",),
                ("data_type",),
                ("is_nullable",),
                ("column_default",)
            ]
        elif query.strip().upper().startswith("SELECT"):
            # For a SELECT query, return one row with value 1.
            self._data = [(1,)]
            self.rowcount = 1
            self.description = [("id",)]
        else:
            # For non-select queries
            self._data = []
            self.rowcount = 1
            self.description = None

    def fetchall(self):
        return self._data

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

class FakeDictConnection:
    def cursor(self, *args, **kwargs):
        return FakeDictCursor()
    def commit(self):
        pass
    def close(self):
        pass

class FakeGroqResponse:
    class FakeChoice:
        def __init__(self, message):
            self.message = message
    def __init__(self, sql_query):
        self.choices = [FakeGroqResponse.FakeChoice(
            message=type("Msg", (), {"content": sql_query})
        )]

class FakeGroqVisualizationResponse:
    class FakeChoice:
        def __init__(self, message):
            self.message = message
    def __init__(self, visualization_json):
        self.choices = [FakeGroqVisualizationResponse.FakeChoice(
            message=type("Msg", (), {"content": json.dumps(visualization_json)})
        )]

# ---------------------------------------------------------------------
# Dummy Test Cases (Using RequestFactory to call view functions directly)
# ---------------------------------------------------------------------
class DummyAPITest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    # --- execute_raw_sql ---
    @patch('insights.views.psycopg2.connect', return_value=FakeDictConnection())
    def test_execute_raw_sql_missing_query(self, mock_connect):
        # Create a dummy POST request without a "query"
        request = self.factory.post('/api/raw-sql/', data={}, content_type='application/json')
        response = execute_raw_sql(request)
        # Expecting a 400 error due to missing query parameter.
        self.assertEqual(response.status_code, 400)

    @patch('insights.views.psycopg2.connect', return_value=FakeDictConnection())
    def test_execute_raw_sql_select_query(self, mock_connect):
        request = self.factory.post('/api/raw-sql/', data={'query': 'SELECT id FROM test_table'}, content_type='application/json')
        response = execute_raw_sql(request)
        self.assertEqual(response.status_code, 200)
        # Dummy response should return our fake SELECT row.
        self.assertEqual(response.data, {'results': [{'id': 1}]})

    @patch('insights.views.psycopg2.connect', return_value=FakeDictConnection())
    def test_execute_raw_sql_non_select_query(self, mock_connect):
        request = self.factory.post('/api/raw-sql/', data={'query': 'INSERT INTO test_table (id) VALUES (1)'}, content_type='application/json')
        response = execute_raw_sql(request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'affected_rows': 1})

    # --- get_database_schema ---
    @patch('insights.views.psycopg2.connect', return_value=FakeDictConnection())
    def test_get_database_schema_incomplete_credentials(self, mock_connect):
        request = self.factory.post('/api/get-database-schema/', data={'db_config': {'name': 'defaultdb', 'user': 'avnadmin'}}, content_type='application/json')
        response = get_database_schema(request)
        self.assertEqual(response.status_code, 400)

    @patch('insights.views.psycopg2.connect', return_value=FakeDictConnection())
    def test_get_database_schema_success(self, mock_connect):
        request = self.factory.post('/api/get-database-schema/', data={
            'db_config': {
                'name': 'defaultdb',
                'user': 'avnadmin',
                'password': 'AVNS_7EFfnVKvWqJCIrhhhXS',
                'host': 'pg-337e2907-insightbot.i.aivencloud.com',
                'port': '19551'
            }
        }, content_type='application/json')
        response = get_database_schema(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('schema', response.data)
        self.assertIsInstance(response.data['schema'], dict)
        self.assertIn('public', response.data['schema'])
        self.assertIn('test_table', response.data['schema']['public'])

    # --- generate_sql_query ---
    @patch('insights.views.get_db_schema', return_value={
        'public': {
            'test_table': [{
                'column_name': 'id',
                'data_type': 'integer',
                'is_nullable': 'NO',
                'column_default': None
            }]
        }
    })
    @patch('insights.views.Groq')
    def test_generate_sql_query_success(self, mock_groq, mock_get_db_schema):
        fake_sql = 'SELECT "id" FROM "test_table";'
        instance = mock_groq.return_value
        instance.chat.completions.create.return_value = FakeGroqResponse(fake_sql)
        request = self.factory.post('/api/generate-sql-query/', data={'natural_language': 'Get the id from test_table'}, content_type='application/json')
        response = generate_sql_query(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('sql_query', response.data)
        self.assertEqual(response.data['sql_query'], fake_sql)

    @patch('insights.views.Groq')
    def test_generate_sql_query_missing_natural_language(self, mock_groq):
        request = self.factory.post('/api/generate-sql-query/', data={}, content_type='application/json')
        response = generate_sql_query(request)
        self.assertEqual(response.status_code, 400)

    # --- generate_visualization_data ---
    @patch('insights.views.Groq')
    def test_generate_visualization_data_success(self, mock_groq):
        visualization_output = [
            {
                "type": "bar",
                "data": {
                    "xlabel": "x",
                    "ylabel": "y",
                    "xvalues": [1, 2, 3],
                    "yvalues": [4, 5, 6]
                }
            }
        ]
        instance = mock_groq.return_value
        instance.chat.completions.create.return_value = FakeGroqVisualizationResponse(visualization_output)
        request = self.factory.post('/api/generate-visualization-data/', data={'dataset': 'some dataset'}, content_type='application/json')
        response = generate_visualization_data(request)
        self.assertEqual(response.status_code, 200)
        self.assertIn('visualizations', response.data)
        self.assertEqual(response.data['visualizations'], visualization_output)

    @patch('insights.views.Groq')
    def test_generate_visualization_data_missing_dataset(self, mock_groq):
        request = self.factory.post('/api/generate-visualization-data/', data={}, content_type='application/json')
        response = generate_visualization_data(request)
        self.assertEqual(response.status_code, 400)

# --- Dummy Tests for the ConnectionViewSet ---
# (We use RequestFactory to call the viewset directly.)
from rest_framework.test import APIRequestFactory
from django.urls import reverse

class DummyConnectionViewSetTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        # Configure the viewset actions for list and create.
        self.list_view = ConnectionViewSet.as_view({'get': 'list'})
        self.create_view = ConnectionViewSet.as_view({'post': 'create'})

    def test_connection_viewset_list(self):
        request = self.factory.get('/api/connections/')
        response = self.list_view(request)
        self.assertEqual(response.status_code, 200)
        # Dummy response: assume an empty list if no connections exist.
        self.assertEqual(response.data, [])

    def test_connection_viewset_create(self):
        data = {
            'connection_name': 'defaultdb',
            'hostname': 'pg-337e2907-insightbot.i.aivencloud.com',
            'dbname': 'defaultdb',
            'username': 'avnadmin',
            'password': 'AVNS_7EFfnVKvWqJCIrhhhXS'
        }
        request = self.factory.post('/api/connections/', data, format='json')
        response = self.create_view(request)
        # Dummy test: assume a successful creation returns 201 and echoes back the connection_name.
        self.assertEqual(response.status_code, 201)
        self.assertIn('connection_name', response.data)
        self.assertEqual(response.data['connection_name'], 'defaultdb')
