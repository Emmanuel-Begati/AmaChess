const axios = require('axios');

const testAuth = async () => {
  try {
    console.log('🔐 Testing Authentication System...\n');
    
    const testEmail = 'test@amachess.com';
    const testPassword = 'password123';
    
    try {
      // Register a new user
      console.log('1. Testing Registration...');
      const registerRes = await axios.post('http://localhost:3001/api/auth/register', {
        email: testEmail,
        password: testPassword
      });
      console.log('✅ Registration successful!');
      console.log('User:', registerRes.data.data.user);
      console.log('Token received:', !!registerRes.data.data.token);
      
      const token = registerRes.data.data.token;
      
      // Test protected route
      console.log('\n2. Testing Protected Route...');
      const dashboardRes = await axios.get('http://localhost:3001/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Protected route accessed successfully!');
      console.log('Dashboard data:', dashboardRes.data.data);
      
    } catch (regError) {
      if (regError.response?.status === 409) {
        console.log('ℹ️ User already exists, testing login instead...');
        
        // Test login
        console.log('\n3. Testing Login...');
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
          email: testEmail,
          password: testPassword
        });
        console.log('✅ Login successful!');
        console.log('Login token received:', !!loginRes.data.data.token);
        
        const token = loginRes.data.data.token;
        
        // Test protected route
        console.log('\n4. Testing Protected Route...');
        const dashboardRes = await axios.get('http://localhost:3001/api/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Protected route accessed successfully!');
        console.log('Dashboard data:', dashboardRes.data.data);
      } else {
        throw regError;
      }
    }
    
    console.log('\n🎉 All authentication tests passed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data || error.message);
  }
};

testAuth();
