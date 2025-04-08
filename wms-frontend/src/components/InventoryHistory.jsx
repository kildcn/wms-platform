import React, { useState, useEffect } from 'react';
import { X, BarChart2, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as inventoryHistoryService from '../services/inventoryHistoryService';

// Inventory History Component with Stacked Bar Chart
const InventoryHistory = ({ productId, productName, onClose }) => {
  const [historyData, setHistoryData] = useState({
    monthlySummary: [],
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch history data
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true);
      try {
        const data = await inventoryHistoryService.getSafeHistoryData(productId);
        setHistoryData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching inventory history:", err);
        setError("Failed to load inventory history data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [productId]);

  // Handle date filter changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply date filters
  const applyDateFilter = async () => {
    setIsLoading(true);
    try {
      const monthlySummary = await inventoryHistoryService.getMonthlySummary(
        productId,
        dateRange.startDate || null,
        dateRange.endDate || null
      );
      setHistoryData(prev => ({
        ...prev,
        monthlySummary
      }));
      setError(null);
    } catch (err) {
      console.error("Error fetching filtered inventory history:", err);
      setError("Failed to apply date filter");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    setDateRange({
      startDate: '',
      endDate: ''
    });
    setIsLoading(true);
    try {
      const monthlySummary = await inventoryHistoryService.getMonthlySummary(productId);
      setHistoryData(prev => ({
        ...prev,
        monthlySummary
      }));
      setError(null);
    } catch (err) {
      console.error("Error resetting inventory history:", err);
      setError("Failed to reset filters");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl max-h-screen overflow-y-auto bg-white rounded-lg shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold flex items-center">
                <BarChart2 className="h-5 w-5 mr-2" />
                Inventory History
              </h2>
              <p className="text-sm text-gray-500">{productName}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mx-4 my-2">
            {error}
          </div>
        )}

        <div className="p-4">
          <div className="space-y-6">
            {/* Date filters */}
            <div className="bg-gray-50 p-3 rounded-md border">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Date Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                    className="p-1 border border-gray-300 rounded w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                    className="p-1 border border-gray-300 rounded w-full"
                  />
                </div>

                <div className="flex items-end space-x-2">
                  <button
                    onClick={applyDateFilter}
                    disabled={isLoading}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
                  >
                    {isLoading ? 'Loading...' : 'Apply'}
                  </button>
                  <button
                    onClick={resetFilters}
                    disabled={isLoading}
                    className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white p-4 rounded-md border h-72">
              <h3 className="font-semibold mb-2">Monthly Activity</h3>
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : historyData.monthlySummary.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={historyData.monthlySummary}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="additions" fill="#4ade80" name="Additions" />
                    <Bar dataKey="removals" fill="#f87171" name="Removals" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available for the selected period
                </div>
              )}
            </div>

            {/* History Table */}
            <div>
              <h3 className="font-semibold mb-2">Recent Activity</h3>
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : historyData.recentActivity.length > 0 ? (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="p-2 border">Date</th>
                        <th className="p-2 border">Action</th>
                        <th className="p-2 border">Quantity</th>
                        <th className="p-2 border">Location</th>
                        <th className="p-2 border">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.recentActivity.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-2 border">{item.date}</td>
                          <td className="p-2 border">
                            {item.action === 'Added' && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center w-min whitespace-nowrap">
                                <ArrowUp className="h-3 w-3 mr-1" /> {item.action}
                              </span>
                            )}
                            {item.action === 'Removed' && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs flex items-center w-min whitespace-nowrap">
                                <ArrowDown className="h-3 w-3 mr-1" /> {item.action}
                              </span>
                            )}
                            {item.action === 'Moved' && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center w-min whitespace-nowrap">
                                {item.action}
                              </span>
                            )}
                            {item.action === 'Counted' && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs flex items-center w-min whitespace-nowrap">
                                {item.action}
                              </span>
                            )}
                            {item.action === 'Quarantined' && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs flex items-center w-min whitespace-nowrap">
                                {item.action}
                              </span>
                            )}
                          </td>
                          <td className="p-2 border">{item.quantity}</td>
                          <td className="p-2 border">{item.location}</td>
                          <td className="p-2 border">{item.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No recent activity found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryHistory;
