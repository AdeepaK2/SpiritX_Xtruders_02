"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AdminLogin = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("adminToken", data.token);
      router.push("/admin/dashboard");
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
      <div className="w-9/10  p-12 rounded-lg shadow-md border-2 border-purple-500 bg-purple-700 h-full flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">Admin Login</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-white ">Username</label>
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
      </div>
    </div>
  </div>
);
}

export default AdminLogin;
