import React, { useState, useEffect } from 'react';
import { database } from '../../firebase/config';
import { ref, get } from 'firebase/database';
import { Win95Button } from '../Win95Button';

export function ReviewsDebugger() {
  const [reviewsData, setReviewsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const reviewsRef = ref(database, 'reviews');
      const snapshot = await get(reviewsRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        setReviewsData(data);
        console.log('Reviews data:', data);
      } else {
        setReviewsData(null);
        setError('No reviews data found in Firebase');
        console.log('No reviews data found');
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Error fetching reviews data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 mb-4">
      <h3 className="font-mono font-bold text-lg mb-4">Reviews Data Debugger</h3>
      
      <div className="mb-4">
        <Win95Button 
          onClick={fetchReviewsData} 
          className="px-4 py-2 font-mono"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Fetch Reviews Data'}
        </Win95Button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 mb-4 font-mono">
          {error}
        </div>
      )}
      
      {reviewsData && (
        <div>
          <h4 className="font-mono font-bold mb-2">Raw Reviews Data:</h4>
          <div className="p-3 bg-gray-100 border border-gray-300 font-mono text-xs overflow-auto max-h-96">
            <pre>{JSON.stringify(reviewsData, null, 2)}</pre>
          </div>
          
          <h4 className="font-mono font-bold mt-4 mb-2">Reviews Count: {Object.keys(reviewsData).length}</h4>
          
          <h4 className="font-mono font-bold mt-4 mb-2">Reviews Structure:</h4>
          <ul className="list-disc pl-5 font-mono text-sm">
            {Object.entries(reviewsData).map(([key, value]: [string, any]) => (
              <li key={key} className="mb-2">
                <strong>{key}</strong>: {value.name} - {value.rating}★ - {value.approved ? 'Approved' : 'Pending'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
