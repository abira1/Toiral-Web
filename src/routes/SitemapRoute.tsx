import React, { useEffect, useState } from 'react';
import { getSitemapXml } from '../api/sitemap';

export default function SitemapRoute() {
  const [sitemapXml, setSitemapXml] = useState<string | null>(null);

  useEffect(() => {
    const fetchSitemapXml = async () => {
      const content = await getSitemapXml();
      setSitemapXml(content);

      // Set the content type to application/xml
      document.contentType = 'application/xml';

      // Create a download if needed
      if (window.location.pathname === '/sitemap.xml') {
        const blob = new Blob([content], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    fetchSitemapXml();
  }, []);

  if (!sitemapXml) {
    return <div>Loading sitemap.xml...</div>;
  }

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {sitemapXml}
    </pre>
  );
}
