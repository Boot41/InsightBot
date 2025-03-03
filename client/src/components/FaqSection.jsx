import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiMinus } from 'react-icons/fi';

const faqs = [
  {
    question: "How does InsightBot convert natural language to SQL?",
    answer: "InsightBot uses advanced natural language processing and machine learning models specifically trained on SQL syntax and database schemas. It understands context, database relationships, and common query patterns to generate accurate SQL from your questions."
  },
  {
    question: "Which databases does InsightBot support?",
    answer: "InsightBot supports all major SQL databases including PostgreSQL, MySQL, MariaDB, SQL Server, Oracle, SQLite, and more. We're constantly adding support for additional database types."
  },
  {
    question: "Is my data secure when using InsightBot?",
    answer: "Absolutely. InsightBot never stores your actual data. We use encrypted connections, and you can choose to run queries through your own infrastructure. We're SOC 2 and GDPR compliant, with enterprise-grade security measures in place."
  },
  {
    question: "Do I need to know SQL to use InsightBot?",
    answer: "Not at all! That's the beauty of InsightBot. You can ask questions in plain English, and our AI will generate the SQL for you. However, if you do know SQL, you can also review and modify the generated queries."
  },
  {
    question: "Can InsightBot handle complex queries with joins and subqueries?",
    answer: "Yes, InsightBot can generate complex SQL including multiple joins, subqueries, window functions, and more. Our AI has been trained on millions of SQL queries ranging from simple to highly complex."
  },
  {
    question: "How accurate are the visualizations?",
    answer: "InsightBot's visualization engine analyzes your data structure and query results to automatically select the most appropriate chart type. It handles data cleaning and formatting, ensuring accurate and meaningful visualizations every time."
  }
];

const FaqItem = ({ question, answer, isOpen, onClick, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="border-b border-gray-200 py-5"
    >
      <button
        className="flex justify-between items-center w-full text-left"
        onClick={onClick}
      >
        <h3 className="text-lg font-medium text-dark-800">{question}</h3>
        <span className="ml-6 flex-shrink-0 text-primary-600">
          {isOpen ? <FiMinus /> : <FiPlus />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-dark-600">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Frequently Asked <span className="gradient-text">Questions</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-dark-600 max-w-2xl mx-auto"
          >
            Everything you need to know about InsightBot and how it can transform your database experience.
          </motion.p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FaqItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => toggleFaq(index)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;