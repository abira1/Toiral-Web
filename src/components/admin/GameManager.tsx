import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { useContent } from '../../contexts/ContentContext';
import { database } from '../../firebase/config';
import { ref, set, get } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';
import { initializeGamesData } from '../../firebase/initializeGames';
import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XIcon,
  SaveIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  EyeOffIcon,
  GamepadIcon,
  MonitorIcon,
  ImageIcon,
  LinkIcon,
  Settings2Icon,
  FilterIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  StarIcon,
  TagIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MaximizeIcon,
  MinimizeIcon,
  VolumeXIcon,
  Volume2Icon,
  HelpCircleIcon,
  DownloadIcon
} from 'lucide-react';
import { Game, GamesSettings } from '../../types';

// Default game settings
const defaultGamesSettings: GamesSettings = {
  games: [],
  categories: [],
  showGames: true,
  title: 'Games',
  subtitle: 'Check out our collection of games',
  iconSize: 'medium', // Default icon size
  layout: 'grid',
  showFeaturedGames: true,
  showCategories: true,
  showSearch: true
};

// Game embed types
const embedTypes = [
  { value: 'direct', label: 'Direct HTML Game', example: 'https://yourdomain.com/games/mygame/index.html' },
  { value: 'itch.io', label: 'Itch.io Embed', example: 'https://itch.io/embed-upload/123456?color=333333' },
  { value: 'youtube', label: 'YouTube Embed', example: 'https://www.youtube.com/embed/VIDEO_ID' },
  { value: 'unity', label: 'Unity WebGL Game', example: 'https://yourdomain.com/games/unity-game/index.html' },
  { value: 'codepen', label: 'CodePen Embed', example: 'https://codepen.io/username/embed/ID?default-tab=result' },
  { value: 'jsfiddle', label: 'JSFiddle Embed', example: 'https://jsfiddle.net/username/ID/embedded/result/' },
  { value: 'glitch', label: 'Glitch Project Embed', example: 'https://glitch.com/embed/#!/embed/project-name' },
  { value: 'custom', label: 'Custom CDN-Hosted Game', example: 'https://cdn.example.com/game-folder/game.html' }
];

export function GameManager() {
  const { content, updateContent } = useContent();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'settings' | 'categories'>('list');
  const [gamesData, setGamesData] = useState<GamesSettings>(defaultGamesSettings);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Form state for adding/editing a game
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState<Partial<Game>>({
    name: '',
    description: '',
    icon: '',
    embedType: 'direct',
    embedUrl: '',
    visible: true,
    category: '',
    tags: [],
    featured: false,
    difficulty: 'medium',
    estimatedTime: '',
    instructions: '',
    controls: ''
  });

  // Category management
  const [categoryFormVisible, setCategoryFormVisible] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    description: '',
    order: 0,
    visible: true
  });

  // Initialize games data from content
  useEffect(() => {
    const initializeData = async () => {
      // Initialize games data in Firebase if it doesn't exist
      await initializeGamesData();

      // Set local state from content
      if (content?.games) {
        setGamesData(content.games);
      } else {
        // If games data doesn't exist in content, initialize with default
        setGamesData(defaultGamesSettings);
      }
    };

    initializeData();
  }, [content?.games]);

  // Handle form input changes
  const handleInputChange = (field: keyof Game, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  // Validate URL
  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Handle form submission for adding/editing a game
  const handleSubmitGame = () => {
    if (!formData.name || !formData.name.trim()) {
      alert('Please enter a game name');
      return;
    }

    if (!formData.icon || !formData.icon.trim()) {
      alert('Please enter a game icon URL');
      return;
    }

    if (!formData.embedUrl || !formData.embedUrl.trim()) {
      alert('Please enter a game embed URL');
      return;
    }

    if (!validateUrl(formData.embedUrl)) {
      alert('Please enter a valid URL for the game embed');
      return;
    }

    if (!validateUrl(formData.icon)) {
      alert('Please enter a valid URL for the game icon');
      return;
    }

    // Create a copy of the games array
    const currentGames = Array.isArray(gamesData.games) ? gamesData.games : [];

    if (editingGame) {
      // Update existing game
      const updatedGames = currentGames.map(game =>
        game.id === editingGame.id
          ? {
              ...game,
              ...formData,
              updatedAt: Date.now()
            }
          : game
      );

      // Update local state
      setGamesData({
        ...gamesData,
        games: updatedGames
      });

      // Save to Firebase
      saveGamesToFirebase({
        ...gamesData,
        games: updatedGames
      });
    } else {
      // Add new game
      const newGame: Game = {
        id: uuidv4(),
        name: formData.name || 'New Game',
        description: formData.description || '',
        icon: formData.icon || '',
        embedType: formData.embedType || 'direct',
        embedUrl: formData.embedUrl || '',
        visible: formData.visible !== undefined ? formData.visible : true,
        order: currentGames.length + 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const updatedGames = [...currentGames, newGame];

      // Update local state
      setGamesData({
        ...gamesData,
        games: updatedGames
      });

      // Save to Firebase
      saveGamesToFirebase({
        ...gamesData,
        games: updatedGames
      });
    }

    // Reset form and go back to list view
    resetForm();
    setActiveTab('list');
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      embedType: 'direct',
      embedUrl: '',
      visible: true,
      category: '',
      tags: [],
      featured: false,
      difficulty: 'medium',
      estimatedTime: '',
      instructions: '',
      controls: ''
    });
    setEditingGame(null);
  };

  // Handle editing a game
  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description || '',
      icon: game.icon,
      embedType: game.embedType,
      embedUrl: game.embedUrl,
      visible: game.visible,
      category: game.category || '',
      tags: game.tags || [],
      featured: game.featured || false,
      difficulty: game.difficulty || 'medium',
      estimatedTime: game.estimatedTime || '',
      instructions: game.instructions || '',
      controls: game.controls || ''
    });
    setActiveTab('add');
  };

  // Handle deleting a game
  const handleDeleteGame = (gameId: string) => {
    if (!window.confirm('Are you sure you want to delete this game?')) {
      return;
    }

    // Create a copy of the games array
    const currentGames = Array.isArray(gamesData.games) ? gamesData.games : [];
    const updatedGames = currentGames.filter(game => game.id !== gameId);

    // Update local state
    setGamesData({
      ...gamesData,
      games: updatedGames
    });

    // Save to Firebase
    saveGamesToFirebase({
      ...gamesData,
      games: updatedGames
    });
  };

  // Handle toggling game visibility
  const handleToggleVisibility = (gameId: string) => {
    // Create a copy of the games array
    const currentGames = Array.isArray(gamesData.games) ? gamesData.games : [];
    const updatedGames = currentGames.map(game =>
      game.id === gameId
        ? { ...game, visible: !game.visible, updatedAt: Date.now() }
        : game
    );

    // Update local state
    setGamesData({
      ...gamesData,
      games: updatedGames
    });

    // Save to Firebase
    saveGamesToFirebase({
      ...gamesData,
      games: updatedGames
    });
  };

  // Handle moving a game up in the order
  const handleMoveUp = (index: number) => {
    if (index === 0) return; // Already at the top

    // Create a copy of the games array
    const currentGames = Array.isArray(gamesData.games) ? gamesData.games : [];
    const updatedGames = [...currentGames];

    // Swap the game with the one above it
    [updatedGames[index], updatedGames[index - 1]] = [updatedGames[index - 1], updatedGames[index]];

    // Update order values
    const reorderedGames = updatedGames.map((game, idx) => ({
      ...game,
      order: idx + 1,
      updatedAt: Date.now()
    }));

    // Update local state
    setGamesData({
      ...gamesData,
      games: reorderedGames
    });

    // Save to Firebase
    saveGamesToFirebase({
      ...gamesData,
      games: reorderedGames
    });
  };

  // Handle moving a game down in the order
  const handleMoveDown = (index: number) => {
    const currentGames = Array.isArray(gamesData.games) ? gamesData.games : [];
    if (index === currentGames.length - 1) return; // Already at the bottom

    // Create a copy of the games array
    const updatedGames = [...currentGames];

    // Swap the game with the one below it
    [updatedGames[index], updatedGames[index + 1]] = [updatedGames[index + 1], updatedGames[index]];

    // Update order values
    const reorderedGames = updatedGames.map((game, idx) => ({
      ...game,
      order: idx + 1,
      updatedAt: Date.now()
    }));

    // Update local state
    setGamesData({
      ...gamesData,
      games: reorderedGames
    });

    // Save to Firebase
    saveGamesToFirebase({
      ...gamesData,
      games: reorderedGames
    });
  };

  // Handle updating settings
  const handleUpdateSettings = (field: keyof GamesSettings, value: any) => {
    // Update local state
    setGamesData({
      ...gamesData,
      [field]: value
    });

    // Save to Firebase
    saveGamesToFirebase({
      ...gamesData,
      [field]: value
    });
  };

  // Save games data to Firebase
  const saveGamesToFirebase = async (dataToSave: GamesSettings) => {
    try {
      setSaveStatus('saving');
      setSaveError(null);

      // Save to Firebase - both paths in parallel
      await Promise.all([
        set(ref(database, 'games'), dataToSave),
        set(ref(database, 'toiral/games'), dataToSave)
      ]);

      // Update the context
      updateContent({
        games: dataToSave
      });

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error saving games to Firebase:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to save games to Firebase');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveError(null);
      }, 3000);
    }
  };

  // Get the example URL for the selected embed type
  const getEmbedTypeExample = () => {
    const selectedType = embedTypes.find(type => type.value === formData.embedType);
    return selectedType ? selectedType.example : '';
  };

  // Handle manually initializing games data
  const handleInitializeGames = async () => {
    try {
      setSaveStatus('saving');
      setSaveError(null);

      await initializeGamesData();

      // Refresh the games data from Firebase
      const gamesSnapshot = await get(ref(database, 'games'));
      if (gamesSnapshot.exists()) {
        const gamesData = gamesSnapshot.val();
        setGamesData(gamesData);

        // Update the context
        updateContent({
          games: gamesData
        });
      }

      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error initializing games data:', error);
      setSaveStatus('error');
      setSaveError(error instanceof Error ? error.message : 'Failed to initialize games data');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveError(null);
      }, 3000);
    }
  };

  return (
    <div className="p-4 bg-white border-2 border-gray-400 rounded-lg">
      <h2 className="font-mono font-bold text-xl mb-6 flex items-center">
        <GamepadIcon className="w-6 h-6 mr-2" />
        Game Manager
      </h2>

      {/* Tabs */}
      <div className="flex mb-6 border-b border-gray-300 flex-wrap">
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'list' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Games List
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'add' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => {
            resetForm();
            setActiveTab('add');
          }}
        >
          Add New Game
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'categories' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </Win95Button>
        <Win95Button
          className={`px-4 py-2 font-mono ${activeTab === 'settings' ? 'border-t-gray-800 border-l-gray-800 border-b-white border-r-white' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </Win95Button>
      </div>

      {/* Games List Tab */}
      {activeTab === 'list' && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="font-mono font-bold text-lg">Games List</h3>
            <Win95Button
              onClick={() => {
                resetForm();
                setActiveTab('add');
              }}
              className="px-4 py-2 font-mono"
            >
              <PlusIcon className="w-4 h-4 inline-block mr-2" />
              Add New Game
            </Win95Button>
          </div>

          {gamesData.games && gamesData.games.length > 0 ? (
            <div className="space-y-4">
              {gamesData.games.map((game, index) => (
                <div key={game.id} className="p-4 bg-gray-100 border-2 border-gray-400 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <img
                        src={game.icon}
                        alt={game.name}
                        className="w-10 h-10 mr-3 object-cover border border-gray-400"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EGame%3C%2Ftext%3E%3C%2Fsvg%3E';
                        }}
                      />
                      <div>
                        <h4 className="font-mono font-bold">{game.name}</h4>
                        <p className="text-sm text-gray-600">{game.embedType} embed</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Win95Button
                        onClick={() => handleToggleVisibility(game.id)}
                        className="p-2"
                        title={game.visible ? 'Hide Game' : 'Show Game'}
                      >
                        {game.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                      </Win95Button>
                      <Win95Button
                        onClick={() => handleMoveUp(index)}
                        className="p-2"
                        disabled={index === 0}
                        title="Move Up"
                      >
                        <ArrowUpIcon className="w-4 h-4" />
                      </Win95Button>
                      <Win95Button
                        onClick={() => handleMoveDown(index)}
                        className="p-2"
                        disabled={index === gamesData.games.length - 1}
                        title="Move Down"
                      >
                        <ArrowDownIcon className="w-4 h-4" />
                      </Win95Button>
                      <Win95Button
                        onClick={() => handleEditGame(game)}
                        className="p-2"
                        title="Edit Game"
                      >
                        <Settings2Icon className="w-4 h-4" />
                      </Win95Button>
                      <Win95Button
                        onClick={() => handleDeleteGame(game.id)}
                        className="p-2 text-red-600"
                        title="Delete Game"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Win95Button>
                    </div>
                  </div>
                  {game.description && (
                    <p className="text-sm text-gray-700 mt-2 mb-2">{game.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    <span className="mr-4">Created: {new Date(game.createdAt).toLocaleDateString()}</span>
                    <span>Updated: {new Date(game.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 border-2 border-gray-400 rounded-lg">
              <GamepadIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="font-mono text-gray-600 mb-4">No games added yet.</p>
              <div className="flex justify-center space-x-4">
                <Win95Button
                  onClick={() => {
                    resetForm();
                    setActiveTab('add');
                  }}
                  className="px-4 py-2 font-mono"
                >
                  <PlusIcon className="w-4 h-4 inline-block mr-2" />
                  Add Your First Game
                </Win95Button>
                <Win95Button
                  onClick={handleInitializeGames}
                  className="px-4 py-2 font-mono bg-blue-100"
                >
                  <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
                  Initialize Default Games
                </Win95Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Game Tab */}
      {activeTab === 'add' && (
        <div>
          <h3 className="font-mono font-bold text-lg mb-4">
            {editingGame ? 'Edit Game' : 'Add New Game'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Game Name *
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter game name"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Description (optional)
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                rows={3}
                placeholder="Enter game description"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Game Icon URL *
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={formData.icon || ''}
                  onChange={(e) => handleInputChange('icon', e.target.value)}
                  className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Enter icon URL"
                  required
                />
                <div className="w-12 h-12 border-2 border-gray-400 flex items-center justify-center overflow-hidden">
                  {formData.icon ? (
                    <img
                      src={formData.icon}
                      alt="Icon Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EIcon%3C%2Ftext%3E%3C%2Fsvg%3E';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Embed Type *
              </label>
              <select
                value={formData.embedType || 'direct'}
                onChange={(e) => handleInputChange('embedType', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                required
              >
                {embedTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Example: {getEmbedTypeExample()}
              </p>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Embed URL *
              </label>
              <input
                type="url"
                value={formData.embedUrl || ''}
                onChange={(e) => handleInputChange('embedUrl', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter embed URL"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter game category"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: Puzzle, Action, Strategy, etc.
              </p>
            </div>

            {/* Tags */}
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Tags (optional)
              </label>
              <input
                type="text"
                value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
                onChange={(e) => {
                  const tagsString = e.target.value;
                  const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
                  handleInputChange('tags', tagsArray);
                }}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter tags separated by commas"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: multiplayer, classic, retro
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Difficulty (optional)
              </label>
              <select
                value={formData.difficulty || 'medium'}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Estimated Time */}
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Estimated Time (optional)
              </label>
              <input
                type="text"
                value={formData.estimatedTime || ''}
                onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter estimated play time"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 5 min, 10-15 min, etc.
              </p>
            </div>

            {/* Instructions */}
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Instructions (optional)
              </label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => handleInputChange('instructions', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                rows={3}
                placeholder="Enter game instructions"
              />
            </div>

            {/* Controls */}
            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Controls (optional)
              </label>
              <textarea
                value={formData.controls || ''}
                onChange={(e) => handleInputChange('controls', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                rows={3}
                placeholder="Enter game controls"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: Use arrow keys to move, spacebar to jump, etc.
              </p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gameVisibility"
                  checked={formData.visible !== undefined ? formData.visible : true}
                  onChange={(e) => handleInputChange('visible', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="gameVisibility" className="font-mono text-gray-600">
                  Game is visible
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="gameFeatured"
                  checked={formData.featured || false}
                  onChange={(e) => handleInputChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="gameFeatured" className="font-mono text-gray-600">
                  Featured game (will appear in featured section)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Win95Button
                onClick={() => {
                  resetForm();
                  setActiveTab('list');
                }}
                className="px-4 py-2 font-mono"
              >
                <XIcon className="w-4 h-4 inline-block mr-2" />
                Cancel
              </Win95Button>
              <Win95Button
                onClick={handleSubmitGame}
                className="px-4 py-2 font-mono bg-blue-100"
              >
                <SaveIcon className="w-4 h-4 inline-block mr-2" />
                {editingGame ? 'Update Game' : 'Add Game'}
              </Win95Button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <h3 className="font-mono font-bold text-lg mb-4">Game Categories</h3>

          {/* Category List */}
          <div className="mb-6">
            <div className="flex justify-between mb-4">
              <h4 className="font-mono font-bold">Categories</h4>
              <Win95Button
                onClick={() => {
                  setCategoryForm({
                    id: '',
                    name: '',
                    description: '',
                    order: (gamesData.categories?.length || 0) + 1,
                    visible: true
                  });
                  setCategoryFormVisible(true);
                }}
                className="px-4 py-2 font-mono"
              >
                <PlusIcon className="w-4 h-4 inline-block mr-2" />
                Add Category
              </Win95Button>
            </div>

            {gamesData.categories && gamesData.categories.length > 0 ? (
              <div className="space-y-2">
                {gamesData.categories.map((category, index) => (
                  <div key={category.id} className="p-3 bg-gray-100 border-2 border-gray-400 rounded-lg flex justify-between items-center">
                    <div>
                      <h5 className="font-mono font-bold">{category.name}</h5>
                      {category.description && (
                        <p className="text-sm text-gray-600">{category.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Win95Button
                        onClick={() => {
                          // Toggle category visibility
                          const updatedCategories = [...(gamesData.categories || [])];
                          updatedCategories[index] = {
                            ...updatedCategories[index],
                            visible: !updatedCategories[index].visible
                          };
                          handleUpdateSettings('categories', updatedCategories);
                        }}
                        className="p-2"
                        title={category.visible ? 'Hide Category' : 'Show Category'}
                      >
                        {category.visible ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
                      </Win95Button>

                      <Win95Button
                        onClick={() => {
                          // Edit category
                          setCategoryForm({
                            id: category.id,
                            name: category.name,
                            description: category.description || '',
                            order: category.order,
                            visible: category.visible
                          });
                          setCategoryFormVisible(true);
                        }}
                        className="p-2"
                        title="Edit Category"
                      >
                        <Settings2Icon className="w-4 h-4" />
                      </Win95Button>

                      <Win95Button
                        onClick={() => {
                          // Delete category
                          if (window.confirm(`Are you sure you want to delete the category "${category.name}"?`)) {
                            const updatedCategories = (gamesData.categories || []).filter(c => c.id !== category.id);
                            handleUpdateSettings('categories', updatedCategories);
                          }
                        }}
                        className="p-2"
                        title="Delete Category"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Win95Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-100 border-2 border-gray-400 rounded-lg">
                <p className="font-mono text-gray-600 mb-4">No categories added yet.</p>
                <Win95Button
                  onClick={() => {
                    setCategoryForm({
                      id: '',
                      name: '',
                      description: '',
                      order: 1,
                      visible: true
                    });
                    setCategoryFormVisible(true);
                  }}
                  className="px-4 py-2 font-mono"
                >
                  <PlusIcon className="w-4 h-4 inline-block mr-2" />
                  Add Your First Category
                </Win95Button>
              </div>
            )}
          </div>

          {/* Category Form */}
          {categoryFormVisible && (
            <div className="mt-6 p-4 bg-gray-100 border-2 border-gray-400 rounded-lg">
              <h4 className="font-mono font-bold mb-4">
                {categoryForm.id ? 'Edit Category' : 'Add New Category'}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-mono text-gray-600">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-mono text-gray-600">
                    Description (optional)
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                    rows={2}
                    placeholder="Enter category description"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="categoryVisibility"
                    checked={categoryForm.visible}
                    onChange={(e) => setCategoryForm({...categoryForm, visible: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="categoryVisibility" className="font-mono text-gray-600">
                    Category is visible
                  </label>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Win95Button
                    onClick={() => setCategoryFormVisible(false)}
                    className="px-4 py-2 font-mono"
                  >
                    <XIcon className="w-4 h-4 inline-block mr-2" />
                    Cancel
                  </Win95Button>

                  <Win95Button
                    onClick={() => {
                      // Validate
                      if (!categoryForm.name.trim()) {
                        alert('Please enter a category name');
                        return;
                      }

                      // Save category
                      const currentCategories = Array.isArray(gamesData.categories) ? [...gamesData.categories] : [];

                      if (categoryForm.id) {
                        // Update existing category
                        const updatedCategories = currentCategories.map(cat =>
                          cat.id === categoryForm.id ? categoryForm : cat
                        );
                        handleUpdateSettings('categories', updatedCategories);
                      } else {
                        // Add new category
                        const newCategory = {
                          ...categoryForm,
                          id: uuidv4()
                        };
                        handleUpdateSettings('categories', [...currentCategories, newCategory]);
                      }

                      // Reset form
                      setCategoryFormVisible(false);
                    }}
                    className="px-4 py-2 font-mono bg-blue-100"
                  >
                    <SaveIcon className="w-4 h-4 inline-block mr-2" />
                    {categoryForm.id ? 'Update Category' : 'Add Category'}
                  </Win95Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h3 className="font-mono font-bold text-lg mb-4">Games Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGames"
                checked={gamesData.showGames}
                onChange={(e) => handleUpdateSettings('showGames', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showGames" className="font-mono text-gray-600">
                Show Games Section
              </label>
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Section Title
              </label>
              <input
                type="text"
                value={gamesData.title || 'Games'}
                onChange={(e) => handleUpdateSettings('title', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter section title"
              />
            </div>

            <div>
              <label className="block mb-1 font-mono text-gray-600">
                Section Subtitle (optional)
              </label>
              <input
                type="text"
                value={gamesData.subtitle || ''}
                onChange={(e) => handleUpdateSettings('subtitle', e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Enter section subtitle"
              />
            </div>

            <div className="mt-4">
              <label className="block mb-1 font-mono text-gray-600">
                Game Icon Size
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="iconSize"
                    value="small"
                    checked={gamesData.iconSize === 'small'}
                    onChange={() => handleUpdateSettings('iconSize', 'small')}
                    className="mr-2"
                  />
                  <span className="font-mono">Small</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="iconSize"
                    value="medium"
                    checked={gamesData.iconSize === 'medium' || !gamesData.iconSize}
                    onChange={() => handleUpdateSettings('iconSize', 'medium')}
                    className="mr-2"
                  />
                  <span className="font-mono">Medium</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="iconSize"
                    value="large"
                    checked={gamesData.iconSize === 'large'}
                    onChange={() => handleUpdateSettings('iconSize', 'large')}
                    className="mr-2"
                  />
                  <span className="font-mono">Large</span>
                </label>
              </div>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-300 border border-gray-400 mr-2"></div>
                  <span className="text-xs">Small</span>
                </div>
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-300 border border-gray-400 mr-2"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-300 border border-gray-400 mr-2"></div>
                  <span className="text-xs">Large</span>
                </div>
              </div>
            </div>

            {/* Layout */}
            <div className="mt-4">
              <label className="block mb-1 font-mono text-gray-600">
                Games Layout
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="layout"
                    value="grid"
                    checked={gamesData.layout === 'grid' || !gamesData.layout}
                    onChange={() => handleUpdateSettings('layout', 'grid')}
                    className="mr-2"
                  />
                  <span className="font-mono">Grid</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="layout"
                    value="list"
                    checked={gamesData.layout === 'list'}
                    onChange={() => handleUpdateSettings('layout', 'list')}
                    className="mr-2"
                  />
                  <span className="font-mono">List</span>
                </label>
              </div>
            </div>

            {/* Display Options */}
            <div className="mt-4 space-y-2">
              <label className="block mb-1 font-mono text-gray-600">
                Display Options
              </label>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showFeaturedGames"
                  checked={gamesData.showFeaturedGames !== false}
                  onChange={(e) => handleUpdateSettings('showFeaturedGames', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showFeaturedGames" className="font-mono text-gray-600">
                  Show Featured Games Section
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showCategories"
                  checked={gamesData.showCategories !== false}
                  onChange={(e) => handleUpdateSettings('showCategories', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showCategories" className="font-mono text-gray-600">
                  Show Category Filters
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showSearch"
                  checked={gamesData.showSearch !== false}
                  onChange={(e) => handleUpdateSettings('showSearch', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showSearch" className="font-mono text-gray-600">
                  Show Search Bar
                </label>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-300">
              <h4 className="font-mono font-bold mb-2">Maintenance</h4>
              <Win95Button
                onClick={handleInitializeGames}
                className="px-4 py-2 font-mono bg-blue-100"
              >
                <RefreshCwIcon className="w-4 h-4 inline-block mr-2" />
                Initialize Default Games
              </Win95Button>
              <p className="text-xs text-gray-500 mt-2">
                This will add the default games (Reversi and Checkers) to the database if they don't exist.
                It will not overwrite any existing games.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save Status */}
      {saveStatus !== 'idle' && (
        <div className={`mt-4 p-2 rounded ${
          saveStatus === 'saving' ? 'bg-blue-100' :
          saveStatus === 'saved' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          {saveStatus === 'saving' && (
            <div className="flex items-center text-blue-600">
              <RefreshCwIcon className="w-5 h-5 animate-spin mr-2" />
              <span className="font-mono">Saving changes...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center text-green-600">
              <CheckIcon className="w-5 h-5 mr-2" />
              <span className="font-mono">Changes saved successfully!</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600">
              <AlertTriangleIcon className="w-5 h-5 mr-2" />
              <span className="font-mono">{saveError || 'Error saving changes'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
