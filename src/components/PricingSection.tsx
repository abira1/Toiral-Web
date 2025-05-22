import React from 'react';
import { useContent } from '../contexts/ContentContext';
import { CheckIcon, StarIcon, RocketIcon, DiamondIcon, PlusIcon, PhoneIcon, CalendarIcon } from 'lucide-react';

export function PricingSection() {
  const { content } = useContent();

  // Get pricing data from context with default values
  const defaultPricing = {
    packages: [],
    addons: [],
    currency: '$',
    showPricing: true,
    title: 'Our Pricing',
    subtitle: 'Choose the perfect package for your business needs'
  };

  // Create a safe pricing object with all required properties
  const pricing = {
    ...defaultPricing,
    ...(content.pricing || {}),
    packages: Array.isArray(content.pricing?.packages) ? content.pricing.packages : [],
    addons: Array.isArray(content.pricing?.addons) ? content.pricing.addons : []
  };

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

  // Render a package card
  const renderPackageCard = (pkg: any) => (
    <div
      key={pkg.id}
      className={`bg-white ${pkg.popular ? 'border-2 border-blue-400 shadow-md' : 'border border-gray-200'}
        rounded-lg overflow-hidden flex flex-col h-full relative transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
      style={{
        maxWidth: '300px',
        margin: '0 auto',
        transform: pkg.popular ? 'scale(1.02)' : 'scale(1)'
      }}
    >
      {/* Popular Badge - Simple Retro Style */}
      {pkg.popular && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-blue-500 text-white px-3 py-1 font-mono text-xs shadow-sm">
            BEST VALUE
          </div>
        </div>
      )}

      {/* Package Header */}
      <div className={`p-4 ${pkg.popular
        ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-b border-blue-200'
        : 'bg-gray-50 border-b border-gray-200'}`}>
        <div className="flex items-center mb-2">
          <div className={`w-10 h-10 flex items-center justify-center ${
            pkg.popular
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600'
            } rounded-full mr-3 shadow-inner`}>
            {getIconComponent(pkg.icon || '', `w-6 h-6`)}
          </div>
          <div>
            <h3 className={`font-mono font-bold text-lg ${pkg.popular ? 'text-blue-700' : 'text-gray-800'}`}>{pkg.name}</h3>
            <p className="font-mono text-xs text-gray-500">{pkg.tagline}</p>
          </div>
        </div>
        <div className="mt-3 flex items-baseline">
          <span className={`font-mono font-bold text-3xl ${pkg.popular ? 'text-blue-600' : 'text-gray-700'}`}>
            {pricing.currency} {pkg.price}
          </span>
          <span className="font-mono ml-2 text-xs text-gray-500">/project</span>
        </div>
        <p className="mt-2 font-mono text-xs text-gray-600 border-t border-gray-200 pt-2 line-clamp-2">
          {pkg.description}
        </p>
      </div>

      {/* Features List */}
      <div className="p-4 flex-grow bg-white">
        <h4 className="font-mono font-bold text-xs uppercase text-gray-500 mb-3 tracking-wider">What's included:</h4>
        <ul className="space-y-2">
          {Array.isArray(pkg.features) ? (
            pkg.features.map((feature: string, index: number) => (
              <li key={index} className="flex items-start">
                <div className={`w-4 h-4 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 rounded-full
                  ${pkg.popular
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'}`}>
                  <CheckIcon className="w-2.5 h-2.5" />
                </div>
                <span className="font-mono text-xs text-gray-700">{feature}</span>
              </li>
            ))
          ) : (
            <li className="flex items-start">
              <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                <CheckIcon className="w-2.5 h-2.5 text-gray-600" />
              </div>
              <span className="font-mono text-xs text-gray-700">Basic features included</span>
            </li>
          )}
        </ul>
      </div>

      {/* Call to Action */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
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
          className={`w-full py-2 px-3 font-mono flex items-center justify-center cursor-pointer text-sm rounded
            ${pkg.popular
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border border-gray-300'}`}
        >
          <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
          {pkg.popular ? 'Get Started Now!' : 'Get Started'}
        </button>
      </div>
    </div>
  );

  // Render an addon card
  const renderAddonCard = (addon: any) => (
    <div
      key={addon.id}
      className="bg-white border border-gray-200 rounded-lg p-3 transition-all duration-300 hover:shadow-md hover:border-blue-300"
      style={{ maxWidth: '220px', margin: '0 auto' }}
    >
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center mr-2">
          <PlusIcon className="w-4 h-4 text-blue-500" />
        </div>
        <h4 className="font-mono font-bold text-sm">{addon.name}</h4>
      </div>
      <p className="font-mono text-xs text-gray-600 mb-3 min-h-[40px] line-clamp-3">{addon.description}</p>
      <div className="font-mono font-bold text-base flex items-baseline">
        <span className="text-blue-600">{pricing.currency} {addon.price}</span>
        {addon.id === 'maintenance' && <span className="text-xs font-normal text-gray-500 ml-1">/month</span>}
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-gradient-to-b from-gray-100 to-blue-50 text-black h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Pricing Header */}
        <div className="text-center mb-6 max-w-2xl mx-auto">
          <div className="inline-block bg-blue-100 text-blue-800 px-3 py-0.5 rounded-full font-mono text-xs mb-2 border border-blue-200">
            Transparent Pricing
          </div>
          <h2 className="text-2xl font-bold font-mono mb-2 text-blue-900">{pricing.title}</h2>
          {pricing.subtitle && (
            <p className="font-mono text-gray-700 text-sm">{pricing.subtitle}</p>
          )}
        </div>

        {/* Pricing Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sortedPackages.filter(pkg => pkg.visible).map(pkg => renderPackageCard(pkg))}
        </div>

        {/* Add-ons Section */}
        {visibleAddons.length > 0 && (
          <div className="mt-8 bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <h3 className="text-lg font-bold font-mono mb-4 text-center relative">
              <span className="text-blue-700">Available Add-ons</span>
              <div className="absolute w-12 h-0.5 bg-blue-400 bottom-0 left-1/2 transform -translate-x-1/2 mt-1 rounded-full"></div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleAddons.map(addon => renderAddonCard(addon))}
            </div>
          </div>
        )}

        {/* Contact CTA */}
        <div className="mt-8 text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-lg shadow-sm">
          <div className="max-w-xl mx-auto">
            <h3 className="font-mono font-bold text-base mb-2 text-blue-800">Need a custom solution?</h3>
            <p className="font-mono text-gray-700 mb-4 text-sm">
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
              className="py-2 px-6 font-mono bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded inline-flex items-center justify-center cursor-pointer text-sm shadow-md"
            >
              <PhoneIcon className="w-3.5 h-3.5 mr-1.5" />
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add DollarSignIcon component
function DollarSignIcon({ className }: { className?: string }) {
  return (
    <img
      src="https://i.postimg.cc/wTC4SC9S/e11d1a19-062b-4b8b-b88a-42e855baa176-removebg-preview.png"
      alt="Pricing"
      className={className}
    />
  );
}
