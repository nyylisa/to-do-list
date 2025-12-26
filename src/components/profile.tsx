import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileProps {
  session: any;
}

export function Profile({ session }: ProfileProps) {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Load Data
  useEffect(() => {
    if (session?.user) {
      const { full_name, bio: userBio } = session.user.user_metadata || {};
      setFullName(full_name || '');
      setBio(userBio || '');
    }
  }, [session]);

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

      // Show Success Animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-full flex items-center justify-center">
      
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 py-4">
        
        {/* Cover Image (SVG) */}
        

        {/* Profile Content */}
        <div className="relative px-8 pb-8">
        

          {/* User Info (Read Only Header) */}
          <div className="text-center mb-6">
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
        
          </div>

          {/* Edit Form */}
          <div className="space-y-4 mb-6">
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
              style={{ backgroundColor: '#6366f1' }} // Indigo-500
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          

        </div>
      </div>
    </div>
  );
}