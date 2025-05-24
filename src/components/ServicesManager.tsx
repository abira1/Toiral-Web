import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { ServicePackage, ServiceAddon, ServicesSettings, ServiceCategory } from '../types';
import { ref, set } from 'firebase/database';
import { database } from '../firebase/config';
import { v4 } from 'uuid';
import {
  TrashIcon,
  PlusIcon,
  StarIcon,
  EyeIcon,
  EyeOffIcon,
  SaveIcon,
  DollarSignIcon,
  SettingsIcon,
  PackageIcon,
  TagIcon,
  FolderIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';

export function ServicesManager() {
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'categories' | 'packages' | 'addons' | 'settings'>('categories');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  // Default service categories
  const defaultCategories: ServiceCategory[] = [
    {
      id: 'web-development',
      name: 'Web Design & Development',
      description: 'Custom websites, e-commerce platforms, and web applications with modern design and functionality.',
      icon: 'code',
      order: 1,
      visible: true,
      color: '#3B82F6'
    },
    {
      id: 'graphic-design',
      name: 'Graphic Design & Branding',
      description: 'Logo design, brand identity, marketing materials, and visual communication solutions.',
      icon: 'palette',
      order: 2,
      visible: true,
      color: '#EF4444'
    },
    {
      id: 'ui-ux-design',
      name: 'UI/UX & Digital Product Design',
      description: 'User interface design, user experience optimization, and digital product development.',
      icon: 'smartphone',
      order: 3,
      visible: true,
      color: '#10B981'
    },
    {
      id: 'consulting',
      name: 'Creative Consulting & Strategy',
      description: 'Brand strategy, creative direction, and business consulting for digital transformation.',
      icon: 'lightbulb',
      order: 4,
      visible: true,
      color: '#F59E0B'
    },
    {
      id: 'marketing',
      name: 'Marketing & Content Design',
      description: 'Digital marketing campaigns, content creation, and promotional material design.',
      icon: 'megaphone',
      order: 5,
      visible: true,
      color: '#8B5CF6'
    },
    {
      id: 'startup-support',
      name: 'Startup & Business Support',
      description: 'Complete business launch packages, branding kits, and entrepreneurial support services.',
      icon: 'rocket',
      order: 6,
      visible: true,
      color: '#06B6D4'
    }
  ];

  // Initialize services data from content with default values
  const defaultServices: ServicesSettings = {
    categories: defaultCategories,
    packages: [],
    addons: [],
    currency: '$',
    showServices: true,
    title: 'Our Services',
    subtitle: 'Comprehensive digital solutions for your business needs'
  };

  // Create a safe initial state with defaults
  const getSafeServicesData = (servicesData: any, legacyPricingData: any) => {
    // If we have new services data, use it
    if (servicesData && typeof servicesData === 'object') {
      return {
        ...defaultServices,
        ...servicesData,
        categories: Array.isArray(servicesData.categories)
          ? servicesData.categories
          : defaultCategories,
        packages: Array.isArray(servicesData.packages)
          ? servicesData.packages
          : defaultServices.packages,
        addons: Array.isArray(servicesData.addons)
          ? servicesData.addons
          : defaultServices.addons
      };
    }

    // Migrate from legacy pricing data if available
    if (legacyPricingData && typeof legacyPricingData === 'object') {
      const migratedPackages = Array.isArray(legacyPricingData.packages)
        ? legacyPricingData.packages.map((pkg: any) => ({
            ...pkg,
            categoryId: pkg.categoryId || 'web-development' // Default category
          }))
        : [];

      return {
        ...defaultServices,
        packages: migratedPackages,
        addons: Array.isArray(legacyPricingData.addons) ? legacyPricingData.addons : [],
        currency: legacyPricingData.currency || '$',
        showServices: legacyPricingData.showPricing !== false,
        title: legacyPricingData.title || 'Our Services',
        subtitle: legacyPricingData.subtitle || 'Comprehensive digital solutions for your business needs'
      };
    }

    return defaultServices;
  };

  // Initialize state with safe data
  const [servicesData, setServicesData] = useState<ServicesSettings>(
    getSafeServicesData(content.services, content.pricing)
  );

  // Update local state when content changes
  useEffect(() => {
    const newServicesData = getSafeServicesData(content.services, content.pricing);
    setServicesData(newServicesData);
    setIsInitialLoading(false);
  }, [content.services, content.pricing]);

  // Save changes to Firebase and context
  const handleSave = async () => {
    try {
      setSaveStatus('saving');

      // Ensure all required properties exist before saving
      const dataToSave: ServicesSettings = {
        ...defaultServices,
        ...servicesData,
        categories: Array.isArray(servicesData.categories) ? servicesData.categories : defaultCategories,
        packages: Array.isArray(servicesData.packages) ? servicesData.packages : [],
        addons: Array.isArray(servicesData.addons) ? servicesData.addons : []
      };

      // Save to Firebase - both new services path and legacy pricing path for compatibility
      await Promise.all([
        set(ref(database, 'services'), dataToSave),
        set(ref(database, 'toiral/services'), dataToSave),
        // Maintain legacy pricing path for backward compatibility
        set(ref(database, 'pricing'), {
          packages: dataToSave.packages,
          addons: dataToSave.addons,
          currency: dataToSave.currency,
          showPricing: dataToSave.showServices,
          title: dataToSave.title,
          subtitle: dataToSave.subtitle
        }),
        set(ref(database, 'toiral/pricing'), {
          packages: dataToSave.packages,
          addons: dataToSave.addons,
          currency: dataToSave.currency,
          showPricing: dataToSave.showServices,
          title: dataToSave.title,
          subtitle: dataToSave.subtitle
        })
      ]);

      // Update the context
      updateContent({
        services: dataToSave,
        pricing: {
          packages: dataToSave.packages,
          addons: dataToSave.addons,
          currency: dataToSave.currency,
          showPricing: dataToSave.showServices,
          title: dataToSave.title,
          subtitle: dataToSave.subtitle
        }
      });

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving services data:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert(`Error saving services data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Add a new category
  const handleAddCategory = () => {
    const currentCategories = Array.isArray(servicesData.categories) ? servicesData.categories : [];

    const newCategory: ServiceCategory = {
      id: v4(),
      name: 'New Service Category',
      description: 'Description for the new service category',
      icon: 'folder',
      order: currentCategories.length + 1,
      visible: true,
      color: '#6B7280'
    };

    const updatedCategories = [...currentCategories, newCategory];

    setServicesData({
      ...servicesData,
      categories: updatedCategories
    });
  };

  // Add a new service package
  const handleAddPackage = () => {
    const currentPackages = Array.isArray(servicesData.packages) ? servicesData.packages : [];
    const currentCategories = Array.isArray(servicesData.categories) ? servicesData.categories : [];

    const newPackage: ServicePackage = {
      id: v4(),
      name: 'New Service Package',
      tagline: 'Professional Service',
      description: 'Description for the new service package',
      price: 0,
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      popular: false,
      visible: true,
      order: currentPackages.length + 1,
      icon: 'star',
      categoryId: currentCategories.length > 0 ? currentCategories[0].id : 'web-development',
      duration: 'one-time',
      deliveryTime: '1-2 weeks'
    };

    const updatedPackages = [...currentPackages, newPackage];

    setServicesData({
      ...servicesData,
      packages: updatedPackages
    });
  };

  // Update a category
  const handleUpdateCategory = (index: number, field: keyof ServiceCategory, value: any) => {
    const currentCategories = Array.isArray(servicesData.categories) ? servicesData.categories : [];

    if (currentCategories.length === 0 || index >= currentCategories.length) {
      console.warn("No categories to update or invalid index");
      return;
    }

    const updatedCategories = [...currentCategories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };

    setServicesData({
      ...servicesData,
      categories: updatedCategories
    });
  };

  // Delete a category
  const handleDeleteCategory = (index: number) => {
    const currentCategories = Array.isArray(servicesData.categories) ? servicesData.categories : [];

    if (currentCategories.length === 0 || index >= currentCategories.length) {
      console.warn("No categories to delete or invalid index");
      return;
    }

    const categoryToDelete = currentCategories[index];
    const updatedCategories = currentCategories.filter((_, i) => i !== index);

    // Also remove any packages that belong to this category
    const updatedPackages = servicesData.packages.filter(pkg => pkg.categoryId !== categoryToDelete.id);

    setServicesData({
      ...servicesData,
      categories: updatedCategories,
      packages: updatedPackages
    });
  };

  // Move category up
  const handleMoveCategoryUp = (index: number) => {
    const currentCategories = Array.isArray(servicesData.categories) ? servicesData.categories : [];

    if (index <= 0 || currentCategories.length === 0) return;

    const updatedCategories = [...currentCategories];
    [updatedCategories[index - 1], updatedCategories[index]] = [updatedCategories[index], updatedCategories[index - 1]];

    // Update order values
    const reorderedCategories = updatedCategories.map((category, idx) => ({
      ...category,
      order: idx + 1
    }));

    setServicesData({
      ...servicesData,
      categories: reorderedCategories
    });
  };

  // Move category down
  const handleMoveCategoryDown = (index: number) => {
    const currentCategories = Array.isArray(servicesData.categories) ? servicesData.categories : [];

    if (index >= currentCategories.length - 1 || currentCategories.length === 0) return;

    const updatedCategories = [...currentCategories];
    [updatedCategories[index], updatedCategories[index + 1]] = [updatedCategories[index + 1], updatedCategories[index]];

    // Update order values
    const reorderedCategories = updatedCategories.map((category, idx) => ({
      ...category,
      order: idx + 1
    }));

    setServicesData({
      ...servicesData,
      categories: reorderedCategories
    });
  };

  // Update a package
  const handleUpdatePackage = (index: number, field: keyof ServicePackage, value: any) => {
    const currentPackages = Array.isArray(servicesData.packages) ? servicesData.packages : [];

    if (currentPackages.length === 0 || index >= currentPackages.length) {
      console.warn("No packages to update or invalid index");
      return;
    }

    const updatedPackages = [...currentPackages];

    // Handle features array specially
    if (field === 'features' && typeof value === 'string') {
      // Split by newlines and filter out empty lines
      updatedPackages[index] = {
        ...updatedPackages[index],
        [field]: value.split('\n').filter(line => line.trim() !== '')
      };
    } else {
      updatedPackages[index] = {
        ...updatedPackages[index],
        [field]: value
      };
    }

    setServicesData({
      ...servicesData,
      packages: updatedPackages
    });
  };

  // Delete a package
  const handleDeletePackage = (index: number) => {
    const currentPackages = Array.isArray(servicesData.packages) ? servicesData.packages : [];

    if (currentPackages.length === 0 || index >= currentPackages.length) {
      console.warn("No packages to delete or invalid index");
      return;
    }

    const updatedPackages = currentPackages.filter((_, i) => i !== index);

    setServicesData({
      ...servicesData,
      packages: updatedPackages
    });
  };

  // Move package up
  const handleMovePackageUp = (index: number) => {
    const currentPackages = Array.isArray(servicesData.packages) ? servicesData.packages : [];

    if (index <= 0 || currentPackages.length === 0) return;

    const updatedPackages = [...currentPackages];
    [updatedPackages[index - 1], updatedPackages[index]] = [updatedPackages[index], updatedPackages[index - 1]];

    // Update order values
    const reorderedPackages = updatedPackages.map((pkg, idx) => ({
      ...pkg,
      order: idx + 1
    }));

    setServicesData({
      ...servicesData,
      packages: reorderedPackages
    });
  };

  // Move package down
  const handleMovePackageDown = (index: number) => {
    const currentPackages = Array.isArray(servicesData.packages) ? servicesData.packages : [];

    if (index >= currentPackages.length - 1 || currentPackages.length === 0) return;

    const updatedPackages = [...currentPackages];
    [updatedPackages[index], updatedPackages[index + 1]] = [updatedPackages[index + 1], updatedPackages[index]];

    // Update order values
    const reorderedPackages = updatedPackages.map((pkg, idx) => ({
      ...pkg,
      order: idx + 1
    }));

    setServicesData({
      ...servicesData,
      packages: reorderedPackages
    });
  };

  // Add a new addon
  const handleAddAddon = () => {
    const currentAddons = Array.isArray(servicesData.addons) ? servicesData.addons : [];

    const newAddon: ServiceAddon = {
      id: v4(),
      name: 'New Service Add-on',
      description: 'Description for the new service add-on',
      price: 0,
      visible: true,
      categoryId: servicesData.categories.length > 0 ? servicesData.categories[0].id : undefined
    };

    const updatedAddons = [...currentAddons, newAddon];

    setServicesData({
      ...servicesData,
      addons: updatedAddons
    });
  };

  // Update an addon
  const handleUpdateAddon = (index: number, field: keyof ServiceAddon, value: any) => {
    const currentAddons = Array.isArray(servicesData.addons) ? servicesData.addons : [];

    if (currentAddons.length === 0 || index >= currentAddons.length) {
      console.warn("No addons to update or invalid index");
      return;
    }

    const updatedAddons = [...currentAddons];
    updatedAddons[index] = {
      ...updatedAddons[index],
      [field]: value
    };

    setServicesData({
      ...servicesData,
      addons: updatedAddons
    });
  };

  // Delete an addon
  const handleDeleteAddon = (index: number) => {
    const currentAddons = Array.isArray(servicesData.addons) ? servicesData.addons : [];

    if (currentAddons.length === 0 || index >= currentAddons.length) {
      console.warn("No addons to delete or invalid index");
      return;
    }

    const updatedAddons = currentAddons.filter((_, i) => i !== index);

    setServicesData({
      ...servicesData,
      addons: updatedAddons
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-mono">Services Management</h2>
        <div className="flex items-center gap-2">
          <Win95Button
            onClick={handleSave}
            className={`px-4 py-2 font-mono flex items-center ${
              saveStatus === 'saving' ? 'opacity-50' : ''
            }`}
            disabled={saveStatus === 'saving'}
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            {saveStatus === 'saving' ? 'Saving...' :
             saveStatus === 'saved' ? 'Saved!' :
             saveStatus === 'error' ? 'Error!' : 'Save Changes'}
          </Win95Button>
        </div>
      </div>

      {/* Loading State */}
      {isInitialLoading && (
        <div className="bg-white p-8 border-2 border-gray-400 rounded-lg text-center">
          <p className="font-mono text-gray-600">Loading services data...</p>
        </div>
      )}

      {/* Tab Navigation */}
      {!isInitialLoading && (
        <>
          <div className="flex border-b-2 border-gray-400">
            <Win95Button
              className={`px-4 py-2 font-mono flex items-center ${activeTab === 'categories' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
              onClick={() => setActiveTab('categories')}
            >
              <FolderIcon className="w-4 h-4 mr-2" />
              Categories
            </Win95Button>
            <Win95Button
              className={`px-4 py-2 font-mono flex items-center ${activeTab === 'packages' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
              onClick={() => setActiveTab('packages')}
            >
              <PackageIcon className="w-4 h-4 mr-2" />
              Services
            </Win95Button>
            <Win95Button
              className={`px-4 py-2 font-mono flex items-center ${activeTab === 'addons' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
              onClick={() => setActiveTab('addons')}
            >
              <TagIcon className="w-4 h-4 mr-2" />
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
          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-mono font-bold text-lg">Service Categories</h3>
                <Win95Button onClick={handleAddCategory} className="px-4 py-2 font-mono flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Category
                </Win95Button>
              </div>

              {!Array.isArray(servicesData.categories) || servicesData.categories.length === 0 ? (
                <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
                  <p className="font-mono text-gray-600">No service categories found. Add your first category to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {servicesData.categories.map((category, index) => (
                    <div key={category.id} className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                      <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
                        <h4 className="font-mono font-bold flex items-center">
                          <div
                            className="w-4 h-4 rounded mr-2"
                            style={{ backgroundColor: category.color || '#6B7280' }}
                          ></div>
                          {category.name}
                        </h4>
                        <div className="flex gap-2">
                          <Win95Button
                            onClick={() => handleUpdateCategory(index, 'visible', !category.visible)}
                            className="px-2 py-1 font-mono"
                          >
                            {category.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleMoveCategoryUp(index)}
                            className="px-2 py-1 font-mono"
                            disabled={index === 0}
                          >
                            <ArrowUpIcon className="w-4 h-4" />
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleMoveCategoryDown(index)}
                            className="px-2 py-1 font-mono"
                            disabled={index === servicesData.categories.length - 1}
                          >
                            <ArrowDownIcon className="w-4 h-4" />
                          </Win95Button>
                          <Win95Button
                            onClick={() => handleDeleteCategory(index)}
                            className="px-2 py-1 font-mono text-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Win95Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-mono text-sm font-bold mb-1">Category Name</label>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleUpdateCategory(index, 'name', e.target.value)}
                            className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-sm font-bold mb-1">Icon</label>
                          <input
                            type="text"
                            value={category.icon}
                            onChange={(e) => handleUpdateCategory(index, 'icon', e.target.value)}
                            className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            placeholder="e.g., code, palette, smartphone"
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-sm font-bold mb-1">Color</label>
                          <input
                            type="color"
                            value={category.color || '#6B7280'}
                            onChange={(e) => handleUpdateCategory(index, 'color', e.target.value)}
                            className="w-full h-10 border-2 border-gray-400 rounded"
                          />
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block font-mono text-sm font-bold mb-1">Category Image URL (Optional)</label>
                          <input
                            type="url"
                            value={category.image || ''}
                            onChange={(e) => handleUpdateCategory(index, 'image', e.target.value)}
                            className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            placeholder="https://example.com/category-image.jpg"
                          />
                          <p className="font-mono text-xs text-gray-600 mt-1">
                            Add an image URL to display a custom image for this category. Leave empty to use icon and color only.
                          </p>
                        </div>
                        <div className="md:col-span-2 lg:col-span-3">
                          <label className="block font-mono text-sm font-bold mb-1">Description</label>
                          <textarea
                            value={category.description}
                            onChange={(e) => handleUpdateCategory(index, 'description', e.target.value)}
                            className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            rows={3}
                          />
                        </div>
                        <div>
                          <label className="block font-mono text-sm font-bold mb-1">Order</label>
                          <input
                            type="number"
                            value={category.order}
                            onChange={(e) => handleUpdateCategory(index, 'order', parseInt(e.target.value) || 0)}
                            className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            min="1"
                          />
                        </div>

                        {/* Preview Section */}
                        {(category.image || category.color) && (
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block font-mono text-sm font-bold mb-2">Preview</label>
                            <div className="bg-gray-100 p-4 border-2 border-gray-400 rounded">
                              <div className="max-w-xs mx-auto">
                                <div
                                  className="bg-gray-200 border-2 border-gray-400 cursor-pointer"
                                  style={{
                                    borderStyle: 'outset',
                                    borderWidth: '2px',
                                    boxShadow: 'inset -1px -1px 0px rgba(0,0,0,0.25), inset 1px 1px 0px rgba(255,255,255,0.75)'
                                  }}
                                >
                                  {/* Preview Image/Header */}
                                  <div className="relative overflow-hidden bg-gray-100 border-b-2 border-gray-400" style={{ borderStyle: 'inset' }}>
                                    {category.image ? (
                                      <div className="relative h-24">
                                        <img
                                          src={category.image}
                                          alt={category.name}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22200%22%20viewBox%3D%220%200%20400%20200%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
                                          }}
                                        />
                                        <div
                                          className="absolute inset-0 bg-opacity-20"
                                          style={{ backgroundColor: category.color || '#6B7280' }}
                                        ></div>
                                        <div className="absolute top-1 right-1 w-6 h-6 bg-white bg-opacity-90 rounded border border-gray-400 flex items-center justify-center text-xs" style={{ borderStyle: 'inset' }}>
                                          📁
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="h-24 flex items-center justify-center"
                                        style={{ backgroundColor: category.color || '#6B7280' }}
                                      >
                                        <div className="text-center text-white">
                                          <div className="w-8 h-8 bg-white bg-opacity-20 rounded border border-white border-opacity-30 flex items-center justify-center mx-auto text-xs" style={{ borderStyle: 'inset' }}>
                                            📁
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Preview Content */}
                                  <div className="p-2 bg-gray-200">
                                    <h4 className="font-mono font-bold text-sm text-gray-800 mb-1">{category.name}</h4>
                                    <p className="font-mono text-xs text-gray-600 line-clamp-2">
                                      {category.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-mono font-bold text-lg">Services & Packages</h3>
                <Win95Button onClick={handleAddPackage} className="px-4 py-2 font-mono flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Service Package
                </Win95Button>
              </div>

              {!Array.isArray(servicesData.packages) || servicesData.packages.length === 0 ? (
                <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
                  <p className="font-mono text-gray-600">No service packages found. Add your first service package to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {servicesData.packages.map((pkg, index) => {
                    const category = servicesData.categories.find(cat => cat.id === pkg.categoryId);
                    return (
                      <div key={pkg.id} className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                        <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
                          <h4 className="font-mono font-bold flex items-center">
                            <div
                              className="w-4 h-4 rounded mr-2"
                              style={{ backgroundColor: category?.color || '#6B7280' }}
                            ></div>
                            {pkg.name}
                            {pkg.popular && (
                              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-mono">
                                Popular
                              </span>
                            )}
                          </h4>
                          <div className="flex gap-2">
                            <Win95Button
                              onClick={() => handleUpdatePackage(index, 'visible', !pkg.visible)}
                              className="px-2 py-1 font-mono"
                            >
                              {pkg.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleUpdatePackage(index, 'popular', !pkg.popular)}
                              className="px-2 py-1 font-mono"
                            >
                              <StarIcon className={`w-4 h-4 ${pkg.popular ? 'text-yellow-500' : 'text-gray-400'}`} />
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleMovePackageUp(index)}
                              className="px-2 py-1 font-mono"
                              disabled={index === 0}
                            >
                              <ArrowUpIcon className="w-4 h-4" />
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleMovePackageDown(index)}
                              className="px-2 py-1 font-mono"
                              disabled={index === servicesData.packages.length - 1}
                            >
                              <ArrowDownIcon className="w-4 h-4" />
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleDeletePackage(index)}
                              className="px-2 py-1 font-mono text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Win95Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Package Name</label>
                            <input
                              type="text"
                              value={pkg.name}
                              onChange={(e) => handleUpdatePackage(index, 'name', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Tagline</label>
                            <input
                              type="text"
                              value={pkg.tagline}
                              onChange={(e) => handleUpdatePackage(index, 'tagline', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Category</label>
                            <select
                              value={pkg.categoryId}
                              onChange={(e) => handleUpdatePackage(index, 'categoryId', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            >
                              {servicesData.categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Price ({servicesData.currency})</label>
                            <input
                              type="number"
                              value={pkg.price}
                              onChange={(e) => handleUpdatePackage(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Duration</label>
                            <select
                              value={pkg.duration || 'one-time'}
                              onChange={(e) => handleUpdatePackage(index, 'duration', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            >
                              <option value="one-time">One-time</option>
                              <option value="monthly">Monthly</option>
                              <option value="yearly">Yearly</option>
                            </select>
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Delivery Time</label>
                            <input
                              type="text"
                              value={pkg.deliveryTime || ''}
                              onChange={(e) => handleUpdatePackage(index, 'deliveryTime', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              placeholder="e.g., 1-2 weeks"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block font-mono text-sm font-bold mb-1">Description</label>
                            <textarea
                              value={pkg.description}
                              onChange={(e) => handleUpdatePackage(index, 'description', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              rows={3}
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block font-mono text-sm font-bold mb-1">Features (one per line)</label>
                            <textarea
                              value={Array.isArray(pkg.features) ? pkg.features.join('\n') : ''}
                              onChange={(e) => handleUpdatePackage(index, 'features', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              rows={5}
                              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Icon</label>
                            <input
                              type="text"
                              value={pkg.icon || ''}
                              onChange={(e) => handleUpdatePackage(index, 'icon', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              placeholder="e.g., star, rocket, diamond"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Order</label>
                            <input
                              type="number"
                              value={pkg.order}
                              onChange={(e) => handleUpdatePackage(index, 'order', parseInt(e.target.value) || 0)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Add-ons Tab */}
          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-mono font-bold text-lg">Service Add-ons</h3>
                <Win95Button onClick={handleAddAddon} className="px-4 py-2 font-mono flex items-center">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Service Add-on
                </Win95Button>
              </div>

              {!Array.isArray(servicesData.addons) || servicesData.addons.length === 0 ? (
                <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
                  <p className="font-mono text-gray-600">No service add-ons found. Add your first service add-on to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {servicesData.addons.map((addon, index) => {
                    const category = addon.categoryId ? servicesData.categories.find(cat => cat.id === addon.categoryId) : null;
                    return (
                      <div key={addon.id} className="bg-white p-6 border-2 border-gray-400 rounded-lg">
                        <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
                          <h4 className="font-mono font-bold flex items-center">
                            {category && (
                              <div
                                className="w-4 h-4 rounded mr-2"
                                style={{ backgroundColor: category.color || '#6B7280' }}
                              ></div>
                            )}
                            {addon.name}
                          </h4>
                          <div className="flex gap-2">
                            <Win95Button
                              onClick={() => handleUpdateAddon(index, 'visible', !addon.visible)}
                              className="px-2 py-1 font-mono"
                            >
                              {addon.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleDeleteAddon(index)}
                              className="px-2 py-1 font-mono text-red-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Win95Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Add-on Name</label>
                            <input
                              type="text"
                              value={addon.name}
                              onChange={(e) => handleUpdateAddon(index, 'name', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Price ({servicesData.currency})</label>
                            <input
                              type="number"
                              value={addon.price}
                              onChange={(e) => handleUpdateAddon(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <div>
                            <label className="block font-mono text-sm font-bold mb-1">Category (Optional)</label>
                            <select
                              value={addon.categoryId || ''}
                              onChange={(e) => handleUpdateAddon(index, 'categoryId', e.target.value || undefined)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                            >
                              <option value="">All Categories</option>
                              {servicesData.categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <label className="block font-mono text-sm font-bold mb-1">Description</label>
                            <textarea
                              value={addon.description || ''}
                              onChange={(e) => handleUpdateAddon(index, 'description', e.target.value)}
                              className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                              rows={3}
                              placeholder="Describe what this add-on includes..."
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-mono font-bold text-lg">Services Settings</h3>
              </div>

              <div className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-6">
                <div className="border-b-2 border-gray-200 pb-4">
                  <h4 className="font-mono font-bold text-lg mb-4">General Settings</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-sm font-bold mb-1">Section Title</label>
                      <input
                        type="text"
                        value={servicesData.title}
                        onChange={(e) => setServicesData({ ...servicesData, title: e.target.value })}
                        className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                        placeholder="Our Services"
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-sm font-bold mb-1">Currency Symbol</label>
                      <input
                        type="text"
                        value={servicesData.currency}
                        onChange={(e) => setServicesData({ ...servicesData, currency: e.target.value })}
                        className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                        placeholder="$"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-mono text-sm font-bold mb-1">Section Subtitle</label>
                      <textarea
                        value={servicesData.subtitle || ''}
                        onChange={(e) => setServicesData({ ...servicesData, subtitle: e.target.value })}
                        className="w-full p-2 border-2 border-gray-400 rounded font-mono"
                        rows={2}
                        placeholder="Comprehensive digital solutions for your business needs"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center font-mono text-sm font-bold">
                        <input
                          type="checkbox"
                          checked={servicesData.showServices}
                          onChange={(e) => setServicesData({ ...servicesData, showServices: e.target.checked })}
                          className="mr-2"
                        />
                        Show Services Section on Website
                      </label>
                      <p className="font-mono text-xs text-gray-600 mt-1">
                        Uncheck to hide the entire services section from the public website
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b-2 border-gray-200 pb-4">
                  <h4 className="font-mono font-bold text-lg mb-4">Statistics</h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 border border-blue-200 rounded">
                      <div className="font-mono text-sm text-blue-600">Total Categories</div>
                      <div className="font-mono text-2xl font-bold text-blue-800">
                        {Array.isArray(servicesData.categories) ? servicesData.categories.length : 0}
                      </div>
                      <div className="font-mono text-xs text-blue-600">
                        {Array.isArray(servicesData.categories) ? servicesData.categories.filter(cat => cat.visible).length : 0} visible
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 border border-green-200 rounded">
                      <div className="font-mono text-sm text-green-600">Total Services</div>
                      <div className="font-mono text-2xl font-bold text-green-800">
                        {Array.isArray(servicesData.packages) ? servicesData.packages.length : 0}
                      </div>
                      <div className="font-mono text-xs text-green-600">
                        {Array.isArray(servicesData.packages) ? servicesData.packages.filter(pkg => pkg.visible).length : 0} visible
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 border border-purple-200 rounded">
                      <div className="font-mono text-sm text-purple-600">Total Add-ons</div>
                      <div className="font-mono text-2xl font-bold text-purple-800">
                        {Array.isArray(servicesData.addons) ? servicesData.addons.length : 0}
                      </div>
                      <div className="font-mono text-xs text-purple-600">
                        {Array.isArray(servicesData.addons) ? servicesData.addons.filter(addon => addon.visible).length : 0} visible
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-mono font-bold text-lg mb-4">Quick Actions</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Win95Button
                      onClick={() => setActiveTab('categories')}
                      className="p-4 font-mono flex items-center justify-center"
                    >
                      <FolderIcon className="w-5 h-5 mr-2" />
                      Manage Categories
                    </Win95Button>
                    <Win95Button
                      onClick={() => setActiveTab('packages')}
                      className="p-4 font-mono flex items-center justify-center"
                    >
                      <PackageIcon className="w-5 h-5 mr-2" />
                      Manage Services
                    </Win95Button>
                    <Win95Button
                      onClick={() => setActiveTab('addons')}
                      className="p-4 font-mono flex items-center justify-center"
                    >
                      <TagIcon className="w-5 h-5 mr-2" />
                      Manage Add-ons
                    </Win95Button>
                    <Win95Button
                      onClick={handleSave}
                      className="p-4 font-mono flex items-center justify-center bg-green-100 hover:bg-green-200"
                    >
                      <SaveIcon className="w-5 h-5 mr-2" />
                      Save All Changes
                    </Win95Button>
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
