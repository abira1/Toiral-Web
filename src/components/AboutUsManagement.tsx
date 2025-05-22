import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { TrashIcon, PlusIcon, AlertTriangleIcon } from 'lucide-react';
export function AboutUsManagement() {
  const {
    content,
    updateContent
  } = useContent();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const aboutUs = content.aboutUs || {
    vision: '',
    story: '',
    gallery: [],
    welcomeText: ''
  };
  const handleAddImage = () => {
    setUploadError(null);
    try {
      new URL(newImageUrl);
    } catch {
      setUploadError('Please enter a valid URL');
      return;
    }
    const newImage = {
      id: Date.now().toString(),
      url: newImageUrl,
      caption: 'New Image'
    };
    updateContent({
      aboutUs: {
        ...aboutUs,
        gallery: [...(aboutUs.gallery || []), newImage]
      }
    });
    setNewImageUrl('');
  };
  const removeImage = (id: string) => {
    updateContent({
      aboutUs: {
        ...aboutUs,
        gallery: aboutUs.gallery.filter(img => img.id !== id)
      }
    });
  };
  return <div className="space-y-6 max-w-4xl mx-auto">
      {/* Vision Section */}
      <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
        <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
          Vision Statement
        </h3>
        <textarea value={aboutUs.vision || ''} onChange={e => {
        updateContent({
          aboutUs: {
            ...aboutUs,
            vision: e.target.value
          }
        });
      }} rows={4} className="w-full p-2 font-mono border-2 border-gray-600 bg-white resize-none" placeholder="Enter your company's vision..." />
      </section>
      {/* Story Section */}
      <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
        <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
          Our Story
        </h3>
        <textarea value={aboutUs.story || ''} onChange={e => {
        updateContent({
          aboutUs: {
            ...aboutUs,
            story: e.target.value
          }
        });
      }} rows={6} className="w-full p-2 font-mono border-2 border-gray-600 bg-white resize-none" placeholder="Tell your company's story..." />
      </section>
      {/* Gallery Section */}
      <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
        <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
          Gallery
        </h3>
        {uploadError && <div className="bg-red-100 border-2 border-red-400 p-3 mb-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangleIcon className="w-5 h-5" />
              <span className="font-mono">{uploadError}</span>
            </div>
          </div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(aboutUs.gallery || []).map(image => <div key={image.id} className="bg-gray-50 p-4 border-2 border-gray-400 rounded-lg">
              <div className="aspect-video relative overflow-hidden mb-2">
                <img src={image.url} alt={image.caption} className="w-full h-full object-cover" onError={e => {
              e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EImage%20Error%3C%2Ftext%3E%3C%2Fsvg%3E';
            }} />
              </div>
              <input type="text" value={image.caption} onChange={e => {
            const updatedGallery = aboutUs.gallery.map(img => img.id === image.id ? {
              ...img,
              caption: e.target.value
            } : img);
            updateContent({
              aboutUs: {
                ...aboutUs,
                gallery: updatedGallery
              }
            });
          }} className="w-full p-2 font-mono border-2 border-gray-600 bg-white mb-2" placeholder="Image caption" />
              <Win95Button className="w-full p-2 font-mono text-red-600" onClick={() => removeImage(image.id)}>
                <TrashIcon className="w-4 h-4 inline mr-2" />
                Remove
              </Win95Button>
            </div>)}
        </div>
        <div className="pt-4 border-t-2 border-gray-400">
          <div className="flex gap-2">
            <input type="url" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white" placeholder="Enter image URL..." />
            <Win95Button className="px-4 py-2 font-mono whitespace-nowrap" onClick={handleAddImage}>
              <PlusIcon className="w-4 h-4 inline mr-2" />
              Add Image
            </Win95Button>
          </div>
          <p className="text-sm text-gray-600 mt-2 font-mono">
            Enter a valid image URL (e.g., https://example.com/image.jpg)
          </p>
        </div>
      </section>
      {/* Welcome Text Section */}
      <section className="bg-white p-6 border-2 border-gray-400 rounded-lg space-y-4">
        <h3 className="font-mono font-bold text-lg border-b-2 border-gray-400 pb-2">
          Welcome Text
        </h3>
        <input type="text" value={aboutUs.welcomeText || ''} onChange={e => {
        updateContent({
          aboutUs: {
            ...aboutUs,
            welcomeText: e.target.value
          }
        });
      }} className="w-full p-2 font-mono border-2 border-gray-600 bg-white" placeholder="Enter welcome text..." />
      </section>
    </div>;
}