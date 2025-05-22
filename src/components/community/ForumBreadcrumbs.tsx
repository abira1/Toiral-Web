import React from 'react';
import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { Win95Button } from '../Win95Button';

interface BreadcrumbItem {
  id: string;
  label: string;
  onClick: () => void;
}

interface ForumBreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function ForumBreadcrumbs({ items }: ForumBreadcrumbsProps) {
  return (
    <div className="bg-gray-100 border-2 border-gray-300 p-2 mb-4 flex items-center flex-wrap gap-1">
      <Win95Button
        onClick={() => items[0].onClick()}
        className="px-2 py-1 font-mono text-sm flex items-center"
        title="Home"
      >
        <HomeIcon className="w-4 h-4 mr-1" />
        Forum Home
      </Win95Button>
      
      {items.slice(1).map((item, index) => (
        <React.Fragment key={item.id}>
          <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          <Win95Button
            onClick={item.onClick}
            className="px-2 py-1 font-mono text-sm"
          >
            {item.label}
          </Win95Button>
        </React.Fragment>
      ))}
    </div>
  );
}
