import React from 'react';
import { useContent } from '../contexts/ContentContext';

/**
 * DataRefreshIndicator - Silent background data refresh handler
 *
 * This component handles background data refreshes without showing any visual indicator.
 * It's completely invisible to the user but still manages the data refresh process.
 */
export function DataRefreshIndicator() {
  // We still use the loadingState to track refreshes in logs, but don't show anything to the user
  const { loadingState } = useContent();

  // Log refresh events for debugging but don't show anything to the user
  if (loadingState.isRefreshing) {
    console.log('Silently refreshing data in the background');
  }

  // Return null to render nothing
  return null;
}
