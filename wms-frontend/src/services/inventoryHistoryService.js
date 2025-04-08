import { API_BASE_URL } from '../config/api';

export const getHistoryByProduct = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory-history/product/${productId}`);
    if (!response.ok) throw new Error(`Failed to fetch history for product ID: ${productId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching history for product ID ${productId}:`, error);
    throw error;
  }
};

export const getHistoryByInventoryItem = async (inventoryItemId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory-history/item/${inventoryItemId}`);
    if (!response.ok) throw new Error(`Failed to fetch history for inventory item ID: ${inventoryItemId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching history for inventory item ID ${inventoryItemId}:`, error);
    throw error;
  }
};

export const getMonthlySummary = async (productId, startDate, endDate) => {
  try {
    let url = `${API_BASE_URL}/inventory-history/product/${productId}/monthly-summary`;

    // Add date filters if provided
    if (startDate || endDate) {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch monthly summary for product ID: ${productId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching monthly summary for product ID ${productId}:`, error);
    throw error;
  }
};

export const getRecentHistory = async (productId, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory-history/product/${productId}/recent?limit=${limit}`);
    if (!response.ok) throw new Error(`Failed to fetch recent history for product ID: ${productId}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching recent history for product ID ${productId}:`, error);
    throw error;
  }
};

// Function to handle API errors and return mock data as fallback
export const getSafeHistoryData = async (productId) => {
  try {
    // Try to get real data from API
    const [historySummary, recentHistory] = await Promise.all([
      getMonthlySummary(productId),
      getRecentHistory(productId)
    ]);

    return {
      monthlySummary: historySummary,
      recentActivity: recentHistory.map(item => ({
        id: item.id,
        date: new Date(item.timestamp).toISOString().split('T')[0],
        action: mapActionTypeToDisplay(item.actionType),
        quantity: item.quantity,
        location: item.sourceLocationId
          ? `${item.sourceLocationId}${item.destinationLocationId ? ` → ${item.destinationLocationId}` : ''}`
          : (item.destinationLocationId ? item.destinationLocationId : 'N/A'),
        user: item.username || 'System',
        batchNumber: item.batchNumber
      }))
    };
  } catch (error) {
    console.warn('Falling back to mock history data:', error);

    // Return mock data as fallback
    return {
      monthlySummary: getMockMonthlySummary(),
      recentActivity: getMockRecentActivity()
    };
  }
};

// Helper function to map action types to display-friendly format
const mapActionTypeToDisplay = (actionType) => {
  const actionMap = {
    'ADDED': 'Added',
    'REMOVED': 'Removed',
    'MOVED': 'Moved',
    'COUNTED': 'Counted',
    'QUARANTINED': 'Quarantined'
  };

  return actionMap[actionType] || actionType;
};

// Mock data generators for fallback
const getMockMonthlySummary = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  return months.map(month => ({
    month,
    additions: Math.floor(Math.random() * 50) + 10,
    removals: Math.floor(Math.random() * 40) + 5
  }));
};

const getMockRecentActivity = () => {
  const actions = ['Added', 'Removed', 'Moved', 'Counted'];
  const users = ['John Doe', 'Jane Smith', 'Alice Johnson', 'Bob Martin'];

  // Generate dates for last 10 days
  const dates = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  return dates.map((date, index) => ({
    id: index + 1,
    date,
    action: actions[Math.floor(Math.random() * actions.length)],
    quantity: Math.floor(Math.random() * 15) + 1,
    location: index % 3 === 0
      ? `A-01-0${index % 2 + 1}-03 → B-02-01-04`
      : `A-01-0${index % 2 + 1}-03`,
    user: users[Math.floor(Math.random() * users.length)],
    batchNumber: `B${100 + index}`
  }));
};
