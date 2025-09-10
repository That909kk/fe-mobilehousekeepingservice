import React from 'react';
import { useAuth } from '../shared/hooks/useAuth';

const DebugUserInfo: React.FC = () => {
  const { user, role, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ 
      padding: '20px', 
      background: '#f5f5f5', 
      borderRadius: '8px', 
      margin: '20px',
      fontFamily: 'monospace'
    }}>
      <h3>Debug User Info</h3>
      <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</div>
      <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
      <div><strong>User Object:</strong></div>
      <pre style={{ background: 'white', padding: '10px', borderRadius: '4px' }}>
        {JSON.stringify(user, null, 2)}
      </pre>
      <div><strong>Role from Auth State:</strong> {role || 'Not found'}</div>
      <div><strong>Role Type:</strong> {typeof role}</div>
      <div><strong>Role Check (CUSTOMER):</strong> {role === 'CUSTOMER' ? 'MATCH' : 'NO MATCH'}</div>
      <div><strong>User Role Property:</strong> {(user as any)?.role || 'Not found'}</div>
      <div><strong>User Role Type:</strong> {typeof (user as any)?.role}</div>
    </div>
  );
};

export default DebugUserInfo;
