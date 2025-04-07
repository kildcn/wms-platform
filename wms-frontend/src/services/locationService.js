import { API_BASE_URL } from '../config/api';

export const getAllLocations = async () => {
  try {
    // Assuming there's an endpoint for locations
    const response = await fetch(`${API_BASE_URL}/locations`);
    if (!response.ok) throw new Error('Failed to fetch warehouse locations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching warehouse locations:', error);
    throw error;
  }
};

export const getLocationById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch location with ID: ${id}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching location with ID ${id}:`, error);
    throw error;
  }
};

export const getLocationsByType = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations?type=${type}`);
    if (!response.ok) throw new Error(`Failed to fetch locations of type: ${type}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching locations of type ${type}:`, error);
    throw error;
  }
};

export const getAvailableLocations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/locations/available`);
    if (!response.ok) throw new Error('Failed to fetch available locations');
    return await response.json();
  } catch (error) {
    console.error('Error fetching available locations:', error);
    throw error;
  }
};

// Fallback function to provide mock locations when API is not available
export const getMockLocations = () => {
  return [
    {
      id: 1,
      aisle: "A",
      rack: "01",
      shelf: "01",
      bin: "01",
      type: "BULK_STORAGE",
      name: "A-01-01-01",
      isOccupied: false,
      maxWeight: 500,
      currentWeight: 0
    },
    {
      id: 2,
      aisle: "A",
      rack: "01",
      shelf: "02",
      bin: "01",
      type: "PICKING",
      name: "A-01-02-01",
      isOccupied: true,
      maxWeight: 200,
      currentWeight: 150
    },
    {
      id: 3,
      aisle: "B",
      rack: "02",
      shelf: "01",
      bin: "01",
      type: "PACKING",
      name: "B-02-01-01",
      isOccupied: false,
      maxWeight: 300,
      currentWeight: 0
    },
    {
      id: 4,
      aisle: "B",
      rack: "02",
      shelf: "01",
      bin: "02",
      type: "BULK_STORAGE",
      name: "B-02-01-02",
      isOccupied: false,
      maxWeight: 500,
      currentWeight: 50
    },
    {
      id: 5,
      aisle: "C",
      rack: "01",
      shelf: "01",
      bin: "01",
      type: "SHIPPING",
      name: "C-01-01-01",
      isOccupied: true,
      maxWeight: 400,
      currentWeight: 350
    }
  ];
};

// Function that tries to get real locations but falls back to mock data if API fails
export const getLocations = async () => {
  try {
    return await getAllLocations();
  } catch (error) {
    console.warn('Falling back to mock location data:', error);
    return getMockLocations();
  }
};
