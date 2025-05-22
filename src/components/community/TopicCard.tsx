import { MessageSquareIcon, HeartIcon, EyeIcon, PinIcon, LockIcon, ClockIcon } from 'lucide-react';
import { LazyImage } from '../LazyImage';

interface TopicCardProps {
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isLocked?: boolean;
  loveCount?: number;
  lastReplyAt?: string;
  lastReplyAuthor?: string;
  imageUrl?: string;
  onClick: () => void;
}

export function TopicCard({
  title,
  content,
  authorName,
  createdAt,
  replies,
  views,
  isPinned = false,
  isLocked = false,
  loveCount = 0,
  lastReplyAt,
  lastReplyAuthor,
  imageUrl,
  onClick
}: TopicCardProps) {
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Default placeholder for missing images
  const placeholderSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fsvg%3E";

  return (
    <div
      className="cursor-pointer hover:bg-gray-100 border-2 border-gray-400 rounded-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
    >
      {/* Topic Image (if available) */}
      {imageUrl && (
        <div className="relative aspect-video">
          <LazyImage
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = placeholderSvg;
            }}
          />
          {/* Status badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {isPinned && (
              <div title="Pinned Topic" className="bg-blue-600 text-white p-1 rounded-full">
                <PinIcon className="w-4 h-4" />
              </div>
            )}
            {isLocked && (
              <div title="Locked Topic" className="bg-red-600 text-white p-1 rounded-full">
                <LockIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Topic Content */}
      <div className="p-3">
        <div className="flex justify-center items-center gap-2 mb-1">
          {!imageUrl && isPinned && (
            <div title="Pinned Topic">
              <PinIcon className="w-4 h-4 text-blue-600" />
            </div>
          )}
          {!imageUrl && isLocked && (
            <div title="Locked Topic">
              <LockIcon className="w-4 h-4 text-red-600" />
            </div>
          )}
          <h3 className="font-bold font-mono text-sm sm:text-base text-center line-clamp-1">{title}</h3>
        </div>

        <p className="font-mono text-xs text-gray-600 text-center line-clamp-2 mb-2">
          {content}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs font-mono text-gray-500">
          <span className="flex items-center gap-1">
            {authorName}
          </span>

          <span className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {formatDate(createdAt)}
          </span>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs font-mono text-gray-500 mt-1 pt-1 border-t border-gray-200">
          <span className="flex items-center gap-1">
            <MessageSquareIcon className="w-3 h-3" />
            {replies} {replies === 1 ? 'reply' : 'replies'}
          </span>

          <span className="flex items-center gap-1">
            <EyeIcon className="w-3 h-3" />
            {views} {views === 1 ? 'view' : 'views'}
          </span>

          {loveCount > 0 && (
            <span className="flex items-center gap-1">
              <HeartIcon className="w-3 h-3 text-red-500" />
              {loveCount}
            </span>
          )}
        </div>

        {lastReplyAt && lastReplyAuthor && (
          <div className="mt-2 text-xs font-mono text-gray-500 border-t border-gray-200 pt-1 text-center">
            <span className="flex items-center justify-center gap-1">
              <MessageSquareIcon className="w-3 h-3" />
              Last reply by {lastReplyAuthor} on {formatDate(lastReplyAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
