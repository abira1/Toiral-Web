import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { useContent } from '../../contexts/ContentContext';
import { MailIcon, TrashIcon, CheckIcon, RefreshCwIcon } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { ContactFormSubmission } from '../../types';

export function ContactSubmissionsManager() {
  const { content, updateContent } = useContent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Force a refresh of the component
  const refreshSubmissions = () => {
    setLoading(true);
    setRefreshKey(prev => prev + 1);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Check if contactSubmissions exists and is valid
  useEffect(() => {
    if (!content.contactSubmissions) {
      console.log('No contact submissions found in content');
    } else {
      console.log('Contact submissions found:', content.contactSubmissions);
    }
  }, [content.contactSubmissions, refreshKey]);

  // Handle removing a contact submission
  const handleRemoveSubmission = async (submissionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Remove from Firebase
      await set(ref(database, `contactSubmissions/${submissionId}`), null);
      
      // Update local state
      if (Array.isArray(content.contactSubmissions)) {
        updateContent({
          contactSubmissions: content.contactSubmissions.filter(s => s.id !== submissionId)
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error removing contact submission:', error);
      setError('Failed to remove contact submission. Please try again.');
      setLoading(false);
    }
  };

  // Handle marking a submission as read
  const handleMarkAsRead = async (submissionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update in Firebase
      await set(ref(database, `contactSubmissions/${submissionId}/status`), 'read');
      
      // Update local state
      if (Array.isArray(content.contactSubmissions)) {
        updateContent({
          contactSubmissions: content.contactSubmissions.map(s => 
            s.id === submissionId ? { ...s, status: 'read' } : s
          )
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating contact submission status:', error);
      setError('Failed to update contact submission status. Please try again.');
      setLoading(false);
    }
  };

  // Handle replying to a submission
  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-mono font-bold text-xl">Contact Form Submissions</h3>
        <Win95Button
          onClick={refreshSubmissions}
          className="px-4 py-2 font-mono"
          disabled={loading}
        >
          <RefreshCwIcon className={`w-4 h-4 inline-block mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Win95Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {content.contactSubmissions && Array.isArray(content.contactSubmissions) && content.contactSubmissions.length > 0 ? (
          content.contactSubmissions.map(submission => (
            <ContactSubmissionItem
              key={submission.id}
              submission={submission}
              onRemove={handleRemoveSubmission}
              onMarkAsRead={handleMarkAsRead}
              onReply={handleReply}
            />
          ))
        ) : (
          <div className="p-8 bg-white border-2 border-gray-400 text-center">
            <MailIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-mono text-gray-600">No contact submissions available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Contact submission item component
function ContactSubmissionItem({
  submission,
  onRemove,
  onMarkAsRead,
  onReply
}: {
  submission: ContactFormSubmission;
  onRemove: (id: string) => void;
  onMarkAsRead: (id: string) => void;
  onReply: (email: string) => void;
}) {
  const isNew = submission.status === 'new';
  
  return (
    <div className={`p-4 border-2 ${isNew ? 'border-blue-400 bg-blue-50' : 'border-gray-400 bg-white'}`}>
      <div className="flex justify-between mb-2">
        <span className="font-mono font-bold flex items-center">
          {submission.name}
          {isNew && (
            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
              New
            </span>
          )}
        </span>
        <span className="font-mono text-sm">
          {new Date(submission.submittedAt).toLocaleString()}
        </span>
      </div>
      <div className="mb-2">
        <span className="font-mono text-sm text-gray-600">
          {submission.email} - {submission.subject}
        </span>
      </div>
      <p className="font-mono text-sm mb-4 whitespace-pre-line">
        {submission.message}
      </p>
      <div className="flex gap-2">
        <Win95Button 
          onClick={() => onReply(submission.email)} 
          className="flex-1 p-2 font-mono"
        >
          <MailIcon className="w-4 h-4 inline-block mr-2" />
          Reply
        </Win95Button>
        
        {isNew && (
          <Win95Button
            onClick={() => onMarkAsRead(submission.id)}
            className="flex-1 p-2 font-mono"
          >
            <CheckIcon className="w-4 h-4 inline-block mr-2" />
            Mark as Read
          </Win95Button>
        )}
        
        <Win95Button
          onClick={() => onRemove(submission.id)}
          className="flex-1 p-2 font-mono text-red-600"
        >
          <TrashIcon className="w-4 h-4 inline-block mr-2" />
          Remove
        </Win95Button>
      </div>
    </div>
  );
}
