import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const demoSlides = [
  {
    title: "Natural Language to SQL",
    description: "Simply type your question and InsightBot generates the perfect SQL query.",
    image: "query-generation"
  },
  {
    title: "Instant Visualizations",
    description: "Get beautiful charts and graphs automatically generated from your query results.",
    image: "visualization"
  },
  {
    title: "Smart Data Analysis",
    description: "Receive AI-powered insights that highlight important patterns and anomalies.",
    image: "analysis"
  }
];

const DemoSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === demoSlides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? demoSlides.length - 1 : prev - 1));
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-primary-50/30 to-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            See InsightBot <span className="gradient-text">in Action</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-dark-600 max-w-2xl mx-auto"
          >
            Experience how InsightBot transforms database interactions with these interactive demos.
          </motion.p>
        </div>
        
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-4xl blur-xl -z-10"></div>
          
          <div className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-soft rounded-4xl p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <motion.div 
                key={activeSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="md:w-1/2"
              >
                <div className="bg-dark-950 rounded-3xl p-4 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="mx-auto text-gray-400 text-sm">InsightBot Demo</div>
                  </div>
                  
                  <div className="h-64 bg-gradient-to-r from-primary-500/30 to-secondary-500/30 rounded-xl flex items-center justify-center">
                    <p className="text-white">Demo: {demoSlides[activeSlide].image}</p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                key={`text-${activeSlide}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="md:w-1/2"
              >
                <h3 className="text-2xl font-bold mb-4">{demoSlides[activeSlide].title}</h3>
                <p className="text-dark-600 mb-6">{demoSlides[activeSlide].description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {demoSlides.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === activeSlide 
                            ? 'bg-primary-600 w-6' 
                            : 'bg-primary-200'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-full border border-primary-200 flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
                      aria-label="Previous slide"
                    >
                      <FiChevronLeft />
                    </button>
                    <button 
                      onClick={nextSlide}
                      className="w-10 h-10 rounded-full border border-primary-200 flex items-center justify-center text-primary-600 hover:bg-primary-50 transition-colors"
                      aria-label="Next slide"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;