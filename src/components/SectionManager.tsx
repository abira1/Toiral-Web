import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Win95Button } from './Win95Button';
import { SectionManagerProps } from '../types';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  CheckIcon,
  LoaderIcon,
  AlertTriangleIcon,
  GripVerticalIcon
} from 'lucide-react';

interface SectionConfig {
  id: string;
  label: string;
  icon: string;
  order: number;
  visible: boolean;
  startMenuOnly?: boolean;
}

export function SectionManager({ title, children, onSave, onCancel, showSaveButton = true }: SectionManagerProps) {
  const { settings, updateSettings, isLoading } = useTheme();
  const [sections, setSections] = useState<SectionConfig[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [newIconUrl, setNewIconUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [draggedSection, setDraggedSection] = useState<string | null>(null);

  // Initialize sections from settings
  useEffect(() => {
    if (settings.sections) {
      // Sort sections by order
      const sortedSections = [...settings.sections].sort((a, b) => a.order - b.order);
      setSections(sortedSections);
    }
  }, [settings.sections]);

  // Validate image URL
  const validateImageUrl = async (url: string): Promise<boolean> => {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new Error('URL must use HTTP or HTTPS protocol');
      }
      // Test if image loads
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  // Handle icon URL change
  const handleIconUrlSubmit = async (sectionId: string) => {
    setUrlError(null);
    setIsImageLoading(true);
    setSaveStatus('saving');

    try {
      const isValid = await validateImageUrl(newIconUrl);
      if (!isValid) {
        throw new Error('Invalid or inaccessible image URL');
      }

      // Update the section icon
      const updatedSections = sections.map(section =>
        section.id === sectionId
          ? { ...section, icon: newIconUrl }
          : section
      );

      setSections(updatedSections);
      updateSettings({ sections: updatedSections });
      setEditingSection(null);
      setNewIconUrl('');

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setUrlError(error instanceof Error ? error.message : 'Invalid image URL');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsImageLoading(false);
    }
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId: string) => {
    setSaveStatus('saving');

    const updatedSections = sections.map(section =>
      section.id === sectionId
        ? { ...section, visible: !section.visible }
        : section
    );

    setSections(updatedSections);
    updateSettings({ sections: updatedSections });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Move section up in order
  const moveSectionUp = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex <= 0) return; // Already at the top

    setSaveStatus('saving');

    const updatedSections = [...sections];
    const currentSection = updatedSections[sectionIndex];
    const prevSection = updatedSections[sectionIndex - 1];

    // Swap orders
    const tempOrder = currentSection.order;
    currentSection.order = prevSection.order;
    prevSection.order = tempOrder;

    // Reorder array
    updatedSections[sectionIndex] = prevSection;
    updatedSections[sectionIndex - 1] = currentSection;

    setSections(updatedSections);
    updateSettings({ sections: updatedSections });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Move section down in order
  const moveSectionDown = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex >= sections.length - 1) return; // Already at the bottom

    setSaveStatus('saving');

    const updatedSections = [...sections];
    const currentSection = updatedSections[sectionIndex];
    const nextSection = updatedSections[sectionIndex + 1];

    // Swap orders
    const tempOrder = currentSection.order;
    currentSection.order = nextSection.order;
    nextSection.order = tempOrder;

    // Reorder array
    updatedSections[sectionIndex] = nextSection;
    updatedSections[sectionIndex + 1] = currentSection;

    setSections(updatedSections);
    updateSettings({ sections: updatedSections });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  // Drag and drop handlers
  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedSection === sectionId) return;

    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === sectionId);

    if (draggedIndex === -1 || targetIndex === -1) return;
  };

  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetSectionId) {
      return;
    }

    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetSectionId);

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    setSaveStatus('saving');

    // Create a copy of the sections array
    const updatedSections = [...sections];

    // Remove the dragged item
    const draggedItem = updatedSections.splice(draggedIndex, 1)[0];

    // Insert it at the target position
    updatedSections.splice(targetIndex, 0, draggedItem);

    // Update order values for all sections
    const reorderedSections = updatedSections.map((section, index) => ({
      ...section,
      order: index + 1
    }));

    setSections(reorderedSections);
    updateSettings({ sections: reorderedSections });

    setDraggedSection(null);

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoaderIcon className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="font-mono text-gray-700">Loading section settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
      <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
        {title || 'Section Manager'}
      </h3>

      {/* Status Bar */}
      {saveStatus !== 'idle' && (
        <div className={`fixed bottom-20 right-4 p-3 rounded-lg shadow-lg z-50 font-mono text-sm flex items-center gap-2
          ${saveStatus === 'saving' ? 'bg-blue-100 text-blue-800' :
            saveStatus === 'saved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'}`}
        >
          {saveStatus === 'saving' && (
            <>
              <LoaderIcon className="w-4 h-4 animate-spin" />
              Saving section settings...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckIcon className="w-4 h-4" />
              Section settings saved!
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertTriangleIcon className="w-4 h-4" />
              Error saving settings
            </>
          )}
        </div>
      )}

      <div className="space-y-2">
        {children ? (
          <div className="mb-4">{children}</div>
        ) : (
          <p className="font-mono text-sm text-gray-600 mb-4">
            Manage your website sections below. You can change their order by dragging or using the arrow buttons,
            update their icons, or toggle their visibility.
          </p>
        )}

        <div className="border-2 border-gray-400 rounded">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="font-mono text-left p-2 border-b-2 border-gray-400">Order</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-400">Section</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-400">Icon</th>
                <th className="font-mono text-left p-2 border-b-2 border-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section, index) => (
                <tr
                  key={section.id}
                  className={`border-b border-gray-300 ${draggedSection === section.id ? 'opacity-50 bg-blue-50' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(section.id)}
                  onDragOver={(e) => handleDragOver(e, section.id)}
                  onDrop={(e) => handleDrop(e, section.id)}
                  onDragEnd={handleDragEnd}
                >
                  <td className="p-2 font-mono">
                    <div className="flex items-center">
                      <GripVerticalIcon className="w-4 h-4 mr-2 cursor-move text-gray-500" />
                      {section.order}
                    </div>
                  </td>
                  <td className="p-2 font-mono">
                    {section.label}
                    {section.startMenuOnly && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Start Menu Only
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {editingSection === section.id ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={newIconUrl}
                            onChange={(e) => {
                              setNewIconUrl(e.target.value);
                              setUrlError(null);
                            }}
                            className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                            placeholder="Enter icon URL..."
                          />
                          <Win95Button
                            onClick={() => handleIconUrlSubmit(section.id)}
                            className="px-4 py-2 font-mono whitespace-nowrap"
                            disabled={isImageLoading}
                          >
                            <ImageIcon className="w-4 h-4 inline-block mr-2" />
                            {isImageLoading ? 'Loading...' : 'Set Icon'}
                          </Win95Button>
                        </div>
                        {urlError && (
                          <div className="bg-red-100 border-2 border-red-400 p-2">
                            <div className="flex items-center gap-2 text-red-700">
                              <AlertTriangleIcon className="w-4 h-4" />
                              <span className="font-mono text-sm">{urlError}</span>
                            </div>
                          </div>
                        )}
                        <Win95Button
                          onClick={() => {
                            setEditingSection(null);
                            setNewIconUrl('');
                            setUrlError(null);
                          }}
                          className="px-4 py-1 font-mono text-sm"
                        >
                          Cancel
                        </Win95Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 border-2 border-gray-400 flex items-center justify-center bg-white">
                          <img
                            src={section.icon}
                            alt={section.label}
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/32?text=Icon';
                            }}
                          />
                        </div>
                        <Win95Button
                          onClick={() => {
                            setEditingSection(section.id);
                            setNewIconUrl(section.icon);
                          }}
                          className="px-2 py-1 font-mono text-xs"
                        >
                          Change
                        </Win95Button>
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <Win95Button
                        onClick={() => toggleSectionVisibility(section.id)}
                        className="px-2 py-1 font-mono text-xs"
                        title={section.visible ? "Hide section" : "Show section"}
                      >
                        {section.visible ? (
                          <>
                            <EyeIcon className="w-3 h-3 inline-block mr-1" />
                            Visible
                          </>
                        ) : (
                          <>
                            <EyeOffIcon className="w-3 h-3 inline-block mr-1" />
                            Hidden
                          </>
                        )}
                      </Win95Button>

                      <Win95Button
                        onClick={() => moveSectionUp(section.id)}
                        className="px-2 py-1 font-mono text-xs"
                        disabled={index === 0}
                        title="Move up"
                      >
                        <ArrowUpIcon className="w-3 h-3" />
                      </Win95Button>

                      <Win95Button
                        onClick={() => moveSectionDown(section.id)}
                        className="px-2 py-1 font-mono text-xs"
                        disabled={index === sections.length - 1}
                        title="Move down"
                      >
                        <ArrowDownIcon className="w-3 h-3" />
                      </Win95Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-gray-100 border-2 border-gray-400 rounded">
          <h4 className="font-mono font-bold mb-2">Instructions:</h4>
          <ul className="list-disc pl-5 font-mono text-sm space-y-1">
            <li>Drag sections or use arrow buttons to change their order</li>
            <li>Click "Change" to update a section's icon (must be a valid image URL)</li>
            <li>Toggle visibility with the eye button</li>
            <li>All changes are saved automatically to the database</li>
            <li><span className="text-blue-800 font-semibold">Start Menu Only</span> sections will only appear in the Start Menu, not on the desktop</li>
          </ul>
        </div>

        {/* Save/Cancel buttons */}
        {(onSave || onCancel) && (
          <div className="flex justify-end gap-2 mt-4">
            {onCancel && (
              <Win95Button
                onClick={onCancel}
                className="px-4 py-2 font-mono"
              >
                Cancel
              </Win95Button>
            )}
            {showSaveButton && onSave && (
              <Win95Button
                onClick={onSave}
                className="px-4 py-2 font-mono"
              >
                <CheckIcon className="w-4 h-4 mr-2" />
                Save Changes
              </Win95Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}