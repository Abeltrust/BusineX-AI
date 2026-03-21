import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { BusinessDataProvider } from './contexts/BusinessDataContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BusinessDataProvider>
          <App />
        </BusinessDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
