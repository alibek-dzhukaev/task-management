import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UsersPage } from './pages/UsersPage';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isAuthenticated) {
    return <UsersPage />;
  }

  if (showRegister) {
    return <RegisterPage onSwitchToLogin={() => setShowRegister(false)} />;
  }

  return <LoginPage onSwitchToRegister={() => setShowRegister(true)} />;
}

export function App() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App;
