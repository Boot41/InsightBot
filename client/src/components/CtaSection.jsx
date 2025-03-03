import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

const CtaSection = ({ onConnectClick }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-6"
          >
            Ready to Transform Your Database Experience?
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xl text-white/90 mb-8"
          >
            Join hundreds of data teams who are already using InsightBot to unlock the power of their databases.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button 
              className="px-8 py-4 bg-white text-primary-700 font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
              onClick={onConnectClick}
            >
              Connect Your Database <FiArrowRight className="ml-2" />
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-medium rounded-full hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
              Schedule a Demo
            </button>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 text-white/80"
          >
            No credit card required. Free trial for 14 days.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;