'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import AdminSidebar from '@/components/adminfetures/AdminSidebar';
import TournamentSummary from '@/components/adminfetures/TournamentSummary';
import AdminPlayersView from '@/components/adminfetures/AdminPlayersView';
import PlayerStatAdmin from '@/components/adminfetures/PlayerStatAdmin';
import { FaChartLine, FaTrophy, FaSpinner } from 'react-icons/fa';

export default function AdminPage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState('');
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [teamCount, setTeamCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    // Check authentication using cookies
    const token = getCookie('adminToken');
    
    if (!token) {
      // No token in cookies, try localStorage as fallback
      const localToken = localStorage.getItem('adminToken');
      if (!localToken) {
        // No token found anywhere, redirect to login
        router.push('/admin/login');
        return;
      }
      
      // Token found in localStorage, validate it
      try {
        const tokenData = JSON.parse(atob(localToken));
        // Check if token is expired
        if (tokenData.exp < Date.now()) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminData');
          router.push('/admin/login');
          return;
        }
        
        // Token is valid
        setAdminData(JSON.parse(localStorage.getItem('adminData') || '{}'));
        setIsAuthenticated(true);
        fetchStats();
      } catch (error) {
        console.error('Invalid token format:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        router.push('/admin/login');
      }
    } else {
      // Token exists in cookie, validate it
      try {
        const tokenData = JSON.parse(atob(token as string));
        // Check if token is expired
        if (tokenData.exp < Date.now()) {
          router.push('/admin/login');
          return;
        }
        
        // Token is valid
        setAdminData(tokenData);
        setIsAuthenticated(true);
        fetchStats();
      } catch (error) {
        console.error('Invalid token format:', error);
        router.push('/admin/login');
      }
    }
  }, [router]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Create mock data for now to avoid API errors
      setPlayerCount(24);
      setTeamCount(8);
      
      /* Uncomment when APIs are ready
      // Fetch players
      const playersResponse = await fetch('/api/player');
      const playersData = await playersResponse.json();
      
      // Fetch teams
      const teamsResponse = await fetch('/api/team');
      const teamsData = await teamsResponse.json();
      
      // Update state with counts
      setPlayerCount(playersData.players?.length || 0);
      setTeamCount(teamsData.teams?.length || 0);
      */
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set fallback values on error
      setPlayerCount(0);
      setTeamCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureSelect = (feature: string) => {
    setActiveFeature(feature);
  };

  // Content to display based on active feature
  const renderContent = () => {
    switch (activeFeature) {
      case 'players':
        return <AdminPlayersView />;
      case 'player-stats':
        return <PlayerStatAdmin />;
      case 'tournament-summary':
        return <TournamentSummary />;
      case 'match-management':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Match Management</h1>
            <p>Schedule and manage tournament matches.</p>
            {/* Match management content will go here */}
          </div>
        );
      default:
        // Default welcome screen
        return (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-center max-w-2xl">
              <h1 className="text-3xl font-bold mb-4 text-indigo-900">
                Welcome {adminData?.username ? `${adminData.username}` : ''} to the Admin Panel
              </h1>
              <p className="text-lg text-gray-700 mb-8">
                Manage players, tournaments, and view statistics for your SpiritX platform.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 hover:border-indigo-300 transition-all">
                  <div className="flex items-center mb-4">
                    <FaChartLine className="text-xl text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold text-indigo-800">Quick Stats</h2>
                  </div>
                  <p className="text-gray-600 mb-4">View platform statistics at a glance</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-10">
                          <FaSpinner className="animate-spin text-indigo-600" />
                        </div>
                      ) : (
                        <p className="text-indigo-800 font-bold text-xl">{playerCount}</p>
                      )}
                      <p className="text-xs text-gray-500">Registered Players</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-lg">
                      {isLoading ? (
                        <div className="flex justify-center items-center h-10">
                          <FaSpinner className="animate-spin text-indigo-600" />
                        </div>
                      ) : (
                        <p className="text-indigo-800 font-bold text-xl">{teamCount}</p>
                      )}
                      <p className="text-xs text-gray-500">Active Teams</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-md border border-indigo-100 hover:border-indigo-300 transition-all">
                  <div className="flex items-center mb-4">
                    <FaTrophy className="text-xl text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold text-indigo-800">Tournament Status</h2>
                  </div>
                  <p className="text-gray-600 mb-4">Current tournament information</p>
                  <button 
                    onClick={() => setActiveFeature('tournament-summary')}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Tournament Statistics
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <FaSpinner className="animate-spin text-indigo-600 text-4xl" />
        <p className="ml-2 text-indigo-800">Authenticating...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeFeature={activeFeature}
        onFeatureSelect={handleFeatureSelect}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}