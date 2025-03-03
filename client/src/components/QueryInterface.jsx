import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiArrowLeft, FiDatabase, FiBarChart2, FiPieChart, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Query submitted:', query);
    // Here you would typically send the query to your backend
    setShowResults(true);
  };

  return (
    <div className="min-h-screen query-interface flex flex-col">
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

      {/* Main content area */}
      <div className="flex-grow overflow-auto">
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
              {/* Query Result Section */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 gradient-text">Your Query</h2>
                <div className="card mb-4">
                  <p className="text-dark-700 font-medium">{query || "Show me the top 10 highest-rated movies with their genres and stream counts"}</p>
                </div>
                
                <h2 className="text-xl font-bold mb-3 gradient-text">Generated SQL</h2>
                <div className="card mb-4 overflow-hidden">
                  <SyntaxHighlighter language="sql" style={atomDark} customStyle={{borderRadius: '1rem', margin: 0}}>
                    {mockSqlQuery}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Data Table */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 gradient-text">Raw Data</h2>
                <div className="card overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Genre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-500 uppercase tracking-wider">Streams</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {movieData.map((movie) => (
                        <tr key={movie.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-900">{movie.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-700">{movie.genre}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-700">{movie.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-700">{movie.rating}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-700">{movie.streams.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visualizations */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 gradient-text">Visualizations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className="card">
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

                  {/* Pie Chart */}
                  <div className="card">
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

                  {/* Line Chart */}
                  <div className="card">
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

                  {/* Stream Count Chart */}
                  <div className="card">
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
                </div>
              </div>

              {/* AI Insights */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3 gradient-text">AI Insights</h2>
                <div className="card">
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
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Query input at the bottom */}
      <div className="p-6 bg-white/50 backdrop-blur-sm border-t border-gray-100">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question about your movie database..."
              className="query-input pr-14"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white flex items-center justify-center hover:shadow-md transition-all duration-300"
            >
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QueryInterface;