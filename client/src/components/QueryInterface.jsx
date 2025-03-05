import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiArrowLeft, FiDatabase, FiBarChart2, FiPieChart, FiTrendingUp, FiInfo, FiEdit2, FiArrowUpCircle, FiArrowDownCircle } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import axios from 'axios';
import CustomBarChart from './CustomBarChart';
import CustomPieChart from './CustomPieChart';
import CustomLineChart from './CustomLineChart';


const QueryInterface = () => {
  const [query, setQuery] = useState('');
  const [sqlQuery, setSqlQuery] = useState("");
  const [showVisualisations, setShowVisualisations] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isEditingSql, setIsEditingSql] = useState(false);
  const [queryResults, setQueryResults] = useState(null); // State to store query results
  const [tableData, setTableData] = useState(null);
  const [selectQuery, setSelectQuery] = useState(true);
  const sqlEditorRef = useRef(null);

  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState(null);


  const handleSubmit = async (e, errorHandling = null) => {
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
        db_config: dbConfig,
        ...(errorHandling ? { error: errorHandling } : {}) // Pass the error message if provided
      });
    
      console.log('Response from backend:', res.data);
      console.log('Generated SQL query:', res.data.sql_query);
    
      if (res.status === 200) {
        let cleanedQuery = res.data.sql_query;
        
        // Collapse multiple backslashes into one
        cleanedQuery = cleanedQuery.replace(/\\+/g, "\\");
        
        // Remove backslashes preceding asterisks and underscores
        cleanedQuery = cleanedQuery
          .replace(/\\\*/g, "*")  // Remove backslash before asterisk
          .replace(/\\_/g, "_");  // Remove backslash before underscore
        
        // Remove Markdown code block formatting
        cleanedQuery = cleanedQuery
          .replace(/```sql\n?/g, "")
          .replace(/```/g, "")
          .trim();
    
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
        let results;
        if (res.data.results) {
          results = res.data.results;
          setSelectQuery(true); // This is a SELECT query.
        } else if (typeof res.data.affected_rows !== 'undefined') {
          results = { message: `Affected rows: ${res.data.affected_rows}` };
          setSelectQuery(false); // Non-SELECT query: show alert.
        } else {
          results = { message: 'Query executed successfully.' };
        }
        setQueryResults(results);
        setShowResults(true);
      } else {
        // Check if error message indicates a missing relation
        if (res.data.error && res.data.error.includes('does not exist')) {
          console.warn('Detected missing relation error. Re-generating SQL with error handling.');
          // Call handleSubmit again with the actual error message
          handleSubmit({ preventDefault: () => {} }, res.data.error);
          return;
        } else {
          console.error('Error running SQL query:', res.status, res.data);
          alert(`Error running SQL query. Status: ${res.status}. See console.`);
        }
      }
    } catch (error) {
      // If we get a 400 error with a message, attempt to re-generate SQL with error handling
      if (
        error.response &&
        error.response.status === 400 &&
        error.response.data.error &&
        error.response.data.error.includes('does not exist')
      ) {
        console.warn('Caught error in raw-sql call. Re-generating SQL with error handling.');
        handleSubmit({ preventDefault: () => {} }, error.response.data.error);
        return;
      }
      console.error('Error sending query (raw-sql):', error);
      alert('Failed to send query (raw-sql). Check console for error.');
    }
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

  const fetchVisualizationData = async (results) => {
    if(!results.length==0){
      try {
        const visRes = await axios.post('http://localhost:8000/api/generate-visualizations/', {
            dataset: results
        });

        console.log('Visualization API Response:', visRes.data);

        if (visRes.status === 200) {
            // The response is already an object, so no need to JSON.parse
            const visualizations = visRes.data.visualizations;

            // Reset all charts to null first
            setBarChartData(null);
            setPieChartData(null);
            setLineChartData(null);

            // Loop through response and update state
            visualizations.forEach((vis) => {
                if (vis && vis.type === 'bar') setBarChartData(vis.data);
                if (vis && vis.type === 'pie') setPieChartData(vis.data);
                if (vis && vis.type === 'line') setLineChartData(vis.data);
            });
            console.log(barChartData, pieChartData, lineChartData);
        } else {
            console.error('Error fetching visualizations:', visRes.status, visRes.data);
        }
    } catch (error) {
        console.error('Error fetching visualization data:', error);
        alert('Failed to fetch visualization data.');
    }
    }

};

const exportTableDataToCSV = (tableData, filename = "export.csv") => {
  if (!tableData || tableData.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Get CSV headers from the keys of the first object
  const headers = Object.keys(tableData[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  tableData.forEach(row => {
    const values = headers.map(header => {
      let cell = row[header];
      if (cell == null) cell = "";
      cell = cell.toString().trim();
      // Escape double quotes by doubling them
      cell = cell.replace(/"/g, '""');
      // Wrap cell value in quotes if it contains commas, quotes, or newlines
      if (cell.search(/("|,|\n)/g) >= 0) {
        cell = `"${cell}"`;
      }
      return cell;
    });
    csvRows.push(values.join(","));
  });

  // Join all rows with new line characters
  const csvString = csvRows.join("\n");

  // Create a Blob from the CSV string and a temporary link to download it
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


useEffect(() => {
  setShowVisualisations(false);
  if (queryResults !== null && queryResults !== undefined) {
    if (selectQuery) {
      setTableData(queryResults);
    } else {
      alert("Database Updated");
      console.log("Database Updated");
    }
  }
}, [queryResults, selectQuery]);



  useEffect(() => {
    fetchVisualizationData(queryResults);
  }, [tableData]);
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
                
                <div className="md:col-span-3">
                <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold mb-3 gradient-text">Raw Data</h2>
                  <button
                    onClick={() => exportTableDataToCSV(tableData)}
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    Export CSV <FiArrowDownCircle className="w-5 h-5" />
                  </button>
                  </div>
                  
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

              </div>

              {/* Visualizations - Varied card sizes */}

                <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold mb-3 gradient-text">Visualizations</h2>
                <button onClick={() => setShowVisualisations(!showVisualisations)} className="flex items-center gap-2 text-primary-600 hover:text-primary-700"><FiArrowDownCircle/>Toggle</button>
                </div>
                {showVisualisations && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-9">

                  {barChartData && <CustomBarChart data={barChartData} />}

                  {pieChartData && <CustomPieChart data={pieChartData} />}

                  {lineChartData && <CustomLineChart data={lineChartData} />}
                </div>)}
              </div>
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