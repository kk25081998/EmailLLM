import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...', color = '#667eea' }) => {
  const sizeMap = {
    small: { width: '16px', height: '16px', fontSize: '0.8rem' },
    medium: { width: '24px', height: '24px', fontSize: '0.9rem' },
    large: { width: '32px', height: '32px', fontSize: '1rem' }
  };

  const spinnerSize = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.5rem',
      justifyContent: 'center'
    }}>
      <div
        style={{
          width: spinnerSize.width,
          height: spinnerSize.height,
          border: `2px solid #e2e8f0`,
          borderTop: `2px solid ${color}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
      {text && (
        <span style={{ 
          fontSize: spinnerSize.fontSize, 
          color: '#64748b' 
        }}>
          {text}
        </span>
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 