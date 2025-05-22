import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { PricingPackage, PricingAddon, PricingSettings } from '../types';
import { ref, set } from 'firebase/database';
import { database } from '../firebase/config';
import { v4 } from 'uuid';
import { TrashIcon, PlusIcon, StarIcon, EyeIcon, EyeOffIcon, SaveIcon, DollarSignIcon, SettingsIcon, PackageIcon, TagIcon } from 'lucide-react';

export function PricingManager() {
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'packages' | 'addons' | 'settings'>('packages');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Initialize pricing data from context with default values
  const defaultPricing: PricingSettings = {
    packages: [],
    addons: [],
    currency: '$',
    showPricing: true,
    title: 'Our Pricing Plans',
    subtitle: 'Choose the perfect package for your business needs'
  };

  // Create a safe initial state with defaults
  const getSafePricingData = (pricingData: any) => ({
    ...defaultPricing,
    ...(pricingData || {}),
    packages: Array.isArray(pricingData?.packages)
      ? pricingData.packages
      : defaultPricing.packages,
    addons: Array.isArray(pricingData?.addons)
      ? pricingData.addons
      : defaultPricing.addons
  });

  // Initialize state with safe data
  const [pricingData, setPricingData] = useState<PricingSettings>(
    getSafePricingData(content.pricing)
  );

  // Only update state on initial load or when pricing data structure changes
  useEffect(() => {
    // Only show loading on initial load
    if (isInitialLoading) {
      // Create a safe copy of pricing data with defaults for missing values
      const updatedPricing = getSafePricingData(content.pricing);

      // Update state with the safe data
      setPricingData(updatedPricing);

      // End initial loading state
      setIsInitialLoading(false);
    }
  }, [content.pricing, isInitialLoading]);

  // Save changes to Firebase and context
  const handleSave = async () => {
    try {
      setSaveStatus('saving');

      // Ensure all required properties exist before saving
      const dataToSave: PricingSettings = {
        ...defaultPricing,
        ...pricingData,
        packages: Array.isArray(pricingData.packages) ? pricingData.packages : [],
        addons: Array.isArray(pricingData.addons) ? pricingData.addons : []
      };

      // Save to Firebase - both paths in parallel
      await Promise.all([
        set(ref(database, 'pricing'), dataToSave),
        set(ref(database, 'toiral/pricing'), dataToSave)
      ]);

      // Update the context
      updateContent({
        pricing: dataToSave
      });

      setSaveStatus('saved');

      // Reset status after 1 second
      setTimeout(() => {
        setSaveStatus('idle');
      }, 1000);
    } catch (error) {
      console.error('Error saving pricing data:', error);
      setSaveStatus('error');
      alert(`Error saving pricing data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Add a new package
  const handleAddPackage = () => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    const newPackage: PricingPackage = {
      id: v4(),
      name: 'New Package',
      tagline: 'Package Tagline',
      description: 'Package description goes here',
      price: 0,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      popular: false,
      visible: true,
      order: currentPackages.length + 1,
      icon: 'star'
    };

    // Update local state immediately for responsive UI
    const updatedPackages = [...currentPackages, newPackage];

    setPricingData({
      ...pricingData,
      packages: updatedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), updatedPackages),
      set(ref(database, 'toiral/pricing/packages'), updatedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: updatedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error adding package:", error);
        alert(`Error adding package: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Update a package
  const handleUpdatePackage = (index: number, field: keyof PricingPackage, value: any) => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    if (currentPackages.length === 0 || index >= currentPackages.length) {
      console.warn("No packages to update or invalid index");
      return; // No packages to update or invalid index
    }

    // Create a copy of the packages array
    const updatedPackages = [...currentPackages];

    // Update the specific field
    updatedPackages[index] = {
      ...updatedPackages[index],
      [field]: value
    };

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      packages: updatedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), updatedPackages),
      set(ref(database, 'toiral/pricing/packages'), updatedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: updatedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error updating package:", error);
        alert(`Error updating package: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Update package features
  const handleUpdateFeature = (packageIndex: number, featureIndex: number, value: string) => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    if (currentPackages.length === 0 || packageIndex >= currentPackages.length) {
      console.warn("No packages to update or invalid index");
      return; // No packages to update or invalid index
    }

    // Ensure features is an array
    const currentFeatures = Array.isArray(currentPackages[packageIndex].features) ?
      currentPackages[packageIndex].features : [];

    if (currentFeatures.length === 0 || featureIndex >= currentFeatures.length) {
      console.warn("No features to update or invalid index");
      return; // No features to update or invalid index
    }

    // Create a copy of the packages array
    const updatedPackages = [...currentPackages];
    const updatedFeatures = [...currentFeatures];
    updatedFeatures[featureIndex] = value;

    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      features: updatedFeatures
    };

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      packages: updatedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), updatedPackages),
      set(ref(database, 'toiral/pricing/packages'), updatedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: updatedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error updating feature:", error);
        alert(`Error updating feature: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Add a feature to a package
  const handleAddFeature = (packageIndex: number) => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    if (currentPackages.length === 0 || packageIndex >= currentPackages.length) {
      console.warn("No packages to update or invalid index");
      return; // No packages to update or invalid index
    }

    // Ensure features is an array
    const currentFeatures = Array.isArray(currentPackages[packageIndex].features) ?
      currentPackages[packageIndex].features : [];

    // Create a copy of the packages array
    const updatedPackages = [...currentPackages];
    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      features: [...currentFeatures, 'New Feature']
    };

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      packages: updatedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), updatedPackages),
      set(ref(database, 'toiral/pricing/packages'), updatedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: updatedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error adding feature:", error);
        alert(`Error adding feature: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Remove a feature from a package
  const handleRemoveFeature = (packageIndex: number, featureIndex: number) => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    if (currentPackages.length === 0 || packageIndex >= currentPackages.length) {
      console.warn("No packages to update or invalid index");
      return; // No packages to update or invalid index
    }

    // Ensure features is an array
    const currentFeatures = Array.isArray(currentPackages[packageIndex].features) ?
      currentPackages[packageIndex].features : [];

    if (currentFeatures.length === 0 || featureIndex >= currentFeatures.length) {
      console.warn("No features to remove or invalid index");
      return; // No features to remove or invalid index
    }

    // Create a copy of the packages array
    const updatedPackages = [...currentPackages];
    const updatedFeatures = [...currentFeatures];
    updatedFeatures.splice(featureIndex, 1);

    updatedPackages[packageIndex] = {
      ...updatedPackages[packageIndex],
      features: updatedFeatures
    };

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      packages: updatedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), updatedPackages),
      set(ref(database, 'toiral/pricing/packages'), updatedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: updatedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error removing feature:", error);
        alert(`Error removing feature: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Delete a package
  const handleDeletePackage = (index: number) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      // Ensure packages is an array
      const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

      if (currentPackages.length === 0) {
        console.warn("No packages to delete");
        return; // No packages to delete
      }

      const updatedPackages = [...currentPackages];
      updatedPackages.splice(index, 1);

      // Update order of remaining packages
      const reorderedPackages = updatedPackages.map((pkg, idx) => ({
        ...pkg,
        order: idx + 1
      }));

      // Update local state immediately for responsive UI
      setPricingData({
        ...pricingData,
        packages: reorderedPackages
      });

      // Save to Firebase in the background
      Promise.all([
        set(ref(database, 'pricing/packages'), reorderedPackages),
        set(ref(database, 'toiral/pricing/packages'), reorderedPackages)
      ])
        .then(() => {
          // Update the context
          updateContent({
            pricing: {
              ...pricingData,
              packages: reorderedPackages
            }
          });
        })
        .catch(error => {
          console.error("Error deleting package:", error);
          alert(`Error deleting package: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
    }
  };

  // Move a package up in order
  const handleMovePackageUp = (index: number) => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    if (index === 0 || currentPackages.length < 2) {
      console.warn("Cannot move package up: already at the top or not enough packages");
      return; // Already at the top or not enough packages
    }

    const updatedPackages = [...currentPackages];
    const temp = updatedPackages[index];
    updatedPackages[index] = updatedPackages[index - 1];
    updatedPackages[index - 1] = temp;

    // Update order property
    const reorderedPackages = updatedPackages.map((pkg, idx) => ({
      ...pkg,
      order: idx + 1
    }));

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      packages: reorderedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), reorderedPackages),
      set(ref(database, 'toiral/pricing/packages'), reorderedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: reorderedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error moving package up:", error);
        alert(`Error moving package up: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Move a package down in order
  const handleMovePackageDown = (index: number) => {
    // Ensure packages is an array
    const currentPackages = Array.isArray(pricingData.packages) ? pricingData.packages : [];

    if (index === currentPackages.length - 1 || currentPackages.length < 2) {
      console.warn("Cannot move package down: already at the bottom or not enough packages");
      return; // Already at the bottom or not enough packages
    }

    const updatedPackages = [...currentPackages];
    const temp = updatedPackages[index];
    updatedPackages[index] = updatedPackages[index + 1];
    updatedPackages[index + 1] = temp;

    // Update order property
    const reorderedPackages = updatedPackages.map((pkg, idx) => ({
      ...pkg,
      order: idx + 1
    }));

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      packages: reorderedPackages
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/packages'), reorderedPackages),
      set(ref(database, 'toiral/pricing/packages'), reorderedPackages)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            packages: reorderedPackages
          }
        });
      })
      .catch(error => {
        console.error("Error moving package down:", error);
        alert(`Error moving package down: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Add a new addon
  const handleAddAddon = () => {
    // Ensure addons is an array
    const currentAddons = Array.isArray(pricingData.addons) ? pricingData.addons : [];

    const newAddon: PricingAddon = {
      id: v4(),
      name: 'New Add-on',
      description: 'Add-on description goes here',
      price: 0,
      visible: true
    };

    // Update local state immediately for responsive UI
    const updatedAddons = [...currentAddons, newAddon];

    setPricingData({
      ...pricingData,
      addons: updatedAddons
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/addons'), updatedAddons),
      set(ref(database, 'toiral/pricing/addons'), updatedAddons)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            addons: updatedAddons
          }
        });
      })
      .catch(error => {
        console.error("Error adding add-on:", error);
        alert(`Error adding add-on: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Update an addon
  const handleUpdateAddon = (index: number, field: keyof PricingAddon, value: any) => {
    // Ensure addons is an array
    const currentAddons = Array.isArray(pricingData.addons) ? pricingData.addons : [];

    if (currentAddons.length === 0 || index >= currentAddons.length) {
      console.warn("No add-ons to update or invalid index");
      return; // No addons to update or invalid index
    }

    // Create a copy of the addons array
    const updatedAddons = [...currentAddons];

    // Update the specific field
    updatedAddons[index] = {
      ...updatedAddons[index],
      [field]: value
    };

    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      addons: updatedAddons
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, 'pricing/addons'), updatedAddons),
      set(ref(database, 'toiral/pricing/addons'), updatedAddons)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            addons: updatedAddons
          }
        });
      })
      .catch(error => {
        console.error("Error updating add-on:", error);
        alert(`Error updating add-on: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  // Delete an addon
  const handleDeleteAddon = (index: number) => {
    if (window.confirm('Are you sure you want to delete this add-on?')) {
      // Ensure addons is an array
      const currentAddons = Array.isArray(pricingData.addons) ? pricingData.addons : [];

      if (currentAddons.length === 0) {
        console.warn("No add-ons to delete");
        return; // No addons to delete
      }

      const updatedAddons = [...currentAddons];
      updatedAddons.splice(index, 1);

      // Update local state immediately for responsive UI
      setPricingData({
        ...pricingData,
        addons: updatedAddons
      });

      // Save to Firebase in the background
      Promise.all([
        set(ref(database, 'pricing/addons'), updatedAddons),
        set(ref(database, 'toiral/pricing/addons'), updatedAddons)
      ])
        .then(() => {
          // Update the context
          updateContent({
            pricing: {
              ...pricingData,
              addons: updatedAddons
            }
          });
        })
        .catch(error => {
          console.error("Error deleting add-on:", error);
          alert(`Error deleting add-on: ${error instanceof Error ? error.message : 'Unknown error'}`);
        });
    }
  };

  // Update settings
  const handleUpdateSettings = (field: keyof PricingSettings, value: any) => {
    // Update local state immediately for responsive UI
    setPricingData({
      ...pricingData,
      [field]: value
    });

    // Save to Firebase in the background
    Promise.all([
      set(ref(database, `pricing/${field}`), value),
      set(ref(database, `toiral/pricing/${field}`), value)
    ])
      .then(() => {
        // Update the context
        updateContent({
          pricing: {
            ...pricingData,
            [field]: value
          }
        });
      })
      .catch(error => {
        console.error(`Error updating setting ${field}:`, error);
        alert(`Error updating setting: ${error instanceof Error ? error.message : 'Unknown error'}`);
      });
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-mono font-bold text-xl">Pricing Manager</h2>
        <div className="flex gap-2">
          <Win95Button
            onClick={handleSave}
            className="px-4 py-2 font-mono flex items-center"
            disabled={saveStatus === 'saving' || isInitialLoading}
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            {saveStatus === 'idle' && 'Save Changes'}
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved!'}
            {saveStatus === 'error' && 'Error!'}
          </Win95Button>
        </div>
      </div>

      {isInitialLoading && (
        <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse delay-75"></div>
            <div className="w-4 h-4 bg-gray-600 rounded-full animate-pulse delay-150"></div>
          </div>
          <p className="font-mono text-gray-600 mt-2">Loading pricing data...</p>
        </div>
      )}

      {!isInitialLoading && (
        <>
          {/* Tabs */}
          <div className="flex flex-wrap gap-1 mb-4 border-b border-gray-400 pb-2">
            <Win95Button
              className={`px-4 py-2 font-mono flex items-center ${activeTab === 'packages' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              <PackageIcon className="w-4 h-4 mr-2" />
              Packages
            </Win95Button>
            <Win95Button
              className={`px-4 py-2 font-mono flex items-center ${activeTab === 'addons' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
              onClick={() => setActiveTab('addons')}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add-ons
            </Win95Button>
            <Win95Button
              className={`px-4 py-2 font-mono flex items-center ${activeTab === 'settings' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Win95Button>
          </div>
        </>
      )}

      {!isInitialLoading && (
        <>
          {/* Packages Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-mono font-bold text-lg">Pricing Packages</h3>
                <Win95Button onClick={handleAddPackage} className="px-4 py-2 font-mono flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Package
                </Win95Button>
              </div>

              {!Array.isArray(pricingData.packages) || pricingData.packages.length === 0 ? (
                <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
                  <p className="font-mono text-gray-600">No packages found. Add your first package to get started.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pricingData.packages.map((pkg, index) => (
                    <div key={pkg.id} className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
                        <h4 className="font-mono font-bold">{pkg.name}</h4>
                        <div className="flex gap-2">
                          <Win95Button
                            onClick={() => handleUpdatePackage(index, 'visible', !pkg.visible)}
                            className="px-2 py-1 font-mono"
                            title={pkg.visible ? 'Hide package' : 'Show package'}
                          >
                            {pkg.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleUpdatePackage(index, 'popular', !pkg.popular)}
                            className={`px-2 py-1 font-mono ${pkg.popular ? 'bg-blue-100' : ''}`}
                            title={pkg.popular ? 'Remove popular tag' : 'Mark as popular'}
                          >
                            <StarIcon className="w-4 h-4" />
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleMovePackageUp(index)}
                            className="px-2 py-1 font-mono"
                            disabled={index === 0}
                            title="Move up"
                          >
                            ↑
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleMovePackageDown(index)}
                            className="px-2 py-1 font-mono"
                            disabled={index === pricingData.packages.length - 1}
                            title="Move down"
                          >
                            ↓
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleDeletePackage(index)}
                            className="px-2 py-1 font-mono text-red-600"
                            title="Delete package"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Win95Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Package Name</label>
                          <input
                            type="text"
                            value={pkg.name}
                            onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                            className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Tagline</label>
                          <input
                            type="text"
                            value={pkg.tagline}
                            onChange={(e) => handleUpdatePackage(index, 'tagline', e.target.value)}
                            className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Price</label>
                          <div className="flex">
                            <span className="p-2 font-mono border-2 border-gray-600 bg-gray-200 border-t-gray-800 border-l-gray-800">
                              {pricingData.currency}
                            </span>
                            <input
                              type="number"
                              value={pkg.price}
                              onChange={(e) => handleUpdatePackage(index, 'price', Number(e.target.value))}
                              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 border-l-0"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Icon</label>
                          <select
                            value={pkg.icon || 'star'}
                            onChange={(e) => handleUpdatePackage(index, 'icon', e.target.value)}
                            className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                          >
                            <option value="star">Star</option>
                            <option value="rocket">Rocket</option>
                            <option value="diamond">Diamond</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block mb-1 font-mono text-gray-600">Description</label>
                        <textarea
                          value={pkg.description}
                          onChange={(e) => handleUpdatePackage(index, 'description', e.target.value)}
                          className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                          rows={2}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="font-mono text-gray-600">Features</label>
                          <Win95Button
                            onClick={() => handleAddFeature(index)}
                            className="px-2 py-1 font-mono text-sm"
                          >
                            <PlusIcon className="w-3 h-3 mr-1 inline" />
                            Add Feature
                          </Win95Button>
                        </div>
                        <div className="space-y-2">
                          {Array.isArray(pkg.features) && pkg.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => handleUpdateFeature(index, featureIndex, e.target.value)}
                                className="flex-grow p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                              />
                              <Win95Button
                                onClick={() => handleRemoveFeature(index, featureIndex)}
                                className="px-2 py-1 font-mono text-red-600"
                                title="Remove feature"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </Win95Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add-ons Tab */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-mono font-bold text-lg">Pricing Add-ons</h3>
                <Win95Button onClick={handleAddAddon} className="px-4 py-2 font-mono flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Add-on
                </Win95Button>
              </div>

              {!Array.isArray(pricingData.addons) || pricingData.addons.length === 0 ? (
                <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
                  <p className="font-mono text-gray-600">No add-ons found. Add your first add-on to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingData.addons.map((addon, index) => (
                    <div key={addon.id} className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
                        <h4 className="font-mono font-bold">{addon.name}</h4>
                        <div className="flex gap-2">
                          <Win95Button
                            onClick={() => handleUpdateAddon(index, 'visible', !addon.visible)}
                            className="px-2 py-1 font-mono"
                            title={addon.visible ? 'Hide add-on' : 'Show add-on'}
                          >
                            {addon.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleDeleteAddon(index)}
                            className="px-2 py-1 font-mono text-red-600"
                            title="Delete add-on"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Win95Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Add-on Name</label>
                          <input
                            type="text"
                            value={addon.name}
                            onChange={(e) => handleUpdateAddon(index, 'name', e.target.value)}
                            className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Description</label>
                          <textarea
                            value={addon.description || ''}
                            onChange={(e) => handleUpdateAddon(index, 'description', e.target.value)}
                            className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="block mb-1 font-mono text-gray-600">Price</label>
                          <div className="flex">
                            <span className="p-2 font-mono border-2 border-gray-600 bg-gray-200 border-t-gray-800 border-l-gray-800">
                              {pricingData.currency}
                            </span>
                            <input
                              type="number"
                              value={addon.price}
                              onChange={(e) => handleUpdateAddon(index, 'price', Number(e.target.value))}
                              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 border-l-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="font-mono font-bold text-lg">Pricing Settings</h3>

              <div className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1 font-mono text-gray-600">Currency Symbol</label>
                    <input
                      type="text"
                      value={pricingData.currency}
                      onChange={(e) => handleUpdateSettings('currency', e.target.value)}
                      className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                      maxLength={3}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center font-mono text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pricingData.showPricing}
                        onChange={(e) => handleUpdateSettings('showPricing', e.target.checked)}
                        className="mr-2"
                      />
                      Show Pricing Section on Website
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-mono text-gray-600">Section Title</label>
                    <input
                      type="text"
                      value={pricingData.title}
                      onChange={(e) => handleUpdateSettings('title', e.target.value)}
                      className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-mono text-gray-600">Section Subtitle</label>
                    <input
                      type="text"
                      value={pricingData.subtitle || ''}
                      onChange={(e) => handleUpdateSettings('subtitle', e.target.value)}
                      className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
