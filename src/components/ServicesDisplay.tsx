import React, { useState } from 'react';
import { useContent } from '../contexts/ContentContext';
import { ServiceCategory, ServicePackage, ServiceAddon } from '../types';
import { LazyImage } from './LazyImage';
import {
  CheckIcon,
  StarIcon,
  RocketIcon,
  DiamondIcon,
  PlusIcon,
  PhoneIcon,
  CalendarIcon,
  ArrowLeftIcon,
  CodeIcon,
  PaletteIcon,
  SmartphoneIcon,
  LightbulbIcon,
  MegaphoneIcon,
  FolderIcon,
  PackageIcon
} from 'lucide-react';

export function ServicesDisplay() {
  const { content } = useContent();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get services data from context with default values
  const defaultServices = {
    categories: [],
    packages: [],
    addons: [],
    currency: '$',
    showServices: true,
    title: 'Our Services',
    subtitle: 'Comprehensive digital solutions for your business needs'
  };

  // Create a safe services object with all required properties
  const services = {
    ...defaultServices,
    ...(content.services || {}),
    categories: Array.isArray(content.services?.categories) ? content.services.categories : [],
    packages: Array.isArray(content.services?.packages) ? content.services.packages : [],
    addons: Array.isArray(content.services?.addons) ? content.services.addons : []
  };

  // Fallback to legacy pricing data if services data is not available
  if (services.categories.length === 0 && content.pricing) {
    const legacyServices = {
      ...defaultServices,
      packages: Array.isArray(content.pricing.packages) ? content.pricing.packages : [],
      addons: Array.isArray(content.pricing.addons) ? content.pricing.addons : [],
      currency: content.pricing.currency || '$',
      showServices: content.pricing.showPricing !== false,
      title: content.pricing.title || 'Our Services',
      subtitle: content.pricing.subtitle || 'Comprehensive digital solutions for your business needs'
    };
    Object.assign(services, legacyServices);
  }

  // Don't show anything if services are disabled
  if (!services.showServices) {
    return null;
  }

  // Sort categories by order
  const sortedCategories = Array.isArray(services.categories)
    ? [...services.categories].sort((a, b) => a.order - b.order).filter(cat => cat.visible)
    : [];

  // Get packages for selected category
  const getPackagesForCategory = (categoryId: string) => {
    return services.packages
      .filter(pkg => pkg.categoryId === categoryId && pkg.visible)
      .sort((a, b) => a.order - b.order);
  };

  // Get addons for selected category
  const getAddonsForCategory = (categoryId: string) => {
    return services.addons
      .filter(addon => addon.categoryId === categoryId && addon.visible);
  };

  // Get icon component based on icon name
  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName?.toLowerCase()) {
      case 'code':
        return <CodeIcon className={className} />;
      case 'palette':
        return <PaletteIcon className={className} />;
      case 'smartphone':
        return <SmartphoneIcon className={className} />;
      case 'lightbulb':
        return <LightbulbIcon className={className} />;
      case 'megaphone':
        return <MegaphoneIcon className={className} />;
      case 'rocket':
        return <RocketIcon className={className} />;
      case 'star':
        return <StarIcon className={className} />;
      case 'diamond':
        return <DiamondIcon className={className} />;
      case 'folder':
        return <FolderIcon className={className} />;
      default:
        return <StarIcon className={className} />;
    }
  };

  // If no category is selected, show category selection
  if (!selectedCategory) {
    return (
      <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Services Header */}
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-mono text-sm mb-3">
              Professional Services
            </div>
            <h2 className="text-3xl font-bold font-mono mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {services.title}
            </h2>
            {services.subtitle && (
              <p className="font-mono text-gray-600 text-lg">{services.subtitle}</p>
            )}
          </div>

          {/* Service Categories Grid */}
          {sortedCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCategories.map((category) => (
                <div
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="bg-gray-200 border-2 border-gray-400 cursor-pointer transform transition-all duration-200 hover:bg-gray-100 active:border-gray-600 active:bg-gray-300 group"
                  style={{
                    borderStyle: 'outset',
                    borderWidth: '2px',
                    boxShadow: 'inset -1px -1px 0px rgba(0,0,0,0.25), inset 1px 1px 0px rgba(255,255,255,0.75)'
                  }}
                >
                  {/* Category Image/Header */}
                  <div className="relative overflow-hidden bg-gray-100 border-b-2 border-gray-400" style={{ borderStyle: 'inset' }}>
                    {category.image ? (
                      <div className="relative h-32 sm:h-40">
                        <LazyImage
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                          placeholderSrc="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22200%22%20viewBox%3D%220%200%20400%20200%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ELoading...%3C%2Ftext%3E%3C%2Fsvg%3E"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22200%22%20viewBox%3D%220%200%20400%20200%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";
                          }}
                        />
                        {/* Color overlay */}
                        <div
                          className="absolute inset-0 bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-200"
                          style={{ backgroundColor: category.color || '#6B7280' }}
                        ></div>
                        {/* Icon overlay */}
                        <div className="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded border border-gray-400 flex items-center justify-center" style={{ borderStyle: 'inset' }}>
                          {getIconComponent(category.icon, 'w-5 h-5 text-gray-700')}
                        </div>
                      </div>
                    ) : (
                      <div
                        className="h-32 sm:h-40 flex items-center justify-center relative"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      >
                        <div className="text-center text-white">
                          <div className="w-16 h-16 bg-white bg-opacity-20 rounded border-2 border-white border-opacity-30 flex items-center justify-center mx-auto mb-2" style={{ borderStyle: 'inset' }}>
                            {getIconComponent(category.icon, 'w-10 h-10 text-white')}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Content */}
                  <div className="p-4 bg-gray-200">
                    <div className="mb-3">
                      <h3 className="font-mono font-bold text-lg text-gray-800 mb-1">{category.name}</h3>
                      <p className="font-mono text-sm text-gray-600 leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    {/* Category Footer */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-400" style={{ borderStyle: 'inset' }}>
                      <span className="font-mono text-xs text-gray-600">
                        {getPackagesForCategory(category.id).length} services
                      </span>
                      <div className="flex items-center text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        <span className="font-mono text-xs mr-1">View</span>
                        <ArrowLeftIcon className="w-3 h-3 transform rotate-180" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white border-2 border-gray-300 rounded-xl p-8 max-w-md mx-auto">
                <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-mono font-bold text-lg text-gray-800 mb-2">No Service Categories</h3>
                <p className="font-mono text-gray-600">
                  Service categories are being set up. Please check back soon!
                </p>
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-300 rounded-xl shadow-sm">
            <div className="max-w-2xl mx-auto">
              <h3 className="font-mono font-bold text-xl mb-3 text-gray-800">Need a custom solution?</h3>
              <p className="font-mono text-gray-600 mb-6 text-lg">
                Contact us for a personalized quote tailored to your specific requirements.
              </p>
              <button
                onClick={() => {
                  const contactIcon = document.querySelector('[data-section-id="contact"]');
                  if (contactIcon) {
                    (contactIcon as HTMLElement).click();
                  } else {
                    window.dispatchEvent(new CustomEvent('openDialog', { detail: { id: 'contact' } }));
                  }
                }}
                className="py-3 px-8 font-mono bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 inline-flex items-center cursor-pointer"
              >
                <PhoneIcon className="w-4 h-4 mr-2" />
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show services for selected category
  const selectedCategoryData = sortedCategories.find(cat => cat.id === selectedCategory);
  const categoryPackages = getPackagesForCategory(selectedCategory);
  const categoryAddons = getAddonsForCategory(selectedCategory);

  if (!selectedCategoryData) {
    setSelectedCategory(null);
    return null;
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center font-mono text-blue-600 hover:text-blue-800 transition-colors duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Services
          </button>
          <span className="font-mono text-gray-400">/</span>
          <span className="font-mono text-gray-800">{selectedCategoryData.name}</span>
        </div>

        {/* Category Header */}
        <div className="text-center mb-8">
          <div
            className="inline-block px-4 py-1 rounded-full font-mono text-sm mb-3 text-white"
            style={{ backgroundColor: selectedCategoryData.color || '#6B7280' }}
          >
            {selectedCategoryData.name}
          </div>
          <h2 className="text-2xl font-bold font-mono mb-4 text-gray-800">
            {selectedCategoryData.name} Services
          </h2>
          <p className="font-mono text-gray-600 text-lg max-w-2xl mx-auto">
            {selectedCategoryData.description}
          </p>
        </div>

        {/* Services/Packages for this category */}
        {categoryPackages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {categoryPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white border-2 ${pkg.popular ? 'border-blue-500 shadow-lg shadow-blue-200' : 'border-gray-300'}
                  rounded-xl overflow-hidden flex flex-col h-full relative transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 right-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-1 px-4 rounded-full font-mono text-sm shadow-md">
                    Most Popular
                  </div>
                )}

                {/* Package Header */}
                <div className={`p-6 ${pkg.popular ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gray-50'} border-b-2 border-gray-200`}>
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 flex items-center justify-center ${pkg.popular ? 'bg-blue-100' : 'bg-gray-200'} rounded-full mr-4 shadow-inner`}>
                      {getIconComponent(pkg.icon || '', `w-7 h-7 ${pkg.popular ? 'text-blue-600' : 'text-gray-700'}`)}
                    </div>
                    <div>
                      <h3 className="font-mono font-bold text-xl">{pkg.name}</h3>
                      <p className="font-mono text-sm text-gray-600">{pkg.tagline}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline">
                    <span className="font-mono font-bold text-4xl">{services.currency} {pkg.price}</span>
                    <span className="font-mono text-gray-500 ml-2">
                      {pkg.duration === 'monthly' ? '/month' :
                       pkg.duration === 'yearly' ? '/year' :
                       '/project'}
                    </span>
                  </div>
                  {pkg.deliveryTime && (
                    <p className="mt-2 font-mono text-sm text-gray-600">
                      Delivery: {pkg.deliveryTime}
                    </p>
                  )}
                  <p className="mt-3 font-mono text-sm text-gray-600 border-t border-gray-200 pt-3">{pkg.description}</p>
                </div>

                {/* Features List */}
                <div className="p-6 flex-grow bg-white">
                  <h4 className="font-mono font-bold text-sm uppercase text-gray-500 mb-4 tracking-wider">What's included:</h4>
                  <ul className="space-y-4">
                    {Array.isArray(pkg.features) ? (
                      pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${pkg.popular ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                            <CheckIcon className="w-3 h-3" />
                          </div>
                          <span className="font-mono text-sm">{feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="flex items-start">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                          <CheckIcon className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="font-mono text-sm">Basic features included</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Call to Action */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      const bookIcon = document.querySelector('[data-section-id="book"]');
                      if (bookIcon) {
                        (bookIcon as HTMLElement).click();
                      } else {
                        window.dispatchEvent(new CustomEvent('openDialog', { detail: { id: 'book' } }));
                      }
                    }}
                    className={`w-full py-3 px-4 font-mono flex items-center justify-center cursor-pointer rounded-lg transition-all duration-300
                      ${pkg.popular
                        ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-300'}`}
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-white border-2 border-gray-300 rounded-xl p-6 max-w-md mx-auto">
              <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-mono text-gray-600">No services available in this category yet.</p>
            </div>
          </div>
        )}

        {/* Add-ons Section for this category */}
        {categoryAddons.length > 0 && (
          <div className="mt-12 bg-white rounded-xl p-8 border border-gray-300 shadow-sm">
            <h3 className="text-xl font-bold font-mono mb-6 text-center relative">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Available Add-ons</span>
              <div className="absolute w-16 h-1 bg-blue-500 bottom-0 left-1/2 transform -translate-x-1/2 mt-2 rounded-full"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryAddons.map((addon) => (
                <div key={addon.id} className="bg-gray-50 border border-gray-300 rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <PlusIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-mono font-bold">{addon.name}</h4>
                  </div>
                  <p className="font-mono text-sm text-gray-600 mb-4 min-h-[60px]">{addon.description}</p>
                  <div className="font-mono font-bold text-lg flex items-baseline">
                    <span className="text-blue-600">{services.currency} {addon.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
