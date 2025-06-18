import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  CreditCard,
  LogOut,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    gameReminders: true,
    puzzleReminders: false,
  })

  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language & Region', icon: Globe },
    { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
  ]

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }))
  }

  return (
    <div className="min-h-screen bg-[#121621] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account preferences and settings</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80"
          >
            <div className="bg-[#272e45] rounded-xl p-6">
              <nav className="space-y-2">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-[#374162]'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-[#374162]">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-600/10 transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-[#272e45] rounded-xl p-6">
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-gray-400 rounded-full bg-cover bg-center" />
                      <div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Change Avatar
                        </button>
                        <p className="text-gray-400 text-sm mt-1">JPG, PNG or GIF. Max size 2MB.</p>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">First Name</label>
                        <input
                          type="text"
                          defaultValue="Aisha"
                          className="w-full bg-[#374162] text-white px-4 py-3 rounded-lg border border-[#4a5568] focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Last Name</label>
                        <input
                          type="text"
                          defaultValue="Chen"
                          className="w-full bg-[#374162] text-white px-4 py-3 rounded-lg border border-[#4a5568] focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-white text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="aisha.chen@example.com"
                          className="w-full bg-[#374162] text-white px-4 py-3 rounded-lg border border-[#4a5568] focus:outline-none focus:border-blue-400"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-white text-sm font-medium mb-2">Bio</label>
                        <textarea
                          rows={4}
                          defaultValue="Chess enthusiast and lifelong learner. Love studying classic games and improving my tactical vision."
                          className="w-full bg-[#374162] text-white px-4 py-3 rounded-lg border border-[#4a5568] focus:outline-none focus:border-blue-400 resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Notification Preferences</h2>
                    <p className="text-gray-400 mb-6">Choose how you want to be notified about your chess activities.</p>
                    
                    <div className="space-y-4">
                      {Object.entries({
                        email: 'Email Notifications',
                        push: 'Push Notifications',
                        gameReminders: 'Game Reminders',
                        puzzleReminders: 'Daily Puzzle Reminders'
                      }).map(([key, label]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-[#374162] rounded-lg">
                          <div>
                            <h3 className="text-white font-medium">{label}</h3>
                            <p className="text-gray-400 text-sm">
                              {key === 'email' && 'Receive notifications via email'}
                              {key === 'push' && 'Receive push notifications in your browser'}
                              {key === 'gameReminders' && 'Get reminded about upcoming games'}
                              {key === 'puzzleReminders' && 'Daily reminders to solve puzzles'}
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifications[key as keyof typeof notifications]}
                              onChange={() => handleNotificationChange(key)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Privacy & Security</h2>
                    
                    <div className="space-y-6">
                      {/* Change Password */}
                      <div className="p-4 bg-[#374162] rounded-lg">
                        <h3 className="text-white font-medium mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white text-sm font-medium mb-2">Current Password</label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-[#4a5568] text-white px-4 py-3 rounded-lg border border-[#5a6578] focus:outline-none focus:border-blue-400 pr-12"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-white text-sm font-medium mb-2">New Password</label>
                            <input
                              type="password"
                              className="w-full bg-[#4a5568] text-white px-4 py-3 rounded-lg border border-[#5a6578] focus:outline-none focus:border-blue-400"
                            />
                          </div>
                          <div>
                            <label className="block text-white text-sm font-medium mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              className="w-full bg-[#4a5568] text-white px-4 py-3 rounded-lg border border-[#5a6578] focus:outline-none focus:border-blue-400"
                            />
                          </div>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                            Update Password
                          </button>
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="p-4 bg-[#374162] rounded-lg">
                        <h3 className="text-white font-medium mb-4">Privacy Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-white">Make profile public</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white">Show online status</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs content can be added here */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-4">Appearance</h2>
                    <p className="text-gray-400 mb-6">Customize the look and feel of your AmaChess experience.</p>
                    
                    <div className="space-y-4">
                      <div className="p-4 bg-[#374162] rounded-lg">
                        <h3 className="text-white font-medium mb-3">Theme</h3>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="p-3 bg-[#4a5568] rounded-lg cursor-pointer border-2 border-blue-600">
                            <div className="w-full h-12 bg-[#121621] rounded mb-2"></div>
                            <p className="text-white text-sm text-center">Dark</p>
                          </div>
                          <div className="p-3 bg-[#4a5568] rounded-lg cursor-pointer border-2 border-transparent hover:border-gray-400">
                            <div className="w-full h-12 bg-white rounded mb-2"></div>
                            <p className="text-white text-sm text-center">Light</p>
                          </div>
                          <div className="p-3 bg-[#4a5568] rounded-lg cursor-pointer border-2 border-transparent hover:border-gray-400">
                            <div className="w-full h-12 bg-gradient-to-r from-[#121621] to-white rounded mb-2"></div>
                            <p className="text-white text-sm text-center">Auto</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings
