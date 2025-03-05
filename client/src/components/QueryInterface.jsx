import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiArrowLeft, FiDatabase, FiArrowDownCircle, FiSend, FiArrowUpCircle, FiEdit2, FiX, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import CustomBarChart from './CustomBarChart';
import CustomPieChart from './CustomPieChart';
import CustomLineChart from './CustomLineChart';

const QueryInterface = () => {
  // Initialize tabs state; each tab stores its own query & result data.
  const [tabs, setTabs] = useState([
    {
      id: 1,
      name: 'Query 1',
      query: '',
      sqlQuery: '',
      showVisualisations: false,
      showResults: false,
      isEditingSql: false,
      queryResults: null,
      tableData: null,
      selectQuery: true,
      barChartData: null,
      pieChartData: null,
      lineChartData: null,
      isLoading: false,
    }
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);
  const sqlEditorRef = useRef(null);

  // Helper functions to get and update the active tab
  const getActiveTab = () => tabs.find(tab => tab.id === activeTabId);

  const updateActiveTab = (updates) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, ...updates } : tab
      )
    );
  };
   
  // Tab management functions
  const addNewTab = () => {
    const newTab = {
      id: nextTabId,
      name: `Query ${nextTabId}`,
      query: '',
      sqlQuery: '',
      showVisualisations: false,
      showResults: false,
      isEditingSql: false,
      queryResults: null,
      tableData: null,
      selectQuery: true,
      barChartData: null,
      pieChartData: null,
      lineChartData: null,
      isLoading: false,
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(nextTabId);
    setNextTabId(nextTabId + 1);
  };

  const closeTab = (tabId, event) => {
    event.stopPropagation();
    if (tabs.length > 1) {
      const newTabs = tabs.filter(tab => tab.id !== tabId);
      setTabs(newTabs);
      if (activeTabId === tabId) {
        setActiveTabId(newTabs[newTabs.length - 1].id);
      }
    }
  };

  const switchTab = (tabId) => {
    setActiveTabId(tabId);
  };

  // ---------------------------
  // API CALLS & EVENT HANDLERS
  // ---------------------------

  const handleSubmit = async (e, errorHandling = null) => {
    e.preventDefault();
    const activeTab = getActiveTab();
    console.log('Query submitted:', activeTab.query);

    // Get dbConfig from localStorage
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

    try {
      const res = await axios.post('http://localhost:8000/api/generate-sql/', {
        natural_language: activeTab.query,
        db_config: dbConfig,
        ...(errorHandling ? { error: errorHandling } : {})
      });

      console.log('Response from backend:', res.data);
      if (res.status === 200) {
        let cleanedQuery = res.data.sql_query;
        // Clean up the SQL string
        cleanedQuery = cleanedQuery.replace(/\\+/g, "\\")
          .replace(/\\\*/g, "*")
          .replace(/\\_/g, "_")
          .replace(/```sql\n?/g, "")
          .replace(/```/g, "")
          .trim();
        updateActiveTab({ sqlQuery: cleanedQuery, showResults: true });
      } else {
        console.error('Error generating SQL:', res.status, res.data);
        alert(`Error generating SQL. Status: ${res.status}. See console.`);
      }
    } catch (error) {
      console.error('Error sending query:', error);
      alert('Failed to send query. Check console for error.');
    }
    updateActiveTab({ showResults: true });
  };

  const runQuery = async () => {
    const activeTab = getActiveTab();
    // Get dbConfig from localStorage
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

    if (!activeTab.sqlQuery) {
      alert('No SQL query to run. Generate a query first.');
      return;
    }

    console.log('Running SQL query:', activeTab.sqlQuery);
    try {
      const res = await axios.post('http://localhost:8000/api/raw-sql/', {
        query: activeTab.sqlQuery,
        db_config: dbConfig
      });

      console.log('Response from backend (raw-sql):', res.data);
      if (res.status === 200) {
        let results;
        if (res.data.results) {
          results = res.data.results;
          updateActiveTab({ queryResults: results, selectQuery: true, showResults: true });
        } else if (typeof res.data.affected_rows !== 'undefined') {
          results = { message: `Affected rows: ${res.data.affected_rows}` };
          updateActiveTab({ queryResults: results, selectQuery: false, showResults: true });
        } else {
          results = { message: 'Query executed successfully.' };
          updateActiveTab({ queryResults: results, showResults: true });
        }
      } else {
        if (res.data.error && res.data.error.includes('does not exist')) {
          console.warn('Detected missing relation error. Re-generating SQL with error handling.');
          handleSubmit({ preventDefault: () => {} }, res.data.error);
          return;
        } else {
          console.error('Error running SQL query:', res.status, res.data);
          alert(`Error running SQL query. Status: ${res.status}. See console.`);
        }
      }
    } catch (error) {
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
    const activeTab = getActiveTab();
    updateActiveTab({ isEditingSql: !activeTab.isEditingSql });
    setTimeout(() => {
      if (sqlEditorRef.current) {
        sqlEditorRef.current.focus();
      }
    }, 0);
  };

  const fetchVisualizationData = async (results) => {
    if (results && results.length > 0) {
      try {
        const visRes = await axios.post('http://localhost:8000/api/generate-visualizations/', {
          dataset: results
        });

        console.log('Visualization API Response:', visRes.data);
        if (visRes.status === 200) {
          const visualizations = visRes.data.visualizations;
          let newBarChartData = null;
          let newPieChartData = null;
          let newLineChartData = null;

          visualizations.forEach((vis) => {
            if (vis && vis.type === 'bar') newBarChartData = vis.data;
            if (vis && vis.type === 'pie') newPieChartData = vis.data;
            if (vis && vis.type === 'line') newLineChartData = vis.data;
          });
          updateActiveTab({
            barChartData: newBarChartData,
            pieChartData: newPieChartData,
            lineChartData: newLineChartData,
          });
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
    const headers = Object.keys(tableData[0]);
    const csvRows = [];
    csvRows.push(headers.join(","));
    tableData.forEach(row => {
      const values = headers.map(header => {
        let cell = row[header];
        if (cell == null) cell = "";
        cell = cell.toString().trim();
        cell = cell.replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) {
          cell = `"${cell}"`;
        }
        return cell;
      });
      csvRows.push(values.join(","));
    });
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------
  // SIDE EFFECTS
  // ---------------------------

  // Get the active tab from the tabs array.
  const activeTab = tabs.find(tab => tab.id === activeTabId);

  // Update table data when queryResults changes.
  useEffect(() => {
    if (activeTab && activeTab.queryResults !== null) {
      if (activeTab.selectQuery) {
        if (activeTab.tableData !== activeTab.queryResults) {
          updateActiveTab({ tableData: activeTab.queryResults });
        }
      } else {
        alert("Database Updated");
        console.log("Database Updated");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.queryResults]);

  // Fetch visualizations when tableData updates.
  useEffect(() => {
    if (activeTab && activeTab.tableData) {
      fetchVisualizationData(activeTab.tableData);
    }
  }, [activeTab?.tableData]);
  

  // ---------------------------
  // RENDERING
  // ---------------------------
  return (
    <div className="min-h-screen flex flex-col query-interface">
      {/* Main Header */}
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

      {/* Tabs Navigation */}
      <div className="bg-white rounded-t-lg shadow">
        <div className="flex items-center space-x-2 p-2 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer ${
                activeTabId === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <span>{tab.name}</span>
              {tabs.length > 1 && (
                <FiX
                  className="h-4 w-4 text-gray-500 hover:text-red-500"
                  onClick={(e) => closeTab(tab.id, e)}
                />
              )}
            </div>
          ))}
          <button
            onClick={addNewTab}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiPlus className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto">
        {!activeTab?.showResults ? (
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
              {/* Results Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Raw Data Table */}
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-bold mb-3 gradient-text">Raw Data</h2>
                    <button
                      onClick={() => exportTableDataToCSV(activeTab.tableData)}
                      className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                    >
                      Export CSV <FiArrowDownCircle className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="card overflow-x-auto h-[500px]">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          {activeTab.tableData && activeTab.tableData[0] && Object.keys(activeTab.tableData[0]).map((header) => (
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
                        {activeTab.tableData && activeTab.tableData.map((row, index) => (
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

              {/* Visualizations */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold mb-3 gradient-text">Visualizations</h2>
                  <button
                    onClick={() =>
                      updateActiveTab({ showVisualisations: !activeTab.showVisualisations })
                    }
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700"
                  >
                    <FiArrowDownCircle />Toggle
                  </button>
                </div>
                {activeTab.showVisualisations && (
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-9">
                    {activeTab.barChartData && <CustomBarChart data={activeTab.barChartData} />}
                    {activeTab.pieChartData && <CustomPieChart data={activeTab.pieChartData} />}
                    {activeTab.lineChartData && <CustomLineChart data={activeTab.lineChartData} />}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Floating Chat-Style Input */}
      <div className="fixed bottom-6 left-0 right-0 z-10 flex justify-center px-4">
        <div className="w-full max-w-3xl">
          {activeTab?.showResults && (
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
                    {activeTab.isEditingSql ? 'Cancel' : 'Edit SQL'}
                  </button>
                </div>
              </div>
              {activeTab.isEditingSql ? (
                <div className="relative">
                  <textarea
                    ref={sqlEditorRef}
                    value={activeTab.sqlQuery}
                    onChange={(e) => updateActiveTab({ sqlQuery: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 text-dark-900 font-mono text-sm h-24 border-none focus:ring-1 focus:ring-primary-400 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="overflow-hidden">
                  <SyntaxHighlighter 
                    language="sql" 
                    style={atomOneDark} 
                    customStyle={{
                      margin: 0,
                      padding: '12px 16px',
                      maxHeight: '100px',
                      fontSize: '0.875rem',
                      borderRadius: 0
                    }}
                  >
                    {activeTab.sqlQuery}
                  </SyntaxHighlighter>
                </div>
              )}
            </div>
          )}

          {/* Chat-style Input */}
          <form onSubmit={handleSubmit} className="relative">
            <div className="bg-white rounded-full shadow-lg flex items-center pl-6 pr-2 py-2 border border-gray-100">
              <input
                type="text"
                value={activeTab.query}
                onChange={(e) => updateActiveTab({ query: e.target.value })}
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

      {/* Bottom Padding to Prevent Hidden Content */}
      <div className="pb-60 md:pb-60"></div>
    </div>
  );
};

export default QueryInterface;
