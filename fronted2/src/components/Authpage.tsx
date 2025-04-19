
"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { BACKEND_URL } from '../../config';
import { useRouter } from 'next/navigation';

export function Authpage({ isSignin }: { isSignin: boolean }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isSignin ? '/signin' : '/signup';
      
      // Prepare request body based on whether it's signin or signup
      const requestBody = isSignin 
        ? { email, password } 
        : { email, username, password };
          
      console.log('Attempting to', isSignin ? 'sign in' : 'sign up', 'with:', requestBody);
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
        router.push('/create-room'); // Redirect to room page
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 bg-white shadow-xl rounded-2xl w-full max-w-md"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-purple-800">
            {isSignin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isSignin ? "Sign in to access your account" : "Sign up to get started"}
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* Email field */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: isSignin ? 0.3 : 0.3, duration: 0.5 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </motion.div>

          {/* Username field - only for signup */}
          {!isSignin && (
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-4"
            >
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <input 
                  id="username"
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </motion.div>
          )}

          {/* Password field */}
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: isSignin ? 0.4 : 0.5, duration: 0.5 }}
            className="mb-4"
          >
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input 
                id="password"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </motion.div>

          {/* Forgot Password - only for signin */}
          {isSignin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex justify-end mb-6"
            >
              <Link href="/forget-password" className="text-sm text-purple-800 hover:text-purple-900 transition-colors">
                Forgot password
              </Link>
            </motion.div>
          )}

          {/* Error message display */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white bg-purple-800 hover:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all ${isLoading ? 'opacity-80' : ''}`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing
              </span>
            ) : (
              isSignin ? "Sign In" : "Sign Up"
            )}
          </motion.button>
        </form>

        {/* Switch between sign in and sign up */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600">
            {isSignin ? "Don't have an account? " : "Already have an account? "}
            <Link href={isSignin ? "/signup" : "/signin"} className="text-purple-800 font-medium hover:text-purple-900 transition-colors">
              {isSignin ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}