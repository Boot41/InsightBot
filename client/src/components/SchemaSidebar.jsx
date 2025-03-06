import React, { useState, useEffect, useRef } from 'react';
import {
  FiChevronDown,
  FiChevronRight

} from 'react-icons/fi';
import { motion,AnimatePresence } from 'framer-motion';


/**
 * Sidebar component to display the database schema hierarchically.
 * Expected schema format:
 * {
 *   "public": {
 *      "table_name": [ { column_name, data_type, ... }, ... ],
 *      ...
 *   },
 *   ...
 * }
 */
const SchemaSidebar = ({ schema }) => {
    // States to control expanded/collapsed status
    const [expandedSchemas, setExpandedSchemas] = useState({});
    const [expandedTables, setExpandedTables] = useState({});
  
    const toggleSchema = (schemaName) => {
      setExpandedSchemas((prev) => ({
        ...prev,
        [schemaName]: !prev[schemaName]
      }));
    };
  
    const toggleTable = (schemaName, tableName) => {
      const key = `${schemaName}_${tableName}`;
      setExpandedTables((prev) => ({
        ...prev,
        [key]: !prev[key]
      }));
    };
  
    return (
      <div
        className="bg-gray-50 h-screen p-4 overflow-y-auto border-r border-gray-200"
      >
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
          Your Tables
        </h2>
        {(!schema || Object.keys(schema).length === 0) ? (
          <p className="text-gray-500">No schema loaded.</p>
        ) : (
          Object.entries(schema).map(([schemaName, tables]) => (
            <div key={schemaName} className="mb-4">
              <div
                onClick={() => toggleSchema(schemaName)}
                className="cursor-pointer flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg font-bold text-gray-800">{schemaName}</span>
                <span className="text-gray-600">
                  {expandedSchemas[schemaName] ? (
                    <FiChevronDown size={20} />
                  ) : (
                    <FiChevronRight size={20} />
                  )}
                </span>
              </div>
              <AnimatePresence>
                {expandedSchemas[schemaName] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-4 mt-2 overflow-hidden"
                  >
                    {Object.entries(tables).map(([tableName, columns]) => {
                      const key = `${schemaName}_${tableName}`;
                      return (
                        <div key={tableName} className="mb-2">
                          <div
                            onClick={() => toggleTable(schemaName, tableName)}
                            className="cursor-pointer flex items-center justify-between p-2 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-md font-semibold text-gray-700">{tableName}</span>
                            <span className="text-gray-500">
                              {expandedTables[key] ? (
                                <FiChevronDown size={18} />
                              ) : (
                                <FiChevronRight size={18} />
                              )}
                            </span>
                          </div>
                          <AnimatePresence>
                            {expandedTables[key] && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="ml-4 mt-1 overflow-hidden"
                              >
                                {columns.map((col, index) => (
                                  <li
                                    key={index}
                                    className="text-sm text-gray-600 py-1 border-b border-gray-100"
                                  >
                                    <span className="font-medium">{col.column_name}</span>
                                    <span className="italic text-xs text-gray-500 ml-1">
                                      ({col.data_type})
                                    </span>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    );
  };

  export default SchemaSidebar;