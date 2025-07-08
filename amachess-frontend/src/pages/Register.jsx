import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    lichessUsername: '',
    chesscomUsername: '',
    country: '',
    fideRating: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        lichessUsername: formData.lichessUsername,
        chesscomUsername: formData.chesscomUsername,
        country: formData.country,
        fideRating: formData.fideRating
      });
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: error.message || 'Failed to register. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join the AmaChess community today
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
            {errors.general && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address*
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password*
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                  Confirm Password*
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-600">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Chess Profile (Optional)</h3>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="lichessUsername" className="block text-xs font-medium text-gray-400 mb-1">
                      Lichess Username
                    </label>
                    <input
                      id="lichessUsername"
                      name="lichessUsername"
                      type="text"
                      value={formData.lichessUsername}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Lichess username"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="chesscomUsername" className="block text-xs font-medium text-gray-400 mb-1">
                      Chess.com Username
                    </label>
                    <input
                      id="chesscomUsername"
                      name="chesscomUsername"
                      type="text"
                      value={formData.chesscomUsername}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your Chess.com username"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="country" className="block text-xs font-medium text-gray-400 mb-1">
                        Country
                      </label>
                      <input
                        id="country"
                        name="country"
                        type="text"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Your country"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="fideRating" className="block text-xs font-medium text-gray-400 mb-1">
                        FIDE Rating
                      </label>
                      <input
                        id="fideRating"
                        name="fideRating"
                        type="text"
                        value={formData.fideRating}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="If applicable"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Sign Up'
              )}
            </button>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </form>
        
        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
