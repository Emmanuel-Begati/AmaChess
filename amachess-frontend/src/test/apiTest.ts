// API Test Utility for debugging puzzle analytics
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const testPuzzleAPI = async (userId: string) => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('🧪 Testing Puzzle API:');
    console.log('- User ID:', userId);
    console.log('- Auth Token:', token ? 'Present' : 'Missing');
    
    // Test API connectivity
    const testResponse = await axios.get(`${API_BASE_URL}/puzzles/user/${userId}/test`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ API Test Response:', testResponse.data);
    
    // Test user stats fetch
    const statsResponse = await axios.get(`${API_BASE_URL}/puzzles/user/${userId}/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ User Stats Response:', statsResponse.data);
    
    return {
      apiConnectivity: testResponse.data,
      userStats: statsResponse.data
    };
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('- Status:', error.response?.status);
      console.error('- Data:', error.response?.data);
    }
    throw error;
  }
};

export const testPuzzleCompletion = async (userId: string, puzzleData: any) => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('🎯 Testing Puzzle Completion:');
    console.log('- User ID:', userId);
    console.log('- Puzzle ID:', puzzleData.id);
    
    const response = await axios.post(`${API_BASE_URL}/puzzles/user/${userId}/stats/update`, {
      puzzleData,
      isCorrect: true,
      timeSpent: 30,
      hintsUsed: 0,
      solutionShown: false
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Puzzle Completion Response:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Puzzle Completion Test Failed:', error);
    if (axios.isAxiosError(error)) {
      console.error('- Status:', error.response?.status);
      console.error('- Data:', error.response?.data);
    }
    throw error;
  }
};
