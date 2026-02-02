import React, { useState, useEffect } from 'react';
import { BriefcaseBusiness, UserRoundSearch, FileText, TrendingUp } from 'lucide-react';
import BarChartOne from '../../components/charts/BarChartOne';
import LineChartOne from '../../components/charts/LineChartOne';
export default function Dashboard() {
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API calls
    // For now, using mock data
    const fetchStats = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
       
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

 
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27592D] mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
    
    
    
    
    </div>
  );
}

