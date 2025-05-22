import React, { useState, useEffect, useMemo } from 'react';
import { useContent } from '../contexts/ContentContext';
import { GameWindow } from './GameWindow';
import { Win95Button } from './Win95Button';
import {
  GamepadIcon,
  XIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from 'lucide-react';
import { Game, GameCategory } from '../types';
import { LazyImage } from './LazyImage';

export function GamesSection() {
  const { content } = useContent();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(content?.games?.layout || 'grid');
  const [showFilters, setShowFilters] = useState(false);

  // If games data doesn't exist or is not visible, don't render anything
  if (!content?.games?.games || !content.games.showGames) {
    return null;
  }

  // Filter visible games
  const visibleGames = content.games.games.filter(game => game.visible);

  // If no visible games, don't render anything
  if (visibleGames.length === 0) {
    return null;
  }

  // Get all categories from games
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    visibleGames.forEach(game => {
      if (game.category) categorySet.add(game.category);
    });
    return Array.from(categorySet);
  }, [visibleGames]);

  // Filter games by search and category
  const filteredGames = useMemo(() => {
    return visibleGames.filter(game => {
      // Filter by search query
      const matchesSearch = searchQuery === '' ||
        game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.description && game.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (game.tags && game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

      // Filter by category
      const matchesCategory = selectedCategory === null || game.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [visibleGames, searchQuery, selectedCategory]);

  // Get featured games
  const featuredGames = useMemo(() => {
    return visibleGames.filter(game => game.featured).slice(0, 3);
  }, [visibleGames]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle category selection
  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Handle view mode toggle
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'grid' ? 'list' : 'grid');
  };

  // Render game card
  const renderGameCard = (game: Game) => {
    const difficultyColor = game.difficulty === 'easy'
      ? 'bg-green-100 text-green-800'
      : game.difficulty === 'medium'
        ? 'bg-yellow-100 text-yellow-800'
        : game.difficulty === 'hard'
          ? 'bg-red-100 text-red-800'
          : '';

    return (
      <div
        key={game.id}
        className={`border-2 border-gray-400 cursor-pointer hover:bg-gray-100 transition-colors relative group overflow-hidden ${
          viewMode === 'grid' ? 'p-2' : 'p-3 flex items-center'
        }`}
        onClick={() => setSelectedGame(game)}
      >
        {/* Featured badge */}
        {game.featured && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 z-10 font-mono">
            Featured
          </div>
        )}

        {/* Game image */}
        <div className={`${
          viewMode === 'grid'
            ? 'aspect-square mb-2 overflow-hidden'
            : 'w-16 h-16 mr-4 flex-shrink-0'
        }`}>
          <LazyImage
            src={game.icon}
            alt={game.name}
            className={`w-full h-full object-cover border border-gray-300 ${
              viewMode === 'list' ? 'rounded-md' : ''
            }`}
            placeholder="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EGame%3C%2Ftext%3E%3C%2Fsvg%3E"
          />

          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <GamepadIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Game info */}
        <div className={viewMode === 'list' ? 'flex-grow' : ''}>
          <h3 className="font-mono font-bold truncate">{game.name}</h3>

          {viewMode === 'list' && game.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{game.description}</p>
          )}

          {/* Game metadata */}
          <div className={`flex items-center mt-1 text-xs text-gray-600 ${
            viewMode === 'grid' ? 'justify-between' : ''
          }`}>
            {/* Category tag */}
            {game.category && (
              <span className="bg-gray-200 px-2 py-0.5 rounded-sm mr-2 font-mono">
                {game.category}
              </span>
            )}

            {/* Difficulty badge */}
            {game.difficulty && (
              <span className={`px-2 py-0.5 rounded-sm mr-2 font-mono ${difficultyColor}`}>
                {game.difficulty}
              </span>
            )}

            {/* Play count */}
            {game.playCount !== undefined && (
              <span className="flex items-center">
                <GamepadIcon className="w-3 h-3 mr-1" />
                {game.playCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-mono font-bold text-xl flex items-center">
          <GamepadIcon className="w-6 h-6 mr-2" />
          {content.games.title || 'Games'}
        </h2>

        {/* View mode toggle */}
        <div className="flex items-center">
          <Win95Button
            onClick={toggleViewMode}
            className="p-2 mr-2"
            title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
          >
            {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <GridIcon className="w-4 h-4" />}
          </Win95Button>

          <Win95Button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2"
            title="Toggle filters"
          >
            <FilterIcon className="w-4 h-4" />
          </Win95Button>
        </div>
      </div>

      {/* Subtitle */}
      {content.games.subtitle && (
        <p className="mb-4 text-gray-600">{content.games.subtitle}</p>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-300">
          {/* Search */}
          <div className="mb-3">
            <div className="flex items-center border-2 border-gray-400 bg-white">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-2 flex-grow font-mono text-sm focus:outline-none"
              />
              <div className="p-2 bg-gray-200 border-l-2 border-gray-400">
                <SearchIcon className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <div className="font-mono font-bold mb-2 text-sm">Categories:</div>
              <div className="flex flex-wrap gap-2">
                <Win95Button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-3 py-1 text-xs font-mono ${selectedCategory === null ? 'bg-blue-100' : ''}`}
                >
                  All
                </Win95Button>

                {categories.map(category => (
                  <Win95Button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 text-xs font-mono ${selectedCategory === category ? 'bg-blue-100' : ''}`}
                  >
                    {category}
                  </Win95Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Featured Games */}
      {featuredGames.length > 0 && content.games.showFeaturedGames && !selectedGame && (
        <div className="mb-6">
          <h3 className="font-mono font-bold text-lg mb-3 flex items-center">
            <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
            Featured Games
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredGames.map(game => renderGameCard(game))}
          </div>
        </div>
      )}

      {/* Selected Game or Game List */}
      {selectedGame ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-mono font-bold text-lg">{selectedGame.name}</h3>
            <Win95Button
              onClick={() => setSelectedGame(null)}
              className="p-2"
            >
              <XIcon className="w-4 h-4" />
            </Win95Button>
          </div>

          {/* Game metadata */}
          <div className="mb-4 flex flex-wrap gap-2">
            {selectedGame.category && (
              <span className="bg-gray-200 px-2 py-1 rounded-sm font-mono text-sm flex items-center">
                <TagIcon className="w-3 h-3 mr-1" />
                {selectedGame.category}
              </span>
            )}

            {selectedGame.difficulty && (
              <span className={`px-2 py-1 rounded-sm font-mono text-sm flex items-center ${
                selectedGame.difficulty === 'easy'
                  ? 'bg-green-100 text-green-800'
                  : selectedGame.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {selectedGame.difficulty} difficulty
              </span>
            )}

            {selectedGame.estimatedTime && (
              <span className="bg-gray-200 px-2 py-1 rounded-sm font-mono text-sm flex items-center">
                <ClockIcon className="w-3 h-3 mr-1" />
                {selectedGame.estimatedTime}
              </span>
            )}
          </div>

          {/* Game description */}
          {selectedGame.description && (
            <p className="mb-4 text-gray-600 font-mono">{selectedGame.description}</p>
          )}

          {/* Game instructions */}
          {selectedGame.instructions && (
            <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-300">
              <h4 className="font-mono font-bold mb-2">Instructions:</h4>
              <p className="text-sm font-mono">{selectedGame.instructions}</p>
            </div>
          )}

          {/* Game controls */}
          {selectedGame.controls && (
            <div className="mb-4 p-3 bg-gray-100 border-2 border-gray-300">
              <h4 className="font-mono font-bold mb-2">Controls:</h4>
              <p className="text-sm font-mono">{selectedGame.controls}</p>
            </div>
          )}

          {/* Game window */}
          <GameWindow gameId={selectedGame.id} />
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-3 font-mono text-sm text-gray-600">
            Showing {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
            {selectedCategory && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>

          {/* Games grid/list */}
          {filteredGames.length > 0 ? (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
              : "space-y-3"
            }>
              {filteredGames.map(game => renderGameCard(game))}
            </div>
          ) : (
            <div className="p-6 text-center bg-gray-100 border-2 border-gray-300">
              <p className="font-mono text-gray-600">No games found matching your criteria.</p>
              <Win95Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="mt-3 px-4 py-2 font-mono"
              >
                Clear Filters
              </Win95Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
