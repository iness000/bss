import { motion } from 'framer-motion';
import { AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

interface ErrorDisplayProps {
  type: 'auth' | 'battery_refused' | 'swap_error' | 'general';
  message: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  type, 
  message, 
  onRetry, 
  onCancel 
}) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'auth':
        return {
          icon: <XCircle className="w-16 h-16 text-red-400" />,
          title: 'Authentication Failed',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50'
        };
      case 'battery_refused':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-yellow-400" />,
          title: 'Battery Rejected',
          bgColor: 'bg-yellow-500/20',
          borderColor: 'border-yellow-500/50'
        };
      case 'swap_error':
        return {
          icon: <XCircle className="w-16 h-16 text-red-400" />,
          title: 'Swap Failed',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/50'
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16 text-orange-400" />,
          title: 'Error',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500/50'
        };
    }
  };

  const config = getErrorConfig();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`${config.bgColor} ${config.borderColor} border-2 rounded-xl p-8 text-center`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="flex justify-center mb-6"
      >
        {config.icon}
      </motion.div>

      <h3 className="text-2xl font-bold text-white mb-4">
        {config.title}
      </h3>

      <p className="text-white/80 mb-8 text-lg">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;