import React, { useEffect, useState } from 'react';
import { getRobotsTxt } from '../api/robots';

export default function RobotsRoute() {
  const [robotsTxt, setRobotsTxt] = useState<string | null>(null);

  useEffect(() => {
    const fetchRobotsTxt = async () => {
      const content = await getRobotsTxt();
      setRobotsTxt(content);

      // Set the content type to text/plain
      document.contentType = 'text/plain';

      // Create a download if needed
      if (window.location.pathname === '/robots.txt') {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'robots.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };

    fetchRobotsTxt();
  }, []);

  if (!robotsTxt) {
    return <div>Loading robots.txt...</div>;
  }

  return (
    <pre style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
      {robotsTxt}
    </pre>
  );
}
