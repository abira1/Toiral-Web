import React, { useEffect } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../firebase/config';

// This component doesn't render anything visible
// It just adds a helper function to the window object
export function ConsoleTeamMembersHelper() {
  useEffect(() => {
    // Add the helper function to the window object
    (window as any).addTeamMember = async (name: string, role: string, imageUrl: string = 'https://via.placeholder.com/200?text=Team+Member') => {
      try {
        console.log('Adding team member:', { name, role, imageUrl });
        
        // Get current about data
        const snapshot = await get(ref(database, 'about'));
        let aboutData = snapshot.exists() ? snapshot.val() : { story: 'Our company story...' };
        
        // Create a new team member
        const newMember = {
          id: Date.now().toString(),
          name: name,
          role: role,
          image: imageUrl
        };
        
        // Update team members array
        if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers)) {
          aboutData.teamMembers = [newMember];
        } else {
          aboutData.teamMembers.push(newMember);
        }
        
        // Save to Firebase
        await set(ref(database, 'about'), aboutData);
        
        console.log('Team member added successfully!');
        alert('Team member added successfully! Refresh the page to see changes.');
        
        return true;
      } catch (error) {
        console.error('Error adding team member:', error);
        alert('Error adding team member: ' + (error as Error).message);
        return false;
      }
    };
    
    // Add a helper function to list all team members
    (window as any).listTeamMembers = async () => {
      try {
        const snapshot = await get(ref(database, 'about'));
        if (snapshot.exists()) {
          const aboutData = snapshot.val();
          if (aboutData.teamMembers && Array.isArray(aboutData.teamMembers)) {
            console.table(aboutData.teamMembers);
            return aboutData.teamMembers;
          } else {
            console.log('No team members found');
            return [];
          }
        } else {
          console.log('About section not found');
          return null;
        }
      } catch (error) {
        console.error('Error listing team members:', error);
        return null;
      }
    };
    
    // Add a helper function to remove a team member
    (window as any).removeTeamMember = async (id: string) => {
      try {
        // Get current about data
        const snapshot = await get(ref(database, 'about'));
        if (!snapshot.exists()) {
          console.error('About section not found');
          return false;
        }
        
        const aboutData = snapshot.val();
        
        // Remove team member from array
        if (!aboutData.teamMembers || !Array.isArray(aboutData.teamMembers)) {
          console.error('No team members found');
          return false;
        }
        
        const initialLength = aboutData.teamMembers.length;
        aboutData.teamMembers = aboutData.teamMembers.filter((member: any) => member.id !== id);
        
        if (aboutData.teamMembers.length === initialLength) {
          console.error('Team member not found with ID:', id);
          return false;
        }
        
        // Save to Firebase
        await set(ref(database, 'about'), aboutData);
        
        console.log('Team member removed successfully!');
        alert('Team member removed successfully! Refresh the page to see changes.');
        
        return true;
      } catch (error) {
        console.error('Error removing team member:', error);
        return false;
      }
    };
    
    // Log instructions to the console
    console.log('%c Team Members Helper Functions', 'font-size: 20px; font-weight: bold; color: blue;');
    console.log('%c Use these functions to manage team members directly from the console:', 'font-size: 14px; color: green;');
    console.log('%c 1. addTeamMember(name, role, imageUrl)', 'font-size: 14px;');
    console.log('%c    Example: addTeamMember("John Doe", "Developer", "https://via.placeholder.com/200")', 'font-size: 14px;');
    console.log('%c 2. listTeamMembers()', 'font-size: 14px;');
    console.log('%c 3. removeTeamMember(id)', 'font-size: 14px;');
    console.log('%c    Example: removeTeamMember("1234567890")', 'font-size: 14px;');
    
    return () => {
      // Clean up when component unmounts
      delete (window as any).addTeamMember;
      delete (window as any).listTeamMembers;
      delete (window as any).removeTeamMember;
    };
  }, []);
  
  return null; // This component doesn't render anything
}
