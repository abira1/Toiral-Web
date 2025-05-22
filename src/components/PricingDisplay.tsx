import React from 'react';
import { useContent } from '../contexts/ContentContext';
import { PricingPackage, PricingAddon } from '../types';
import { CheckIcon, StarIcon, RocketIcon, DiamondIcon, PlusIcon, PhoneIcon, CalendarIcon } from 'lucide-react';

export function PricingDisplay() {
  const { content } = useContent();

  // Get pricing data from context with default values
  const defaultPricing = {
    packages: [],
    addons: [],
    currency: '$',
    showPricing: true,
    title: 'Our Pricing Plans',
    subtitle: 'Choose the perfect package for your business needs'
  };

  // Create a safe pricing object with all required properties
  const pricing = {
    ...defaultPricing,
    ...(content.pricing || {}),
    packages: Array.isArray(content.pricing?.packages) ? content.pricing.packages : [],
    addons: Array.isArray(content.pricing?.addons) ? content.pricing.addons : []
  };

  // Don't show anything if pricing is disabled
  if (!pricing.showPricing) {
    return null;
  }

  // Sort packages by order (ensure packages is an array)
  const sortedPackages = Array.isArray(pricing.packages)
    ? [...pricing.packages].sort((a, b) => a.order - b.order)
    : [];

  // Filter visible addons (ensure addons is an array)
  const visibleAddons = Array.isArray(pricing.addons)
    ? pricing.addons.filter(addon => addon.visible)
    : [];

  // Get icon component based on icon name
  const getIconComponent = (iconName: string, className: string) => {
    switch (iconName?.toLowerCase()) {
      case 'star':
        return <StarIcon className={className} />;
      case 'rocket':
        return <RocketIcon className={className} />;
      case 'diamond':
        return <DiamondIcon className={className} />;
      default:
        return <StarIcon className={className} />;
    }
  };

  return (
    <div className="p-6 bg-gradient-to-b from-gray-100 to-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Pricing Header */}
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-1 rounded-full font-mono text-sm mb-3">
            Transparent Pricing
          </div>
          <h2 className="text-3xl font-bold font-mono mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{pricing.title}</h2>
          {pricing.subtitle && (
            <p className="font-mono text-gray-600 text-lg">{pricing.subtitle}</p>
          )}
        </div>

        {/* Pricing Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sortedPackages.filter(pkg => pkg.visible).map((pkg) => (
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
                  <span className="font-mono font-bold text-4xl">{pricing.currency} {pkg.price}</span>
                  <span className="font-mono text-gray-500 ml-2">/project</span>
                </div>
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
                    // Find the book icon and click it
                    const bookIcon = document.querySelector('[data-section-id="book"]');
                    if (bookIcon) {
                      (bookIcon as HTMLElement).click();
                    } else {
                      // Fallback: dispatch a custom event that Windows95Desktop can listen for
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

        {/* Add-ons Section */}
        {visibleAddons.length > 0 && (
          <div className="mt-16 bg-white rounded-xl p-8 border border-gray-300 shadow-sm">
            <h3 className="text-xl font-bold font-mono mb-8 text-center relative">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Available Add-ons</span>
              <div className="absolute w-16 h-1 bg-blue-500 bottom-0 left-1/2 transform -translate-x-1/2 mt-2 rounded-full"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleAddons.map((addon) => (
                <div key={addon.id} className="bg-gray-50 border border-gray-300 rounded-lg p-5 transition-all duration-300 hover:shadow-md hover:border-blue-300">
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <PlusIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-mono font-bold">{addon.name}</h4>
                  </div>
                  <p className="font-mono text-sm text-gray-600 mb-4 min-h-[60px]">{addon.description}</p>
                  <div className="font-mono font-bold text-lg flex items-baseline">
                    <span className="text-blue-600">{pricing.currency} {addon.price}</span>
                    {addon.id === 'maintenance' && <span className="text-sm font-normal text-gray-500 ml-1">/month</span>}
                  </div>
                </div>
              ))}
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
                // Find the contact icon and click it
                const contactIcon = document.querySelector('[data-section-id="contact"]');
                if (contactIcon) {
                  (contactIcon as HTMLElement).click();
                } else {
                  // Fallback: dispatch a custom event that Windows95Desktop can listen for
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
