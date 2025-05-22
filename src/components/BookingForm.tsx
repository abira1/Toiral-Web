import React, { useState } from 'react';
import { Win95Button } from './Win95Button';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ClockIcon, CheckIcon, LockIcon } from 'lucide-react';
import { addBooking } from '../firebase/contentDatabase';
interface BookingFormProps {
  onClose: () => void;
}
export function BookingForm({
  onClose
}: BookingFormProps) {
  const {
    addBooking,
    content
  } = useContent();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    serviceType: '',
    date: '',
    time: '',
    description: '',
    selectedPackage: '' // New field for package selection
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to book an appointment.');
      return;
    }

    try {
      // Prepare booking data with package information if applicable
      let bookingDescription = formData.description;

      // Add package information to the description if selected
      if (formData.selectedPackage &&
          (formData.serviceType === 'Website Design Meeting' ||
           formData.serviceType === 'Development Planning')) {
        bookingDescription = `Package of Interest: ${formData.selectedPackage}\n\n${bookingDescription}`;
      }

      // Add user ID to the booking data
      const bookingDataWithUserId = {
        ...formData,
        description: bookingDescription,
        userId: user.uid, // Add the user ID from Firebase Auth
        email: user.email || formData.email // Use the authenticated email if available
      };

      // Use Firebase to add the booking
      await addBooking(bookingDataWithUserId);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 5000); // Close after 5 seconds
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('There was an error submitting your booking. Please try again.');
    }
  };
  if (submitted) {
    return <div className="p-8 bg-gray-200 text-center">
        <div className="bg-white border-2 border-gray-400 p-6 shadow-lg max-w-2xl mx-auto">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-10 h-10 text-white" />
            </div>
          </div>
          <h3 className="font-mono font-bold text-2xl mb-4 text-green-700">
            Booking Request Submitted Successfully!
          </h3>
          <div className="space-y-4 mb-6">
            <p className="font-mono text-gray-700">
              Thank you for choosing Toiral Web Development! Your booking
              request has been received and is being reviewed by our team.
            </p>

            {/* Booking details summary */}
            <div className="bg-gray-50 p-4 border-2 border-gray-300 text-left">
              <h4 className="font-mono font-bold mb-2">Booking Details</h4>
              <ul className="font-mono text-sm space-y-2">
                <li><span className="font-bold">Service:</span> {formData.serviceType}</li>
                <li><span className="font-bold">Date:</span> {formData.date}</li>
                <li><span className="font-bold">Time:</span> {formData.time}</li>
                {formData.selectedPackage && (
                  <li><span className="font-bold">Package:</span> {formData.selectedPackage}</li>
                )}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 border-2 border-gray-300 text-left">
              <h4 className="font-mono font-bold mb-2">What happens next?</h4>
              <ul className="font-mono text-sm space-y-2 list-disc pl-4">
                <li>Our team will review your booking request</li>
                <li>You'll receive a confirmation email within 24 hours</li>
                <li>Once approved, we'll send detailed meeting instructions</li>
                <li>Feel free to contact us if you need to make any changes</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 border-2 border-blue-200">
              <p className="font-mono text-sm text-blue-800">
                Need immediate assistance? Contact us at {content.contact?.email || 'contract.toiral@gmail.com'}{' '}
                or call {content.contact?.phone || '+880 1804-673095'}
              </p>
            </div>
          </div>
          <div className="font-mono text-sm text-gray-500">
            This window will close automatically in a few seconds...
          </div>
        </div>
      </div>;
  }
  return <div className="p-4 bg-gray-200 text-black">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          {!user ? (
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 mb-4 text-center">
              <div className="flex justify-center mb-2">
                <LockIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-mono font-bold text-lg mb-2 text-yellow-800">
                Login Required
              </h3>
              <p className="font-mono text-sm mb-4">
                You must be logged in to book an appointment. This ensures your bookings are private and only visible to you.
              </p>
              <Win95Button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-2 font-mono bg-blue-100 hover:bg-blue-200"
              >
                Login / Register
              </Win95Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-mono">First Name:</label>
                <input type="text" name="firstName" required value={formData.firstName} onChange={e => setFormData({
                ...formData,
                firstName: e.target.value
              })} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="John" />
              </div>
              <div>
                <label className="block mb-1 font-mono">Last Name:</label>
                <input type="text" name="lastName" required value={formData.lastName} onChange={e => setFormData({
                ...formData,
                lastName: e.target.value
              })} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="Doe" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-mono">Email Address:</label>
                <input type="email" name="email" required value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block mb-1 font-mono">Phone Number:</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" placeholder="+1 (234) 567-8900" />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-mono">Service Type:</label>
              <select
                name="serviceType"
                required
                value={formData.serviceType}
                onChange={e => setFormData({
                  ...formData,
                  serviceType: e.target.value,
                  // Reset selectedPackage when service type changes
                  selectedPackage: ''
                })}
                className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              >
                <option value="">Select a service type</option>
                {/* Use our custom service types */}
                <option value="Initial Consultation">Initial Consultation (30 mins, Free)</option>
                <option value="Website Design Meeting">Website Design Meeting</option>
                <option value="Development Planning">Development Planning</option>
                <option value="SEO Strategy Session">SEO Strategy Session</option>
                <option value="Admin Panel Help">Admin Panel Help</option>
              </select>
            </div>

            {/* Package selection field - only shown for Website Design Meeting and Development Planning */}
            {(formData.serviceType === 'Website Design Meeting' || formData.serviceType === 'Development Planning') && (
              <div>
                <label className="block mb-1 font-mono">Package of Interest:</label>
                <select
                  name="selectedPackage"
                  required
                  value={formData.selectedPackage}
                  onChange={e => setFormData({
                    ...formData,
                    selectedPackage: e.target.value
                  })}
                  className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                >
                  <option value="">Select a package</option>
                  {Array.isArray(content.pricing?.packages) ?
                    content.pricing.packages
                      .filter(pkg => pkg.visible)
                      .map(pkg => (
                        <option key={pkg.id} value={pkg.name}>
                          {pkg.name} (${pkg.price})
                        </option>
                      ))
                    :
                    <>
                      <option value="Basic Package">Basic Package ($499)</option>
                      <option value="Standard Package">Standard Package ($999)</option>
                      <option value="Premium Package">Premium Package ($1999)</option>
                    </>
                  }
                  <option value="Custom Solution">Custom Solution (TBD)</option>
                </select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-mono">Preferred Date:</label>
                <div className="relative">
                  <input type="date" name="date" required value={formData.date} onChange={e => setFormData({
                  ...formData,
                  date: e.target.value
                })} className="w-full p-1 pl-8 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800" />
                  <CalendarIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-mono">Preferred Time:</label>
                <div className="relative">
                  <select name="time" required value={formData.time} onChange={e => setFormData({
                  ...formData,
                  time: e.target.value
                })} className="w-full p-1 pl-8 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800">
                    <option value="">Select a time slot</option>
                    {Array.isArray(content.availableHours) ? content.availableHours.map(hour => <option key={hour} value={`${hour}:00`}>
                        {`${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`}
                      </option>) :
                      [9, 10, 11, 13, 14, 15, 16].map(hour => <option key={hour} value={`${hour}:00`}>
                        {`${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`}
                      </option>)}
                  </select>
                  <ClockIcon className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
            <div>
              <label className="block mb-1 font-mono">
                Project Description:
              </label>
              <textarea name="description" required value={formData.description} onChange={e => setFormData({
              ...formData,
              description: e.target.value
            })} rows={4} className="w-full p-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none" placeholder="Please briefly describe your project or requirements..." />
            </div>
            <div className="flex justify-end gap-2 mt-6 border-t border-gray-400 pt-4">
              <Win95Button type="button" className="px-4 py-2 font-mono" onClick={onClose}>
                Cancel
              </Win95Button>
              <Win95Button type="submit" className="px-8 py-2 font-mono bg-blue-100 hover:bg-blue-200">
                Book Appointment
              </Win95Button>
            </div>
          </form>
          )}
        </div>
        <div className="lg:w-72 space-y-4 lg:border-l-2 lg:border-gray-400 lg:pl-6">
          <div className="p-4 bg-white border-2 border-gray-400">
            <div className="font-mono font-bold mb-2 text-blue-900">
              Available Hours
            </div>
            <div className="font-mono text-sm space-y-1">
              <div>{content.contact?.officeHours?.days || 'Monday - Friday'}</div>
              <div>{content.contact?.officeHours?.hours || '9:00 AM - 6:00 PM'}</div>
              <div className="text-green-600 font-bold mt-2">
                Currently Available
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-2 border-gray-400">
            <div className="font-mono font-bold mb-2 text-blue-900">
              Meeting Types
            </div>
            <div className="font-mono text-sm space-y-2">
              {/* Display our custom service types */}
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500" />
                <div>Initial Consultation (30 mins, Free)</div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500" />
                <div>Website Design Meeting</div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-purple-500" />
                <div>Development Planning</div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500" />
                <div>SEO Strategy Session</div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-red-500" />
                <div>Admin Panel Help</div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white border-2 border-gray-400">
            <div className="font-mono font-bold mb-2 text-blue-900">
              Important Notes
            </div>
            <ul className="font-mono text-sm list-disc pl-4 space-y-1">
              <li>Please book at least 24 hours in advance</li>
              <li>Rescheduling is available up to 12 hours before</li>
              <li>All times are in {content.contact?.officeHours?.timezone || 'GMT+6'}</li>
              <li>Initial consultation is always free</li>
            </ul>
          </div>
        </div>
      </div>
    </div>;
}