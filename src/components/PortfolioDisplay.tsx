import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import { SocialShareButtons } from './social/SocialShareButtons';
import { LazyImage } from './LazyImage';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  order?: number;
}

function PortfolioDisplay() {
  const { content } = useContent();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      // Check if content.portfolio exists
      if (!content.portfolio) {
        console.log('Portfolio data is undefined or null');
        setPortfolioItems([]);
        setLoading(false);
        return;
      }

      // Check if content.portfolio is an array
      if (Array.isArray(content.portfolio)) {
        console.log('Portfolio data is an array with length:', content.portfolio.length);

        // Sort by order property if it exists
        const sortedItems = [...content.portfolio].sort((a, b) => {
          // If both items have order property, sort by order
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // If only a has order property, a comes first
          if (a.order !== undefined) {
            return -1;
          }
          // If only b has order property, b comes first
          if (b.order !== undefined) {
            return 1;
          }
          // If neither has order property, maintain original order
          return 0;
        });

        setPortfolioItems(sortedItems);
        setLoading(false);
        return;
      }

      // If content.portfolio is an object, try to convert it to an array
      if (typeof content.portfolio === 'object' && content.portfolio !== null) {
        console.log('Portfolio data is an object, attempting to convert to array');
        const portfolioArray = Object.values(content.portfolio);

        // Validate that each item has the required properties
        const validItems = portfolioArray.filter(item =>
          item &&
          typeof item === 'object' &&
          'id' in item &&
          'title' in item &&
          'description' in item &&
          'image' in item &&
          'url' in item
        );

        // Sort by order property if it exists
        const sortedItems = (validItems as PortfolioItem[]).sort((a, b) => {
          // If both items have order property, sort by order
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          // If only a has order property, a comes first
          if (a.order !== undefined) {
            return -1;
          }
          // If only b has order property, b comes first
          if (b.order !== undefined) {
            return 1;
          }
          // If neither has order property, maintain original order
          return 0;
        });

        setPortfolioItems(sortedItems);
        setLoading(false);
        return;
      }

      // If we get here, the data is in an unexpected format
      console.error('Portfolio data is in an unexpected format:', content.portfolio);
      setPortfolioItems([]);
      setError('Portfolio data is in an unexpected format');
      setLoading(false);
    } catch (err) {
      console.error('Error processing portfolio data:', err);
      setError('Error processing portfolio data');
      setLoading(false);
    }
  }, [content.portfolio]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center py-12 bg-white border-2 border-gray-300 rounded-lg">
            <span className="text-gray-500 font-mono">Loading portfolio items...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center py-12 bg-red-100 border-2 border-red-300 rounded-lg">
            <span className="text-red-500 font-mono">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Portfolio Header - Removed as requested */}

        {portfolioItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {portfolioItems.map(project => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-lg overflow-hidden border-2 border-gray-400 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                onClick={e => {
                  if (!project.url.startsWith('http')) {
                    e.preventDefault();
                    alert('Invalid project URL');
                  }
                }}
              >
                <div className="relative aspect-video">
                  <LazyImage
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
                    }}
                    responsive={true}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <div className="text-white">
                      <h3 className="font-bold font-mono text-lg">
                        {project.title}
                      </h3>
                      <p className="font-mono text-sm text-white/90 flex items-center gap-1">
                        <span>Visit Project</span>
                        <svg className="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold font-mono text-lg mb-2">
                    {project.title}
                  </h3>
                  <p className="font-mono text-sm text-gray-600 line-clamp-3 mb-3">
                    {project.description}
                  </p>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <SocialShareButtons
                      url={project.url}
                      title={project.title}
                      description={project.description}
                      image={project.image}
                      compact={true}
                    />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white border-2 border-gray-300 rounded-lg">
            <span className="text-gray-500 font-mono">
              Portfolio items coming soon...
            </span>
          </div>
        )}

        {/* Portfolio Footer */}
        {portfolioItems.length > 0 && (
          <div className="bg-white border-2 border-gray-400 p-4 mt-6 text-center">
            <button
              className="px-4 py-2 bg-gray-200 border-2 border-gray-400 font-mono text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
              onClick={() => {
                // Find the contact icon and simulate a click
                const contactIcon = document.querySelector('[data-icon="contact"]');
                if (contactIcon) {
                  (contactIcon as HTMLElement).click();
                } else {
                  // Alternative method: dispatch a custom event to open the contact dialog
                  const event = new CustomEvent('openDialog', {
                    detail: { id: 'contact' }
                  });
                  window.dispatchEvent(event);
                }
              }}
            >
              Contact with us
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PortfolioDisplay;
