import React from 'react';
import { DialogWindow } from '../DialogWindow';
import { StandalonePortfolio } from './StandalonePortfolio';

interface PortfolioExplorerProps {
  onClose: () => void;
}

export function PortfolioExplorer({ onClose }: PortfolioExplorerProps) {
  return (
    <DialogWindow
      title="Portfolio Explorer"
      onClose={onClose}
      style={{ width: 800, height: 600 }}
    >
      <div className="h-full">
        <StandalonePortfolio onClose={onClose} />
      </div>
    </DialogWindow>
  );
}
