import { motion } from 'framer-motion';
import { FiDatabase, FiArrowRight } from 'react-icons/fi';

const HeroSection = ({ onConnectClick }) => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0070c4" />
              <stop offset="100%" stopColor="#6d28d9" />
            </linearGradient>
          </defs>
          <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="url(#grid-gradient)" />
          {Array.from({ length: 10 }).map((_, i) => (
            <line 
              key={`h-${i}`} 
              x1="0" 
              y1={i * 10} 
              x2="100" 
              y2={i * 10} 
              stroke="currentColor" 
              strokeWidth="0.1" 
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line 
              key={`v-${i}`} 
              x1={i * 10} 
              y1="0" 
              x2={i * 10} 
              y2="100" 
              stroke="currentColor" 
              strokeWidth="0.1" 
            />
          ))}
        </svg>
        
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-400 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute top-40 -left-20 w-80 h-80 bg-secondary-400 rounded-full opacity-10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-1/2 text-center lg:text-left"
          >
            <div className="inline-block px-4 py-2 bg-primary-50 text-primary-700 rounded-full mb-6">
              <span className="flex items-center text-sm font-medium">
                <FiDatabase className="mr-2" /> AI-Powered Database Intelligence
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Transform Your <span className="gradient-text">Database Queries</span> With AI
            </h1>
            
            <p className="text-lg text-dark-600 mb-8 max-w-xl mx-auto lg:mx-0">
              InsightBot turns your natural language into powerful SQL queries and beautiful visualizations. Connect your database and start getting insights in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                className="btn-primary flex items-center justify-center"
                onClick={onConnectClick}
              >
                Connect Your Database <FiArrowRight className="ml-2" />
              </button>
              <button className="btn-secondary">
                Watch Demo
              </button>
            </div>
            
            {/* <div className="mt-8 flex items-center justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
                ))}
              </div>
              <p className="ml-4 text-sm text-dark-600">
                <span className="font-semibold">500+</span> data teams trust InsightBot
              </p>
            </div> */}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:w-1/2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-4xl blur-xl"></div>
              <div className="relative bg-white/80 backdrop-blur-sm border border-white/40 shadow-soft rounded-4xl p-6 overflow-hidden">
                <div className="bg-dark-950 rounded-3xl p-4 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-gray-400 text-sm">InsightBot Query Interface</div>
                  </div>
                  
                  <div className="bg-dark-900 rounded-xl p-4 mb-4">
                    <p className="text-gray-300 mb-2 text-sm">Ask your database anything:</p>
                    <p className="text-white font-medium">Show me monthly revenue trends for the past year broken down by product category</p>
                  </div>
                  
                  <div className="bg-dark-800 rounded-xl p-4 mb-4">
                    <p className="text-gray-400 mb-2 text-sm">Generated SQL:</p>
                    <pre className="text-xs text-primary-300 overflow-x-auto">
                      {`SELECT 
  DATE_TRUNC('month', order_date) AS month,
  product_category,
  SUM(order_amount) AS revenue
FROM orders
JOIN products ON orders.product_id = products.id
WHERE order_date >= NOW() - INTERVAL '1 year'
GROUP BY 1, 2
ORDER BY 1, 2;`}
                    </pre>
                  </div>
                  
                  <div className="bg-dark-800 rounded-xl p-4">
                    <p className="text-gray-400 mb-2 text-sm">Visualization:</p>
                    <div className="h-40 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-lg flex items-center justify-center">
                      <p className="text-white text-sm">Interactive Chart Preview</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;