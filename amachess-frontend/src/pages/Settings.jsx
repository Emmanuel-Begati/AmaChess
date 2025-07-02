import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Settings = () => {
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
            
            <div className="space-y-6">
              {/* Account Settings */}
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <h2 className="text-xl font-bold text-white mb-4">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Display Name</label>
                    <input 
                      type="text" 
                      value="Aisha"
                      className="w-full px-3 py-2 bg-[#121621] border border-[#374162] rounded-lg text-white focus:border-[#115fd4] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      value="aisha@example.com"
                      className="w-full px-3 py-2 bg-[#121621] border border-[#374162] rounded-lg text-white focus:border-[#115fd4] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Game Preferences */}
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <h2 className="text-xl font-bold text-white mb-4">Game Preferences</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Show coordinates</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#115fd4] transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Highlight moves</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#115fd4] transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Sound effects</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#374162] transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-gradient-to-br from-[#233248] to-[#1a2636] rounded-xl p-6 shadow-xl border border-[#233248]/50">
                <h2 className="text-xl font-bold text-white mb-4">Notifications</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Daily puzzle reminders</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#115fd4] transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Game analysis ready</span>
                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#115fd4] transition-colors focus:outline-none">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button className="px-6 py-3 bg-gradient-to-r from-[#115fd4] to-[#4a90e2] text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-[#115fd4]/25 transition-all duration-300 hover:scale-105">
                  Save Changes
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
