import React from 'react';
import { LazyImage } from './LazyImage';

/**
 * A test component to demonstrate the blur-to-clear image loading effect
 */
export function ImageLoadingTest() {
  // Sample images of different sizes and types
  const testImages = [
    {
      src: 'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
      alt: 'Profile Image',
      width: 300,
      height: 300
    },
    {
      src: 'https://i.postimg.cc/15k3RcBh/Portfolio.png',
      alt: 'Portfolio Icon',
      width: 200,
      height: 200
    },
    {
      src: 'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
      alt: 'Appointment Icon',
      width: 200,
      height: 200
    },
    {
      src: 'https://i.postimg.cc/RCb0yzn0/Contact.png',
      alt: 'Contact Icon',
      width: 200,
      height: 200
    }
  ];

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold mb-4 font-mono">Image Loading Effect Test</h1>
        
        <p className="mb-6 font-mono">
          This page demonstrates the blur-to-clear image loading effect. 
          Images start with a 20px blur at 0.7 opacity and transition to clear over 0.8 seconds.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testImages.map((image, index) => (
            <div key={index} className="bg-white p-4 border-2 border-gray-400 rounded-lg">
              <h2 className="font-mono font-bold mb-2">{image.alt}</h2>
              <div className="aspect-square overflow-hidden">
                <LazyImage
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-contain"
                  responsive={true}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 rounded-lg">
          <h2 className="font-mono font-bold mb-2">Large Image Test</h2>
          <div className="aspect-video overflow-hidden">
            <LazyImage
              src="https://i.postimg.cc/wTC4SC9S/e11d1a19-062b-4b8b-b88a-42e855baa176-removebg-preview.png"
              alt="Large Test Image"
              className="w-full h-full object-cover"
              responsive={true}
            />
          </div>
        </div>
        
        <div className="bg-white p-4 border-2 border-gray-400 rounded-lg">
          <h2 className="font-mono font-bold mb-2">Network Throttling Test</h2>
          <p className="mb-4 font-mono text-sm">
            To test on slow connections, open Chrome DevTools (F12), go to the Network tab, 
            and set the throttling to "Slow 3G". Then reload the page to see the blur effect in action.
          </p>
          <div className="aspect-video overflow-hidden">
            <LazyImage
              src="https://i.postimg.cc/7hbZhKjD/Chat.png"
              alt="Network Throttling Test Image"
              className="w-full h-full object-cover"
              responsive={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
