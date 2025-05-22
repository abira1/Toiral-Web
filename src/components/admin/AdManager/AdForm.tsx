import React, { useState } from 'react';
import { Ad } from '../../../types/ad.types';
import { createAd, updateAd } from '../../../firebase/adService';
import { AdPreview } from '../../../components/admin/AdManager/AdPreview';

interface AdFormProps {
  ad: Ad | null;
  isCreating: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export function AdForm({ ad, isCreating, onCancel, onSuccess }: AdFormProps) {
  // Initialize form state
  const [formData, setFormData] = useState<Partial<Ad>>(
    ad || {
      type: 'banner',
      title: '',
      content: {
        heading: '',
        body: '',
        mediaType: 'image',
        mediaUrl: '',
        videoAutoplay: true,
        videoMuted: true,
        videoControls: false,
        buttonText: 'Learn More',
        buttonUrl: '#about'
      },
      styling: {
        backgroundColor: '#c0c0c0', // Windows 95 gray
        textColor: '#000000', // Black text
        accentColor: '#000080', // Windows 95 blue
        borderRadius: '0' // No rounded corners in Windows 95
      },
      animation: {
        type: 'fade',
        direction: 'bottom',
        duration: 0.5
      },
      display: {
        position: 'bottom',
        startDate: Date.now(),
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
        frequency: 'daily',
        delay: 1,
        showOnPages: [],
        closeAfter: 15,
        minTimeBetweenDisplays: 30 // 30 seconds minimum between displays
      },
      isActive: true
    }
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [showPreview, setShowPreview] = useState(false);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes('.')) {
      const [section, field] = name.split('.');

      // Make sure the section exists in formData
      if (!formData[section as keyof Ad]) {
        console.log(`Creating missing section: ${section}`);
        // Initialize the section with an empty object
        const updatedFormData = { ...formData };
        updatedFormData[section as keyof Ad] = {} as any;
        setFormData(updatedFormData);
      }

      setFormData(prev => {
        // Create a deep copy to ensure we're not modifying the previous state directly
        const updatedSection = { ...(prev[section as keyof Ad] as any || {}) };
        updatedSection[field] = value;

        const newData = { ...prev };
        newData[section as keyof Ad] = updatedSection as any;

        console.log(`Updated ${section}.${field} to:`, value);
        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);

    // Handle nested properties
    if (name.includes('.')) {
      const [section, field] = name.split('.');

      setFormData(prev => {
        // Create a deep copy to ensure we're not modifying the previous state directly
        const updatedSection = { ...(prev[section as keyof Ad] as any || {}) };
        updatedSection[field] = numValue;

        const newData = { ...prev };
        newData[section as keyof Ad] = updatedSection as any;

        return newData;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    }
  };

  // Handle date input changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const timestamp = new Date(value).getTime();

    if (name.includes('.')) {
      const [section, field] = name.split('.');

      setFormData(prev => {
        // Create a deep copy to ensure we're not modifying the previous state directly
        const updatedSection = { ...(prev[section as keyof Ad] as any || {}) };
        updatedSection[field] = timestamp;

        const newData = { ...prev };
        newData[section as keyof Ad] = updatedSection as any;

        return newData;
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.title?.trim()) {
      setError('Ad title is required');
      setLoading(false);
      return;
    }

    if (!formData.content?.heading?.trim()) {
      setError('Ad heading is required');
      setLoading(false);
      return;
    }

    try {
      if (isCreating) {
        await createAd(formData as Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'stats'>);
      } else if (ad?.id) {
        await updateAd(ad.id, formData);
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving ad:', err);
      setError('Failed to save ad. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format date for input fields
  const formatDateForInput = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date:', error, timestamp);
      return new Date().toISOString().split('T')[0];
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-mono">
          {isCreating ? 'Create New Ad' : 'Edit Ad'}
        </h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-sm"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <p className="font-medium">Important Information</p>
        </div>
        <p className="mt-2 text-sm">
          Both <span className="font-bold">Ad Title</span> and <span className="font-bold">Heading</span> are required fields.
          The Ad Title is for internal reference only, while the Heading will be displayed to users.
        </p>
      </div>

      <div className="flex flex-wrap -mx-2">
        <div className={`px-2 ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                type="button"
                className={`px-4 py-2 font-mono text-sm ${activeTab === 'content' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('content')}
              >
                Content
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-mono text-sm ${activeTab === 'styling' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('styling')}
              >
                Styling
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-mono text-sm ${activeTab === 'animation' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('animation')}
              >
                Animation
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-mono text-sm ${activeTab === 'display' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                onClick={() => setActiveTab('display')}
              >
                Display
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4">
              {/* Basic Info - Always visible */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <div className="mb-4">
                  <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                    Ad Title (internal only) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${!formData.title?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    required
                    placeholder="Enter a title for this ad (required)"
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                    Ad Type
                  </label>
                  <select
                    name="type"
                    value={formData.type || 'banner'}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="banner">Banner</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="flex items-center font-mono text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive || false}
                      onChange={handleCheckboxChange}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    Active
                  </label>
                </div>
              </div>

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div>
                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Heading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="content.heading"
                      value={formData.content?.heading || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${!formData.content?.heading?.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                      required
                      placeholder="Enter a heading for this ad (required)"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Body Text
                    </label>
                    <textarea
                      name="content.body"
                      value={formData.content?.body || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Media Type
                    </label>
                    <select
                      name="content.mediaType"
                      value={formData.content?.mediaType || 'image'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      {formData.content?.mediaType === 'video' ? 'Video URL' : 'Image URL'}
                    </label>
                    <input
                      type="url"
                      name="content.mediaUrl"
                      value={formData.content?.mediaUrl || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder={formData.content?.mediaType === 'video'
                        ? "https://example.com/video.mp4"
                        : "https://example.com/image.jpg"}
                    />
                  </div>

                  {formData.content?.mediaType === 'video' && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                      <h4 className="font-mono text-sm font-medium text-gray-700 mb-2">Video Options</h4>

                      <div className="space-y-2">
                        <label className="flex items-center font-mono text-sm text-gray-700">
                          <input
                            type="checkbox"
                            name="content.videoAutoplay"
                            checked={true}
                            disabled={true}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-50"
                          />
                          Autoplay video (always enabled)
                        </label>

                        <label className="flex items-center font-mono text-sm text-gray-700">
                          <input
                            type="checkbox"
                            name="content.videoMuted"
                            checked={true}
                            disabled={true}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded opacity-50"
                          />
                          Mute video (always enabled for autoplay)
                        </label>

                        <label className="flex items-center font-mono text-sm text-gray-700">
                          <input
                            type="checkbox"
                            name="content.videoControls"
                            checked={Boolean(formData.content?.videoControls)}
                            onChange={(e) => {
                              setFormData(prev => {
                                const updatedContent = { ...(prev.content as any || {}) };
                                updatedContent.videoControls = e.target.checked;

                                return {
                                  ...prev,
                                  content: updatedContent as any
                                };
                              });
                            }}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          Show video controls
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="content.buttonText"
                      value={formData.content?.buttonText || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Button Target
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <select
                          name="buttonTargetType"
                          value={formData.content?.buttonUrl?.startsWith('#') ? 'section' : 'external'}
                          onChange={(e) => {
                            const isSection = e.target.value === 'section';
                            // If switching to section, set a default section
                            // If switching to external, set an empty URL
                            setFormData(prev => {
                              const updatedContent = { ...(prev.content as any || {}) };
                              updatedContent.buttonUrl = isSection ? '#about' : '';

                              return {
                                ...prev,
                                content: updatedContent as any
                              };
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="section">Website Section</option>
                          <option value="external">External URL</option>
                        </select>
                      </div>

                      {formData.content?.buttonUrl?.startsWith('#') ? (
                        <select
                          name="content.buttonUrl"
                          value={formData.content?.buttonUrl || '#about'}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="#about">Toiral (About)</option>
                          <option value="#portfolio">Portfolio</option>
                          <option value="#book">Appointments</option>
                          <option value="#reviews">Reviews</option>
                          <option value="#contact">Contact</option>
                          <option value="#pricing">Pricing</option>
                          <option value="#chat">Live Chat Support</option>
                          <option value="#reversi">Reversi Game</option>
                          <option value="#checkers">Checkers Game</option>
                        </select>
                      ) : (
                        <input
                          type="url"
                          name="content.buttonUrl"
                          value={formData.content?.buttonUrl || ''}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="https://example.com/page"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      {formData.content?.buttonUrl?.startsWith('#')
                        ? "Button will open the selected section on your website"
                        : "Button will open the external URL in a new tab"}
                    </p>
                  </div>
                </div>
              )}

              {/* Styling Tab */}
              {activeTab === 'styling' && (
                <div>
                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="styling.backgroundColor"
                        value={formData.styling?.backgroundColor || '#ffffff'}
                        onChange={handleChange}
                        className="h-8 w-8 mr-2"
                      />
                      <input
                        type="text"
                        name="styling.backgroundColor"
                        value={formData.styling?.backgroundColor || '#ffffff'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="styling.textColor"
                        value={formData.styling?.textColor || '#000000'}
                        onChange={handleChange}
                        className="h-8 w-8 mr-2"
                      />
                      <input
                        type="text"
                        name="styling.textColor"
                        value={formData.styling?.textColor || '#000000'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Accent Color (Button)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        name="styling.accentColor"
                        value={formData.styling?.accentColor || '#3B82F6'}
                        onChange={handleChange}
                        className="h-8 w-8 mr-2"
                      />
                      <input
                        type="text"
                        name="styling.accentColor"
                        value={formData.styling?.accentColor || '#3B82F6'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Border Radius
                    </label>
                    <input
                      type="text"
                      name="styling.borderRadius"
                      value={formData.styling?.borderRadius || '0.375rem'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.375rem"
                    />
                  </div>

                  {formData.type === 'popup' && (
                    <div className="mb-4">
                      <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <input
                        type="text"
                        name="styling.width"
                        value={formData.styling?.width || '320px'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="320px"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Animation Tab */}
              {activeTab === 'animation' && (
                <div>
                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Animation Type
                    </label>
                    <select
                      name="animation.type"
                      value={formData.animation?.type || 'fade'}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="bounce">Bounce</option>
                      <option value="pulse">Pulse</option>
                    </select>
                  </div>

                  {formData.animation?.type === 'slide' && (
                    <div className="mb-4">
                      <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                        Slide Direction
                      </label>
                      <select
                        name="animation.direction"
                        value={formData.animation?.direction || 'bottom'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="top">Top</option>
                        <option value="right">Right</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                      </select>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Animation Duration (seconds)
                    </label>
                    <input
                      type="number"
                      name="animation.duration"
                      value={formData.animation?.duration || 0.5}
                      onChange={handleNumberChange}
                      min="0.1"
                      max="2"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Display Tab */}
              {activeTab === 'display' && (
                <div>
                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <select
                        name="display.position"
                        value={formData.display?.position || 'bottom'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="center">Center</option>
                        <option value="corner-top-right">Corner (Top Right)</option>
                        <option value="corner-bottom-right">Corner (Bottom Right)</option>
                        <option value="corner-top-left">Corner (Top Left)</option>
                        <option value="corner-bottom-left">Corner (Bottom Left)</option>
                      </select>

                      <div className="bg-gray-50 p-4 border border-gray-200 rounded-md">
                        <h4 className="font-mono text-sm font-medium text-gray-700 mb-3">Position Preview</h4>
                        <div className="relative w-full h-32 bg-gray-200 border border-gray-300 rounded overflow-hidden">
                          {/* Screen representation */}
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            Website Content Area
                          </div>

                          {/* Position indicator */}
                          <div
                            className={`absolute w-16 h-6 bg-blue-500 text-white text-xs flex items-center justify-center rounded-sm`}
                            style={{
                              ...(formData.display?.position === 'top' && { top: '0', left: '50%', transform: 'translateX(-50%)' }),
                              ...(formData.display?.position === 'bottom' && { bottom: '0', left: '50%', transform: 'translateX(-50%)' }),
                              ...(formData.display?.position === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
                              ...(formData.display?.position === 'corner-top-right' && { top: '4px', right: '4px' }),
                              ...(formData.display?.position === 'corner-bottom-right' && { bottom: '4px', right: '4px' }),
                              ...(formData.display?.position === 'corner-top-left' && { top: '4px', left: '4px' }),
                              ...(formData.display?.position === 'corner-bottom-left' && { bottom: '4px', left: '4px' }),
                            }}
                          >
                            Ad
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 font-mono">
                          {formData.display?.position === 'top' && "Banner will appear at the top of the screen"}
                          {formData.display?.position === 'bottom' && "Banner will appear at the bottom of the screen"}
                          {formData.display?.position === 'center' && "Popup will appear in the center of the screen"}
                          {formData.display?.position === 'corner-top-right' && "Ad will appear in the top right corner"}
                          {formData.display?.position === 'corner-bottom-right' && "Ad will appear in the bottom right corner"}
                          {formData.display?.position === 'corner-top-left' && "Ad will appear in the top left corner"}
                          {formData.display?.position === 'corner-bottom-left' && "Ad will appear in the bottom left corner"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="flex items-center">
                      <input
                        type="date"
                        name="display.startDate"
                        value={formatDateForInput(formData.display?.startDate || Date.now())}
                        onChange={handleDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const updatedDisplay = { ...(prev.display as any || {}) };
                            updatedDisplay.startDate = Date.now();

                            return {
                              ...prev,
                              display: updatedDisplay as any
                            };
                          });
                        }}
                        className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                      >
                        Today
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <div className="flex items-center">
                      <input
                        type="date"
                        name="display.endDate"
                        value={formatDateForInput(formData.display?.endDate || (Date.now() + 7 * 24 * 60 * 60 * 1000))}
                        onChange={handleDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => {
                            const updatedDisplay = { ...(prev.display as any || {}) };
                            updatedDisplay.endDate = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now

                            return {
                              ...prev,
                              display: updatedDisplay as any
                            };
                          });
                        }}
                        className="ml-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                      >
                        +7 Days
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Display Frequency
                    </label>
                    <div className="grid grid-cols-1 gap-4">
                      <select
                        name="display.frequency"
                        value={formData.display?.frequency || 'daily'}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="once">Once per user</option>
                        <option value="daily">Once per day</option>
                        <option value="hourly">Once per hour</option>
                        <option value="always">Every page load</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.frequency = 'once';

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className={`px-3 py-2 text-xs font-mono rounded border ${
                            formData.display?.frequency === 'once'
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-bold">Once per user</div>
                          <div className="text-xs opacity-75">Show only once to each user</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.frequency = 'daily';

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className={`px-3 py-2 text-xs font-mono rounded border ${
                            formData.display?.frequency === 'daily'
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-bold">Once per day</div>
                          <div className="text-xs opacity-75">Show once every 24 hours</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.frequency = 'hourly';

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className={`px-3 py-2 text-xs font-mono rounded border ${
                            formData.display?.frequency === 'hourly'
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-bold">Once per hour</div>
                          <div className="text-xs opacity-75">Show once every hour</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.frequency = 'always';

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className={`px-3 py-2 text-xs font-mono rounded border ${
                            formData.display?.frequency === 'always'
                              ? 'bg-blue-100 border-blue-300 text-blue-800'
                              : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <div className="font-bold">Every page load</div>
                          <div className="text-xs opacity-75">Show on every page visit</div>
                        </button>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                        <h4 className="font-mono text-sm font-medium text-gray-700 mb-2">Frequency Explanation</h4>
                        <p className="text-xs text-gray-600 font-mono">
                          {formData.display?.frequency === 'once' && (
                            "This ad will be shown only once to each user, and never again unless they clear their browser data."
                          )}
                          {formData.display?.frequency === 'daily' && (
                            "This ad will be shown once per day to each user. After viewing, they won't see it again for 24 hours."
                          )}
                          {formData.display?.frequency === 'hourly' && (
                            "This ad will be shown once per hour to each user. After viewing, they won't see it again for 1 hour."
                          )}
                          {formData.display?.frequency === 'always' && (
                            "This ad will be shown on every page load, regardless of how recently the user has seen it."
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Delay before showing (seconds)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="display.delay"
                        value={formData.display?.delay || 1}
                        onChange={handleNumberChange}
                        min="0"
                        max="30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="ml-2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.delay = 0;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          0s
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.delay = 1;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          1s
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.delay = 3;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          3s
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      How long to wait before showing the ad after the page loads
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Auto-close after (seconds, 0 for never)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="display.closeAfter"
                        value={formData.display?.closeAfter || 0}
                        onChange={handleNumberChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="ml-2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.closeAfter = 0;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          Never
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.closeAfter = 15;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          15s
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.closeAfter = 30;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          30s
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      Set to 0 to keep the ad open until the user closes it manually
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block font-mono text-sm font-medium text-gray-700 mb-1">
                      Minimum time between displays (seconds)
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        name="display.minTimeBetweenDisplays"
                        value={formData.display?.minTimeBetweenDisplays !== undefined ? formData.display.minTimeBetweenDisplays : 30}
                        onChange={handleNumberChange}
                        min="0"
                        max="3600"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <div className="ml-2 flex space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.minTimeBetweenDisplays = 0;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          0s
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.minTimeBetweenDisplays = 30;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          30s
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.minTimeBetweenDisplays = 60;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          1m
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => {
                              const updatedDisplay = { ...(prev.display as any || {}) };
                              updatedDisplay.minTimeBetweenDisplays = 300;

                              return {
                                ...prev,
                                display: updatedDisplay as any
                              };
                            });
                          }}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-xs"
                        >
                          5m
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-mono">
                      Minimum time to wait before showing this ad again after it's been closed. Set to 0 to show immediately after closing.
                    </p>
                    {formData.display?.minTimeBetweenDisplays === 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-xs text-yellow-700 font-mono">
                          <strong>Note:</strong> With a value of 0, the ad will reappear as soon as possible after being closed.
                          A brief delay (about 1 second) is still applied to prevent jarring user experience.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-mono text-sm mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-mono text-sm ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Saving...' : 'Save Ad'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="w-1/2 px-2">
            <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
              <h3 className="text-lg font-bold font-mono mb-4">Preview</h3>
              <AdPreview ad={formData as Ad} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
