import { ref, set, get } from 'firebase/database';
import { database } from './config';

// Default games data
const defaultGamesData = {
  games: [
    {
      id: 'reversi',
      name: 'Reversi',
      description: 'Classic Reversi/Othello game',
      icon: 'https://i.postimg.cc/7hbZhKjD/Chat.png',
      embedType: 'direct',
      embedUrl: 'https://playpager.com/embed/reversi/index.html',
      visible: true,
      order: 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    },
    {
      id: 'checkers',
      name: 'Checkers',
      description: 'Classic Checkers game',
      icon: 'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
      embedType: 'direct',
      embedUrl: 'https://playpager.com/embed/checkers/index.html',
      visible: true,
      order: 2,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ],
  showGames: true,
  title: 'Games',
  subtitle: 'Check out our collection of games',
  iconSize: 'medium' // Default icon size
};

// Function to initialize games data
export const initializeGamesData = async () => {
  try {
    console.log('Initializing games data...');

    // Check if games data already exists
    const gamesSnapshot = await get(ref(database, 'games'));

    if (!gamesSnapshot.exists()) {
      // If games data doesn't exist, initialize with default data
      await set(ref(database, 'games'), defaultGamesData);
      console.log('Games data initialized successfully');
    } else {
      console.log('Games data already exists');

      // Check if the games array exists and has items
      const gamesData = gamesSnapshot.val();
      if (!gamesData.games || !Array.isArray(gamesData.games) || gamesData.games.length === 0) {
        // If games array is missing or empty, update with default games
        // Preserve any existing settings like iconSize
        const updatedData = {
          ...defaultGamesData,
          ...gamesData,
          games: defaultGamesData.games // Always use the default games
        };
        await set(ref(database, 'games'), updatedData);
        console.log('Games data updated with default games');
      }

      // Ensure iconSize exists
      if (!gamesData.iconSize) {
        await set(ref(database, 'games/iconSize'), 'medium');
        console.log('Added default iconSize to games data');
      }
    }

    // Also update the games data in the toiral path
    const toiralGamesSnapshot = await get(ref(database, 'toiral/games'));

    if (!toiralGamesSnapshot.exists()) {
      // If toiral/games data doesn't exist, initialize with default data
      await set(ref(database, 'toiral/games'), defaultGamesData);
      console.log('Toiral games data initialized successfully');
    } else {
      console.log('Toiral games data already exists');

      // Check if the games array exists and has items
      const toiralGamesData = toiralGamesSnapshot.val();
      if (!toiralGamesData.games || !Array.isArray(toiralGamesData.games) || toiralGamesData.games.length === 0) {
        // If games array is missing or empty, update with default games
        // Preserve any existing settings like iconSize
        const updatedData = {
          ...defaultGamesData,
          ...toiralGamesData,
          games: defaultGamesData.games // Always use the default games
        };
        await set(ref(database, 'toiral/games'), updatedData);
        console.log('Toiral games data updated with default games');
      }

      // Ensure iconSize exists
      if (!toiralGamesData.iconSize) {
        await set(ref(database, 'toiral/games/iconSize'), 'medium');
        console.log('Added default iconSize to toiral games data');
      }
    }

    return true;
  } catch (error) {
    console.error('Error initializing games data:', error);
    return false;
  }
};
