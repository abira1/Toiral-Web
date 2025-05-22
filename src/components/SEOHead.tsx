import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase/config';
import { useLocation } from 'react-router-dom';

interface MetaTag {
  id: string;
  name: string;
  content: string;
}

interface PageSpecificSEO {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  structuredData: string;
}

interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  canonicalUrl: string;
  structuredData: string;
  metaTags: MetaTag[];
  pageSpecificSEO?: {
    [key: string]: PageSpecificSEO;
  };
  coreWebVitals?: {
    enableLazyLoading: boolean;
    preloadCriticalAssets: boolean;
    optimizeImages: boolean;
    minimizeCLS: boolean;
    improveInteractivity: boolean;
  };
}

export function SEOHead() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Determine current section from URL
  const getCurrentSection = () => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    return section || 'home';
  };

  useEffect(() => {
    const seoRef = ref(database, 'seo');

    const unsubscribe = onValue(seoRef, (snapshot) => {
      setLoading(true);
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSeoSettings(data);
        }
      } catch (err) {
        console.error('Error loading SEO settings:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading || !seoSettings) {
    // Return minimal SEO during loading
    return (
      <Helmet>
        <title>Toiral Web Development</title>
        <meta name="description" content="Creating Tomorrow's Web, Today" />
      </Helmet>
    );
  }

  // Get current section
  const currentSection = getCurrentSection();

  // Get page-specific SEO if available
  const pageSpecificSEO = seoSettings.pageSpecificSEO &&
                          seoSettings.pageSpecificSEO[currentSection] ?
                          seoSettings.pageSpecificSEO[currentSection] : null;

  // Use page-specific SEO or fall back to global SEO
  const title = pageSpecificSEO?.title || seoSettings.title;
  const description = pageSpecificSEO?.description || seoSettings.description;
  const keywords = pageSpecificSEO?.keywords || seoSettings.keywords;
  const ogTitle = pageSpecificSEO?.ogTitle || seoSettings.ogTitle;
  const ogDescription = pageSpecificSEO?.ogDescription || seoSettings.ogDescription;
  const ogImage = pageSpecificSEO?.ogImage || seoSettings.ogImage;
  const canonicalUrl = pageSpecificSEO?.canonicalUrl || seoSettings.canonicalUrl;

  // Parse global structured data if it exists and is valid JSON
  let structuredData = null;
  if (seoSettings.structuredData) {
    try {
      structuredData = JSON.parse(seoSettings.structuredData);
    } catch (e) {
      console.error('Invalid global structured data JSON:', e);
    }
  }

  // Parse page-specific structured data if it exists
  let pageStructuredData = null;
  if (pageSpecificSEO?.structuredData) {
    try {
      pageStructuredData = JSON.parse(pageSpecificSEO.structuredData);
    } catch (e) {
      console.error('Invalid page-specific structured data JSON:', e);
    }
  }

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={window.location.href} />

      {/* Twitter */}
      {seoSettings.twitterCard && <meta name="twitter:card" content={seoSettings.twitterCard} />}
      {seoSettings.twitterTitle && <meta name="twitter:title" content={seoSettings.twitterTitle || ogTitle} />}
      {seoSettings.twitterDescription && <meta name="twitter:description" content={seoSettings.twitterDescription || ogDescription} />}
      {seoSettings.twitterImage && <meta name="twitter:image" content={seoSettings.twitterImage || ogImage} />}

      {/* Custom meta tags */}
      {seoSettings.metaTags && seoSettings.metaTags.map((tag) => (
        <meta key={tag.id} name={tag.name} content={tag.content} />
      ))}

      {/* Structured Data / JSON-LD - Global */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Structured Data / JSON-LD - Page Specific */}
      {pageStructuredData && (
        <script type="application/ld+json">
          {JSON.stringify(pageStructuredData)}
        </script>
      )}
    </Helmet>
  );
}
