import React, { useState } from 'react';
import { Win95Button } from '../Win95Button';
import { useContent } from '../../contexts/ContentContext';
import {
  TrashIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  CalendarIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  FilterIcon,
  SortAscIcon
} from 'lucide-react';
import { ref, set } from 'firebase/database';
import { database } from '../../firebase/config';
import { BookingSubmission } from '../../types';
import { sendAppointmentApprovalNotification } from '../../firebase/notificationService';
import { BookingConfirmationDialog } from '../BookingConfirmationDialog';

export function BookingManager() {
  const { content, updateContent } = useContent();
  const [notificationStatus, setNotificationStatus] = useState<{
    booking: string;
    status: 'sending' | 'success' | 'error';
    message?: string;
  } | null>(null);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');

  // Filter and sort bookings
  const filteredAndSortedBookings = React.useMemo(() => {
    if (!content.bookings || !Array.isArray(content.bookings)) return [];

    let filtered = content.bookings;

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      }
    });
  }, [content.bookings, statusFilter, sortBy]);

  /**
   * Helper function to update booking status with type safety
   */
  const updateBookingStatus = async (booking: BookingSubmission, newStatus: 'pending' | 'approved' | 'rejected') => {
    // Update in Firebase
    await set(ref(database, `bookings/${booking.id}/status`), newStatus);

    // Create updated booking object
    const updatedBooking: BookingSubmission = {
      ...booking,
      status: newStatus
    };

    // Ensure bookings is an array before mapping
    const currentBookings = Array.isArray(content.bookings) ? content.bookings : [];

    // Update local state
    updateContent({
      bookings: currentBookings.map(b => b.id === booking.id ? updatedBooking : b)
    });

    return updatedBooking;
  };

  const handleBookingApprove = async (booking: BookingSubmission) => {
    try {
      console.log('Approving booking:', booking.id);

      // Use our helper function to update the booking status
      const approvedBooking = await updateBookingStatus(booking, 'approved');
      console.log('Updated booking status in Firebase');

      // Dispatch event for UI updates
      const event = new CustomEvent('contentUpdate', {
        detail: {
          type: 'booking_update',
          data: {
            id: approvedBooking.id,
            status: approvedBooking.status
          }
        }
      });

      window.dispatchEvent(event);
      console.log('Dispatched event');

      // Send notification to user
      setNotificationStatus({
        booking: booking.id,
        status: 'sending'
      });

      try {
        // Check if user has a userId (required for notifications)
        if (!booking.userId) {
          setNotificationStatus({
            booking: booking.id,
            status: 'error',
            message: 'No user ID associated with this booking'
          });
          console.log('No user ID associated with this booking');
        } else {
          // Send notification
          console.log('Attempting to send notification to user:', booking.userId);
          const notificationSent = await sendAppointmentApprovalNotification(approvedBooking);

          if (notificationSent) {
            setNotificationStatus({
              booking: booking.id,
              status: 'success',
              message: 'Notification sent successfully'
            });
            console.log('Notification sent successfully');
          } else {
            // This is a non-critical error - the appointment is still approved
            setNotificationStatus({
              booking: booking.id,
              status: 'error',
              message: 'User may not have notifications enabled'
            });
            console.log('User may not have notifications enabled');
          }
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        setNotificationStatus({
          booking: booking.id,
          status: 'error',
          message: 'Failed to send notification'
        });
      }

      // Show confirmation dialog
      setConfirmedBooking(approvedBooking);
      setShowBookingConfirmation(true);

      // Clear notification status after 5 seconds
      setTimeout(() => {
        setNotificationStatus(null);
      }, 5000);
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking. Please try again.');

      setNotificationStatus({
        booking: booking.id,
        status: 'error',
        message: 'Failed to approve booking'
      });
    }
  };

  const handleBookingReject = async (booking: BookingSubmission) => {
    try {
      await updateBookingStatus(booking, 'rejected');
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking. Please try again.');
    }
  };

  const handleBookingRemove = async (booking: BookingSubmission) => {
    try {
      await set(ref(database, `bookings/${booking.id}`), null);
      const currentBookings = Array.isArray(content.bookings) ? content.bookings : [];
      updateContent({
        bookings: currentBookings.filter(b => b.id !== booking.id)
      });
    } catch (error) {
      console.error('Error removing booking:', error);
      alert('Failed to remove booking. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 border-2 border-gray-400">
        <h3 className="font-mono font-bold text-xl mb-4 border-b-2 border-gray-200 pb-2">
          Booking Management
        </h3>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-100 border-2 border-gray-300">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-4 h-4" />
            <label className="font-mono text-sm font-bold">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2 py-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAscIcon className="w-4 h-4" />
            <label className="font-mono text-sm font-bold">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2 py-1 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
            >
              <option value="date">Date (Newest First)</option>
              <option value="name">Name (A-Z)</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="font-mono text-sm text-gray-600">
              Showing {filteredAndSortedBookings.length} of {content.bookings?.length || 0} bookings
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAndSortedBookings.length > 0 ? (
            filteredAndSortedBookings.map(booking => (
              <div key={booking.id} className="p-4 bg-white border-2 border-gray-400">
                <div className="flex justify-between mb-2">
                  <div className="flex items-center">
                    <span className="font-mono font-bold">
                      {booking.firstName} {booking.lastName}
                    </span>
                    {booking.status && (
                      <span className={`ml-2 px-2 py-0.5 text-xs font-mono rounded ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'approved'
                          ? 'Approved'
                          : booking.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-sm">
                    {new Date(booking.submittedAt).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-mono text-sm">
                      <MailIcon className="w-4 h-4 inline-block mr-2" />
                      {booking.email}
                    </p>
                    <p className="font-mono text-sm">
                      <PhoneIcon className="w-4 h-4 inline-block mr-2" />
                      {booking.phone}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-sm">
                      <CalendarIcon className="w-4 h-4 inline-block mr-2" />
                      {booking.date} at {booking.time}
                    </p>
                    <p className="font-mono text-sm font-bold">
                      {booking.serviceType}
                    </p>
                  </div>
                </div>

                <p className="font-mono text-sm mb-4 whitespace-pre-line">
                  {booking.description}
                </p>

                {/* Notification Status */}
                {notificationStatus && notificationStatus.booking === booking.id && (
                  <div className={`mb-4 p-3 border-2 font-mono text-sm ${
                    notificationStatus.status === 'sending'
                      ? 'border-blue-400 bg-blue-50 text-blue-800'
                      : notificationStatus.status === 'success'
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-red-400 bg-red-50 text-red-800'
                  }`}>
                    <div className="flex items-center">
                      {notificationStatus.status === 'sending' && (
                        <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {notificationStatus.status === 'success' && (
                        <CheckIcon className="w-4 h-4 mr-2" />
                      )}
                      {notificationStatus.status === 'error' && (
                        <AlertTriangleIcon className="w-4 h-4 mr-2" />
                      )}
                      <span>
                        {notificationStatus.status === 'sending' && 'Sending notification...'}
                        {notificationStatus.status === 'success' && 'Notification sent successfully!'}
                        {notificationStatus.status === 'error' && (notificationStatus.message || 'Failed to send notification')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Win95Button
                    onClick={() => handleBookingApprove(booking)}
                    className={`flex-1 p-2 font-mono ${booking.status === 'approved' ? 'bg-green-100' : ''}`}
                    disabled={booking.status === 'approved'}
                  >
                    <CheckIcon className="w-4 h-4 inline-block mr-2" />
                    Approve
                  </Win95Button>
                  <Win95Button
                    onClick={() => handleBookingReject(booking)}
                    className={`flex-1 p-2 font-mono ${booking.status === 'rejected' ? 'bg-red-100' : ''}`}
                    disabled={booking.status === 'rejected'}
                  >
                    <XIcon className="w-4 h-4 inline-block mr-2" />
                    Reject
                  </Win95Button>
                  <Win95Button
                    onClick={() => handleBookingRemove(booking)}
                    className="flex-1 p-2 font-mono text-red-600"
                  >
                    <TrashIcon className="w-4 h-4 inline-block mr-2" />
                    Remove
                  </Win95Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 bg-white border-2 border-gray-400 text-center">
              <ClockIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="font-mono text-gray-600">
                {statusFilter === 'all'
                  ? 'No bookings available'
                  : `No ${statusFilter} bookings found`
                }
              </p>
              {statusFilter !== 'all' && (
                <Win95Button
                  onClick={() => setStatusFilter('all')}
                  className="px-4 py-2 font-mono mt-4"
                >
                  Show All Bookings
                </Win95Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Booking Confirmation Dialog */}
      {showBookingConfirmation && confirmedBooking && (
        <BookingConfirmationDialog
          booking={confirmedBooking}
          notificationStatus={notificationStatus}
          onClose={() => {
            setShowBookingConfirmation(false);
            setConfirmedBooking(null);
          }}
        />
      )}
    </div>
  );
}
