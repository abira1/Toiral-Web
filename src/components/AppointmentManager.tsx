import React, { useState, useEffect } from 'react';
import { useContent } from '../contexts/ContentContext';
import { useAuth } from '../contexts/AuthContext';
import { Win95Button } from './Win95Button';
import { BookingForm } from './BookingForm';
import { CalendarIcon, ClockIcon, CheckIcon, XIcon, PlusIcon, RefreshCwIcon, LockIcon } from 'lucide-react';
import { subscribeToBookings } from '../firebase/contentDatabase';
export function AppointmentManager() {
  const {
    content
  } = useContent();
  const { user } = useAuth();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [userBookings, setUserBookings] = useState<any[]>([]);

  // Subscribe to user-specific bookings
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToBookings((bookings) => {
        setUserBookings(bookings);
      }, user.uid);

      return () => unsubscribe();
    } else {
      setUserBookings([]);
    }
  }, [user]);
  const now = new Date();
  const appointments = (Array.isArray(userBookings) ? userBookings : [])
    .sort((a, b) => {
      try {
        return new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime();
      } catch (error) {
        return 0;
      }
    })
    .reduce((acc, booking) => {
      try {
        const bookingDate = new Date(`${booking.date} ${booking.time}`);
        if (bookingDate > now) {
          acc.upcoming.push(booking);
        } else {
          acc.past.push(booking);
        }
      } catch (error) {
        // If there's an error parsing the date, default to upcoming
        acc.upcoming.push(booking);
      }
      return acc;
    }, {
      upcoming: [],
      past: []
    });
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="flex items-center text-green-600">
            <CheckIcon className="w-4 h-4 mr-1" />
            Approved
          </span>;
      case 'rejected':
        return <span className="flex items-center text-red-600">
            <XIcon className="w-4 h-4 mr-1" />
            Declined
          </span>;
      default:
        return <span className="flex items-center text-yellow-600">
            <RefreshCwIcon className="w-4 h-4 mr-1" />
            Pending
          </span>;
    }
  };
  return <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {!user ? (
          <div className="bg-yellow-50 border-2 border-yellow-300 p-8 text-center">
            <div className="flex justify-center mb-4">
              <LockIcon className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="font-mono font-bold text-xl mb-4 text-yellow-800">
              Login Required
            </h2>
            <p className="font-mono mb-6 max-w-md mx-auto">
              You must be logged in to view and manage your appointments. This ensures your booking information remains private and secure.
            </p>
            <Win95Button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 font-mono bg-blue-100 hover:bg-blue-200"
            >
              Login / Register
            </Win95Button>
          </div>
        ) : showBookingForm ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-mono text-xl font-bold">Book Appointment</h2>
              <Win95Button onClick={() => setShowBookingForm(false)} className="px-4 py-2 font-mono">
                Back to Appointments
              </Win95Button>
            </div>
            <BookingForm onClose={() => setShowBookingForm(false)} />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="font-mono text-xl font-bold">My Appointments</h2>
              <Win95Button onClick={() => setShowBookingForm(true)} className="px-4 py-2 font-mono">
                <PlusIcon className="w-4 h-4 inline-block mr-2" />
                New Appointment
              </Win95Button>
            </div>
            <div className="flex gap-2 border-b-2 border-gray-400 pb-2">
              <Win95Button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 font-mono ${activeTab === 'upcoming' ? 'bg-blue-100' : ''}`}>
                Upcoming ({appointments.upcoming.length})
              </Win95Button>
              <Win95Button onClick={() => setActiveTab('past')} className={`px-4 py-2 font-mono ${activeTab === 'past' ? 'bg-blue-100' : ''}`}>
                Past ({appointments.past.length})
              </Win95Button>
            </div>
            <div className="space-y-4">
              {appointments[activeTab].length === 0 ? <div className="bg-white p-8 border-2 border-gray-400 text-center">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-mono text-gray-600">
                    {activeTab === 'upcoming' ? "You don't have any upcoming appointments" : "You don't have any past appointments"}
                  </p>
                  {activeTab === 'upcoming' && <Win95Button onClick={() => setShowBookingForm(true)} className="px-4 py-2 font-mono mt-4">
                      Book Your First Appointment
                    </Win95Button>}
                </div> : appointments[activeTab].map(booking => <div key={booking.id} className="bg-white p-4 border-2 border-gray-400">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-mono font-bold text-lg">
                          {booking.serviceType}
                        </h3>
                        <p className="font-mono text-gray-600">
                          {booking.firstName} {booking.lastName}
                        </p>
                      </div>
                      <div className="font-mono">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="font-mono">{booking.date}</span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="font-mono">{booking.time}</span>
                      </div>
                    </div>
                    {booking.description && <p className="mt-4 font-mono text-sm text-gray-600 border-t border-gray-200 pt-4">
                        {booking.description}
                      </p>}
                  </div>)}
            </div>
          </div>
        )}
      </div>
    </div>;
}