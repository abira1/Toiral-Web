import React, { useEffect, useState, useRef } from 'react';
import { useContent } from '../contexts/ContentContext';
import { Game } from '../types';
import { Win95Button } from './Win95Button';
import {
  MaximizeIcon,
  MinimizeIcon,
  RefreshCwIcon,
  VolumeXIcon,
  Volume2Icon,
  HelpCircleIcon,
  DownloadIcon
} from 'lucide-react';

interface GameWindowProps {
  gameType?: 'reversi' | 'checkers';
  gameId?: string;
}

export function GameWindow({
  gameType,
  gameId
}: GameWindowProps) {
  const { content } = useContent();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Legacy game URLs for backward compatibility
  const legacyGameUrls = {
    reversi: 'https://playpager.com/embed/reversi/index.html',
    checkers: 'https://playpager.com/embed/checkers/index.html'
  };

  useEffect(() => {
    // If gameId is provided, find the game in the database
    if (gameId && content?.games?.games) {
      const foundGame = content.games.games.find(g => g.id === gameId);
      if (foundGame) {
        setGame(foundGame);

        // Increment play count if available
        if (foundGame.playCount !== undefined) {
          // This would typically update the play count in Firebase
          // For now, we're just updating the local state
          console.log(`Game ${foundGame.name} played. Count: ${foundGame.playCount + 1}`);
        }
      } else {
        setError('Game not found');
      }
    }
    setLoading(false);
  }, [gameId, content?.games?.games]);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(!isMuted);

    // Try to mute the iframe content if possible
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        // This is a basic approach - not all games will support this
        iframeRef.current.contentWindow.postMessage({ action: 'toggleMute' }, '*');
      } catch (e) {
        console.log('Could not send mute message to game');
      }
    }
  };

  // Handle refresh game
  const refreshGame = () => {
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };

  // Auto-hide controls after inactivity
  const resetControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    setShowControls(true);

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    setControlsTimeout(timeout);
  };

  // Set up controls auto-hide
  useEffect(() => {
    resetControlsTimeout();

    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, []);

  // If using legacy gameType, try to find it in the database first
  if (gameType && !gameId) {
    // Try to find the game in the database by its ID (which matches the gameType)
    if (content?.games?.games) {
      const foundGame = content.games.games.find(g => g.id === gameType);
      if (foundGame) {
        return (
          <div
            ref={containerRef}
            className="w-full h-[550px] bg-gray-200 relative"
            onMouseMove={resetControlsTimeout}
          >
            <iframe
              ref={iframeRef}
              style={{
                width: '100%',
                height: '550px',
                overflow: 'hidden',
                border: 'none'
              }}
              src={foundGame.embedUrl}
              title={foundGame.name}
              scrolling="no"
              allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />

            {/* Game controls */}
            <div
              className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-300 ${
                showControls ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Win95Button
                onClick={toggleMute}
                className="p-2"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
              </Win95Button>

              <Win95Button
                onClick={refreshGame}
                className="p-2"
                title="Restart Game"
              >
                <RefreshCwIcon className="w-4 h-4" />
              </Win95Button>

              <Win95Button
                onClick={toggleFullscreen}
                className="p-2"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
              </Win95Button>
            </div>
          </div>
        );
      }
    }

    // Fallback to legacy URLs if not found in database
    return (
      <div
        ref={containerRef}
        className="w-full h-[550px] bg-gray-200 relative"
        onMouseMove={resetControlsTimeout}
      >
        <iframe
          ref={iframeRef}
          style={{
            width: '100%',
            height: '550px',
            overflow: 'hidden',
            border: 'none'
          }}
          src={legacyGameUrls[gameType]}
          title={gameType === 'reversi' ? 'Online Othello Game' : 'Online Checkers Game'}
          scrolling="no"
          allow="fullscreen"
        />

        {/* Game controls */}
        <div
          className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Win95Button
            onClick={toggleMute}
            className="p-2"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
          </Win95Button>

          <Win95Button
            onClick={refreshGame}
            className="p-2"
            title="Restart Game"
          >
            <RefreshCwIcon className="w-4 h-4" />
          </Win95Button>

          <Win95Button
            onClick={toggleFullscreen}
            className="p-2"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
          </Win95Button>
        </div>
      </div>
    );
  }

  // If loading
  if (loading) {
    return (
      <div className="w-full h-[550px] bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600 font-mono">Loading game...</p>
        </div>
      </div>
    );
  }

  // If error
  if (error || !game) {
    return (
      <div className="w-full h-[550px] bg-gray-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-mono">{error || 'Game not found'}</p>
          <Win95Button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 font-mono"
          >
            Reload
          </Win95Button>
        </div>
      </div>
    );
  }

  // Render the game based on its embed type
  return (
    <div
      ref={containerRef}
      className="w-full h-[550px] bg-gray-200 relative"
      onMouseMove={resetControlsTimeout}
    >
      <iframe
        ref={iframeRef}
        style={{
          width: '100%',
          height: '550px',
          overflow: 'hidden',
          border: 'none'
        }}
        src={game.embedUrl}
        title={game.name}
        scrolling="no"
        allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Game controls */}
      <div
        className={`absolute top-2 right-2 flex gap-1 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {game.instructions && (
          <Win95Button
            onClick={() => alert(game.instructions)}
            className="p-2"
            title="Instructions"
          >
            <HelpCircleIcon className="w-4 h-4" />
          </Win95Button>
        )}

        <Win95Button
          onClick={toggleMute}
          className="p-2"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeXIcon className="w-4 h-4" /> : <Volume2Icon className="w-4 h-4" />}
        </Win95Button>

        <Win95Button
          onClick={refreshGame}
          className="p-2"
          title="Restart Game"
        >
          <RefreshCwIcon className="w-4 h-4" />
        </Win95Button>

        <Win95Button
          onClick={toggleFullscreen}
          className="p-2"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <MinimizeIcon className="w-4 h-4" /> : <MaximizeIcon className="w-4 h-4" />}
        </Win95Button>
      </div>

      {/* Loading overlay - shown when refreshing the game */}
      {loading && (
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 font-mono">Loading game...</p>
          </div>
        </div>
      )}
    </div>
  );
}