import React from 'react';
import { MessageSquareIcon } from 'lucide-react';
import { LazyImage } from '../LazyImage';

interface CategoryCardProps {
  id: string;
  name: string;
  description: string;
  icon?: string;
  topicCount?: number;
  isSelected?: boolean;
  onClick: () => void;
}

export function CategoryCard({
  id,
  name,
  description,
  icon,
  topicCount = 0,
  isSelected = false,
  onClick
}: CategoryCardProps) {
  // Default placeholder for missing images
  const placeholderSvg = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E%3C%2Ftext%3E%3C%2Fsvg%3E";

  return (
    <div
      className={`
        cursor-pointer hover:bg-gray-100 border-2 border-gray-400 rounded-lg overflow-hidden
        ${isSelected ? 'bg-blue-50 border-blue-400' : ''}
        transition-all duration-300 transform hover:-translate-y-1
      `}
      onClick={onClick}
    >
      {/* Category Image */}
      <div className="relative aspect-video">
        <LazyImage
          src={icon || placeholderSvg}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = placeholderSvg;
          }}
        />
        <div className="absolute top-0 right-0 bg-gray-800 text-white px-3 py-1 rounded-bl-md text-xs font-mono">
          {topicCount} {topicCount === 1 ? 'topic' : 'topics'}
        </div>
      </div>

      {/* Category Info */}
      <div className="p-3">
        <h4 className="font-bold font-mono text-center mb-1">{name}</h4>
        <p className="font-mono text-xs text-gray-600 text-center line-clamp-2">{description}</p>
      </div>
    </div>
  );
}
