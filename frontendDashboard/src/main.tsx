import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SocketLogger from './components/DebugSocket';
import './index.css';
import { ProgressProvider } from './context/ProgressContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <ProgressProvider>
       <App />
    </ProgressProvider>
  </StrictMode>
);
