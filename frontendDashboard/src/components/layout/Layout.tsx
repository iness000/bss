import React from 'react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  backgroundClass?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title, 
  subtitle, 
  backgroundClass = "bg-gradient-to-br from-blue-400 to-blue-600" 
}) => {
  return (
    <div className={`min-h-screen w-full transition-colors duration-700 ${backgroundClass}`}>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-4xl font-bold text-white mb-2">{title}</h1>
              )}
              {subtitle && (
                <p className="text-white/80 text-lg">{subtitle}</p>
              )}
            </div>
          )}
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl p-6 shadow-card">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Layout;