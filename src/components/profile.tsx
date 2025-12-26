import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { LogOut } from 'lucide-react';

interface ProfileProps {
  session: any;
}

export function Profile({ session }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [buttonText, setButtonText] = useState('Sign Out');

  // Load Data
  useEffect(() => {
    if (session?.user) {
      const { full_name, bio: userBio } = session.user.user_metadata || {};
      setFullName(full_name || '');
      setBio(userBio || '');
    }
  }, [session]);

  // --- SAFETY CHECK ---
  // Keeps the page from going blank if data is loading
  if (!session || !session.user) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Please Sign In</h2>
        <p className="text-gray-500">You need to be logged in to view your profile.</p>
      </div>
    );
  }

  // Handle Save
  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName,
          bio: bio 
        }
      });

      if (error) throw error;

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setButtonText('Signed Out ✓');
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 1000);
  };

  const memberSince = new Date(session.user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 py-8">
        
        {/* Profile Content (No Images) */}
        <div className="relative px-8">

          {/* User Info Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-1 text-gray-800">
              {fullName || 'User'}
            </h1>
            <p className="text-sm text-gray-500">{session.user.email}</p>
          </div>

          {/* Success Toast */}
          <div 
            className={`mb-4 p-3 rounded-lg text-center text-sm font-medium transition-all duration-300 transform ${
              showSuccess 
                ? 'opacity-100 translate-y-0 bg-green-100 text-green-800' 
                : 'opacity-0 -translate-y-2 h-0 overflow-hidden'
            }`}
          >
             ✓ Profile updated successfully!
          </div>

          {/* Edit Form */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Display Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-gray-800"
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Bio</label>
              <textarea 
                rows={4} 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..." 
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition-all text-gray-800"
              />
            </div>

            <button 
              onClick={handleSave}
              disabled={loading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
              style={{ backgroundColor: '#6366f1' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Footer Info (Sign Out) */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-gray-100">
            <div>
              <p className="text-xs font-medium mb-1 text-gray-500">Member Since</p>
              <p className="text-sm font-semibold text-gray-800">{memberSince}</p>
            </div>
            <div className="flex items-end justify-end">
              <button 
                onClick={handleSignOut}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  buttonText.includes('✓') 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                }`}
              >
                {buttonText === 'Sign Out' && <LogOut size={16} />}
                {buttonText}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}