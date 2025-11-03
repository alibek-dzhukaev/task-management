import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import type { RegisterDto } from '@task-management/shared-types';

interface RegisterPageProps {
  onSwitchToLogin: () => void;
}

export function RegisterPage({ onSwitchToLogin }: RegisterPageProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registerData: RegisterDto = { email, password, name };
      const authResponse = await apiClient.register(registerData);
      login(authResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign Up</h1>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password (min 6 characters)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="******"
            style={{ width: '100%', padding: '8px', fontSize: '14px' }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', padding: '10px', background: '#ffe6e6', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <button
            type="button"
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#0070f3',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
}

