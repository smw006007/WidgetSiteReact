import React, { useState } from 'react';
import BaseWidget from '../../../core/base/BaseWidget.jsx';
import { formatKarrat, formatTimeAgo, truncateAddress } from '../../../core/utils/formatters.js';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Users, AlertTriangle, Minimize2, Maximize2, ExternalLink } from 'lucide-react';
import './styles.css';

const WhaleAlertsWidget = ({ limit = 10, refreshInterval = 60000, ...props }) => {
  const [isMinimal, setIsMinimal] = useState(false);

  const fetchWhaleAlerts = async () => {
    try {
      const response = await fetch(`https://www.karrathub.com/api/ecosystem/alerts?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('WhaleAlerts fetch error:', error);
      throw new Error(`Failed to fetch whale alerts: ${error.message}`);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy': case 'purchase': return <ArrowUpRight size={16} className="text-success" />;
      case 'sell': case 'sale': return <ArrowDownLeft size={16} className="text-error" />;
      case 'transfer': case 'whale_transfer': return <Users size={16} className="text-info" />;
      default: return <TrendingUp size={16} className="text-warning" />;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy': case 'purchase': return 'var(--success-color)';
      case 'sell': case 'sale': return 'var(--error-color)';
      case 'transfer': case 'whale_transfer': return 'var(--info-color)';
      default: return 'var(--warning-color)';
    }
  };

  const handleEtherscanClick = (e, txHash) => {
    e.stopPropagation(); // Prevent card click when clicking the explicit button
    window.open(`https://etherscan.io/tx/${txHash}`, '_blank', 'noopener,noreferrer');
  };

  const renderFullContent = (alerts) => {
    if (!Array.isArray(alerts) || alerts.length === 0) {
      return (
        <div className="whale-alerts-empty">
          <AlertTriangle size={48} />
          <h4>No Recent Whale Activity</h4>
          <p>No large transactions detected in the last 24 hours</p>
        </div>
      );
    }

    return (
      <div className="whale-alerts-content">
        <div className="alerts-header">
          <div className="alert-count">
            <TrendingUp size={16} />
            <span>{alerts.length} Recent Alerts</span>
            <span className="threshold-text">Min: 1,000 KARRAT</span>
          </div>
          <div className="header-controls">
            <button className="toggle-button" onClick={() => setIsMinimal(true)} title="Switch to minimal view">
              <Minimize2 size={14} />
            </button>
          </div>
        </div>
        <div className="alerts-list">
          {alerts.map((alert, index) => (
            <div 
              key={alert.id || index} 
              className="alert-item"
              style={{ cursor: alert.transaction_hash ? 'pointer' : 'default' }}
              onClick={alert.transaction_hash ? () => handleEtherscanClick(new Event(''), alert.transaction_hash) : undefined}
            >
              {alert.transaction_hash && <span className="click-to-view-indicator">VIEW</span>}
              <div className="alert-icon">{getTransactionIcon(alert.type || alert.transaction_type)}</div>
              <div className="alert-details">
                <div className="alert-main">
                  <div className="alert-amount">{formatKarrat(alert.amount || alert.value)}</div>
                  <div className="alert-type">
                    <span className="type-badge" style={{ backgroundColor: getTransactionTypeColor(alert.type || alert.transaction_type) }}>
                      {(alert.type || alert.transaction_type || 'Transaction').replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="alert-meta">
                  <div className="alert-addresses">
                    {alert.from_address && <span className="address">From: {truncateAddress(alert.from_address)}</span>}
                    {alert.to_address && <span className="address">To: {truncateAddress(alert.to_address)}</span>}
                    {alert.address && !alert.from_address && !alert.to_address && <span className="address">{truncateAddress(alert.address)}</span>}
                  </div>
                  <div className="alert-time">{formatTimeAgo(alert.timestamp || alert.created_at)}</div>
                </div>
              </div>
              <div className="alert-value">
                {alert.usd_value && <div className="usd-value">${Number(alert.usd_value).toLocaleString()}</div>}
                <div className="tx-hash">
                  {alert.transaction_hash && (
                    <a href={`https://etherscan.io/tx/${alert.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="tx-link" onClick={(e) => e.stopPropagation()}>
                      View TX
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderMinimalContent = (alerts) => {
    return (
      <div className="whale-alerts-minimal">
        <div className="minimal-header">
          <div className="minimal-count">
            <TrendingUp size={12} />
            <span>{alerts.length} Alerts</span>
          </div>
          <button className="toggle-button" onClick={() => setIsMinimal(false)} title="Switch to full view">
            <Maximize2 size={14} />
          </button>
        </div>
        
        {!alerts || alerts.length === 0 ? (
          <div className="whale-alerts-minimal-empty">
            <AlertTriangle size={24} />
            <span>No recent activity</span>
          </div>
        ) : (
          <div className="minimal-alerts-list">
            {alerts.map(alert => (
              <div 
                key={alert.id}
                className="minimal-data-row" 
                title={`View transaction for ${formatKarrat(alert.amount)}`}
                onClick={() => handleEtherscanClick(new Event(''), alert.transaction_hash)}
              >
                <span className="minimal-row-amount">{formatKarrat(alert.amount)}</span>
                <span className="minimal-row-time">{formatTimeAgo(alert.timestamp)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="minimal-summary">
          Min. 1,000 KARRAT
        </div>
      </div>
    );
  };

  const renderContent = (data) => {
    const alerts = data?.data || data?.alerts || [];
    return isMinimal ? renderMinimalContent(alerts) : renderFullContent(alerts);
  };

  return (
    <BaseWidget
      fetchData={fetchWhaleAlerts}
      renderContent={renderContent}
      refreshInterval={refreshInterval}
      className={`whale-alerts-widget ${isMinimal ? 'minimal' : 'full'}`}
      {...props}
    />
  );
};

export default WhaleAlertsWidget;