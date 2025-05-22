import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { PhoneIcon, MailIcon, ClockIcon, SaveIcon, PlusIcon, TrashIcon, InstagramIcon, FacebookIcon, TwitterIcon, LinkedinIcon, YoutubeIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';
import { SocialMediaLink } from '../types';
import { ref, set, onValue } from 'firebase/database';
import { database } from '../firebase';

export function ContactInfoManager() {
  const { content, updateContent } = useContent();

  // Initialize contactInfo if it doesn't exist
  console.log("Content from context:", content);
  const existingContactInfo = content.contact || content.contactInfo || {};
  console.log("Existing contact info:", existingContactInfo);

  // Create initial state with default values
  const initialContactInfo = {
    officeHours: existingContactInfo.officeHours
      ? existingContactInfo.officeHours
      : {
          days: 'Monday - Friday',
          hours: '9:00 AM - 6:00 PM',
          timezone: 'GMT+6'
        },
    phone: existingContactInfo.phone || '',
    whatsapp: existingContactInfo.whatsapp || '',
    email: existingContactInfo.email || '',
    socialMedia: Array.isArray(existingContactInfo.socialMedia)
      ? existingContactInfo.socialMedia
      : convertOldSocialMediaFormat(existingContactInfo.socialMedia || {})
  };

  console.log("Initial contact info:", initialContactInfo);

  // Function to convert old social media format to new format
  function convertOldSocialMediaFormat(oldSocialMedia: any): SocialMediaLink[] {
    console.log("Converting old social media format:", oldSocialMedia);

    // If it's null, undefined, or not an object, return an empty array
    if (!oldSocialMedia || typeof oldSocialMedia !== 'object') {
      console.log("No valid social media data, returning empty array");
      return [];
    }

    const result: SocialMediaLink[] = [];
    const timestamp = Date.now();

    // Convert old format to new format
    if (oldSocialMedia.facebook) {
      result.push({
        id: 'facebook-' + timestamp,
        platform: 'Facebook',
        icon: 'facebook',
        url: oldSocialMedia.facebook
      });
    }

    if (oldSocialMedia.instagram) {
      result.push({
        id: 'instagram-' + timestamp,
        platform: 'Instagram',
        icon: 'instagram',
        url: oldSocialMedia.instagram
      });
    }

    if (oldSocialMedia.twitter) {
      result.push({
        id: 'twitter-' + timestamp,
        platform: 'Twitter',
        icon: 'twitter',
        url: oldSocialMedia.twitter
      });
    }

    if (oldSocialMedia.linkedin) {
      result.push({
        id: 'linkedin-' + timestamp,
        platform: 'LinkedIn',
        icon: 'linkedin',
        url: oldSocialMedia.linkedin
      });
    }

    console.log("Converted social media:", result);
    return result;
  }

  // Local state for form values
  const [formValues, setFormValues] = useState(initialContactInfo);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Listen for real-time updates from Firebase - disabled for now to prevent conflicts
  // We'll rely on the ContentContext for initial data
  /*
  useEffect(() => {
    console.log("Setting up Firebase listener");
    const contactRef = ref(database, 'contact');

    const unsubscribe = onValue(contactRef, (snapshot) => {
      console.log("Firebase data updated");
      if (snapshot.exists()) {
        const contactData = snapshot.val();
        console.log("Received data from Firebase:", contactData);

        // Only update if user is not currently editing
        if (saveStatus === 'idle' || saveStatus === 'saved') {
          console.log("Updating form values from Firebase");

          // Convert data if needed
          const updatedContactInfo = {
            officeHours: contactData.officeHours || contactData.hours || '',
            phone: contactData.phone || '',
            whatsapp: contactData.whatsapp || '',
            email: contactData.email || '',
            socialMedia: Array.isArray(contactData.socialMedia)
              ? contactData.socialMedia
              : convertOldSocialMediaFormat(contactData.socialMedia)
          };

          setFormValues(updatedContactInfo);
        }
      }
    }, (error) => {
      console.error("Error fetching contact data:", error);
    });

    return () => {
      console.log("Cleaning up Firebase listener");
      unsubscribe();
    };
  }, [saveStatus]);
  */

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormValues(prev => {
      const newValues = {
        ...prev,
        [field]: value
      };
      console.log("New form values:", newValues);
      return newValues;
    });
  };

  // Handle office hours changes
  const handleOfficeHoursChange = (field: string, value: string) => {
    console.log(`Updating officeHours.${field} to:`, value);
    setFormValues(prev => {
      const newValues = {
        ...prev,
        officeHours: {
          ...prev.officeHours,
          [field]: value
        }
      };
      console.log("New form values after office hours update:", newValues);
      return newValues;
    });
  };

  // Handle social media changes
  const handleSocialMediaChange = (id: string, field: string, value: string) => {
    console.log(`Updating social media ${id}.${field} to:`, value);
    setFormValues(prev => {
      // Ensure socialMedia is an array
      const socialMedia = Array.isArray(prev.socialMedia) ? prev.socialMedia : [];

      const newValues = {
        ...prev,
        socialMedia: socialMedia.map(item =>
          item.id === id ? { ...item, [field]: value } : item
        )
      };
      console.log("New form values after social media update:", newValues);
      return newValues;
    });
  };

  // Add new social media platform
  const handleAddSocialMedia = () => {
    console.log("Adding new social media platform");
    const newSocialMedia: SocialMediaLink = {
      id: 'social-' + Date.now(),
      platform: 'New Platform',
      icon: 'facebook',
      url: ''
    };

    setFormValues(prev => {
      // Ensure socialMedia is an array
      const socialMedia = Array.isArray(prev.socialMedia) ? prev.socialMedia : [];

      const newValues = {
        ...prev,
        socialMedia: [...socialMedia, newSocialMedia]
      };
      console.log("New form values after adding social media:", newValues);
      return newValues;
    });
  };

  // Remove social media platform
  const handleRemoveSocialMedia = (id: string) => {
    console.log(`Removing social media platform with id: ${id}`);
    setFormValues(prev => {
      // Ensure socialMedia is an array
      const socialMedia = Array.isArray(prev.socialMedia) ? prev.socialMedia : [];

      const newValues = {
        ...prev,
        socialMedia: socialMedia.filter(item => item.id !== id)
      };
      console.log("New form values after removing social media:", newValues);
      return newValues;
    });
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'facebook':
        return <FacebookIcon className="w-5 h-5" />;
      case 'instagram':
        return <InstagramIcon className="w-5 h-5" />;
      case 'twitter':
        return <TwitterIcon className="w-5 h-5" />;
      case 'linkedin':
        return <LinkedinIcon className="w-5 h-5" />;
      case 'youtube':
        return <YoutubeIcon className="w-5 h-5" />;
      default:
        return <MailIcon className="w-5 h-5" />;
    }
  };

  // Save changes to Firebase and context
  const handleSave = async () => {
    try {
      console.log("Saving contact information:", formValues);
      setSaveStatus('saving');

      // Ensure socialMedia is an array
      const dataToSave = {
        ...formValues,
        socialMedia: Array.isArray(formValues.socialMedia) ? formValues.socialMedia : []
      };

      console.log("Data being saved:", dataToSave);

      // Save to Firebase directly
      try {
        // Save to /toiral/contact path (main path)
        await set(ref(database, 'toiral/contact'), dataToSave);
        console.log("Successfully saved to 'toiral/contact' path");

        // Save to /contact path (legacy path)
        await set(ref(database, 'contact'), dataToSave);
        console.log("Successfully saved to 'contact' path");

        // Save to /contactInfo path for backward compatibility
        await set(ref(database, 'contactInfo'), dataToSave);
        console.log("Successfully saved to 'contactInfo' path");

        // Update the context
        updateContent({
          contact: dataToSave,
          contactInfo: dataToSave
        });

        console.log("Save completed successfully");
        setSaveStatus('saved');
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        setSaveStatus('error');
      }

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error in save process:', error);
      setSaveStatus('error');

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  return (
    <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
      <h3 className="font-mono font-bold text-xl border-b-2 border-gray-200 pb-2 mb-6">
        Contact Information
      </h3>

      <div className="space-y-6">
        {/* Office Hours */}
        <div className="flex items-start">
          <div className="w-10 flex-shrink-0 pt-2">
            <ClockIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-grow">
            <label className="block mb-1 font-mono text-gray-600 font-bold">
              Office Hours
            </label>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-mono text-gray-600 text-sm">
                  Days
                </label>
                <input
                  type="text"
                  value={formValues.officeHours.days}
                  onChange={(e) => handleOfficeHoursChange('days', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Monday - Friday"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono text-gray-600 text-sm">
                  Hours
                </label>
                <input
                  type="text"
                  value={formValues.officeHours.hours}
                  onChange={(e) => handleOfficeHoursChange('hours', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono text-gray-600 text-sm">
                  Timezone
                </label>
                <input
                  type="text"
                  value={formValues.officeHours.timezone}
                  onChange={(e) => handleOfficeHoursChange('timezone', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="GMT+6"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center">
          <div className="w-10 flex-shrink-0">
            <PhoneIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-grow">
            <label className="block mb-1 font-mono text-gray-600">
              Phone Number
            </label>
            <input
              type="text"
              value={formValues.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="+1 (123) 456-7890"
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div className="flex items-center">
          <div className="w-10 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
              <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
              <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
              <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2-.5 2.5-1" />
            </svg>
          </div>
          <div className="flex-grow">
            <label className="block mb-1 font-mono text-gray-600">
              WhatsApp Number
            </label>
            <input
              type="text"
              value={formValues.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="+1 (123) 456-7890"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex items-center">
          <div className="w-10 flex-shrink-0">
            <MailIcon className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-grow">
            <label className="block mb-1 font-mono text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              value={formValues.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="contact@example.com"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-mono font-bold text-lg">Social Media</h4>
            <Win95Button
              onClick={handleAddSocialMedia}
              className="px-3 py-1 font-mono text-sm flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Platform
            </Win95Button>
          </div>

          {!Array.isArray(formValues.socialMedia) || formValues.socialMedia.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 border-2 border-gray-400">
              <p className="font-mono text-gray-600">No social media platforms added yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formValues.socialMedia.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 border-2 border-gray-400 rounded-lg">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full mr-2">
                        {getIconComponent(item.icon)}
                      </div>
                      <h5 className="font-mono font-bold">{item.platform || 'New Platform'}</h5>
                    </div>
                    <Win95Button
                      onClick={() => handleRemoveSocialMedia(item.id)}
                      className="px-2 py-1 font-mono text-xs text-red-600"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </Win95Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 font-mono text-xs text-gray-600">
                        Platform Name
                      </label>
                      <input
                        type="text"
                        value={item.platform}
                        onChange={(e) => handleSocialMediaChange(item.id, 'platform', e.target.value)}
                        className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 text-sm"
                        placeholder="Facebook, Instagram, etc."
                      />
                    </div>

                    <div>
                      <label className="block mb-1 font-mono text-xs text-gray-600">
                        Icon
                      </label>
                      <select
                        value={item.icon}
                        onChange={(e) => handleSocialMediaChange(item.id, 'icon', e.target.value)}
                        className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 text-sm"
                      >
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                        <option value="twitter">Twitter</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                        <option value="link">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block mb-1 font-mono text-xs text-gray-600">
                        URL
                      </label>
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) => handleSocialMediaChange(item.id, 'url', e.target.value)}
                        className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 text-sm"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-between items-center">
          <div>
            {saveStatus === 'saving' && (
              <span className="font-mono text-sm text-gray-600 animate-pulse flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving changes...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="font-mono text-sm text-green-600 flex items-center">
                <CheckIcon className="w-4 h-4 mr-2" />
                Changes saved successfully!
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="font-mono text-sm text-red-600 flex items-center">
                <AlertTriangleIcon className="w-4 h-4 mr-2" />
                Error saving changes. Please try again.
              </span>
            )}
          </div>

          <Win95Button
            onClick={handleSave}
            className={`px-4 py-2 font-mono flex items-center ${
              saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' :
              saveStatus === 'saved' ? 'bg-green-100' :
              saveStatus === 'error' ? 'bg-red-100' :
              'bg-blue-100 hover:bg-blue-200'
            }`}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : saveStatus === 'saved' ? (
              <CheckIcon className="w-4 h-4 mr-2" />
            ) : saveStatus === 'error' ? (
              <AlertTriangleIcon className="w-4 h-4 mr-2" />
            ) : (
              <SaveIcon className="w-4 h-4 mr-2" />
            )}
            {saveStatus === 'saving' ? 'Saving...' :
             saveStatus === 'saved' ? 'Saved!' :
             saveStatus === 'error' ? 'Try Again' :
             'Save Contact Information'}
          </Win95Button>
        </div>
      </div>
    </div>
  );
}
