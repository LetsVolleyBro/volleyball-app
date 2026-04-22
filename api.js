// API utility functions
// Update this to match your backend URL

const API_URL = 'http://localhost:3000/api';

// Get current user ID from device (simple implementation)
export const getOrCreateUser = async (deviceId) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error getting/creating user:', error);
    return null;
  }
};

// Get all matches
export const fetchMatches = async () => {
  try {
    const response = await fetch(`${API_URL}/matches`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

// Get single match
export const fetchMatch = async (matchId) => {
  try {
    const response = await fetch(`${API_URL}/matches/${matchId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching match:', error);
    return null;
  }
};

// Create match
export const createMatch = async (match, userId) => {
  try {
    const response = await fetch(`${API_URL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...match,
        creatorId: userId,
      }),
    });
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error creating match:', error);
    return null;
  }
};

// Join match
export const joinMatch = async (matchId, userId) => {
  try {
    const response = await fetch(`${API_URL}/matches/${matchId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error joining match:', error);
    return null;
  }
};

// Leave match
export const leaveMatch = async (matchId, userId) => {
  try {
    const response = await fetch(`${API_URL}/matches/${matchId}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error leaving match:', error);
    return null;
  }
};
