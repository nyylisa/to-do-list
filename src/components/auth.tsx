import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Lock, Mail, CheckCircle, User } from 'lucide-react';

// --- FIX: Component moved OUTSIDE the main Auth function ---
const InputField = ({ icon: Icon, type, value, onChange, placeholder, required = true }: any) => (
  <div 
    className="flex items-center w-full border-2 rounded-lg transition-colors focus-within:border-[#1976D2] bg-white overflow-hidden"
    style={{ borderColor: '#E3F2FD' }}
  >
    <div className="pl-3 py-2">
      <Icon className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type={type}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
      placeholder={placeholder}
    />
  </div>
);
// -----------------------------------------------------------

interface AuthProps {
  defaultIsSignUp?: boolean; 
}

export function Auth({ defaultIsSignUp = false }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); 
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(defaultIsSignUp);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsSignUp(defaultIsSignUp);
    setError(null);
    setConfirmPassword('');
    setFullName('');
  }, [defaultIsSignUp]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up with Name
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName, 
            },
          },
        });
        if (error) throw error;
        alert('Success! Check your email for the login link.');
      } else {
        // Sign In
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[50vh] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8" style={{ borderTop: '4px solid #1976D2' }}>
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: '#0D47A1' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Name Field (Only for Sign Up) */}
          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium mb-1" style={{ color: '#0D47A1' }}>Full Name</label>
              <InputField 
                icon={User}
                type="text"
                value={fullName}
                onChange={(e: any) => setFullName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#0D47A1' }}>Email</label>
            <InputField 
              icon={Mail}
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#0D47A1' }}>Password</label>
            <InputField 
              icon={Lock}
              type="password"
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Confirm Password Field (Only for Sign Up) */}
          {isSignUp && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium mb-1" style={{ color: '#0D47A1' }}>Confirm Password</label>
              
              <div 
                className={`flex items-center w-full border-2 rounded-lg transition-colors bg-white overflow-hidden ${
                  password && confirmPassword && password !== confirmPassword 
                  ? 'border-red-300 focus-within:border-red-500' 
                  : 'border-[#E3F2FD] focus-within:border-[#1976D2]'
                }`}
              >
                <div className="pl-3 py-2">
                  <CheckCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 outline-none text-gray-700 placeholder-gray-400 bg-transparent"
                  placeholder="Repeat password"
                />
              </div>

              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-500 mt-1 ml-1">Passwords do not match</p>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity flex justify-center items-center gap-2"
            style={{ backgroundColor: '#1976D2' }}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 font-medium hover:underline"
              style={{ color: '#1976D2' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}