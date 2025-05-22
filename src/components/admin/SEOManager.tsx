import React, { useState, useEffect } from 'react';
import { Win95Button } from '../Win95Button';
import { database } from '../../firebase/config';
import { ref, onValue, set } from 'firebase/database';
import { SearchIcon, SaveIcon, PlusIcon, TrashIcon, CheckIcon, AlertTriangleIcon, RefreshCwIcon } from 'lucide-react';

// Define types for SEO data
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
  robotsTxt: string;
  sitemapXml: string;
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

export function SEOManager() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    title: 'Toiral Web Development | Creating Tomorrow\'s Web, Today',
    description: 'Professional web development services with unique design aesthetics. Get custom websites, responsive design, and modern functionality for your business needs.',
    keywords: 'web development, custom websites, responsive design, Toiral, web services',
    ogTitle: 'Toiral Web - Innovative Web Development Solutions',
    ogDescription: 'Discover Toiral\'s unique approach to web development. Custom websites with modern functionality and distinctive design aesthetics.',
    ogImage: 'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Toiral Web | Creating Tomorrow\'s Web, Today',
    twitterDescription: 'Professional web development with a unique approach. Custom websites, responsive design, and modern functionality.',
    twitterImage: 'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
    canonicalUrl: 'https://toiral-development.web.app/',
    structuredData: '{"@context":"https://schema.org","@type":"Organization","name":"Toiral Web Development","url":"https://toiral-development.web.app/","logo":"https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png","description":"Toiral offers professional web development services with unique design aesthetics. Get custom websites, responsive design, and modern functionality.","contactPoint":{"@type":"ContactPoint","telephone":"+880 1804-673095","contactType":"customer service","email":"contract.toiral@gmail.com"},"sameAs":["https://toiral-development.web.app/"],"address":{"@type":"PostalAddress","addressCountry":"Bangladesh"},"offers":{"@type":"AggregateOffer","priceCurrency":"USD","highPrice":"5000","lowPrice":"500","offerCount":"3","offers":[{"@type":"Offer","name":"Basic Website Package","description":"Custom website with responsive design","price":"500","priceCurrency":"USD"},{"@type":"Offer","name":"Business Website Package","description":"Advanced website with CMS and custom features","price":"1500","priceCurrency":"USD"},{"@type":"Offer","name":"Enterprise Solution","description":"Complete web solution with advanced features and integrations","price":"5000","priceCurrency":"USD"}]}}',
    metaTags: [
      {
        id: 'viewport',
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
      },
      {
        id: 'author',
        name: 'author',
        content: 'Toiral Web Development'
      },
      {
        id: 'robots',
        name: 'robots',
        content: 'index, follow'
      },
      {
        id: 'googlebot',
        name: 'googlebot',
        content: 'index, follow'
      },
      {
        id: 'revisit-after',
        name: 'revisit-after',
        content: '7 days'
      }
    ],
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /login/\nDisallow: /not-found/\nDisallow: /reset-theme/\nDisallow: /add-pricing/\nDisallow: /test-ads/\nDisallow: /team-members/\nDisallow: /notifications/\n\nSitemap: https://toiral-development.web.app/sitemap.xml',
    sitemapXml: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://toiral-development.web.app/</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=about</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=portfolio</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=reviews</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=contact</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=book</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=pricing</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=community</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n  <url>\n    <loc>https://toiral-development.web.app/?section=games</loc>\n    <lastmod>2024-07-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n</urlset>',
    pageSpecificSEO: {
      home: {
        title: 'Toiral Web Development | Creating Tomorrow\'s Web, Today',
        description: 'Professional web development services with unique design aesthetics. Get custom websites, responsive design, and modern functionality for your business needs.',
        keywords: 'web development, custom websites, responsive design, Toiral, web services',
        ogTitle: 'Toiral Web - Innovative Web Development Solutions',
        ogDescription: 'Discover Toiral\'s unique approach to web development. Custom websites with modern functionality and distinctive design aesthetics.',
        ogImage: 'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
        canonicalUrl: 'https://toiral-development.web.app/',
        structuredData: '{"@context":"https://schema.org","@type":"WebSite","name":"Toiral Web Development","url":"https://toiral-development.web.app/","potentialAction":{"@type":"SearchAction","target":"https://toiral-development.web.app/?search={search_term_string}","query-input":"required name=search_term_string"}}'
      },
      about: {
        title: 'Web Development Services | Custom Solutions by Toiral',
        description: 'Explore our comprehensive web development services including custom website design, responsive development, e-commerce solutions, and admin panel creation.',
        keywords: 'web services, custom websites, responsive design, e-commerce, admin panels',
        ogTitle: 'Professional Web Development Services | Toiral',
        ogDescription: 'From simple websites to complex web applications, our services cover all your web development needs with quality and attention to detail.',
        ogImage: 'https://i.postimg.cc/15k3RcBh/Portfolio.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=about',
        structuredData: '{"@context":"https://schema.org","@type":"Service","serviceType":"Web Development","provider":{"@type":"Organization","name":"Toiral Web Development","url":"https://toiral-development.web.app/"},"description":"Professional web development services including custom website design, responsive development, e-commerce solutions, and admin panel creation.","offers":{"@type":"AggregateOffer","priceCurrency":"USD","lowPrice":"500","highPrice":"5000"}}'
      },
      portfolio: {
        title: 'Web Development Portfolio | Toiral Projects Showcase',
        description: 'Browse our portfolio of successful web development projects. See how we blend modern functionality with distinctive design for unique, effective websites.',
        keywords: 'web portfolio, development projects, website examples, design examples, case studies',
        ogTitle: 'Our Work | Toiral Web Development Portfolio',
        ogDescription: 'Explore our diverse portfolio of web projects. Each website showcases our commitment to quality, functionality, and distinctive design.',
        ogImage: 'https://i.postimg.cc/15k3RcBh/Portfolio.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=portfolio',
        structuredData: '{"@context":"https://schema.org","@type":"ItemList","itemListElement":[{"@type":"ListItem","position":1,"item":{"@type":"CreativeWork","name":"E-commerce Platform","description":"Modern shopping experience with distinctive aesthetics","image":"https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300","url":"https://toiral-development.web.app/?section=portfolio"}}]}'
      },
      contact: {
        title: 'Contact Toiral | Web Development Inquiries',
        description: 'Get in touch with Toiral for your web development needs. Request a quote, schedule a consultation, or ask questions about our services.',
        keywords: 'contact web developer, development quote, website consultation, hire web developer',
        ogTitle: 'Contact Us | Toiral Web Development',
        ogDescription: 'Have a project in mind? Get in touch with our team to discuss your web development needs and how we can help bring your vision to life.',
        ogImage: 'https://i.postimg.cc/RCb0yzn0/Contact.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=contact',
        structuredData: '{"@context":"https://schema.org","@type":"ContactPage","name":"Contact Toiral Web Development","description":"Get in touch with Toiral for your web development needs.","mainEntity":{"@type":"Organization","name":"Toiral Web Development","telephone":"+880 1804-673095","email":"contract.toiral@gmail.com","contactPoint":{"@type":"ContactPoint","telephone":"+880 1804-673095","contactType":"customer service","email":"contract.toiral@gmail.com","availableLanguage":["English"]}}}'
      },
      pricing: {
        title: 'Web Development Pricing | Toiral Service Packages',
        description: 'Explore our transparent pricing for web development services. Choose from various packages designed to meet different business needs and budgets.',
        keywords: 'web development pricing, website packages, affordable web design, custom website cost',
        ogTitle: 'Affordable Web Development Pricing | Toiral',
        ogDescription: 'Find the perfect web development package for your business. Transparent pricing with no hidden fees and excellent value for your investment.',
        ogImage: 'https://i.postimg.cc/Kz9zZLJV/dollar-sign.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=pricing',
        structuredData: '{"@context":"https://schema.org","@type":"Product","name":"Toiral Web Development Services","description":"Professional web development services with various pricing options","offers":{"@type":"AggregateOffer","priceCurrency":"USD","lowPrice":"500","highPrice":"5000","offerCount":"3"}}'
      },
      book: {
        title: 'Book a Consultation | Toiral Web Development',
        description: 'Schedule a free consultation with our web development experts. Discuss your project requirements and get professional advice on the best solutions.',
        keywords: 'book web developer, consultation, project discussion, web development meeting',
        ogTitle: 'Book Your Free Web Development Consultation | Toiral',
        ogDescription: 'Take the first step toward your new website. Schedule a consultation with our experts to discuss your project needs and goals.',
        ogImage: 'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=book',
        structuredData: '{"@context":"https://schema.org","@type":"Service","serviceType":"Consultation","provider":{"@type":"Organization","name":"Toiral Web Development"},"description":"Free web development consultation to discuss your project requirements","offers":{"@type":"Offer","price":"0","priceCurrency":"USD"}}'
      },
      reviews: {
        title: 'Client Reviews & Testimonials | Toiral Web Development',
        description: 'Read what our clients say about our web development services. Authentic testimonials from businesses that have experienced our quality work and service.',
        keywords: 'web development reviews, client testimonials, customer feedback, service quality',
        ogTitle: 'Client Success Stories | Toiral Web Development',
        ogDescription: 'Don\'t just take our word for it. Read authentic reviews from our clients about their experience working with Toiral Web Development.',
        ogImage: 'https://i.postimg.cc/cLf4vgkK/Review.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=reviews',
        structuredData: '{"@context":"https://schema.org","@type":"Review","itemReviewed":{"@type":"Organization","name":"Toiral Web Development"},"author":{"@type":"Person","name":"Client"},"reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"}}'
      },
      community: {
        title: 'Join Our Web Development Community | Toiral',
        description: 'Connect with fellow web enthusiasts in our community. Share ideas, get support, and stay updated on the latest web development trends and techniques.',
        keywords: 'web development community, developer network, coding forum, web design community',
        ogTitle: 'Toiral Web Development Community | Connect & Learn',
        ogDescription: 'Join our growing community of web developers and enthusiasts. Share knowledge, get support, and collaborate on exciting web projects.',
        ogImage: '/assets/images/community.png',
        canonicalUrl: 'https://toiral-development.web.app/?section=community',
        structuredData: '{"@context":"https://schema.org","@type":"DiscussionForumPosting","headline":"Join the Toiral Web Development Community","description":"Connect with fellow web enthusiasts in our community. Share ideas, get support, and stay updated on the latest trends."}'
      }
    },
    coreWebVitals: {
      enableLazyLoading: true,
      preloadCriticalAssets: true,
      optimizeImages: true,
      minimizeCLS: true,
      improveInteractivity: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'social' | 'advanced' | 'pages' | 'performance'>('basic');
  const [newMetaTag, setNewMetaTag] = useState<{ name: string; content: string }>({ name: '', content: '' });

  // Load SEO settings from Firebase
  useEffect(() => {
    const seoRef = ref(database, 'seo');

    const unsubscribe = onValue(seoRef, (snapshot) => {
      setLoading(true);
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSeoSettings(data);
        } else {
          // Initialize with default data if none exists
          set(seoRef, seoSettings);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading SEO settings:', err);
        setError('Failed to load SEO settings');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save SEO settings to Firebase
  const handleSave = async () => {
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await set(ref(database, 'seo'), seoSettings);
      setSuccess('SEO settings saved successfully');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving SEO settings:', err);
      setError('Failed to save SEO settings');
    } finally {
      setSaving(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof SEOSettings, value: string) => {
    setSeoSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add new meta tag
  const handleAddMetaTag = () => {
    if (!newMetaTag.name || !newMetaTag.content) return;

    const newTag: MetaTag = {
      id: Date.now().toString(),
      name: newMetaTag.name,
      content: newMetaTag.content
    };

    setSeoSettings(prev => ({
      ...prev,
      metaTags: prev.metaTags && Array.isArray(prev.metaTags) ? [...prev.metaTags, newTag] : [newTag]
    }));

    // Reset form
    setNewMetaTag({ name: '', content: '' });
  };

  // Remove meta tag
  const handleRemoveMetaTag = (id: string) => {
    setSeoSettings(prev => ({
      ...prev,
      metaTags: prev.metaTags && Array.isArray(prev.metaTags)
        ? prev.metaTags.filter(tag => tag.id !== id)
        : []
    }));
  };

  // Generate meta tags preview
  const generateMetaTagsPreview = () => {
    let preview = `<title>${seoSettings.title}</title>\n`;
    preview += `<meta name="description" content="${seoSettings.description}" />\n`;

    if (seoSettings.keywords) {
      preview += `<meta name="keywords" content="${seoSettings.keywords}" />\n`;
    }

    // Open Graph tags
    if (seoSettings.ogTitle) {
      preview += `<meta property="og:title" content="${seoSettings.ogTitle}" />\n`;
    }

    if (seoSettings.ogDescription) {
      preview += `<meta property="og:description" content="${seoSettings.ogDescription}" />\n`;
    }

    if (seoSettings.ogImage) {
      preview += `<meta property="og:image" content="${seoSettings.ogImage}" />\n`;
    }

    // Twitter tags
    if (seoSettings.twitterCard) {
      preview += `<meta name="twitter:card" content="${seoSettings.twitterCard}" />\n`;
    }

    if (seoSettings.twitterTitle) {
      preview += `<meta name="twitter:title" content="${seoSettings.twitterTitle}" />\n`;
    }

    if (seoSettings.twitterDescription) {
      preview += `<meta name="twitter:description" content="${seoSettings.twitterDescription}" />\n`;
    }

    if (seoSettings.twitterImage) {
      preview += `<meta name="twitter:image" content="${seoSettings.twitterImage}" />\n`;
    }

    // Canonical URL
    if (seoSettings.canonicalUrl) {
      preview += `<link rel="canonical" href="${seoSettings.canonicalUrl}" />\n`;
    }

    // Custom meta tags
    if (seoSettings.metaTags && Array.isArray(seoSettings.metaTags)) {
      seoSettings.metaTags.forEach(tag => {
        preview += `<meta name="${tag.name}" content="${tag.content}" />\n`;
      });
    }

    return preview;
  };

  if (loading && !seoSettings) {
    return (
      <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600 font-mono">Loading SEO settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border-2 border-gray-400 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono flex items-center">
          <SearchIcon className="w-5 h-5 mr-2" />
          SEO Manager
        </h2>
        <Win95Button
          onClick={handleSave}
          className="px-4 py-2 font-mono flex items-center"
          disabled={saving}
        >
          {saving ? (
            <>
              <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Win95Button>
      </div>

      {error && (
        <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700 flex items-center">
          <AlertTriangleIcon className="w-5 h-5 mr-2" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-2 border-green-400 p-3 mb-4 font-mono text-green-700 flex items-center">
          <CheckIcon className="w-5 h-5 mr-2" />
          <p>{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap mb-4 border-b border-gray-300">
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'basic' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic SEO
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'social' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('social')}
        >
          Social Media
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'advanced' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'pages' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('pages')}
        >
          Page-Specific SEO
        </button>
        <button
          className={`px-4 py-2 font-mono ${activeTab === 'performance' ? 'bg-blue-100 border-2 border-b-0 border-gray-300' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
      </div>

      {/* Basic SEO Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-mono">Page Title</label>
            <input
              type="text"
              value={seoSettings.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter page title"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended length: 50-60 characters. Current: {seoSettings.title ? seoSettings.title.length : 0}
            </p>
          </div>

          <div>
            <label className="block mb-1 font-mono">Meta Description</label>
            <textarea
              value={seoSettings.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              rows={3}
              placeholder="Enter meta description"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended length: 150-160 characters. Current: {seoSettings.description ? seoSettings.description.length : 0}
            </p>
          </div>

          <div>
            <label className="block mb-1 font-mono">Keywords</label>
            <input
              type="text"
              value={seoSettings.keywords || ''}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="Enter keywords separated by commas"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: web development, design, retro, windows 95
            </p>
          </div>

          <div>
            <label className="block mb-1 font-mono">Canonical URL</label>
            <input
              type="text"
              value={seoSettings.canonicalUrl || ''}
              onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              placeholder="https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              The preferred URL for this page to avoid duplicate content issues
            </p>
          </div>

          <div>
            <h3 className="font-mono font-bold mb-2">Custom Meta Tags</h3>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newMetaTag.name}
                onChange={(e) => setNewMetaTag({ ...newMetaTag, name: e.target.value })}
                className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Meta name"
              />
              <input
                type="text"
                value={newMetaTag.content}
                onChange={(e) => setNewMetaTag({ ...newMetaTag, content: e.target.value })}
                className="flex-1 p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                placeholder="Content"
              />
              <Win95Button
                onClick={handleAddMetaTag}
                className="px-3 py-1 font-mono"
                disabled={!newMetaTag.name || !newMetaTag.content}
              >
                <PlusIcon className="w-4 h-4" />
              </Win95Button>
            </div>

            <div className="border-2 border-gray-300 max-h-40 overflow-y-auto">
              {seoSettings.metaTags && seoSettings.metaTags.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left font-mono">Name</th>
                      <th className="p-2 text-left font-mono">Content</th>
                      <th className="p-2 text-center font-mono w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {seoSettings.metaTags.map((tag) => (
                      <tr key={tag.id} className="border-t border-gray-300">
                        <td className="p-2 font-mono">{tag.name}</td>
                        <td className="p-2 font-mono">{tag.content}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleRemoveMetaTag(tag.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-4 text-center text-gray-500 font-mono">
                  No custom meta tags added
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Social Media Tab */}
      {activeTab === 'social' && (
        <div className="space-y-4">
          <div className="mb-6">
            <h3 className="font-mono font-bold mb-2">Open Graph (Facebook, LinkedIn)</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-mono">OG Title</label>
                <input
                  type="text"
                  value={seoSettings.ogTitle || ''}
                  onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Enter Open Graph title"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono">OG Description</label>
                <textarea
                  value={seoSettings.ogDescription || ''}
                  onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={2}
                  placeholder="Enter Open Graph description"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono">OG Image URL</label>
                <input
                  type="text"
                  value={seoSettings.ogImage || ''}
                  onChange={(e) => handleInputChange('ogImage', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200 x 630 pixels
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-mono font-bold mb-2">Twitter Card</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-mono">Card Type</label>
                <select
                  value={seoSettings.twitterCard || 'summary_large_image'}
                  onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                >
                  <option value="summary">Summary</option>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="app">App</option>
                  <option value="player">Player</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 font-mono">Twitter Title</label>
                <input
                  type="text"
                  value={seoSettings.twitterTitle || ''}
                  onChange={(e) => handleInputChange('twitterTitle', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Enter Twitter title"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono">Twitter Description</label>
                <textarea
                  value={seoSettings.twitterDescription || ''}
                  onChange={(e) => handleInputChange('twitterDescription', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={2}
                  placeholder="Enter Twitter description"
                />
              </div>

              <div>
                <label className="block mb-1 font-mono">Twitter Image URL</label>
                <input
                  type="text"
                  value={seoSettings.twitterImage || ''}
                  onChange={(e) => handleInputChange('twitterImage', e.target.value)}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended size: 1200 x 675 pixels
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Tab */}
      {activeTab === 'advanced' && (
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-mono">Structured Data (JSON-LD)</label>
            <textarea
              value={seoSettings.structuredData || '{}'}
              onChange={(e) => handleInputChange('structuredData', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              rows={8}
              placeholder='{"@context":"https://schema.org","@type":"Organization","name":"Toiral","url":"https://example.com"}'
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON-LD format for structured data (Schema.org)
            </p>
          </div>

          <div>
            <label className="block mb-1 font-mono">robots.txt</label>
            <textarea
              value={seoSettings.robotsTxt || 'User-agent: *\nAllow: /'}
              onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="block mb-1 font-mono">sitemap.xml</label>
            <textarea
              value={seoSettings.sitemapXml || '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://example.com/</loc>\n    <lastmod>2023-01-01</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n</urlset>'}
              onChange={(e) => handleInputChange('sitemapXml', e.target.value)}
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              rows={8}
            />
          </div>
        </div>
      )}

      {/* Page-Specific SEO Tab */}
      {activeTab === 'pages' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 border-2 border-blue-200 mb-4">
            <p className="font-mono text-sm">
              Configure SEO settings for specific pages/sections of your website. These settings will override the global settings when a user visits the specific page.
            </p>
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-mono">Select Page/Section</label>
            <select
              className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
              onChange={(e) => {
                // This is just for UI selection, not changing the actual data
                const selectedPage = e.target.value;
                document.getElementById(`page-section-${selectedPage}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <option value="">-- Select a page --</option>
              <option value="home">Home</option>
              <option value="about">About/Services</option>
              <option value="portfolio">Portfolio</option>
              <option value="contact">Contact</option>
              <option value="pricing">Pricing</option>
              <option value="book">Book Appointment</option>
              <option value="reviews">Reviews</option>
              <option value="community">Community</option>
            </select>
          </div>

          {/* Home Page SEO */}
          <div id="page-section-home" className="border-2 border-gray-300 p-4 mb-6">
            <h3 className="font-mono font-bold mb-3 text-lg">Home Page SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-mono">Title</label>
                <input
                  type="text"
                  value={seoSettings.pageSpecificSEO?.home?.title || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.home) updatedSettings.pageSpecificSEO.home = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.home.title = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Home page title"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Description</label>
                <textarea
                  value={seoSettings.pageSpecificSEO?.home?.description || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.home) updatedSettings.pageSpecificSEO.home = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.home.description = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={2}
                  placeholder="Home page description"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Keywords</label>
                <input
                  type="text"
                  value={seoSettings.pageSpecificSEO?.home?.keywords || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.home) updatedSettings.pageSpecificSEO.home = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.home.keywords = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="Home page keywords"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Canonical URL</label>
                <input
                  type="text"
                  value={seoSettings.pageSpecificSEO?.home?.canonicalUrl || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.home) updatedSettings.pageSpecificSEO.home = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.home.canonicalUrl = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="https://toiral-development.web.app/"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Structured Data (JSON-LD)</label>
                <textarea
                  value={seoSettings.pageSpecificSEO?.home?.structuredData || '{}'}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.home) updatedSettings.pageSpecificSEO.home = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.home.structuredData = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={4}
                  placeholder='{"@context":"https://schema.org","@type":"WebSite"}'
                />
              </div>
            </div>
          </div>

          {/* About/Services Page SEO */}
          <div id="page-section-about" className="border-2 border-gray-300 p-4 mb-6">
            <h3 className="font-mono font-bold mb-3 text-lg">About/Services Page SEO</h3>
            <div className="space-y-3">
              <div>
                <label className="block mb-1 font-mono">Title</label>
                <input
                  type="text"
                  value={seoSettings.pageSpecificSEO?.about?.title || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.about) updatedSettings.pageSpecificSEO.about = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.about.title = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="About/Services page title"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Description</label>
                <textarea
                  value={seoSettings.pageSpecificSEO?.about?.description || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.about) updatedSettings.pageSpecificSEO.about = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.about.description = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={2}
                  placeholder="About/Services page description"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Keywords</label>
                <input
                  type="text"
                  value={seoSettings.pageSpecificSEO?.about?.keywords || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.about) updatedSettings.pageSpecificSEO.about = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.about.keywords = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="About/Services page keywords"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Canonical URL</label>
                <input
                  type="text"
                  value={seoSettings.pageSpecificSEO?.about?.canonicalUrl || ''}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.about) updatedSettings.pageSpecificSEO.about = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.about.canonicalUrl = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800"
                  placeholder="https://toiral-development.web.app/?section=about"
                />
              </div>
              <div>
                <label className="block mb-1 font-mono">Structured Data (JSON-LD)</label>
                <textarea
                  value={seoSettings.pageSpecificSEO?.about?.structuredData || '{}'}
                  onChange={(e) => {
                    const updatedSettings = { ...seoSettings };
                    if (!updatedSettings.pageSpecificSEO) updatedSettings.pageSpecificSEO = {};
                    if (!updatedSettings.pageSpecificSEO.about) updatedSettings.pageSpecificSEO.about = {} as PageSpecificSEO;
                    updatedSettings.pageSpecificSEO.about.structuredData = e.target.value;
                    setSeoSettings(updatedSettings);
                  }}
                  className="w-full p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
                  rows={4}
                  placeholder='{"@context":"https://schema.org","@type":"Service"}'
                />
              </div>
            </div>
          </div>

          {/* Add more page sections as needed */}
          <div className="text-center p-4 border-2 border-dashed border-gray-300">
            <p className="font-mono text-gray-500">
              Configure other pages in the SEO Manager to optimize each section of your website.
            </p>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 border-2 border-blue-200 mb-4">
            <p className="font-mono text-sm">
              Optimize your website's Core Web Vitals and performance metrics. These settings help improve user experience and search engine rankings.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enableLazyLoading"
                checked={seoSettings.coreWebVitals?.enableLazyLoading || false}
                onChange={(e) => {
                  const updatedSettings = { ...seoSettings };
                  if (!updatedSettings.coreWebVitals) updatedSettings.coreWebVitals = {
                    enableLazyLoading: false,
                    preloadCriticalAssets: false,
                    optimizeImages: false,
                    minimizeCLS: false,
                    improveInteractivity: false
                  };
                  updatedSettings.coreWebVitals.enableLazyLoading = e.target.checked;
                  setSeoSettings(updatedSettings);
                }}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="enableLazyLoading" className="font-mono">Enable Lazy Loading</label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Load images and other resources only when they enter the viewport to improve initial page load time.
            </p>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="preloadCriticalAssets"
                checked={seoSettings.coreWebVitals?.preloadCriticalAssets || false}
                onChange={(e) => {
                  const updatedSettings = { ...seoSettings };
                  if (!updatedSettings.coreWebVitals) updatedSettings.coreWebVitals = {
                    enableLazyLoading: false,
                    preloadCriticalAssets: false,
                    optimizeImages: false,
                    minimizeCLS: false,
                    improveInteractivity: false
                  };
                  updatedSettings.coreWebVitals.preloadCriticalAssets = e.target.checked;
                  setSeoSettings(updatedSettings);
                }}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="preloadCriticalAssets" className="font-mono">Preload Critical Assets</label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Preload essential resources to improve Largest Contentful Paint (LCP) metrics.
            </p>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="optimizeImages"
                checked={seoSettings.coreWebVitals?.optimizeImages || false}
                onChange={(e) => {
                  const updatedSettings = { ...seoSettings };
                  if (!updatedSettings.coreWebVitals) updatedSettings.coreWebVitals = {
                    enableLazyLoading: false,
                    preloadCriticalAssets: false,
                    optimizeImages: false,
                    minimizeCLS: false,
                    improveInteractivity: false
                  };
                  updatedSettings.coreWebVitals.optimizeImages = e.target.checked;
                  setSeoSettings(updatedSettings);
                }}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="optimizeImages" className="font-mono">Optimize Images</label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Apply blur-to-clear loading effect and optimize image formats for better performance.
            </p>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="minimizeCLS"
                checked={seoSettings.coreWebVitals?.minimizeCLS || false}
                onChange={(e) => {
                  const updatedSettings = { ...seoSettings };
                  if (!updatedSettings.coreWebVitals) updatedSettings.coreWebVitals = {
                    enableLazyLoading: false,
                    preloadCriticalAssets: false,
                    optimizeImages: false,
                    minimizeCLS: false,
                    improveInteractivity: false
                  };
                  updatedSettings.coreWebVitals.minimizeCLS = e.target.checked;
                  setSeoSettings(updatedSettings);
                }}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="minimizeCLS" className="font-mono">Minimize Layout Shifts</label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Reduce Cumulative Layout Shift (CLS) by reserving space for dynamic content.
            </p>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="improveInteractivity"
                checked={seoSettings.coreWebVitals?.improveInteractivity || false}
                onChange={(e) => {
                  const updatedSettings = { ...seoSettings };
                  if (!updatedSettings.coreWebVitals) updatedSettings.coreWebVitals = {
                    enableLazyLoading: false,
                    preloadCriticalAssets: false,
                    optimizeImages: false,
                    minimizeCLS: false,
                    improveInteractivity: false
                  };
                  updatedSettings.coreWebVitals.improveInteractivity = e.target.checked;
                  setSeoSettings(updatedSettings);
                }}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor="improveInteractivity" className="font-mono">Improve Interactivity</label>
            </div>
            <p className="text-xs text-gray-500 ml-7">
              Optimize First Input Delay (FID) by minimizing main thread work and optimizing JavaScript execution.
            </p>
          </div>

          <div className="mt-6 p-4 border-2 border-gray-300 bg-gray-50">
            <h3 className="font-mono font-bold mb-2">Performance Recommendations</h3>
            <ul className="list-disc ml-5 space-y-1 text-sm">
              <li>Use WebP image format with fallbacks for better compression</li>
              <li>Implement responsive images with srcset attributes</li>
              <li>Set explicit width and height on images to prevent layout shifts</li>
              <li>Minimize third-party scripts or load them asynchronously</li>
              <li>Use font-display: swap for text visibility during font loading</li>
              <li>Implement code splitting for large JavaScript bundles</li>
            </ul>
          </div>
        </div>
      )}

      {/* Meta Tags Preview */}
      <div className="mt-6">
        <h3 className="font-mono font-bold mb-2">Meta Tags Preview</h3>
        <div className="bg-gray-100 p-3 border-2 border-gray-300 overflow-x-auto">
          <pre className="font-mono text-sm">{generateMetaTagsPreview()}</pre>
        </div>
      </div>

      {/* Implementation Instructions */}
      <div className="mt-6 bg-blue-50 p-4 border-2 border-blue-200 font-mono text-sm">
        <h3 className="font-bold mb-2">Implementation Instructions</h3>
        <p>Your SEO settings are automatically applied through the SEOHead component in App.tsx.</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1">
          <li>Global SEO settings apply to all pages</li>
          <li>Page-specific SEO settings override global settings for each section</li>
          <li>Core Web Vitals settings can be enabled/disabled in the Performance tab</li>
          <li>robots.txt and sitemap.xml are served through dedicated routes</li>
          <li>Test your SEO with <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google's Rich Results Test</a></li>
        </ol>
      </div>
    </div>
  );
}
