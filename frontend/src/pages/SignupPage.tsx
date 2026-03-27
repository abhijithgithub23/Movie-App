import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import cineviaImg from "../assets/cinevia.png";
import { registerUser } from '../features/auth/authSlice';
import type { AppDispatch, RootState } from '../store/store';

const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { status } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      await dispatch(registerUser(formData)).unwrap();
      toast.success("Account created successfully!");
      // Send them straight to the app since the backend already logged them in!
      navigate('/'); 
    }  catch (err) {
      toast.error((err as string) || "Failed to log in. Please check your credentials.");
    } 
  };

  return (
    <div className="min-h-screen flex bg-main transition-colors duration-300 flex-row-reverse relative overflow-hidden">
      
      <div 
        className="absolute inset-0 z-0 lg:hidden bg-cover bg-center"
        style={{ backgroundImage: `url(${cineviaImg})` }}
      >
        <div className="absolute inset-0 bg-main/80 backdrop-blur-lg transition-colors duration-300" />
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: `url(${cineviaImg})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-main via-transparent to-transparent opacity-90" />
        
        <div className="absolute bottom-20 right-16 max-w-lg z-10 text-right">
          <h2 className="text-5xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight">
            Start Your Journey.
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed drop-shadow-md">
            Join a community of movie lovers. Curate your watchlist, rate your favorites, and never forget a title again.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="max-w-md w-full space-y-8">
          
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl font-black text-text-main mb-3 tracking-tight">Sign Up</h1>
            <p className="text-text-muted text-lg">Create your account in seconds.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-btn-bg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                className="w-full pl-12 pr-5 py-4 bg-card-bg/50 border border-text-muted/20 rounded-2xl text-text-main placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-btn-bg/50 focus:border-btn-bg focus:bg-card-bg transition-all duration-300 shadow-sm"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-btn-bg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email address"
                className="w-full pl-12 pr-5 py-4 bg-card-bg/50 border border-text-muted/20 rounded-2xl text-text-main placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-btn-bg/50 focus:border-btn-bg focus:bg-card-bg transition-all duration-300 shadow-sm"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-btn-bg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className="w-full pl-12 pr-5 py-4 bg-card-bg/50 border border-text-muted/20 rounded-2xl text-text-main placeholder-text-muted/50 focus:outline-none focus:ring-2 focus:ring-btn-bg/50 focus:border-btn-bg focus:bg-card-bg transition-all duration-300 shadow-sm"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-4 px-6 mt-6 bg-btn-bg text-btn-text font-bold text-lg rounded-2xl shadow-xl shadow-btn-bg/20 hover:bg-btn-bg/90 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="pt-6 text-center lg:text-left border-t border-text-muted/10">
            <p className="text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-text-main hover:text-btn-bg transition-colors duration-300 underline underline-offset-4 decoration-2 decoration-btn-bg/30 hover:decoration-btn-bg">
                Log in here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;