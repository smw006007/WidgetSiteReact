import React, { useState } from 'react';

const ApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      // Test the direct URL without using our client
      const response = await fetch('https://www.karrathub.com/api/ecosystem/status');
      const data = await response.json();
      
      setTestResult({
        success: true,
        data: data,
        message: 'Direct API test successful!',
        url: 'https://www.karrathub.com/api/ecosystem/status'
      });
    } catch (error) {
      setTestResult({
        success: false,
        error: error,
        message: `Direct API test failed: ${error.message}`,
        url: 'https://www.karrathub.com/api/ecosystem/status'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white'
    }}>
      <h3>Direct API Test</h3>
      <p>Testing direct connection to: https://www.karrathub.com/api/ecosystem/status</p>
      
      <button 
        onClick={testApi} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#666' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Testing...' : 'Test Direct API Connection'}
      </button>
      
      {testResult && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: testResult.success ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 0, 0, 0.1)',
          borderRadius: '4px'
        }}>
          <h4>{testResult.message}</h4>
          <p><strong>URL tested:</strong> {testResult.url}</p>
          <pre style={{ 
            fontSize: '12px', 
            overflow: 'auto', 
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            padding: '10px',
            borderRadius: '4px'
          }}>
            {JSON.stringify(testResult.success ? testResult.data : testResult.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;