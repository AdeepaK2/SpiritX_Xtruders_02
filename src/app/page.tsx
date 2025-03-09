'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaCog } from "react-icons/fa";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  
  // Animation trigger on mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-800 to-indigo-900 overflow-hidden fixed inset-0">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply opacity-20 filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Admin Panel Button - Right Side */}
      <Link 
        href="/admin" 
        className={`absolute top-6 right-6 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 z-20 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
        style={{ transitionDelay: '900ms' }}
      >
        <FaCog className="text-white" />
        Admin Panel
      </Link>

      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4 py-6 text-white max-h-full">
        {/* Logo with animation */}
        <div className={`transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <Image
            src="/logo.png"
            alt="SpiritX Logo"
            width={240}
            height={100}
            priority
            className="drop-shadow-xl"
          />
        </div>
        
        {/* Tagline */}
        <h1 className={`text-lg md:text-xl font-bold text-center max-w-lg transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          Build your ultimate cricket team and compete in the elite university league
        </h1>
        
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          {/* Login button */}
          <Link href="/login" 
            className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 delay-500 w-40 text-center ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            Login
          </Link>
          
          {/* Sign up button */}
          <Link href="/signup" 
            className={`px-6 py-3 bg-white text-indigo-800 hover:bg-gray-100 rounded-lg font-medium text-base shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 delay-700 w-40 text-center ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            Sign Up
          </Link>
        </div>
        
        {/* Optional: Feature highlights */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 max-w-4xl transition-all duration-1000 delay-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-center">
            <h3 className="font-bold mb-1">Build Your Team</h3>
            <p className="text-xs md:text-sm text-gray-200">Select players from universities around the country</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-center">
            <h3 className="font-bold mb-1">Compete</h3>
            <p className="text-xs md:text-sm text-gray-200">Join leagues and tournaments to prove your team's worth</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-lg text-center">
            <h3 className="font-bold mb-1">AI Assistant</h3>
            <p className="text-xs md:text-sm text-gray-200">Get help from Spiriter AI to optimize your team</p>
          </div>
        </div>
      </div>
      
      {/* Add animation keyframes to the styles */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
