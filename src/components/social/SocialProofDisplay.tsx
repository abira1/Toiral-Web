import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, off } from 'firebase/database';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, YoutubeIcon, UsersIcon } from 'lucide-react';

interface SocialStats {
  facebook?: number;
  twitter?: number;
  instagram?: number;
  linkedin?: number;
  youtube?: number;
  clients?: number;
  projects?: number;
  [key: string]: number | undefined;
}

interface SocialProofDisplayProps {
  className?: string;
  compact?: boolean;
}

export function SocialProofDisplay({ className = '', compact = false }: SocialProofDisplayProps) {
  const [stats, setStats] = useState<SocialStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socialStatsRef = ref(database, 'socialStats');
    
    const handleData = (snapshot: any) => {
      if (snapshot.exists()) {
        setStats(snapshot.val());
      } else {
        // If no data exists, use empty stats
        setStats({});
      }
      setLoading(false);
    };
    
    const handleError = (error: any) => {
      console.error('Error loading social stats:', error);
      setError('Failed to load social statistics');
      setLoading(false);
    };
    
    onValue(socialStatsRef, handleData, handleError);
    
    return () => {
      off(socialStatsRef);
    };
  }, []);

  // Helper function to format numbers (e.g., 1500 -> 1.5K)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  // Get the appropriate icon for a social platform
  const getIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <FacebookIcon className="w-5 h-5 text-blue-600" />;
      case 'twitter':
        return <TwitterIcon className="w-5 h-5 text-blue-400" />;
      case 'instagram':
        return <InstagramIcon className="w-5 h-5 text-pink-600" />;
      case 'linkedin':
        return <LinkedinIcon className="w-5 h-5 text-blue-700" />;
      case 'youtube':
        return <YoutubeIcon className="w-5 h-5 text-red-600" />;
      case 'clients':
        return <UsersIcon className="w-5 h-5 text-green-600" />;
      case 'projects':
        return <UsersIcon className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white border-2 border-gray-400 p-4 ${className}`}>
        <p className="font-mono text-sm text-center text-gray-500">Loading social statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white border-2 border-gray-400 p-4 ${className}`}>
        <p className="font-mono text-sm text-center text-red-500">{error}</p>
      </div>
    );
  }

  // If no stats are available
  if (Object.keys(stats).length === 0) {
    return null;
  }

  return (
    <div className={`bg-white border-2 border-gray-400 p-4 ${className}`}>
      <h3 className="font-mono font-bold text-lg mb-4 text-center">Our Community</h3>
      
      <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-2 md:grid-cols-4 gap-4'}`}>
        {Object.entries(stats).map(([platform, count]) => (
          count !== undefined && (
            <div key={platform} className="flex flex-col items-center p-2 border-2 border-gray-300 bg-gray-100">
              <div className="mb-1">{getIcon(platform)}</div>
              <div className="font-mono font-bold">{formatNumber(count)}</div>
              <div className="font-mono text-xs text-gray-600 capitalize">{platform}</div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
