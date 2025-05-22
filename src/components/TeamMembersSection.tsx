import React from 'react';
import { TeamMember } from '../types';
import { LazyImage } from './LazyImage';

// Helper function to generate placeholder SVG
const getPlaceholderSvg = () => {
  return `data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22200%22%20viewBox%3D%220%200%20200%20200%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22200%22%20height%3D%22200%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ETeam%20Member%3C%2Ftext%3E%3C%2Fsvg%3E`;
};

interface TeamMembersSectionProps {
  teamMembers?: TeamMember[];
  className?: string;
}

export function TeamMembersSection({ teamMembers, className = '' }: TeamMembersSectionProps) {
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="font-mono text-gray-600">
          No team members available
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {teamMembers.map(member => (
        <div key={member.id} className="text-center">
          <div className="w-24 h-24 mx-auto mb-2 overflow-hidden rounded-full border-2 border-gray-400">
            <LazyImage
              src={member.image}
              alt={member.name}
              className="w-full h-full object-cover"
              placeholderSrc={getPlaceholderSvg()}
              onError={e => {
                (e.target as HTMLImageElement).src = getPlaceholderSvg();
              }}
            />
          </div>
          <h3 className="font-mono font-bold">{member.name}</h3>
          <p className="font-mono text-sm text-gray-600">
            {member.role}
          </p>
        </div>
      ))}
    </div>
  );
}
