# SEO Optimization Guide for Toiral Web

This guide will help you optimize your website's SEO using the new SEO Manager in the admin panel.

## Basic SEO Settings

### Page Title
- **Current Recommendation**: 50-60 characters
- **Best Practices**:
  - Include your primary keyword near the beginning
  - Make it compelling and descriptive
  - Include your brand name (e.g., "Web Development Services | Toiral")
  - Each page should have a unique title

### Meta Description
- **Current Recommendation**: 150-160 characters
- **Best Practices**:
  - Summarize the page content clearly
  - Include primary and secondary keywords naturally
  - Add a call-to-action when appropriate
  - Make it compelling to increase click-through rates

### Keywords
- **Best Practices**:
  - Include 3-5 relevant keywords separated by commas
  - Focus on long-tail keywords (more specific phrases)
  - Research keywords using tools like Google Keyword Planner
  - Example: "web development, responsive design, custom websites, business websites"

### Canonical URL
- **Purpose**: Prevents duplicate content issues
- **Format**: Should be the full URL of the page (e.g., "https://toiral.web.app/")

## Social Media Optimization

### Open Graph (Facebook, LinkedIn)
- **OG Title**: Similar to your page title but can be more engaging for social media
- **OG Description**: Similar to meta description but tailored for social sharing
- **OG Image**: 1200 x 630 pixels, high-quality image that represents your content

### Twitter Card
- **Card Type**: Usually "summary_large_image" for websites
- **Twitter Title**: Similar to OG Title
- **Twitter Description**: Similar to OG Description
- **Twitter Image**: 1200 x 675 pixels, high-quality image

## Advanced SEO

### Structured Data (JSON-LD)
- **Purpose**: Helps search engines understand your content better
- **Examples**:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Toiral Web Development",
    "url": "https://toiral.web.app/",
    "logo": "https://toiral.web.app/toiral.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+880 1804-673095",
      "contactType": "customer service"
    }
  }
  ```

### robots.txt
- **Purpose**: Tells search engines which pages to crawl
- **Basic Example**:
  ```
  User-agent: *
  Allow: /
  Disallow: /admin/
  Sitemap: https://toiral.web.app/sitemap.xml
  ```

### sitemap.xml
- **Purpose**: Helps search engines discover all your pages
- **Basic Structure**:
  ```xml
  <?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
      <loc>https://toiral.web.app/</loc>
      <lastmod>2023-05-01</lastmod>
      <changefreq>monthly</changefreq>
      <priority>1.0</priority>
    </url>
  </urlset>
  ```

## Recommended SEO Content for Toiral

### Homepage
- **Title**: "Toiral Web Development | Creating Tomorrow's Web, Today"
- **Description**: "Toiral offers professional web development services with a unique Windows 95 aesthetic. Get custom websites, responsive design, and modern functionality with retro charm."
- **Keywords**: "web development, retro design, windows 95 aesthetic, custom websites, responsive design"

### Services
- **Title**: "Web Development Services | Toiral"
- **Description**: "Explore our web development services including custom website design, responsive development, e-commerce solutions, and admin panel creation with our signature retro aesthetic."
- **Keywords**: "web services, custom websites, responsive design, e-commerce, admin panels"

### Portfolio
- **Title**: "Web Development Portfolio | Toiral Projects"
- **Description**: "Browse our portfolio of successful web development projects. See how we blend modern functionality with nostalgic design for unique, effective websites."
- **Keywords**: "web portfolio, development projects, website examples, retro design examples"

### Contact
- **Title**: "Contact Toiral | Web Development Inquiries"
- **Description**: "Get in touch with Toiral for your web development needs. Request a quote, schedule a consultation, or ask questions about our services."
- **Keywords**: "contact web developer, development quote, website consultation"

## SEO Checklist

- [ ] Update page titles and meta descriptions for all sections
- [ ] Configure Open Graph and Twitter Card settings
- [ ] Set up structured data for your organization
- [ ] Create a comprehensive sitemap.xml
- [ ] Configure robots.txt appropriately
- [ ] Add custom meta tags as needed
- [ ] Test your SEO settings using tools like Google's Rich Results Test

Remember to regularly update your SEO settings as your content changes and to align with current SEO best practices.
