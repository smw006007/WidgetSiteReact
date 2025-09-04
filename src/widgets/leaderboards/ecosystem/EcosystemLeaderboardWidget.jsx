import React, { useState } from 'react';
import BaseWidget from '../../../core/base/BaseWidget.jsx';
import { formatKarrat, truncateAddress, formatNumber } from '../../../core/utils/formatters.js';
import { Trophy, Medal, Award, TrendingUp, Users, Coins, Crown, Star, Minimize2, Maximize2 } from 'lucide-react';
import './styles.css';

const EcosystemLeaderboardWidget = ({ limit = 50, refreshInterval = 300000, ...props }) => {
  const [isMinimal, setIsMinimal] = useState(false);
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchLeaderboardData = async () => {
    try {
      const response = await fetch(`https://www.karrathub.com/api/ecosystem/leaderboards/ecosystem`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Leaderboard API Response:', data);
      return data;
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      throw new Error(`Failed to fetch leaderboard data: ${error.message}`);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'ecosystem_legend':
        return <Crown size={16} className="tier-legend" />;
      case 'ecosystem_whale':
        return <Trophy size={16} className="tier-whale" />;
      case 'ecosystem_participant':
        return <Medal size={16} className="tier-participant" />;
      default:
        return <Star size={16} className="tier-default" />;
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'ecosystem_legend':
        return '#ffd700'; // Gold
      case 'ecosystem_whale':
        return '#c0392b'; // Red
      case 'ecosystem_participant':
        return '#3b82f6'; // Blue
      default:
        return '#6b7280'; // Gray
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={18} style={{ color: '#ffd700' }} />;
    if (rank === 2) return <Trophy size={18} style={{ color: '#c0c0c0' }} />;
    if (rank === 3) return <Medal size={18} style={{ color: '#cd7f32' }} />;
    return <span className="rank-number">#{rank}</span>;
  };

  const sortData = (data, field, order) => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (field === 'address') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderMinimalContent = (data) => {
    const leaders = data?.ecosystem_leaders || [];
    
    if (!Array.isArray(leaders) || leaders.length === 0) {
      return (
        <div className="leaderboard-minimal-empty">
          <Trophy size={24} />
          <span>No leaderboard data</span>
        </div>
      );
    }

    const topThree = leaders.slice(0, 3);

    return (
      <div className="leaderboard-minimal">
        <div className="minimal-header">
          <div className="minimal-title">
            <Trophy size={14} />
            <span>Top {leaders.length}</span>
          </div>
          <button 
            onClick={() => setIsMinimal(false)}
            className="toggle-button"
            title="Expand view"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        <div className="minimal-podium">
          {topThree.map((leader, index) => (
            <div key={leader.address} className={`podium-position pos-${index + 1}`}>
              <div className="podium-rank">
                {getRankIcon(leader.rank)}
              </div>
              <div className="podium-details">
                <div className="podium-address">
                  {truncateAddress(leader.address, 4, 4)}
                </div>
                <div className="podium-score">
                  {formatNumber(leader.ecosystem_score)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFullContent = (data) => {
    const leaders = data?.ecosystem_leaders || [];
    
    if (!Array.isArray(leaders) || leaders.length === 0) {
      return (
        <div className="leaderboard-empty">
          <Trophy size={48} />
          <h4>No Leaderboard Data</h4>
          <p>Unable to load ecosystem leaderboard</p>
        </div>
      );
    }

    const sortedLeaders = sortData(leaders, sortBy, sortOrder);

    return (
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <div className="header-info">
            <div className="leaderboard-stats">
              <TrendingUp size={16} />
              <span>{leaders.length} ecosystem participants</span>
            </div>
          </div>
          <div className="header-controls">
            <button 
              onClick={() => setIsMinimal(true)}
              className="toggle-button"
              title="Minimize view"
            >
              <Minimize2 size={14} />
            </button>
          </div>
        </div>

        <div className="leaderboard-table-container">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th 
                  onClick={() => handleSort('rank')}
                  className={`sortable ${sortBy === 'rank' ? `sorted-${sortOrder}` : ''}`}
                >
                  Rank
                </th>
                <th 
                  onClick={() => handleSort('address')}
                  className={`sortable ${sortBy === 'address' ? `sorted-${sortOrder}` : ''}`}
                >
                  Address
                </th>
                <th 
                  onClick={() => handleSort('ecosystem_score')}
                  className={`sortable ${sortBy === 'ecosystem_score' ? `sorted-${sortOrder}` : ''}`}
                >
                  Score
                </th>
                <th 
                  onClick={() => handleSort('karrat_balance')}
                  className={`sortable ${sortBy === 'karrat_balance' ? `sorted-${sortOrder}` : ''}`}
                >
                  KARRAT
                </th>
                <th 
                  onClick={() => handleSort('nft_count')}
                  className={`sortable ${sortBy === 'nft_count' ? `sorted-${sortOrder}` : ''}`}
                >
                  NFTs
                </th>
                <th 
                  onClick={() => handleSort('collections_owned')}
                  className={`sortable ${sortBy === 'collections_owned' ? `sorted-${sortOrder}` : ''}`}
                >
                  Collections
                </th>
                <th>Tier</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaders.map((leader) => (
                <tr 
                  key={leader.address}
                  className="leaderboard-row"
                  onClick={() => {
                    console.log('Leader clicked:', leader.address);
                    window.open(`https://etherscan.io/address/${leader.address}`, '_blank');
                  }}
                >
                  <td className="rank-cell">
                    {getRankIcon(leader.rank)}
                  </td>
                  <td className="address-cell">
                    <span className="address-display">
                      {truncateAddress(leader.address)}
                    </span>
                  </td>
                  <td className="score-cell">
                    <span className="score-value">
                      {formatNumber(leader.ecosystem_score, 2)}
                    </span>
                  </td>
                  <td className="karrat-cell">
                    <span className="karrat-amount">
                      {leader.karrat_balance > 0 ? formatNumber(leader.karrat_balance, 0) : '-'}
                    </span>
                  </td>
                  <td className="nft-cell">
                    <span className="nft-count">
                      {leader.nft_count > 0 ? leader.nft_count : '-'}
                    </span>
                  </td>
                  <td className="collections-cell">
                    <span className="collections-count">
                      {leader.collections_owned > 0 ? leader.collections_owned : '-'}
                    </span>
                  </td>
                  <td className="tier-cell">
                    <div 
                      className="tier-badge"
                      style={{ 
                        backgroundColor: `${getTierColor(leader.ecosystem_tier)}20`,
                        borderColor: getTierColor(leader.ecosystem_tier)
                      }}
                    >
                      {getTierIcon(leader.ecosystem_tier)}
                      <span style={{ color: getTierColor(leader.ecosystem_tier) }}>
                        {leader.ecosystem_tier.replace('ecosystem_', '').toUpperCase()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderContent = (data) => {
    return isMinimal ? renderMinimalContent(data) : renderFullContent(data);
  };

  return (
    <BaseWidget
      title="Ecosystem Leaderboard"
      fetchData={fetchLeaderboardData}
      renderContent={renderContent}
      refreshInterval={refreshInterval}
      className={`leaderboard-widget ${isMinimal ? 'minimal' : 'full'}`}
      {...props}
    />
  );
};

export default EcosystemLeaderboardWidget;