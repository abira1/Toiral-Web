import React from 'react';
import { Win95Button } from './Win95Button';
import { CheckIcon, CalendarIcon, VideoIcon, MailIcon, BellIcon, AlertTriangleIcon } from 'lucide-react';

interface BookingConfirmationDialogProps {
  booking: {
    firstName: string;
    lastName: string;
    date: string;
    time: string;
    serviceType: string;
    email: string;
    userId?: string;
  };
  onClose: () => void;
  notificationStatus?: {
    booking: string;
    status: 'sending' | 'success' | 'error' | null;
    message?: string;
  } | null;
}
export function BookingConfirmationDialog({
  booking,
  onClose,
  notificationStatus
}: BookingConfirmationDialogProps) {
  const formattedDate = new Date(`${booking.date} ${booking.time}`).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
  return <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md bg-gray-300 border-2 border-white border-r-gray-800 border-b-gray-800 p-4 m-4">
        <div className="bg-blue-900 text-white px-2 py-1 font-bold mb-4">
          Booking Confirmation
        </div>
        <div className="bg-white p-6 border-2 border-gray-600 border-t-gray-800 border-l-gray-800">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center mb-6">
            <h3 className="font-mono font-bold text-xl mb-2">
              Thanks for booking with Toiral!
            </h3>
            <p className="font-mono text-gray-600">
              Your appointment has been successfully scheduled. We're excited to
              connect with you and bring your ideas to life.
            </p>
          </div>
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 font-mono">
              <CalendarIcon className="w-5 h-5 mt-0.5 text-gray-600" />
              <div>
                <div className="font-bold">Date & Time</div>
                <div className="text-gray-600">{formattedDate}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 font-mono">
              <VideoIcon className="w-5 h-5 mt-0.5 text-gray-600" />
              <div>
                <div className="font-bold">Meeting Type</div>
                <div className="text-gray-600">{booking.serviceType}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 font-mono">
              <MailIcon className="w-5 h-5 mt-0.5 text-gray-600" />
              <div>
                <div className="font-bold">Confirmation Email</div>
                <div className="text-gray-600">Sent to: {booking.email}</div>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 p-4 mb-6">
            <p className="font-mono text-sm text-blue-800">
              Need to reschedule or have a question? Feel free to reach
              out—we've got your back!
            </p>
          </div>

          {/* Notification Status Section */}
          {notificationStatus && notificationStatus.booking === booking.id && (
            <div className={`border-2 p-4 mb-6 flex items-start gap-3 ${
              notificationStatus.status === 'success'
                ? 'bg-green-50 border-green-200'
                : notificationStatus.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
            }`}>
              {notificationStatus.status === 'sending' && (
                <div className="animate-spin">
                  <BellIcon className="w-5 h-5 text-yellow-600" />
                </div>
              )}
              {notificationStatus.status === 'success' && (
                <BellIcon className="w-5 h-5 text-green-600" />
              )}
              {notificationStatus.status === 'error' && (
                <AlertTriangleIcon className="w-5 h-5 text-red-600" />
              )}
              <div className="flex-1">
                <div className="font-mono font-bold">
                  {notificationStatus.status === 'sending' && 'Sending notification...'}
                  {notificationStatus.status === 'success' && 'Notification sent'}
                  {notificationStatus.status === 'error' && 'Notification issue'}
                </div>
                <div className="font-mono text-sm">
                  {notificationStatus.status === 'sending' &&
                    'Sending appointment approval notification to the client...'}
                  {notificationStatus.status === 'success' &&
                    'The client has been notified about their approved appointment.'}
                  {notificationStatus.status === 'error' && (
                    <>
                      {notificationStatus.message || 'Failed to send notification to the client.'}
                      {notificationStatus.message === 'User may not have notifications enabled' && (
                        <div className="mt-1 text-xs text-gray-700">
                          The client needs to enable notifications in their profile settings.
                          This doesn't affect the appointment approval - the client can still
                          see their approved appointment in their account.
                        </div>
                      )}
                      {notificationStatus.message === 'No user ID associated with this booking' && (
                        <div className="mt-1 text-xs text-gray-700">
                          This booking was created without a user account or before the notification
                          system was implemented. The client will need to check their appointment status manually.
                        </div>
                      )}
                    </>
                  )}
                </div>
                {notificationStatus.status === 'success' && (
                  <div className="mt-2 text-xs font-mono text-gray-600">
                    <div className="mb-1">Notification details:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div>Title:</div>
                      <div>"Your appointment has been successfully approved."</div>
                      <div>Image:</div>
                      <div className="truncate">Toiral logo</div>
                      <div>Expiration:</div>
                      <div>4 weeks</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Win95Button onClick={onClose} className="px-6 py-2 font-mono">
              Close
            </Win95Button>
          </div>
        </div>
      </div>
    </div>;
}