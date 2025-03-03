import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar = ({ onConnectClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl font-bold gradient-text">InsightBot</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-dark-800 hover:text-primary-600 transition-colors">Features</a>
          <a href="#demo" className="text-dark-800 hover:text-primary-600 transition-colors">Demo</a>
          <a href="#faq" className="text-dark-800 hover:text-primary-600 transition-colors">FAQ</a>
          <a href="#pricing" className="text-dark-800 hover:text-primary-600 transition-colors">Pricing</a>
          <button 
            className="btn-primary"
            onClick={onConnectClick}
          >
            Connect Your Database
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-dark-800 p-2"
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white shadow-md"
        >
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <a 
              href="#features" 
              className="text-dark-800 hover:text-primary-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="text-dark-800 hover:text-primary-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Demo
            </a>
            <a 
              href="#faq" 
              className="text-dark-800 hover:text-primary-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </a>
            <a 
              href="#pricing" 
              className="text-dark-800 hover:text-primary-600 transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            <button 
              className="btn-primary w-full"
              onClick={() => {
                setIsMenuOpen(false);
                onConnectClick();
              }}
            >
              Connect Your Database
            </button>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;