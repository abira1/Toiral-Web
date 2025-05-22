import React from 'react';
import { useContent } from '../contexts/ContentContext';
export function AboutUsDialog() {
  const {
    content
  } = useContent();
  if (!content || !content.aboutUs) {
    return <div className="p-6 bg-gray-200 text-black">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 border-2 border-gray-400 rounded-lg text-center">
            <p className="font-mono text-gray-600">Loading content...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Vision Section */}
        <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
            Our Vision
          </h2>
          <p className="font-mono whitespace-pre-line leading-relaxed text-gray-700">
            {content.aboutUs.vision || 'Our vision statement is coming soon...'}
          </p>
        </section>
        {/* Story Section */}
        <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
            Our Story
          </h2>
          <p className="font-mono whitespace-pre-line leading-relaxed text-gray-700">
            {content.aboutUs.story || 'Our story is coming soon...'}
          </p>
        </section>
        {/* Gallery Section */}
        <section className="bg-white p-6 border-2 border-gray-400 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 font-mono border-b-2 border-gray-200 pb-2">
            Gallery
          </h2>
          {content.aboutUs.gallery && content.aboutUs.gallery.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.aboutUs.gallery.map(image => <div key={image.id} className="space-y-2">
                  <img src={image.url} alt={image.caption} className="w-full h-48 object-cover border-2 border-gray-400" onError={e => {
              e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
            }} />
                  <p className="font-mono text-sm text-center text-gray-600">
                    {image.caption}
                  </p>
                </div>)}
            </div> : <div className="text-center py-8">
              <p className="font-mono text-gray-600">
                No gallery images available
              </p>
            </div>}
        </section>
        {/* Footer Section */}
        <section className="text-center p-6 border-t-2 border-gray-400">
          <p className="font-mono text-lg text-gray-700">
            {content.aboutUs.welcomeText || 'Welcome to our company'}
          </p>
        </section>
      </div>
    </div>;
}