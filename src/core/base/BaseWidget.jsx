import React, { useState, useEffect } from 'react';

const BaseWidget = ({ 
  title, 
  fetchData, 
  renderContent, 
  refreshInterval = null,
  className = '',
  ...props 
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const result = await fetchData();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      console.error('Widget data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className={`base-widget ${className}`} {...props}>
        <div className="widget-header">
          <h3>{title}</h3>
        </div>
        <div className="widget-content">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`base-widget ${className}`} {...props}>
        <div className="widget-header">
          <h3>{title}</h3>
        </div>
        <div className="widget-content">
          <div style={{ color: '#ef4444' }}>Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`base-widget ${className}`} {...props}>
      <div className="widget-header">
        <h3>{title}</h3>
      </div>
      <div className="widget-content">
        {data && renderContent(data)}
        {!data && <div>No data available</div>}
      </div>
    </div>
  );
};

export default BaseWidget;