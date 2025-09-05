import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import BaseWidget from '../../../core/base/BaseWidget.jsx';
import { formatKarrat, formatTimeAgo, truncateAddress } from '../../../core/utils/formatters.js';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, AlertTriangle, Maximize2, X, ChevronDown, ChevronUp } from 'lucide-react';
import './styles.css';

const WhaleAlertsWidget = ({ limit = 10, refreshInterval = 60000, ...props }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedGroupId, setExpandedGroupId] = useState(null);

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
  
  const groupTransactions = (alerts) => {
    if (!Array.isArray(alerts) || alerts.length === 0) return [];

    const cleanedAlerts = alerts.map(a => ({
        ...a,
        amount: Number(a.amount) || 0,
        usd_value: Number(a.usd_value) || 0,
    })).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const groups = [];
    const timeWindow = 15 * 60 * 1000; // 15 minutes

    cleanedAlerts.forEach(alert => {
      const targetGroup = groups.find(group => {
        const timeDiff = Math.abs(new Date(group.timestamp) - new Date(alert.timestamp));
        return (
          group.from_address === alert.from_address &&
          group.type === alert.type &&
          timeDiff < timeWindow
        );
      });

      if (targetGroup) {
        targetGroup.amount += alert.amount;
        targetGroup.usd_value += alert.usd_value;
        targetGroup.transactions.push(alert);
        targetGroup.timestamp = new Date(targetGroup.timestamp) > new Date(alert.timestamp) 
            ? targetGroup.timestamp 
            : alert.timestamp;
      } else {
        groups.push({
          ...alert,
          transactions: [alert],
        });
      }
    });

    return groups.map(group => {
      const isGrouped = group.transactions.length > 1;
      if (isGrouped) {
        group.isGrouped = true;
        group.id = group.transactions.map(t => t.id).join('-');
        const toAddresses = [...new Set(group.transactions.map(t => t.to_address))];
        if (toAddresses.length > 1) {
            group.to_address_display = `${toAddresses.length} addresses`;
            group.to_address = null;
        }
      }
      return group;
    });
  };

  const getTransactionIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'buy': case 'purchase': return <ArrowUpRight size={16} className="text-success" />;
      case 'sell': case 'sale': return <ArrowDownLeft size={16} className="text-error" />;
      // Use default icon for transfers
      case 'transfer': case 'whale_transfer': return <TrendingUp size={16} className="text-info" />;
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
    e.stopPropagation();
    if (txHash) {
        window.open(`https://etherscan.io/tx/${txHash}`, '_blank', 'noopener,noreferrer');
    }
  };
  
  const toggleGroupExpansion = (groupId) => {
    setExpandedGroupId(prevId => (prevId === groupId ? null : groupId));
  };

  const renderFullContent = (alerts) => {
    const groupedAlerts = groupTransactions(alerts);
    
    if (!Array.isArray(groupedAlerts) || groupedAlerts.length === 0) {
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
        <div className="alerts-list">
          {groupedAlerts.map((alert) => (
            <div key={alert.id} className="alert-item-wrapper">
                <div 
                  className="alert-item"
                  style={{ cursor: alert.transaction_hash && !alert.isGrouped ? 'pointer' : 'default' }}
                  onClick={!alert.isGrouped ? (e) => handleEtherscanClick(e, alert.transaction_hash) : undefined}
                >
                  {alert.transaction_hash && !alert.isGrouped && <span className="click-to-view-indicator">VIEW</span>}
                  <div className="alert-icon">{getTransactionIcon(alert.type || alert.transaction_type)}</div>
                  <div className="alert-details">
                    <div className="alert-main">
                      <div className="alert-amount">{formatKarrat(alert.amount)}</div>
                      <div className="alert-type">
                         {alert.isGrouped && <span className="type-badge-grouped">{alert.transactions.length} TXs</span>}
                        <span className="type-badge" style={{ backgroundColor: getTransactionTypeColor(alert.type || alert.transaction_type) }}>
                          {(alert.type || alert.transaction_type || 'Transaction').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="alert-meta">
                      <div className="alert-addresses">
                        {alert.from_address && <span className="address">From: {truncateAddress(alert.from_address)}</span>}
                        {alert.to_address_display && <span className="address">To: {alert.to_address_display}</span>}
                        {alert.to_address && !alert.to_address_display && <span className="address">To: {truncateAddress(alert.to_address)}</span>}
                        {alert.address && !alert.from_address && !alert.to_address && <span className="address">{truncateAddress(alert.address)}</span>}
                      </div>
                      <div className="alert-time">{formatTimeAgo(alert.timestamp || alert.created_at)}</div>
                    </div>
                  </div>
                  <div className="alert-value">
                    {alert.usd_value > 0 && <div className="usd-value">${Number(alert.usd_value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>}
                    <div className="tx-hash">
                      {alert.isGrouped ? (
                        <button className="tx-link view-txs-btn" onClick={() => toggleGroupExpansion(alert.id)}>
                          {expandedGroupId === alert.id ? <ChevronUp size={12}/> : <ChevronDown size={12} />}
                           View TXs
                        </button>
                      ) : (
                        alert.transaction_hash && (
                        <a href={`https://etherscan.io/tx/${alert.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="tx-link" onClick={(e) => e.stopPropagation()}>
                          View TX
                        </a>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {alert.isGrouped && expandedGroupId === alert.id && (
                    <div className="grouped-transactions-list">
                        {alert.transactions.map((tx, index) => (
                            <div key={tx.id || index} className="grouped-tx-item">
                                <div className="grouped-tx-details">
                                    <span className="grouped-tx-amount">{formatKarrat(tx.amount)}</span>
                                    <span className="grouped-tx-address">To: {truncateAddress(tx.to_address)}</span>
                                </div>
                                <a href={`https://etherscan.io/tx/${tx.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="tx-link">
                                    Etherscan
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderMinimalContent = (alerts) => {
    const groupedAlerts = groupTransactions(alerts);
    return (
      <div className="whale-alerts-minimal">
        <div className="minimal-header">
          <div className="minimal-count">
            <TrendingUp size={12} />
            <span>{groupedAlerts.length} Alerts</span>
          </div>
          <button className="toggle-button" onClick={() => setIsModalOpen(true)} title="Expand view">
            <Maximize2 size={14} />
          </button>
        </div>
        
        {!groupedAlerts || groupedAlerts.length === 0 ? (
          <div className="whale-alerts-minimal-empty">
            <AlertTriangle size={24} />
            <span>No recent activity</span>
          </div>
        ) : (
          <div className="minimal-alerts-list">
            {groupedAlerts.slice(0, 5).map(alert => (
              <div 
                key={alert.id}
                className="minimal-data-row" 
                title={alert.isGrouped ? `View details for ${alert.transactions.length} transactions` : `View transaction for ${formatKarrat(alert.amount)}`}
                onClick={!alert.isGrouped ? (e) => handleEtherscanClick(e, alert.transaction_hash) : () => setIsModalOpen(true)}
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
  
  const renderModal = (data) => {
    const alerts = data?.data || data?.alerts || [];
    return ReactDOM.createPortal(
      <div className="widget-modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="widget-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <h3>Whale Alerts</h3>
                <button onClick={() => setIsModalOpen(false)} className="modal-close-btn">
                    <X size={18}/>
                </button>
            </div>
            <div className="modal-content">
                {renderFullContent(alerts)}
            </div>
            <div className="modal-footer">
                <span>Showing latest {alerts.length} alerts</span>
            </div>
        </div>
      </div>,
      document.body
    )
  }

  const renderContent = (data) => {
    const alerts = data?.data || data?.alerts || [];
    // Always render minimal content; the modal is a separate layer.
    return (
        <>
            {renderMinimalContent(alerts)}
            {isModalOpen && renderModal(data)}
        </>
    );
  };

  return (
    <BaseWidget
      fetchData={fetchWhaleAlerts}
      renderContent={renderContent}
      refreshInterval={refreshInterval}
      className={`whale-alerts-widget minimal`} // The widget itself is always in the minimal container
      {...props}
    />
  );
};

export default WhaleAlertsWidget;