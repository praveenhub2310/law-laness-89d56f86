
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { GoogleDriveProvider } from './contexts/GoogleDriveContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <GoogleDriveProvider>
      <App />
    </GoogleDriveProvider>
  </AuthProvider>
);
