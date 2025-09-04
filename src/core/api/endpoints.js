// Base URL for the KARRAT ecosystem API
const BASE_URL = '/api/ecosystem';

export const endpoints = {
  // System Status & Health
  status: () => `${BASE_URL}/status`,
  health: () => `${BASE_URL}/health`,
  debug: () => `${BASE_URL}/debug`,
  
  // Contract Management
  contracts: () => `${BASE_URL}/contracts`,
  stats: () => `${BASE_URL}/stats`,
  
  // Whale Alerts & Activity
  alerts: (limit = 50) => `${BASE_URL}/alerts?limit=${limit}`,
  
  // Portfolio Analytics
  portfolio: (address) => `${BASE_URL}/portfolio?address=${address}`,
  portfolioCompare: () => `${BASE_URL}/portfolio/compare`,
  
  // Holder Management
  holders: (contract = null, limit = 100) => {
    const params = new URLSearchParams();
    if (contract) params.append('contract', contract);
    params.append('limit', limit.toString());
    return `${BASE_URL}/holders?${params}`;
  },
  topHolders: (limit = 50) => `${BASE_URL}/holders/top?limit=${limit}`,
  
  // Leaderboards
  leaderboards: (type = null, limit = 50) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    params.append('limit', limit.toString());
    return `${BASE_URL}/leaderboards?${params}`;
  },
  whales: () => `${BASE_URL}/whales`,
  leaderboardWhales: () => `${BASE_URL}/leaderboards/whales`,
  leaderboardCollectors: () => `${BASE_URL}/leaderboards/collectors`,
  leaderboardEcosystem: () => `${BASE_URL}/leaderboards/ecosystem`,
  leaderboardDiamondHands: () => `${BASE_URL}/leaderboards/diamond-hands`,
  
  // Achievements
  achievements: () => `${BASE_URL}/achievements`,
  userAchievements: (address) => `${BASE_URL}/achievements/user?address=${address}`,
  checkAchievements: () => `${BASE_URL}/achievements/check`,
  
  // Notifications
  notifications: (address, limit = 50, unread = null) => {
    const params = new URLSearchParams();
    params.append('address', address);
    params.append('limit', limit.toString());
    if (unread !== null) params.append('unread', unread.toString());
    return `${BASE_URL}/notifications?${params}`;
  },
  
  // Discord Integration
  discordWebhookRegister: () => `${BASE_URL}/discord/webhook/register`,
  discordWebhookTest: () => `${BASE_URL}/discord/webhook/test`,
  discordWebhookStats: () => `${BASE_URL}/discord/webhook/stats`,
};

export default endpoints;