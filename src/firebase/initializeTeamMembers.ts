import { ref, set, get } from 'firebase/database';
import { database } from './config';

// Function to initialize the team members section
export const initializeTeamMembers = async () => {
  try {
    console.log('Initializing team members section...');
    
    // Get the current about section
    const aboutRef = ref(database, 'about');
    const snapshot = await get(aboutRef);
    
    // Create a default team member
    const defaultTeamMember = {
      id: Date.now().toString(),
      name: 'Team Member',
      role: 'Role',
      image: 'https://via.placeholder.com/200?text=Team+Member'
    };
    
    if (snapshot.exists()) {
      // About section exists, check if it has team members
      const aboutData = snapshot.val();
      console.log('Current about data:', aboutData);
      
      if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers) || aboutData.teamMembers.length === 0) {
        // No team members, add a default one
        const updatedAbout = {
          ...aboutData,
          teamMembers: [defaultTeamMember]
        };
        
        await set(aboutRef, updatedAbout);
        console.log('Added default team member to existing about section:', updatedAbout);
        return true;
      } else {
        console.log('Team members already exist:', aboutData.teamMembers);
        return false;
      }
    } else {
      // About section doesn't exist, create it with a default team member
      const defaultAbout = {
        story: 'Our company story...',
        teamMembers: [defaultTeamMember]
      };
      
      await set(aboutRef, defaultAbout);
      console.log('Created new about section with default team member:', defaultAbout);
      return true;
    }
  } catch (error) {
    console.error('Error initializing team members:', error);
    return false;
  }
};

// Function to check if team members are initialized
export const checkTeamMembersInitialized = async () => {
  try {
    const aboutRef = ref(database, 'about');
    const snapshot = await get(aboutRef);
    
    if (snapshot.exists()) {
      const aboutData = snapshot.val();
      return aboutData.teamMembers && Array.isArray(aboutData.teamMembers) && aboutData.teamMembers.length > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking team members initialization:', error);
    return false;
  }
};
