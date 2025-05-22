import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Win95Button } from './Win95Button';
import { AlertTriangleIcon, ImageIcon, CheckIcon, RefreshCwIcon, EyeIcon, LoaderIcon } from 'lucide-react';
import { defaultSettings } from '../contexts/ThemeContext';
import { SectionManager } from './SectionManager.jsx';
function isValidColor(color: string): boolean {
  const s = new Option().style;
  s.color = color;
  return s.color !== '';
}
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
export function ThemeManagement() {
  const {
    settings,
    updateSettings,
    resetSettings,
    isLoading
  } = useTheme();
  const [imageUrl, setImageUrl] = useState(settings.backgroundImage || '');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [customColor, setCustomColor] = useState(settings.backgroundColor);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  useEffect(() => {
    setImageUrl(settings.backgroundImage || '');
    setCustomColor(settings.backgroundColor);
  }, [settings.backgroundImage, settings.backgroundColor]);
  const handleColorChange = (color: string) => {
    setCustomColor(color);
    setColorError(null);
    if (!isValidColor(color)) {
      setColorError('Invalid color format');
      return;
    }

    setSaveStatus('saving');
    updateSettings({
      backgroundColor: color
    });

    // Show saved status briefly
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };
  const handleImageUrlSubmit = async () => {
    setUrlError(null);
    setIsImageLoading(true);
    setSaveStatus('saving');

    try {
      const isValid = await validateImageUrl(imageUrl);
      if (!isValid) {
        throw new Error('Invalid or inaccessible image URL');
      }

      updateSettings({
        backgroundImage: imageUrl,
        useBackgroundImage: true
      });

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
  const handleUseBackground = (type: 'color' | 'image') => {
    setSaveStatus('saving');

    updateSettings({
      useBackgroundImage: type === 'image',
      ...(type === 'image' && settings.backgroundImage ? {
        backgroundImage: settings.backgroundImage
      } : {})
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };
  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all theme settings to default?')) {
      setSaveStatus('saving');

      resetSettings();
      setImageUrl('');
      setCustomColor(defaultSettings.backgroundColor);
      setUrlError(null);
      setColorError(null);

      setTimeout(() => {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }, 500);
    }
  };
  const predefinedColors = [{
    name: 'Teal',
    value: 'rgb(20 184 166)'
  }, {
    name: 'Blue',
    value: 'rgb(59 130 246)'
  }, {
    name: 'Purple',
    value: 'rgb(168 85 247)'
  }, {
    name: 'Pink',
    value: 'rgb(236 72 153)'
  }, {
    name: 'Green',
    value: 'rgb(34 197 94)'
  }, {
    name: 'Orange',
    value: 'rgb(249 115 22)'
  }];
  return <div className="p-4 bg-gray-200">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoaderIcon className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="font-mono text-gray-700">Loading theme settings...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
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
                  Saving theme settings...
                </>
              )}
              {saveStatus === 'saved' && (
                <>
                  <CheckIcon className="w-4 h-4" />
                  Theme settings saved!
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

          {/* Preview Section */}
          <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b-2 border-gray-400 pb-2">
              <h3 className="font-mono font-bold text-lg">Live Preview</h3>
              <Win95Button onClick={handleResetSettings} className="px-4 py-2 font-mono text-sm">
                <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
                Reset to Default
              </Win95Button>
            </div>
          <div className="relative">
            <div className="aspect-video border-2 border-gray-400 rounded overflow-hidden" style={{
            backgroundColor: settings.backgroundColor,
            backgroundImage: settings.useBackgroundImage && settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }} />
            <div className="absolute bottom-2 right-2">
              <Win95Button onClick={() => window.open(settings.backgroundImage || '', '_blank')} className="px-2 py-1 font-mono text-xs" disabled={!settings.backgroundImage}>
                <EyeIcon className="w-3 h-3 inline-block mr-1" />
                View Full Image
              </Win95Button>
            </div>
          </div>
        </section>
        {/* Background Type Selection */}
        <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
          <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
            Background Type
          </h3>
          <div className="flex gap-2">
            <Win95Button onClick={() => handleUseBackground('color')} className={`px-4 py-2 font-mono flex-1 ${!settings.useBackgroundImage ? 'bg-blue-100' : ''}`}>
              {!settings.useBackgroundImage && <CheckIcon className="w-4 h-4 inline-block mr-2" />}
              Solid Color
            </Win95Button>
            <Win95Button onClick={() => handleUseBackground('image')} className={`px-4 py-2 font-mono flex-1 ${settings.useBackgroundImage ? 'bg-blue-100' : ''}`}>
              {settings.useBackgroundImage && <CheckIcon className="w-4 h-4 inline-block mr-2" />}
              Background Image
            </Win95Button>
          </div>
        </section>
        {/* Color Selection */}
        {!settings.useBackgroundImage && <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
            <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
              Background Color
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-mono">Custom Color:</label>
                <div className="flex gap-2">
                  <input type="color" value={customColor} onChange={e => handleColorChange(e.target.value)} className="w-16 h-10 cursor-pointer border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" />
                  <input type="text" value={customColor} onChange={e => handleColorChange(e.target.value)} className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="Enter color value" />
                </div>
                {colorError && <p className="text-red-500 text-sm mt-1 font-mono">
                    {colorError}
                  </p>}
              </div>
              <div>
                <label className="block mb-2 font-mono">Preset Colors:</label>
                <div className="grid grid-cols-3 gap-2">
                  {predefinedColors.map(color => <button key={color.value} onClick={() => handleColorChange(color.value)} title={color.name} className={`w-full h-10 border-2 ${settings.backgroundColor === color.value ? 'border-blue-500' : 'border-gray-400'} rounded hover:border-blue-500 transition-colors`} style={{
                backgroundColor: color.value
              }} />)}
                </div>
              </div>
            </div>
          </section>}
        {/* Image Background */}
        {settings.useBackgroundImage && <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
            <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
              Background Image
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-mono">Image URL:</label>
                <div className="flex gap-2">
                  <input type="url" value={imageUrl} onChange={e => {
                setImageUrl(e.target.value);
                setUrlError(null);
              }} className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="Enter image URL..." />
                  <Win95Button onClick={handleImageUrlSubmit} className="px-4 py-2 font-mono whitespace-nowrap" disabled={isImageLoading}>
                    <ImageIcon className="w-4 h-4 inline-block mr-2" />
                    {isImageLoading ? 'Loading...' : 'Set Image'}
                  </Win95Button>
                </div>
              </div>
              {urlError && <div className="bg-red-100 border-2 border-red-400 p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangleIcon className="w-5 h-5" />
                    <span className="font-mono">{urlError}</span>
                  </div>
                </div>}
              {settings.backgroundImage && <div className="aspect-video relative overflow-hidden border-2 border-gray-400">
                  <img src={settings.backgroundImage} alt="Current background" className="w-full h-full object-cover" />
                </div>}
            </div>
          </section>}
        {/* Desktop Settings */}
        <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
          <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
            Desktop Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.clockVisible} onChange={e => updateSettings({
                clockVisible: e.target.checked
              })} className="form-checkbox" />
                <span className="font-mono">Show Clock</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={settings.desktopIcons.visible} onChange={e => updateSettings({
                desktopIcons: {
                  ...settings.desktopIcons,
                  visible: e.target.checked
                }
              })} className="form-checkbox" />
                <span className="font-mono">Show Desktop Icons</span>
              </label>
            </div>

            {/* Icon Size Controls */}
            <div className="mt-4 border-t-2 border-gray-200 pt-4">
              <h4 className="font-mono font-bold mb-3">Icon Size Settings</h4>

              {/* Desktop Icons Size */}
              <div className="mb-4">
                <label className="block font-mono text-sm mb-2">Desktop Icons Size:</label>
                <div className="flex gap-2">
                  <Win95Button
                    onClick={() => updateSettings({
                      desktopIcons: {
                        ...settings.desktopIcons,
                        size: 'small'
                      }
                    })}
                    className={`px-3 py-1 font-mono ${settings.desktopIcons.size === 'small' ? 'bg-blue-100' : ''}`}
                  >
                    Small
                  </Win95Button>
                  <Win95Button
                    onClick={() => updateSettings({
                      desktopIcons: {
                        ...settings.desktopIcons,
                        size: 'medium'
                      }
                    })}
                    className={`px-3 py-1 font-mono ${settings.desktopIcons.size === 'medium' ? 'bg-blue-100' : ''}`}
                  >
                    Medium
                  </Win95Button>
                  <Win95Button
                    onClick={() => updateSettings({
                      desktopIcons: {
                        ...settings.desktopIcons,
                        size: 'large'
                      }
                    })}
                    className={`px-3 py-1 font-mono ${settings.desktopIcons.size === 'large' ? 'bg-blue-100' : ''}`}
                  >
                    Large
                  </Win95Button>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="w-8 h-8 border border-gray-400 flex items-center justify-center mr-2 bg-gray-100">
                    <div className={`
                      ${settings.desktopIcons.size === 'small' ? 'w-4 h-4' :
                        settings.desktopIcons.size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'}
                      bg-blue-500
                    `}></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">Preview</span>
                </div>
              </div>

              {/* Menu Icons Size */}
              <div>
                <label className="block font-mono text-sm mb-2">Start Menu Icons Size:</label>
                <div className="flex gap-2">
                  <Win95Button
                    onClick={() => updateSettings({
                      menuIcons: {
                        ...settings.menuIcons,
                        size: 'small'
                      }
                    })}
                    className={`px-3 py-1 font-mono ${settings.menuIcons.size === 'small' ? 'bg-blue-100' : ''}`}
                  >
                    Small
                  </Win95Button>
                  <Win95Button
                    onClick={() => updateSettings({
                      menuIcons: {
                        ...settings.menuIcons,
                        size: 'medium'
                      }
                    })}
                    className={`px-3 py-1 font-mono ${settings.menuIcons.size === 'medium' ? 'bg-blue-100' : ''}`}
                  >
                    Medium
                  </Win95Button>
                  <Win95Button
                    onClick={() => updateSettings({
                      menuIcons: {
                        ...settings.menuIcons,
                        size: 'large'
                      }
                    })}
                    className={`px-3 py-1 font-mono ${settings.menuIcons.size === 'large' ? 'bg-blue-100' : ''}`}
                  >
                    Large
                  </Win95Button>
                </div>
                <div className="mt-2 flex items-center">
                  <div className="w-8 h-8 border border-gray-400 flex items-center justify-center mr-2 bg-gray-100">
                    <div className={`
                      ${settings.menuIcons.size === 'small' ? 'w-4 h-4' :
                        settings.menuIcons.size === 'medium' ? 'w-6 h-6' : 'w-8 h-8'}
                      bg-green-500
                    `}></div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">Preview</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Manager */}
        <SectionManager title="Section Manager" showSaveButton={false}>
          <div className="p-2">
            <p className="font-mono text-sm text-gray-600">
              Manage your website sections and their icons here.
            </p>
          </div>
        </SectionManager>
      </div>
    )}
    </div>;
}