import React, { useState, useMemo } from 'react';
import BaseWidget from '../../../core/base/BaseWidget.jsx';
import { formatKarrat, truncateAddress, formatNumber } from '../../../core/utils/formatters.js';
import { 
  Trophy, Medal, Award, TrendingUp, Users, Coins, Crown, Star, 
  Minimize2, Maximize2, Search, ChevronLeft, ChevronRight,
  Copy, Check, ArrowUpDown
} from 'lucide-react';
import './styles.css';

const EcosystemLeaderboardWidget = ({ limit = 50, refreshInterval = 300000, ...props }) => {
  const [isMinimal, setIsMinimal] = useState(false);
  const [sortBy, setSortBy] = useState('rank');
  const [sortOrder, setSortOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [copiedAddress, setCopiedAddress] = useState(null);

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

  const copyAddress = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
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
    setCurrentPage(1); // Reset to first page when sorting
  };

  const filteredAndSortedData = useMemo(() => {
    return (leaders) => {
      if (!Array.isArray(leaders)) return [];
      
      // Filter by search term
      let filtered = leaders;
      if (searchTerm) {
        filtered = leaders.filter(leader => 
          leader.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Sort data
      const sorted = sortData(filtered, sortBy, sortOrder);
      
      return sorted;
    };
  }, [searchTerm, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    return (data) => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return data.slice(startIndex, endIndex);
    };
  }, [currentPage, itemsPerPage]);

  const renderPaginationControls = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return (
      <div className="pagination-controls">
        <div className="pagination-info">
          <span>
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
          </span>
        </div>
        
        <div className="pagination-size">
          <label>Show:</label>
          <select 
            value={itemsPerPage} 
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="pagination-buttons">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
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

    const processedData = filteredAndSortedData(leaders);
    const currentPageData = paginatedData(processedData);

    return (
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <div className="header-info">
            <div className="leaderboard-stats">
              <TrendingUp size={16} />
              <span>{processedData.length} participants {searchTerm && `(filtered from ${leaders.length})`}</span>
            </div>
          </div>
          <div className="header-controls">
            <div className="search-container">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search address..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
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
                  className={`sortable rank-header ${sortBy === 'rank' ? `sorted-${sortOrder}` : ''}`}
                >
                  <div className="th-content">
                    <span>Rank</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('address')}
                  className={`sortable address-header ${sortBy === 'address' ? `sorted-${sortOrder}` : ''}`}
                >
                  <div className="th-content">
                    <span>Address</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('ecosystem_score')}
                  className={`sortable score-header ${sortBy === 'ecosystem_score' ? `sorted-${sortOrder}` : ''}`}
                >
                  <div className="th-content">
                    <span>Score</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('karrat_balance')}
                  className={`sortable karrat-header ${sortBy === 'karrat_balance' ? `sorted-${sortOrder}` : ''}`}
                >
                  <div className="th-content">
                    <span>KARRAT</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('nft_count')}
                  className={`sortable nft-header ${sortBy === 'nft_count' ? `sorted-${sortOrder}` : ''}`}
                >
                  <div className="th-content">
                    <span>NFTs</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('collections_owned')}
                  className={`sortable collections-header ${sortBy === 'collections_owned' ? `sorted-${sortOrder}` : ''}`}
                >
                  <div className="th-content">
                    <span>Collections</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="tier-header">
                  <span>Tier</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.map((leader) => (
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
                    <div className="address-container">
                      <span className="address-display">
                        {truncateAddress(leader.address)}
                      </span>
                      <button
                        className={`copy-btn ${copiedAddress === leader.address ? 'copied' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(leader.address);
                        }}
                        title={copiedAddress === leader.address ? 'Copied!' : 'Copy full address'}
                      >
                        {copiedAddress === leader.address ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
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

        {renderPaginationControls(processedData.length)}
      </div>
    );
  };

  const renderContent = (data) => {
    return isMinimal ? renderMinimalContent(data) : renderFullContent(data);
  };

  return (
    <BaseWidget
      fetchData={fetchLeaderboardData}
      renderContent={renderContent}
      refreshInterval={refreshInterval}
      className={`leaderboard-widget ${isMinimal ? 'minimal' : 'full'}`}
      {...props}
    />
  );
};

export default EcosystemLeaderboardWidget;