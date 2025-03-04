import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiArrowLeft, FiDatabase, FiBarChart2, FiPieChart, FiTrendingUp, FiInfo, FiEdit2, FiArrowUpCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';

// Mock movie data
const movieData = [
  { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', year: 1994, rating: 9.3, streams: 1250000 },
  { id: 2, title: 'The Godfather', genre: 'Crime', year: 1972, rating: 9.2, streams: 980000 },
  { id: 3, title: 'Pulp Fiction', genre: 'Crime', year: 1994, rating: 8.9, streams: 1100000 },
  { id: 4, title: 'The Dark Knight', genre: 'Action', year: 2008, rating: 9.0, streams: 1450000 },
  { id: 5, title: 'Inception', genre: 'Sci-Fi', year: 2010, rating: 8.8, streams: 1300000 },
  { id: 6, title: 'Interstellar', genre: 'Sci-Fi', year: 2014, rating: 8.6, streams: 1200000 },
  { id: 7, title: 'Fight Club', genre: 'Drama', year: 1999, rating: 8.8, streams: 950000 },
  { id: 8, title: 'The Matrix', genre: 'Sci-Fi', year: 1999, rating: 8.7, streams: 1050000 },
  { id: 9, title: 'Goodfellas', genre: 'Crime', year: 1990, rating: 8.7, streams: 850000 },
  { id: 10, title: 'Parasite', genre: 'Thriller', year: 2019, rating: 8.6, streams: 780000 },
];

// Genre data for pie chart
const genreData = [
  { name: 'Drama', value: 2 },
  { name: 'Crime', value: 3 },
  { name: 'Sci-Fi', value: 3 },
  { name: 'Action', value: 1 },
  { name: 'Thriller', value: 1 },
];

// Year data for line chart
const yearData = [
  { year: '1970s', avgRating: 9.2, movies: 1 },
  { year: '1990s', avgRating: 8.8, movies: 4 },
  { year: '2000s', avgRating: 9.0, movies: 1 },
  { year: '2010s', avgRating: 8.7, movies: 4 },
];

// Colors for charts
const COLORS = ['#0c8ee7', '#7c3aed', '#36aaf5', '#8b5cf6', '#0070c4', '#6d28d9'];

// Mock SQL query
const mockSqlQuery = `SELECT m.title, m.genre, m.release_year, m.rating, COUNT(s.id) as stream_count
FROM movies m
JOIN streams s ON m.id = s.movie_id
GROUP BY m.id
ORDER BY m.rating DESC
LIMIT 10;`;

// Mock AI insights
const mockInsights = [
  "Sci-Fi movies make up 30% of the top-rated films but generate 35% of total streams.",
  "Movies from the 1990s have consistently high ratings, averaging 8.8/10.",
  "The Dark Knight (2008) has the highest number of streams despite not having the highest rating.",
  "Crime genre films have maintained popularity across decades, appearing in the 1970s, 1990s, and 2010s."
];

const QueryInterface = () => {
  const [query, setQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState(mockSqlQuery);
  const [showResults, setShowResults] = useState(false);
  const [isEditingSql, setIsEditingSql] = useState(false);
  const [queryResults, setQueryResults] = useState(null); // State to store query results
  const [tableData, setTableData] = useState(null);
  const sqlEditorRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Query submitted:', query);

    // Fetch dbConfig from localStorage
    const storedDbConfig = localStorage.getItem('connectionFormData');
    let dbConfig;

    if (storedDbConfig) {
      dbConfig = JSON.parse(storedDbConfig);
      // Rename keys to match backend expectation if necessary
      dbConfig = {
        name: dbConfig.database, // Assuming 'database' in localStorage maps to 'name' for backend
        user: dbConfig.username, // Assuming 'username' in localStorage maps to 'user' for backend
        password: dbConfig.password,
        host: dbConfig.host,
        port: dbConfig.port || '5432' // Default port if not in localStorage
      };
    } else {
      console.error('No database configuration found in localStorage.');
      alert('No database connection configured. Please connect to a database first.');
      return; // Stop submission if no dbConfig is found
    }


    try {
      const res = await axios.post('http://localhost:8000/api/generate-sql/', {
        natural_language: query,
        db_config: dbConfig
      });
    
      console.log('Response from backend:', res.data);
      console.log('Generated SQL query:', res.data.sql_query);
    
      if (res.status === 200) {
        // Fix: Remove extra backslashes from SQL query
        const cleanedQuery = res.data.sql_query.replace(/\\_/g, "_").replace(/\\\\/g, "\\");
    
        setSqlQuery(cleanedQuery);
        setShowResults(true);
      } else {
        console.error('Error generating SQL:', res.status, res.data);
        alert(`Error generating SQL. Status: ${res.status}. See console.`);
      }
    
    } catch (error) {
      console.error('Error sending query:', error);
      alert('Failed to send query. Check console for error.');
    }
    

    setShowResults(true);
  };
  const runQuery = async () => {
    // Fetch dbConfig from localStorage (same logic as in handleSubmit)
    const storedDbConfig = localStorage.getItem('connectionFormData');
    let dbConfig;

    if (storedDbConfig) {
      dbConfig = JSON.parse(storedDbConfig);
      dbConfig = {
        name: dbConfig.database,
        user: dbConfig.username,
        password: dbConfig.password,
        host: dbConfig.host,
        port: dbConfig.port || '5432'
      };
    } else {
      console.error('No database configuration found in localStorage.');
      alert('No database connection configured. Please connect to a database first.');
      return;
    }

    if (!sqlQuery) {
      alert('No SQL query to run. Generate a query first.');
      return;
    }

    console.log('Running SQL query:', sqlQuery);

    try {
      const res = await axios.post('http://localhost:8000/api/raw-sql/', {
        query: sqlQuery, // Use the current sqlQuery state
        db_config: dbConfig
      });

      console.log('Response from backend (raw-sql):', res.data);

      if (res.status === 200) {
        setQueryResults(res.data.results || res.data.affected_rows || {message: 'Query executed successfully'}); // Handle different response types
        console.log('Query result : ', queryResults);
        setShowResults(true); // Keep results section visible or update as needed
      } else {
        console.error('Error running SQL query:', res.status, res.data);
        alert(`Error running SQL query. Status: ${res.status}. See console.`);
      }

    } catch (error) {
      console.error('Error sending query (raw-sql):', error);
      alert('Failed to send query (raw-sql). Check console for error.');
    }
  };


  const handleSqlSubmit = () => {
    console.log('SQL query submitted:', sqlQuery);
    // Here you would typically send the SQL query to your backend
  };

  const handleSqlEdit = () => {
    if(isEditingSql){
      setIsEditingSql(false)
    }else{
      setIsEditingSql(true)
    }
    setTimeout(() => {
      if (sqlEditorRef.current) {
        sqlEditorRef.current.focus();
      }
    }, 0);
  };

  useEffect(() => {
    setTableData(queryResults);
  }, [queryResults]);

  return (
    <div className="min-h-screen flex flex-col query-interface">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-4 px-6 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <FiArrowLeft className="mr-2 text-dark-600" />
              <span className="text-xl font-bold gradient-text">InsightBot</span>
            </a>
            <div className="ml-6 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm flex items-center">
              <FiDatabase className="mr-1" size={14} />
              <span>Connected to Movies Database</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area - scrollable */}
      <div className="flex-grow overflow-y-auto">
        {!showResults ? (
          <div className="h-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-md px-4"
            >
              <h2 className="text-2xl font-bold mb-3">Ask Your Database Anything</h2>
              <p className="text-dark-600">
                Type your question in natural language and InsightBot will generate the SQL query for you.
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="container mx-auto py-6 px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Dynamic Layout for Results */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Data Table - Spans 2 columns */}
                <div className="md:col-span-2">
                  <h2 className="text-xl font-bold mb-3 gradient-text">Raw Data</h2>
                  <div className="card overflow-x-auto h-[500px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          {tableData && tableData[0] && Object.keys(tableData[0]).map((header) => (
                            <th
                              key={header}
                              className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider"
                            >
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tableData && tableData.map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((cell, cellIndex) => (
                              <td
                                key={cellIndex}
                                className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Insights - Takes 1 column */}
                {/* <div>
                  <h2 className="text-xl font-bold mb-3 gradient-text">AI Insights</h2>
                  <div className="card h-[500px] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiInfo className="mr-2 text-primary-500" />
                      Key Observations
                    </h3>
                    <ul className="space-y-3">
                      {mockInsights.map((insight, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mr-3 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-dark-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div> */}
              </div>

              {/* Visualizations - Varied card sizes */}
              {/* <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 gradient-text">Visualizations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="card md:col-span-5">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiBarChart2 className="mr-2 text-primary-500" />
                      Rating by Movie
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={movieData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" tick={false} />
                        <YAxis domain={[8, 10]} />
                        <Tooltip 
                          formatter={(value, name) => [value, 'Rating']}
                          labelFormatter={(label) => movieData.find(m => m.title === label)?.title}
                        />
                        <Bar dataKey="rating" fill="#0c8ee7" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card md:col-span-3">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiPieChart className="mr-2 text-secondary-500" />
                      Movies by Genre
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={genreData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {genreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card md:col-span-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiBarChart2 className="mr-2 text-secondary-500" />
                      Stream Count by Movie
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={movieData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="title" tick={false} />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [value.toLocaleString(), 'Streams']}
                          labelFormatter={(label) => movieData.find(m => m.title === label)?.title}
                        />
                        <Bar dataKey="streams" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="card md:col-span-12">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <FiTrendingUp className="mr-2 text-primary-500" />
                      Average Rating by Decade
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={yearData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[8.5, 9.5]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="avgRating" stroke="#7c3aed" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div> */}
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating chat-style input at the bottom */}
      <div className="fixed bottom-6 left-0 right-0 z-10 flex justify-center px-4">
        <div className="w-full max-w-3xl">
          {showResults && (
            <div className="bg-white rounded-2xl shadow-xl mb-3 overflow-hidden border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-medium text-dark-600">Generated SQL</h3>
                
                <div className="ml-auto flex items-center">
                  <button 
                    onClick={runQuery}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center mr-2"
                  >
                    <FiArrowUpCircle className="mr-1" size={14} />
                    FIRE
                  </button>
                  <button 
                    onClick={handleSqlEdit}
                    className="text-primary-600 hover:text-primary-700 text-sm flex items-center mr-2"
                  >
                    <FiEdit2 className="mr-1" size={14} />
                    {isEditingSql ? 'Cancel' : 'Edit SQL'}
                  </button>

                </div>
              </div>
              
              {isEditingSql ? (
                <div className="relative">
                  <textarea
                    ref={sqlEditorRef}
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 text-dark-900 font-mono text-sm h-24 border-none focus:ring-1 focus:ring-primary-400 focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      handleSqlSubmit();
                      setIsEditingSql(false);
                    }}
                    className="absolute right-3 bottom-3 px-3 py-1 rounded-md bg-primary-600 text-white text-xs font-medium hover:bg-primary-700"
                  >
                    Run SQL
                  </button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <SyntaxHighlighter 
                    language="sql" 
                    style={atomDark} 
                    customStyle={{
                      margin: 0,
                      padding: '12px 16px',
                      maxHeight: '100px',
                      fontSize: '0.875rem',
                      borderRadius: 0
                    }}
                  >
                    {sqlQuery}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          )}
          
          {/* Chat-style input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-white rounded-full shadow-lg flex items-center pl-6 pr-2 py-2 border border-gray-100">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your movie database..."
                className="bg-transparent text-dark-800 placeholder-gray-500 flex-grow focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex items-center justify-center hover:shadow-md transition-all duration-300 ml-2"
                onClick={handleSubmit}
              >
                <FiSend />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Add padding at the bottom to prevent content from being hidden behind the fixed input */}
      <div className="pb-60 md:pb-60"></div>
    </div>
  );
};

export default QueryInterface;