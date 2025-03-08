'use client';

import { useRouter, useParams, usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const Dashboard = () => {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  
  // Extract feature from the pathname
  const getFeature = () => {
    const pathParts = pathname.split('/');
    return pathParts[pathParts.length - 1];
  };

  const feature = getFeature();
  
  const renderFeature = () => {
    switch (feature) {
      case 'players':
        return <div>Players View Content</div>;
      case 'select-team':
        return <div>Select Your Team Content</div>;
      case 'team':
        return <div>Team View Content</div>;
      case 'budget':
        return <div>Budget View Content</div>;
      case 'leaderboard':
        return <div>Leaderboard Content</div>;
      case 'spiriter':
        return <div>Spiriter Chatbot Content</div>;
      default:
        return <div>Select a feature from the sidebar</div>;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        {renderFeature()}
      </div>
    </div>
  );
};

export default Dashboard;
