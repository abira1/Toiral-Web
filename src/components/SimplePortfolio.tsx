import React from 'react';
import { Win95Button } from './Win95Button';
import { FolderIcon, FileIcon } from 'lucide-react';

export function SimplePortfolio() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-200 border-b-2 border-gray-400 p-2">
        <h2 className="font-bold font-mono">My Portfolio</h2>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Web Projects */}
          <div className="border-2 border-gray-400 bg-white p-4">
            <div className="flex items-center mb-3">
              <FolderIcon className="w-6 h-6 text-yellow-600 mr-2" />
              <h3 className="font-bold font-mono text-lg">Web Projects</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-mono">E-commerce Website</span>
              </li>
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-mono">Portfolio Website</span>
              </li>
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-mono">Corporate Website</span>
              </li>
            </ul>
            <p className="mt-3 font-mono text-sm">
              A collection of web development projects built with React, Vue, and other modern technologies.
            </p>
          </div>
          
          {/* Mobile Apps */}
          <div className="border-2 border-gray-400 bg-white p-4">
            <div className="flex items-center mb-3">
              <FolderIcon className="w-6 h-6 text-yellow-600 mr-2" />
              <h3 className="font-bold font-mono text-lg">Mobile Apps</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-mono">Food Delivery App</span>
              </li>
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-mono">Fitness Tracker</span>
              </li>
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-blue-600 mr-2" />
                <span className="font-mono">Task Manager</span>
              </li>
            </ul>
            <p className="mt-3 font-mono text-sm">
              Mobile applications developed with React Native and Flutter for iOS and Android platforms.
            </p>
          </div>
          
          {/* Design Work */}
          <div className="border-2 border-gray-400 bg-white p-4">
            <div className="flex items-center mb-3">
              <FolderIcon className="w-6 h-6 text-yellow-600 mr-2" />
              <h3 className="font-bold font-mono text-lg">Design Work</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-mono">Brand Identity</span>
              </li>
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-mono">UI/UX Design</span>
              </li>
              <li className="flex items-center">
                <FileIcon className="w-4 h-4 text-green-600 mr-2" />
                <span className="font-mono">Logo Design</span>
              </li>
            </ul>
            <p className="mt-3 font-mono text-sm">
              Graphic design and UI/UX projects created with Figma, Adobe XD, and Photoshop.
            </p>
          </div>
          
          {/* Skills */}
          <div className="border-2 border-gray-400 bg-white p-4">
            <div className="flex items-center mb-3">
              <FolderIcon className="w-6 h-6 text-yellow-600 mr-2" />
              <h3 className="font-bold font-mono text-lg">Skills</h3>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-mono font-bold">Frontend</h4>
                <p className="font-mono text-sm">React, Vue, Angular, HTML, CSS, JavaScript</p>
              </div>
              <div>
                <h4 className="font-mono font-bold">Backend</h4>
                <p className="font-mono text-sm">Node.js, Express, Firebase, MongoDB</p>
              </div>
              <div>
                <h4 className="font-mono font-bold">Mobile</h4>
                <p className="font-mono text-sm">React Native, Flutter, Swift</p>
              </div>
              <div>
                <h4 className="font-mono font-bold">Design</h4>
                <p className="font-mono text-sm">Figma, Adobe XD, Photoshop, Illustrator</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contact Section */}
        <div className="mt-6 border-2 border-gray-400 bg-white p-4">
          <h3 className="font-bold font-mono text-lg mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-mono"><strong>Email:</strong> contact@example.com</p>
              <p className="font-mono"><strong>Phone:</strong> (123) 456-7890</p>
              <p className="font-mono"><strong>Website:</strong> www.example.com</p>
            </div>
            <div>
              <p className="font-mono"><strong>LinkedIn:</strong> linkedin.com/in/example</p>
              <p className="font-mono"><strong>GitHub:</strong> github.com/example</p>
              <p className="font-mono"><strong>Twitter:</strong> @example</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-200 border-t-2 border-gray-400 p-2 flex justify-between items-center">
        <span className="font-mono text-sm">© 2023 My Portfolio</span>
        <Win95Button className="px-3 py-1 font-mono text-sm">
          Download Resume
        </Win95Button>
      </div>
    </div>
  );
}
