"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      console.log("Submitting login form:", form);
      
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    
      const data = await res.json();
      console.log("Login response:", data);
    
      if (data.success && data.userId) {
        console.log("Login successful, redirecting to:", `/${data.userId}/dashboard`);
        
        // Use both methods for redirection to ensure it works
        router.push(`/${data.userId}/dashboard`);
        
        // Fallback to direct navigation if router.push doesn't work
        setTimeout(() => {
          window.location.href = `/${data.userId}/dashboard`;
        }, 500);
      } else {
        // Show error message
        setError(data.message || data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  // For testing - create a test login function
  const handleTestLogin = () => {
    // Hardcoded test user ID - replace with a valid user ID from your database
    const testUserId = "65d9b18a02cb3e578f016f14"; // Example user ID
    router.push(`/${testUserId}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl text-black font-bold mb-6 text-center">Login</h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        {/* Dev tools section - remove in production */}
        <div className="mt-6 p-4 border border-gray-200 rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Dev Testing</h3>
          <button 
            onClick={handleTestLogin}
            className="w-full bg-gray-800 text-white py-2 rounded-md hover:bg-gray-700"
          >
            Test Dashboard Redirect
          </button>
          <p className="mt-2 text-xs text-gray-500">
            This button bypasses login and redirects directly to a test user dashboard
          </p>
        </div>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

