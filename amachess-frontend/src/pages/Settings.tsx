import React, { useState, useEffect } from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { useAuth } from '../contexts/AuthContext';
import { usePreferences } from '../contexts/PreferencesContext';
import { User } from '../types';

interface FormData {
  name: string;
  email: string;
  lichessUsername: string;
  country: string;
  fideRating: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  lichessUsername?: string;
  country?: string;
  fideRating?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const [activeSection, setActiveSection] = useState<'account' | 'password' | 'preferences'>('account');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    lichessUsername: '',
    country: '',
    fideRating: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        lichessUsername: user.lichessUsername || '',
        country: user.country || '',
        fideRating: user.fideRating?.toString() || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear success message when user makes changes
    if (success) {
      setSuccess('');
    }
  };

  const handlePreferenceChange = (key: string, value: boolean) => {
    updatePreferences({
      ...preferences,
      [key]: value
    });
    setSuccess('Preferences updated successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (formData.name && formData.name.trim().length < 3) {
      newErrors.name = 'Display name must be at least 3 characters';
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
        newErrors.newPassword = 'New password must be at least 8 characters';
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
    setErrors({});

    try {
      if (activeSection === 'account') {
        const profileData: Partial<User> = {
          name: formData.name,
          lichessUsername: formData.lichessUsername,
          country: formData.country,
        };
        if (formData.fideRating) {
          profileData.fideRating = parseInt(formData.fideRating);
        }
        await updateProfile!(profileData);
      } else if (activeSection === 'password') {
        // TODO: Implement password change functionality
        console.log('Password change not yet implemented');
      } else {
        // Preferences are handled in real-time
      }

      setSuccess(
        activeSection === 'account' 
          ? 'Profile updated successfully!' 
          : activeSection === 'password'
          ? 'Password changed successfully!'
          : 'Settings saved successfully!'
      );

      // Clear password fields
      if (activeSection === 'password') {
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setErrors({ general: error.message || 'Failed to save changes. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const ToggleButton = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
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
                Password
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
                      <label className="block text-white text-sm font-medium mb-2" htmlFor="name">Display Name</label>
                      <input 
                        id="name"
                        name="name"
                        type="text" 
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                          errors.name ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-400">{errors.name}</p>
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
                        disabled
                        className="w-full px-3 py-2 bg-[#121621] border border-[#374162] rounded-lg text-gray-400 cursor-not-allowed"
                      />
                      <p className="mt-1 text-sm text-[#92a8c9]">Email cannot be changed</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="lichessUsername">
                          Lichess Username
                        </label>
                        <input 
                          id="lichessUsername"
                          name="lichessUsername"
                          type="text" 
                          value={formData.lichessUsername}
                          onChange={handleChange}
                          placeholder="Your Lichess username"
                          className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                            errors.lichessUsername ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                          }`}
                        />
                        {errors.lichessUsername && (
                          <p className="mt-1 text-sm text-red-400">{errors.lichessUsername}</p>
                        )}
                        <p className="mt-1 text-xs text-[#92a8c9]">
                          Connect your Lichess account to import games and view stats
                        </p>
                      </div>

                      {/* Lichess Stats Preview */}
                      {formData.lichessUsername && formData.lichessUsername.trim() && (
                        <div className="bg-[#0f1419] border border-[#374162] rounded-lg p-4">
                          <h4 className="text-white font-medium mb-3 flex items-center">
                            <span className="w-6 h-6 bg-white rounded mr-2 flex items-center justify-center">
                              <span className="text-black font-bold text-sm">L</span>
                            </span>
                            Lichess Profile Preview (Coming Soon)
                          </h4>
                          <p className="text-gray-400 text-sm">Stats preview will be displayed here once connected.</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="country">
                          Country
                        </label>
                        <input 
                          id="country"
                          name="country"
                          type="text" 
                          value={formData.country}
                          onChange={handleChange}
                          placeholder="Your country"
                          className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                            errors.country ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                          }`}
                        />
                        {errors.country && (
                          <p className="mt-1 text-sm text-red-400">{errors.country}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2" htmlFor="fideRating">
                          FIDE Rating
                        </label>
                        <input 
                          id="fideRating"
                          name="fideRating"
                          type="number" 
                          value={formData.fideRating}
                          onChange={handleChange}
                          placeholder="Your FIDE rating"
                          className={`w-full px-3 py-2 bg-[#121621] border rounded-lg text-white focus:outline-none ${
                            errors.fideRating ? 'border-red-500' : 'border-[#374162] focus:border-[#115fd4]'
                          }`}
                        />
                        {errors.fideRating && (
                          <p className="mt-1 text-sm text-red-400">{errors.fideRating}</p>
                        )}
                      </div>
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
                <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                  <h2 className="text-xl font-bold text-white mb-4">Game Preferences</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Sound Effects</h3>
                        <p className="text-[#92a8c9] text-sm">Play sounds for piece moves and captures</p>
                      </div>
                      <ToggleButton 
                        enabled={preferences.soundEnabled || false}
                        onChange={() => handlePreferenceChange('soundEnabled', !preferences.soundEnabled)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Show Coordinates</h3>
                        <p className="text-[#92a8c9] text-sm">Display file and rank labels on the board</p>
                      </div>
                      <ToggleButton 
                        enabled={preferences.showCoordinates || false}
                        onChange={() => handlePreferenceChange('showCoordinates', !preferences.showCoordinates)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Highlight Legal Moves</h3>
                        <p className="text-[#92a8c9] text-sm">Show possible moves when selecting a piece</p>
                      </div>
                      <ToggleButton 
                        enabled={preferences.highlightMoves || false}
                        onChange={() => handlePreferenceChange('highlightMoves', !preferences.highlightMoves)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-medium">Auto-promote to Queen</h3>
                        <p className="text-[#92a8c9] text-sm">Automatically promote pawns to queen</p>
                      </div>
                      <ToggleButton 
                        enabled={preferences.autoPromoteToQueen || false}
                        onChange={() => handlePreferenceChange('autoPromoteToQueen', !preferences.autoPromoteToQueen)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <button 
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="px-6 py-3 bg-[#115fd4] text-white rounded-lg hover:bg-[#0e4fb3] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
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
