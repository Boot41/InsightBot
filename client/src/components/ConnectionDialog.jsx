import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDatabase } from 'react-icons/fi';

const ConnectionDialog = ({ onClose, onConnect }) => {
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConnect(formData);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-dark-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl shadow-lg max-w-md w-full overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white mr-3">
                <FiDatabase size={20} />
              </div>
              <h3 className="text-xl font-semibold">Connect to Database</h3>
            </div>
            <button 
              onClick={onClose}
              className="text-dark-400 hover:text-dark-600 transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="form-label">Connection Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Database"
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="host" className="form-label">Host Name / Address</label>
                <input
                  type="text"
                  id="host"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  placeholder="localhost or db.example.com"
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="port" className="form-label">Port</label>
                <input
                  type="text"
                  id="port"
                  name="port"
                  value={formData.port}
                  onChange={handleChange}
                  placeholder="5432"
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="database" className="form-label">Maintenance Database</label>
                <input
                  type="text"
                  id="database"
                  name="database"
                  value={formData.database}
                  onChange={handleChange}
                  placeholder="postgres"
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="postgres"
                  className="form-input"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                type="submit"
                className="w-full btn-primary"
              >
                Connect
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConnectionDialog;