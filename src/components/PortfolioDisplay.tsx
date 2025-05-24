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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {portfolioItems.map(project => (
              <div
                key={project.id}
                className="flex flex-col h-full"
              >
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white overflow-hidden border-2 border-gray-400 hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 flex flex-col h-full"
                  style={{
                    borderStyle: 'outset',
                    borderWidth: '2px',
                    boxShadow: 'inset -1px -1px 0px rgba(0,0,0,0.25), inset 1px 1px 0px rgba(255,255,255,0.75)'
                  }}
                  onClick={e => {
                    if (!project.url.startsWith('http')) {
                      e.preventDefault();
                      alert('Invalid project URL');
                    }
                  }}
                >
                  {/* Standardized image container with consistent 16:9 aspect ratio */}
                  <div className="portfolio-image-container">
                    <LazyImage
                      src={project.image}
                      alt={project.title}
                      className="portfolio-image-standardized group-hover:scale-105"
                      onError={e => {
                        // Enhanced fallback with proper 16:9 dimensions and Windows 95 styling
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22225%22%20viewBox%3D%220%200%20400%20225%22%3E%3Crect%20fill%3D%22%23C0C0C0%22%20width%3D%22400%22%20height%3D%22225%22%20stroke%3D%22%23808080%22%20stroke-width%3D%222%22%2F%3E%3Crect%20fill%3D%22%23FFFFFF%22%20x%3D%2250%22%20y%3D%2250%22%20width%3D%22300%22%20height%3D%22125%22%20stroke%3D%22%23808080%22%20stroke-width%3D%221%22%2F%3E%3Ctext%20fill%3D%22%23000000%22%20font-family%3D%22monospace%22%20font-size%3D%2218%22%20x%3D%22200%22%20y%3D%22100%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EProject%20Image%3C%2Ftext%3E%3Ctext%20fill%3D%22%23666666%22%20font-family%3D%22monospace%22%20font-size%3D%2212%22%20x%3D%22200%22%20y%3D%22125%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E16%3A9%20Aspect%20Ratio%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                      responsive={true}
                      width={400}
                      height={225}
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

                  {/* Fixed height content area */}
                  <div className="p-4 flex-1 flex flex-col justify-between" style={{ minHeight: '140px' }}>
                    <div className="flex-1">
                      <h3 className="font-bold font-mono text-lg mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="font-mono text-sm text-gray-600 line-clamp-3 mb-3">
                        {project.description}
                      </p>
                    </div>

                    {/* Fixed position social buttons */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-auto">
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
              </div>
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
