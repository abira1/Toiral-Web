import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';

export async function getRobotsTxt() {
  try {
    const robotsRef = ref(database, 'seo/robotsTxt');
    const snapshot = await get(robotsRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Default robots.txt if none exists in the database
      return `User-agent: *
Allow: /
Sitemap: ${window.location.origin}/sitemap.xml`;
    }
  } catch (error) {
    console.error('Error fetching robots.txt:', error);
    return `User-agent: *
Allow: /`;
  }
}
