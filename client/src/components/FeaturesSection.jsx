import { motion } from 'framer-motion';
import { FiCode, FiPieChart, FiDatabase, FiTrendingUp, FiShield, FiCpu } from 'react-icons/fi';

const features = [
  {
    icon: <FiCode />,
    title: "AI-Powered SQL Generation",
    description: "Transform natural language into optimized SQL queries with our advanced AI engine. No more complex query writing."
  },
  {
    icon: <FiPieChart />,
    title: "Smart Visualizations",
    description: "Automatically generate the most appropriate charts and graphs based on your query results and data types."
  },
  {
    icon: <FiDatabase />,
    title: "Multi-Database Support",
    description: "Connect to PostgreSQL, MySQL, SQL Server, Oracle, and more with our universal database adapter."
  },
  {
    icon: <FiTrendingUp />,
    title: "Intelligent Analysis",
    description: "Get AI-powered insights and anomaly detection that highlight important patterns in your data."
  },
  {
    icon: <FiShield />,
    title: "Secure Connection",
    description: "Enterprise-grade security with encrypted connections and role-based access control for your database."
  },
  {
    icon: <FiCpu />,
    title: "Query Optimization",
    description: "Automatically optimize queries for performance with our intelligent query planning engine."
  }
];

const FeatureCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="card group hover:bg-gradient-to-br hover:from-primary-50 hover:to-secondary-50"
    >
      <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-4 group-hover:bg-gradient-to-r group-hover:from-primary-500 group-hover:to-secondary-500 group-hover:text-white transition-all duration-300">
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-dark-600">{description}</p>
    </motion.div>
  );
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-white to-primary-50/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Powerful <span className="gradient-text">Features</span> at Your Fingertips
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-dark-600 max-w-2xl mx-auto"
          >
            InsightBot combines cutting-edge AI with powerful database tools to transform how you interact with your data.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;