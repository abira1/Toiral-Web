import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, onValue, set, remove, push } from 'firebase/database';
import { MailIcon, SaveIcon, PlusIcon, TrashIcon, CheckIcon, AlertTriangleIcon, RefreshCwIcon, SendIcon, DownloadIcon, UploadIcon } from 'lucide-react';

// Define types for email marketing data
interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribed: boolean;
  subscribedAt: number;
  lastEmailSent?: number;
  source?: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  templateId?: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: number;
  sentAt?: number;
  recipients: number;
  opens?: number;
  clicks?: number;
}

interface EmailMarketingSettings {
  subscribers: Record<string, Subscriber>;
  templates: Record<string, EmailTemplate>;
  campaigns: Record<string, EmailCampaign>;
  settings: {
    senderName: string;
    senderEmail: string;
    replyToEmail: string;
    signupFormEnabled: boolean;
    doubleOptIn: boolean;
    welcomeEmailEnabled: boolean;
    welcomeEmailSubject: string;
    welcomeEmailContent: string;
  };
}

export function EmailMarketing() {
  const [emailData, setEmailData] = useState<EmailMarketingSettings>({
    subscribers: {},
    templates: {},
    campaigns: {},
    settings: {
      senderName: 'Toiral Web Development',
      senderEmail: 'contract.toiral@gmail.com',
      replyToEmail: 'contract.toiral@gmail.com',
      signupFormEnabled: true,
      doubleOptIn: true,
      welcomeEmailEnabled: true,
      welcomeEmailSubject: 'Welcome to Toiral Web Development',
      welcomeEmailContent: 'Thank you for subscribing to our newsletter!'
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'subscribers' | 'templates' | 'campaigns' | 'settings'>('subscribers');
  const [newSubscriber, setNewSubscriber] = useState<{ email: string; name: string }>({ email: '', name: '' });
  const [subscriberFilter, setSubscriberFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [subscriberSearch, setSubscriberSearch] = useState('');

  // Load email marketing data from Firebase
  useEffect(() => {
    const emailRef = ref(database, 'emailMarketing');

    const unsubscribe = onValue(emailRef, (snapshot) => {
      setLoading(true);
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setEmailData(data);
        } else {
          // Initialize with default data if none exists
          set(emailRef, emailData);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading email marketing data:', err);
        setError('Failed to load email marketing data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save email marketing settings to Firebase
  const handleSaveSettings = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await set(ref(database, 'emailMarketing/settings'), emailData.settings);
      setSuccess('Email marketing settings saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving email marketing settings:', err);
      setError('Failed to save email marketing settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle settings input changes
  const handleSettingsChange = (field: keyof typeof emailData.settings, value: any) => {
    setEmailData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  // Add new subscriber
  const handleAddSubscriber = async () => {
    if (!newSubscriber.email) return;

    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const subscribersRef = ref(database, 'emailMarketing/subscribers');
      const newSubscriberRef = push(subscribersRef);
      const subscriberId = newSubscriberRef.key;

      if (!subscriberId) {
        throw new Error('Failed to generate subscriber ID');
      }

      const subscriber: Subscriber = {
        id: subscriberId,
        email: newSubscriber.email,
        name: newSubscriber.name || undefined,
        subscribed: true,
        subscribedAt: Date.now(),
        source: 'admin'
      };

      await set(newSubscriberRef, subscriber);

      setSuccess('Subscriber added successfully');
      setNewSubscriber({ email: '', name: '' });

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error adding subscriber:', err);
      setError('Failed to add subscriber');
    } finally {
      setSaving(false);
    }
  };

  // Remove subscriber
  const handleRemoveSubscriber = async (id: string) => {
    if (!confirm('Are you sure you want to remove this subscriber?')) return;

    try {
      await remove(ref(database, `emailMarketing/subscribers/${id}`));
      setSuccess('Subscriber removed successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error removing subscriber:', err);
      setError('Failed to remove subscriber');
    }
  };

  // Toggle subscriber status
  const handleToggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      await set(ref(database, `emailMarketing/subscribers/${id}/subscribed`), !currentStatus);
      setSuccess(`Subscriber ${currentStatus ? 'unsubscribed' : 'resubscribed'} successfully`);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error toggling subscriber status:', err);
      setError('Failed to update subscriber status');
    }
  };

  // Export subscribers to CSV
  const handleExportSubscribers = () => {
    const subscribers = Object.values(emailData.subscribers || {});
    if (subscribers.length === 0) {
      setError('No subscribers to export');
      return;
    }

    // Create CSV content
    const headers = ['Email', 'Name', 'Status', 'Subscribed At', 'Last Email Sent', 'Source'];
    const rows = subscribers.map(sub => [
      sub.email,
      sub.name || '',
      sub.subscribed ? 'Active' : 'Inactive',
      new Date(sub.subscribedAt).toISOString(),
      sub.lastEmailSent ? new Date(sub.lastEmailSent).toISOString() : '',
      sub.source || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and search subscribers
  const getFilteredSubscribers = () => {
    let filtered = Object.values(emailData.subscribers || {});

    // Apply status filter
    if (subscriberFilter === 'active') {
      filtered = filtered.filter(sub => sub.subscribed);
    } else if (subscriberFilter === 'inactive') {
      filtered = filtered.filter(sub => !sub.subscribed);
    }

    // Apply search filter
    if (subscriberSearch) {
      const search = subscriberSearch.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.email.toLowerCase().includes(search) ||
        (sub.name && sub.name.toLowerCase().includes(search))
      );
    }

    return filtered;
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading && Object.keys(emailData.subscribers || {}).length === 0) {
    return (
      <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 font-mono">Loading email marketing data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono flex items-center">
          <MailIcon className="w-5 h-5 mr-2" />
          Email Marketing
        </h2>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700 flex items-center">
          <AlertTriangleIcon className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700 flex items-center">
          <CheckIcon className="w-5 h-5 mr-2" />
          <p>{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex mb-4 border-b border-gray-300">
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'subscribers' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('subscribers')}
        >
          Subscribers
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'templates' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'campaigns' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('campaigns')}
        >
          Campaigns
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'settings' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Subscribers Tab */}
      {activeTab === 'subscribers' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="border-2 border-gray-400 flex">
                <button
                  className={`px-3 py-1 font-mono text-sm ${subscriberFilter === 'all' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setSubscriberFilter('all')}
                >
                  All
                </button>
                <button
                  className={`px-3 py-1 font-mono text-sm ${subscriberFilter === 'active' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setSubscriberFilter('active')}
                >
                  Active
                </button>
                <button
                  className={`px-3 py-1 font-mono text-sm ${subscriberFilter === 'inactive' ? 'bg-blue-100' : 'bg-gray-200'}`}
                  onClick={() => setSubscriberFilter('inactive')}
                >
                  Inactive
                </button>
              </div>

              <input
                type="text"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
                className="p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Search subscribers..."
              />
            </div>

            <Win95Button
              onClick={handleExportSubscribers}
              className="px-3 py-1 font-mono text-sm flex items-center"
            >
              <DownloadIcon className="w-4 h-4 mr-1" />
              Export CSV
            </Win95Button>
          </div>

          {/* Add new subscriber form */}
          <div className="mb-4 p-4 border-2 border-gray-300 bg-gray-100">
            <h3 className="font-mono font-bold mb-2">Add New Subscriber</h3>
            <div className="flex space-x-2">
              <input
                type="email"
                value={newSubscriber.email}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Email address"
              />
              <input
                type="text"
                value={newSubscriber.name}
                onChange={(e) => setNewSubscriber({ ...newSubscriber, name: e.target.value })}
                className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Name (optional)"
              />
              <Win95Button
                onClick={handleAddSubscriber}
                className="px-3 py-1 font-mono flex items-center"
                disabled={!newSubscriber.email || saving}
              >
                {saving ? (
                  <RefreshCwIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
                Add
              </Win95Button>
            </div>
          </div>

          {/* Subscribers list */}
          <div className="border-2 border-gray-300">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left font-mono">Email</th>
                  <th className="p-2 text-left font-mono">Name</th>
                  <th className="p-2 text-center font-mono">Status</th>
                  <th className="p-2 text-center font-mono">Subscribed On</th>
                  <th className="p-2 text-center font-mono">Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredSubscribers().length > 0 ? (
                  getFilteredSubscribers().map((subscriber) => (
                    <tr key={subscriber.id} className="border-t border-gray-300">
                      <td className="p-2 font-mono">{subscriber.email}</td>
                      <td className="p-2 font-mono">{subscriber.name || '-'}</td>
                      <td className="p-2 text-center">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${subscriber.subscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {subscriber.subscribed ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono">{formatDate(subscriber.subscribedAt)}</td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleToggleSubscriberStatus(subscriber.id, subscriber.subscribed)}
                            className={`px-2 py-1 text-xs font-mono ${subscriber.subscribed ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                            title={subscriber.subscribed ? 'Unsubscribe' : 'Resubscribe'}
                          >
                            {subscriber.subscribed ? 'Unsubscribe' : 'Resubscribe'}
                          </button>
                          <button
                            onClick={() => handleRemoveSubscriber(subscriber.id)}
                            className="px-2 py-1 bg-red-100 text-red-800 text-xs font-mono"
                            title="Remove"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500 font-mono">
                      No subscribers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-gray-500 font-mono">
            Total: {getFilteredSubscribers().length} subscribers
            {subscriberFilter !== 'all' && ` (${subscriberFilter})`}
            {subscriberSearch && ` matching "${subscriberSearch}"`}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="p-6 bg-gray-100 border-2 border-gray-300 text-center">
          <h3 className="font-mono font-bold mb-2">Email Templates</h3>
          <p className="text-gray-600 mb-4">
            This feature will allow you to create and manage email templates for your campaigns.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon in a future update!
          </p>
        </div>
      )}

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="p-6 bg-gray-100 border-2 border-gray-300 text-center">
          <h3 className="font-mono font-bold mb-2">Email Campaigns</h3>
          <p className="text-gray-600 mb-4">
            This feature will allow you to create, schedule, and track email campaigns.
          </p>
          <p className="text-sm text-gray-500">
            Coming soon in a future update!
          </p>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-mono">Sender Name</label>
              <input
                type="text"
                value={emailData.settings?.senderName || ''}
                onChange={(e) => handleSettingsChange('senderName', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Your Name or Company Name"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono">Sender Email</label>
              <input
                type="email"
                value={emailData.settings?.senderEmail || ''}
                onChange={(e) => handleSettingsChange('senderEmail', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono">Reply-To Email</label>
              <input
                type="email"
                value={emailData.settings?.replyToEmail || ''}
                onChange={(e) => handleSettingsChange('replyToEmail', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="email@example.com"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="signupFormEnabled"
                checked={emailData.settings?.signupFormEnabled || false}
                onChange={(e) => handleSettingsChange('signupFormEnabled', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="signupFormEnabled" className="font-mono">
                Enable newsletter signup form on website
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="doubleOptIn"
                checked={emailData.settings?.doubleOptIn || false}
                onChange={(e) => handleSettingsChange('doubleOptIn', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="doubleOptIn" className="font-mono">
                Require double opt-in for new subscribers
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="welcomeEmailEnabled"
                checked={emailData.settings?.welcomeEmailEnabled || false}
                onChange={(e) => handleSettingsChange('welcomeEmailEnabled', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="welcomeEmailEnabled" className="font-mono">
                Send welcome email to new subscribers
              </label>
            </div>

            {emailData.settings?.welcomeEmailEnabled && (
              <div className="ml-6 space-y-4 border-l-2 border-gray-300 pl-4">
                <div>
                  <label className="block mb-1 font-mono">Welcome Email Subject</label>
                  <input
                    type="text"
                    value={emailData.settings?.welcomeEmailSubject || ''}
                    onChange={(e) => handleSettingsChange('welcomeEmailSubject', e.target.value)}
                    className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Welcome to our newsletter!"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-mono">Welcome Email Content</label>
                  <textarea
                    value={emailData.settings?.welcomeEmailContent || ''}
                    onChange={(e) => handleSettingsChange('welcomeEmailContent', e.target.value)}
                    className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                    rows={5}
                    placeholder="Thank you for subscribing to our newsletter!"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Win95Button
              onClick={handleSaveSettings}
              className="px-4 py-2 font-mono flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Win95Button>
          </div>
        </div>
      )}

      {/* Implementation Instructions */}
      <div className="mt-6 bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
        <h3 className="font-bold mb-2">Implementation Instructions</h3>
        <p>To implement email marketing on your website:</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Create a newsletter signup component for your website</li>
          <li>Connect the signup form to the Firebase Realtime Database</li>
          <li>Set up a server-side function to handle email sending</li>
          <li>For full email marketing capabilities, consider integrating with a service like Mailchimp, SendGrid, or AWS SES</li>
        </ol>
      </div>
    </div>
  );
}
