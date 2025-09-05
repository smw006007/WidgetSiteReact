// Simple formatter functions
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export const formatKarrat = (amount) => {
  if (amount === null || amount === undefined) return '0 KARRAT';
  return `${Number(amount).toLocaleString()} KARRAT`;
};

export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined || isNaN(number)) return '0';
  return Number(number).toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const truncateAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'healthy':
    case 'active':
    case 'online':
      return '#10b981'; // green
    case 'warning':
    case 'degraded':
      return '#f59e0b'; // yellow
    case 'error':
    case 'down':
    case 'offline':
      return '#ef4444'; // red
    default:
      return '#6b7280'; // gray
  }
};