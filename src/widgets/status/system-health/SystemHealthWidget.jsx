import React from 'react';
import BaseWidget from '../../../core/base/BaseWidget.jsx';
import { formatTime, getStatusColor } from '../../../core/utils/formatters.js';
import { Server, Activity, Clock, Code } from 'lucide-react';
import './styles.css';

const SystemHealthWidget = ({ refreshInterval = 30000, ...props }) => {
  const fetchSystemHealth = async () => {
    try {
      // Use direct fetch like the working test
      const response = await fetch('https://www.karrathub.com/api/ecosystem/status');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('SystemHealth API Response:', data);
      return data;
    } catch (error) {
      console.error('SystemHealth fetch error:', error);
      throw new Error(`Failed to fetch system health: ${error.message}`);
    }
  };

  const renderContent = (data) => {
    console.log('Rendering SystemHealth with data:', data);
    
    // Handle both direct API response and wrapped response
    const healthData = data.data || data;
    
    if (!healthData) {
      return <div className="text-error">Invalid response from server</div>;
    }

    const {
      status,
      api_version,
      timestamp,
      environment,
      uptime,
      response_time_ms,
      active_connections,
      database_status,
      cache_status
    } = healthData;

    const statusColor = getStatusColor(status);

    return (
      <div className="system-health-content">
        {/* Main Status */}
        <div className="status-overview">
          <div className="status-indicator-large">
            <div 
              className="status-dot" 
              style={{ backgroundColor: statusColor }}
            />
            <div className="status-info">
              <div className="status-text">{status?.toUpperCase() || 'UNKNOWN'}</div>
              <div className="status-subtext">System Status</div>
            </div>
          </div>
          
          <div className="system-metrics">
            <div className="metric">
              <Activity size={16} />
              <span>Response: {response_time_ms || 'N/A'}ms</span>
            </div>
            <div className="metric">
              <Server size={16} />
              <span>Env: {environment || 'Unknown'}</span>
            </div>
          </div>
        </div>

        {/* Detailed Info */}
        <div className="health-details">
          <div className="detail-row">
            <div className="detail-label">
              <Code size={14} />
              API Version
            </div>
            <div className="detail-value">{api_version || 'Unknown'}</div>
          </div>
          
          <div className="detail-row">
            <div className="detail-label">
              <Clock size={14} />
              Last Updated
            </div>
            <div className="detail-value">{formatTime(timestamp)}</div>
          </div>
          
          {uptime && (
            <div className="detail-row">
              <div className="detail-label">Uptime</div>
              <div className="detail-value">{uptime}</div>
            </div>
          )}
        </div>

        {/* Service Status */}
        {(database_status || cache_status) && (
          <div className="service-status">
            {database_status && (
              <div className="service-item">
                <div 
                  className="service-indicator" 
                  style={{ backgroundColor: getStatusColor(database_status) }}
                />
                <span>Database</span>
                <span className="service-status-text">{database_status}</span>
              </div>
            )}
            
            {cache_status && (
              <div className="service-item">
                <div 
                  className="service-indicator" 
                  style={{ backgroundColor: getStatusColor(cache_status) }}
                />
                <span>Cache</span>
                <span className="service-status-text">{cache_status}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseWidget
      title="System Health"
      fetchData={fetchSystemHealth}
      renderContent={renderContent}
      refreshInterval={refreshInterval}
      className="system-health-widget"
      {...props}
    />
  );
};

export default SystemHealthWidget;