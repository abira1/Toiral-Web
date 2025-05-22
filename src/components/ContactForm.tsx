import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { CheckIcon } from 'lucide-react';
import { addContactSubmission } from '../firebase/contentDatabase';
export function ContactForm({
  onClose
}: {
  onClose: () => void;
}) {
  const {
    addContactSubmission
  } = useContent();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Use Firebase to add the contact submission
      await addContactSubmission(formData);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('There was an error submitting your message. Please try again.');
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  if (submitted) {
    return <div className="p-8 bg-gray-200 text-center">
        <div className="bg-green-100 border-2 border-green-600 p-6 shadow-lg">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="font-mono font-bold text-green-800 text-lg mb-2">
            Message Sent Successfully!
          </h3>
          <p className="font-mono text-green-700">
            We'll get back to you as soon as possible.
          </p>
        </div>
      </div>;
  }
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-mono">Your Name:</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" />
        </div>
        <div>
          <label className="block mb-1 font-mono">Email Address:</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" />
        </div>
      </div>
      <div>
        <label className="block mb-1 font-mono">Subject:</label>
        <select name="subject" value={formData.subject} onChange={handleChange} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800">
          <option>General Inquiry</option>
          <option>Technical Support</option>
          <option>Business Proposal</option>
          <option>Other</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-mono">Message:</label>
        <textarea name="message" rows={6} required value={formData.message} onChange={handleChange} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none" />
      </div>
      <div className="flex justify-end">
        <Win95Button type="submit" className="px-4 py-2 font-mono">
          Send Message
        </Win95Button>
      </div>
    </form>;
}