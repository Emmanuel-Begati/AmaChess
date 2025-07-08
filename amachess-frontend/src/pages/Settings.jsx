import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  
  const [formData, setFormData] = useState({
    displayName: user?.name || user?.email?.split('@')[0] || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('account');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear success message when user makes changes
    if (success) setSuccess('');
  };

  const togglePreference = (preference) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference]
    }));
    
    // Clear success message when user makes changes
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.displayName && formData.displayName.trim().length < 3) {
      newErrors.displayName = 'Display name must be at least 3 characters';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (activeSection === 'password') {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }
      
      if (formData.newPassword && formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setSuccess('');
    setErrors({});
    
    try {
      // Mock API call - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Here you would call your actual update functions
      if (activeSection === 'account') {
        // Example: await updateProfile(formData.displayName, formData.email);
        console.log('Saving profile changes:', {
          displayName: formData.displayName,
          email: formData.email
        });
      } else if (activeSection === 'password') {
        // Example: await updatePassword(formData.currentPassword, formData.newPassword);
        console.log('Changing password');
        
        // Clear password fields after successful change
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        // Save preferences to context - this will trigger the localStorage save
        updatePreferences(preferences);
        console.log('Saving preferences:', preferences);
      }
      
      setSuccess(
        activeSection === 'account' 
          ? 'Profile updated successfully!' 
          : activeSection === 'password'
          ? 'Password changed successfully!'
          : 'Preferences saved successfully!'
      );
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrors({ general: 'Failed to save changes. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Render toggle button
  const ToggleButton = ({ enabled, onChange }) => (
    <button 
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-[#115fd4]' : 'bg-[#374162]'}`}
      onClick={onChange}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`} 
      />
    </button>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#111822] via-[#0f1419] to-[#111822] text-white">
      <div className="w-full">
        <Header />
        
        <main className="w-full">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Settings</h1>
              <p className="text-[#92a8c9] text-lg">Customize your AmaChess experience.</p>
            </div>
            
            {/* Tab Navigation */}
            <div className="flex mb-6 border-b border-[#233248]">
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeSection === 'account' ? 'text-white border-b-2 border-[#115fd4]' : 'text-[#92a8c9] hover:text-white'}`}
                onClick={() => setActiveSection('account')}
              >
                Account Settings
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeSection === 'password' ? 'text-white border-b-2 border-[#115fd4]' : 'text-[#92a8c9] hover:text-white'}`}
                onClick={() => setActiveSection('password')}
              >
                Change Password
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium ${activeSection === 'preferences' ? 'text-white border-b-2 border-[#115fd4]' : 'text-[#92a8c9] hover:text-white'}`}
                onClick={() => setActiveSection('preferences')}
              >
                Preferences
              </button>
            </div>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="mb-4 p-3 bg-green-600/20 border border-green-600/50 rounded text-green-400 text-sm">
                {success}
              </div>
            )}
            
            {errors.general && (
              <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm">
                {errors.general}
              </div>
            )}
            
            <div className="space-y-6">
              {/* Account Settings */}
              {activeSection === 'account' && (
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                  <h2 className="text-xl font-bold text-white mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2" htmlFor="displayName">Display Name</label>
                      <input 
                        id="displayName"
                        name="displayName"
                        type="text" 
                        value={formData.displayName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                          errors.displayName ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                        }`}
                      />
                      {errors.displayName && (
                        <p className="mt-1 text-sm text-red-400">{errors.displayName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2" htmlFor="email">Email</label>
                      <input 
                        id="email"
                        name="email"
                        type="email" 
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                          errors.email ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                        }`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Password Change */}
              {activeSection === 'password' && (
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                  <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2" htmlFor="currentPassword">Current Password</label>
                      <input 
                        id="currentPassword"
                        name="currentPassword"
                        type="password" 
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                          errors.currentPassword ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                        }`}
                      />
                      {errors.currentPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.currentPassword}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2" htmlFor="newPassword">New Password</label>
                      <input 
                        id="newPassword"
                        name="newPassword"
                        type="password" 
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                          errors.newPassword ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                        }`}
                      />
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.newPassword}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2" htmlFor="confirmPassword">Confirm New Password</label>
                      <input 
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                          errors.confirmPassword ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                        }`}
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences */}
              {activeSection === 'preferences' && (
                <>
                  {/* Game Preferences */}
                  <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                    <h2 className="text-xl font-bold text-white mb-4">Game Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Show coordinates</span>
                        <ToggleButton 
                          enabled={preferences.showCoordinates} 
                          onChange={() => togglePreference('showCoordinates')} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Highlight moves</span>
                        <ToggleButton 
                          enabled={preferences.highlightMoves} 
                          onChange={() => togglePreference('highlightMoves')} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Sound effects</span>
                        <ToggleButton 
                          enabled={preferences.soundEffects} 
                          onChange={() => togglePreference('soundEffects')} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                    <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white">Daily puzzle reminders</span>
                        <ToggleButton 
                          enabled={preferences.dailyPuzzleReminders} 
                          onChange={() => togglePreference('dailyPuzzleReminders')} 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white">Game analysis ready</span>
                        <ToggleButton 
                          enabled={preferences.gameAnalysisReady} 
                          onChange={() => togglePreference('gameAnalysisReady')} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                  onClick={handleSaveChanges}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Settings;
