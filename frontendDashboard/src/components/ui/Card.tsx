import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  onClick 
}) => {
  const baseClasses = 'bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg';
  const hoverClasses = hover ? 'hover:bg-white/20 transition-all duration-300 cursor-pointer' : '';
  const cardClasses = `${baseClasses} ${hoverClasses} ${className}`;

  const CardComponent = onClick ? motion.div : 'div';

  return (
    <CardComponent
      className={cardClasses}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={hover ? { scale: 0.98 } : {}}
    >
      {children}
    </CardComponent>
  );
};

export default Card;