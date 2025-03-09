'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { FaUser, FaCoins, FaTrophy, FaUserFriends, FaCalendarAlt, FaChevronLeft, FaChevronRight, FaCamera } from 'react-icons/fa';

interface User {
  _id: string;
  username: string;
  email: string;
  budget: number;
  points: number;
  rank?: number;
  accountCreationDate: string;
  lastLoginDate: string;
  profileIcon: number; // Simple number field instead of complex object
}

interface Team {
  _id: string;
  name: string;
  players: any[];
  totalValue: number;
}

const UserDataView = () => {
  const params = useParams();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId ?? '';
  
  const [user, setUser] = useState<User | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentProfileImage, setCurrentProfileImage] = useState(1);
  const [updating, setUpdating] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch user data
        const userRes = await fetch(`/api/user?id=${userId}`);
        
        if (!userRes.ok) {
          throw new Error(`Failed to fetch user data: ${userRes.status}`);
        }
        
        const userData = await userRes.json();
        
        if (userData.user) {
          setUser(userData.user);
        } else {
          throw new Error('User data not found in response');
        }
        
        // Fetch team data
        const teamRes = await fetch(`/api/team?userId=${userId}`);
        
        if (teamRes.ok) {
          const teamData = await teamRes.json();
          if (teamData.teams && teamData.teams.length > 0) {
            setTeam(teamData.teams[0]);
          }
        }
        
      } catch (err: any) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  const updateProfileImage = async (iconNumber: number) => {
    if (!user || updating) return;
    
    try {
      setUpdating(true);
      
      const response = await fetch(`/api/user/profile-image?id=${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileIcon: iconNumber
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update the user state with the new profile icon
        if (result.user) {
          setUser(prevUser => ({
            ...prevUser!,
            profileIcon: result.user.profileIcon
          }));
          setCurrentProfileImage(iconNumber);
        }
      } else {
        console.error('Failed to update profile image');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    } finally {
      setUpdating(false);
    }
  };
  
  const cycleProfileImage = (direction: 'next' | 'prev') => {
    const currentNum = user?.profileIcon 
      ? user.profileIcon
      : currentProfileImage;
      
    let newImageNum = direction === 'next' 
      ? (currentNum % 5) + 1 // Cycle forward (1->2->3->4->5->1)
      : (currentNum - 1) || 5; // Cycle backward (5<-1<-2<-3<-4<-5)
      
    updateProfileImage(newImageNum);
  };

  useEffect(() => {
    if (user?.profileIcon) {
      try {
        const imageNum = user.profileIcon;
        console.log("Setting current profile image to:", imageNum);
        setCurrentProfileImage(imageNum);
      } catch (err) {
        console.error("Error setting profile image:", err);
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-800">User not found</h3>
        <p className="text-yellow-700">Could not find user data for this account</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Profile</h1>
        <p className="text-gray-600">Your personal information and team details</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col items-center mb-6">
              {/* Larger profile image with navigation buttons */}
              <div className="relative mb-4">
                <div className="h-32 w-32 rounded-full overflow-hidden">
                  <Image 
                    src={`/proicons/${user?.profileIcon || currentProfileImage}.png`}
                    alt={`${user?.username}'s profile`}
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                  />
                </div>
                
                {/* Camera button to open image selector */}
                <button 
                  onClick={() => setShowImageSelector(true)}
                  disabled={updating}
                  className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 shadow hover:bg-indigo-700 disabled:opacity-50 text-white"
                  aria-label="Change profile image"
                >
                  <FaCamera />
                </button>
              </div>
              
              <h2 className="text-2xl font-bold">{user?.username}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <FaCoins className="text-yellow-500 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold">₹{user.budget?.toLocaleString() || '0'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <FaTrophy className="text-indigo-500 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="font-semibold">{user.points || 0}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg flex items-center">
                <FaTrophy className="text-purple-500 text-xl mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Rank</p>
                  <p className="font-semibold">#{user.rank || 'N/A'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <FaCalendarAlt className="text-blue-500 text-xl mr-3" />
                  <p className="text-sm text-gray-500">Member Since</p>
                </div>
                <p className="font-semibold">
                  {new Date(user.accountCreationDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Team Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">Your Team</h3>
                <p className="text-gray-600">
                  {team ? `${team.name} - ${team.players.length} players` : 'No team created yet'}
                </p>
              </div>
              <FaUserFriends className="text-indigo-500 text-2xl" />
            </div>
            
            {team ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700 font-medium">Team Value:</span>
                    <span className="font-semibold">₹{team.totalValue?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">Players:</span>
                    <span className="font-semibold">{team.players.length}/11</span>
                  </div>
                </div>
                
                {team.players.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium mb-3">Team Players</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {team.players.map((player: any) => (
                            <tr key={player._id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{player.category}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{player.playerValue?.toLocaleString() || '0'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm italic text-gray-600">Your team has been created but no players have been added yet.</p>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700">
                  You haven't created a team yet. Go to the "Select Team" page to build your team.
                </p>
              </div>
            )}
          </div>
          
          {/* Game Statistics */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg flex justify-between">
                <span className="text-gray-700 font-medium">Last Login:</span>
                <span className="font-semibold">
                  {user.lastLoginDate ? new Date(user.lastLoginDate).toLocaleString() : 'N/A'}
                </span>
              </div>
              <p className="text-gray-600">
                Additional game statistics and performance metrics will appear here as you play.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image Selection Overlay */}
      {showImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-xs w-full">
            <h3 className="text-lg font-bold mb-3">Select Profile Image</h3>
            
            <div className="flex justify-between space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((imgNum) => (
                <button
                  key={imgNum}
                  onClick={() => {
                    updateProfileImage(imgNum);
                    setShowImageSelector(false);
                  }}
                  className={`relative rounded-full overflow-hidden border-2 w-12 h-12 ${
                    (user?.profileIcon || currentProfileImage) === imgNum
                      ? 'border-indigo-600'
                      : 'border-transparent'
                  }`}
                >
                  <Image
                    src={`/proicons/${imgNum}.png`}
                    alt={`Profile option ${imgNum}`}
                    width={48}
                    height={48}
                    className="w-full h-full"
                  />
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowImageSelector(false)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDataView;