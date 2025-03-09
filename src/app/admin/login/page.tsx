"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { setCookie, getCookie } from 'cookies-next';

const AdminLogin = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in via cookie
    const token = getCookie('adminToken');
    if (token) {
      router.push('/admin');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Test credentials - we support multiple users for testing
      const validCredentials = [
        { username: 'admin', password: 'admin123' },
        { username: 'renu', password: 'renu123' }
      ];
      
      const isValid = validCredentials.some(
        cred => cred.username === username && cred.password === password
      );

      if (isValid) {
        // Create a mock token
        const token = "valid-token-" + Math.random().toString(36).substring(2);
        
        // Store in localStorage as backup
        localStorage.setItem("adminToken", token);
        
        // Set cookie with 1 day expiration
        setCookie('adminToken', token, { 
          maxAge: 60 * 60 * 24, // 1 day
          path: '/',
        });
        
        // Redirect to admin page
        router.push("/admin");
        return;
      }

<<<<<<< HEAD
      localStorage.setItem("adminToken", data.token);
      router.push("/admin");
=======
      // If test credentials don't match, throw error
      // In production, this would be replaced with a real API call
      throw new Error("Invalid username or password");
      
>>>>>>> origin/main
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Image */}
      <div className="w-1/2 h-full">
        <img src="/login.webp" alt="Login Side image" className="w-full h-full object-cover" />
      </div>
      
      {/* Right Side - Form */}
      <div className="w-1/2 flex items-center justify-center bg-purple-700 h-full ml-0">
        <div className="w-9/10 p-12 rounded-lg shadow-md border-2 border-purple-500 bg-purple-700 h-full flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-center mb-6 text-white">Admin Login</h2>
          {error && <p className="text-red-500 text-center bg-white/10 p-2 rounded mb-4">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-white">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring focus:ring-purple-300 bg-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring focus:ring-purple-300 bg-white"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full mt-3 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition duration-200"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          
          {/* Add test credential hint for development */}
          <div className="mt-4 text-white/70 text-sm text-center">
            <p>Test credentials:</p>
            <p>Username: admin | Password: admin123</p>
            <p>Username: renu | Password: renu123</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
