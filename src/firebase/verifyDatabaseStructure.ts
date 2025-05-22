import { ref, get, set } from 'firebase/database';
import { database } from './config';

// Function to verify if a node exists in the database
const verifyNode = async (nodePath: string): Promise<boolean> => {
  try {
    const snapshot = await get(ref(database, nodePath));
    return snapshot.exists();
  } catch (error) {
    console.error(`Error verifying node ${nodePath}:`, error);
    return false;
  }
};

// Function to initialize a node if it doesn't exist
const initializeNode = async (nodePath: string): Promise<boolean> => {
  try {
    const exists = await verifyNode(nodePath);
    if (!exists) {
      await set(ref(database, nodePath), {
        status: "initialized",
        timestamp: Date.now()
      });
      console.log(`Node ${nodePath} initialized successfully`);
    } else {
      console.log(`Node ${nodePath} already exists`);
    }
    return true;
  } catch (error) {
    console.error(`Error initializing node ${nodePath}:`, error);
    return false;
  }
};

// Function to verify and initialize all required nodes
export const verifyAndInitializeDatabase = async (): Promise<{
  success: boolean;
  existingNodes: string[];
  initializedNodes: string[];
  failedNodes: string[];
}> => {
  const requiredNodes = [
    'toiral',
    'portfolio',
    'reviews',
    'contact',
    'bookings',
    'security',
    'profile',
    'theme',
    'pricing'
  ];

  const existingNodes: string[] = [];
  const initializedNodes: string[] = [];
  const failedNodes: string[] = [];

  console.log('Verifying database structure...');

  for (const node of requiredNodes) {
    const exists = await verifyNode(node);
    if (exists) {
      existingNodes.push(node);
    } else {
      const initialized = await initializeNode(node);
      if (initialized) {
        initializedNodes.push(node);
      } else {
        failedNodes.push(node);
      }
    }
  }

  const success = failedNodes.length === 0;

  return {
    success,
    existingNodes,
    initializedNodes,
    failedNodes
  };
};

// Function to log the current database structure
export const logDatabaseStructure = async (): Promise<void> => {
  try {
    const snapshot = await get(ref(database));
    console.log('Current database structure:', snapshot.val());
  } catch (error) {
    console.error('Error logging database structure:', error);
  }
};
