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
      // Call the admin API to verify credentials
      const response = await fetch(
        `/api/admin?verifyLogin=true&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
      );

      const data = await response.json();

      if (response.ok) {
        // Login successful
        
        // Create a token from the admin data
        const token = btoa(JSON.stringify({
          id: data.admin._id,
          username: data.admin.username,
          role: data.admin.role,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiration
        }));
        
        // Store in localStorage as backup
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));
        
        // Set cookie with 24 hour expiration
        setCookie('adminToken', token, { 
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        });
        
        // Redirect to admin page
        router.push("/admin");
        return;
      } else {
        // Login failed
        throw new Error(data.error || "Invalid username or password");
      }
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
                className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring focus:ring-purple-300 bg-white text-black"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-white">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border-2 border-purple-500 rounded-lg focus:outline-none focus:ring focus:ring-purple-300 bg-white text-black"
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
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
