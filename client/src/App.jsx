import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import DemoSection from './components/DemoSection';
import FaqSection from './components/FaqSection';
import CtaSection from './components/CtaSection';
import Footer from './components/Footer';
import ConnectionDialog from './components/ConnectionDialog';
import QueryInterface from './components/QueryInterface';

function App() {
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          window.scrollTo({
            top: targetElement.offsetTop - 80, // Adjust for navbar height
            behavior: 'smooth'
          });
        }
      });
    });
  }, []);

  const handleOpenConnectionDialog = () => {
    setIsConnectionDialogOpen(true);
  };

  const handleCloseConnectionDialog = () => {
    setIsConnectionDialogOpen(false);
  };

  const handleConnect = (connectionDetails) => {
    console.log('Connection details:', connectionDetails);
    setIsConnectionDialogOpen(false);
    setIsConnected(true);
  };

  if (isConnected) {
    return <QueryInterface />;
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="bg-glow"></div>
      <Navbar onConnectClick={handleOpenConnectionDialog} />
      <main>
        <HeroSection onConnectClick={handleOpenConnectionDialog} />
        <FeaturesSection />
        {/* <DemoSection /> */}
        <FaqSection />
        <CtaSection onConnectClick={handleOpenConnectionDialog} />
      </main>
      <Footer />
      
      {isConnectionDialogOpen && (
        <ConnectionDialog 
          onClose={handleCloseConnectionDialog} 
          onConnect={handleConnect}
        />
      )}
    </div>
  );
}

export default App;