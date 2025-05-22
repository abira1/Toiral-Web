import { ref, get } from 'firebase/database';
import { database } from '../firebase/config';

export async function getSitemapXml() {
  try {
    const sitemapRef = ref(database, 'seo/sitemapXml');
    const snapshot = await get(sitemapRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      // Default sitemap.xml if none exists in the database
      const currentDate = new Date().toISOString().split('T')[0];
      return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${window.location.origin}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    }
  } catch (error) {
    console.error('Error fetching sitemap.xml:', error);
    const currentDate = new Date().toISOString().split('T')[0];
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${window.location.origin}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
}
