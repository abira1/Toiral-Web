import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Win95Button } from './Win95Button';
import { SendIcon, ChevronRightIcon } from 'lucide-react';
import { useContent } from '../contexts/ContentContext';
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'system';
  timestamp: Date;
  suggestions?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  entities?: Entity[];
  intent?: string;
  confidence?: number;
  threadId?: number;
  replyTo?: number;
}
interface Entity {
  type: 'service' | 'technology' | 'price' | 'timeline' | 'location' | 'contact' | 'business_type' | 'urgency' | 'industry' | 'question';
  value: string;
  confidence: number;
}
interface ConversationContext {
  lastTopic?: string;
  userIntent?: string;
  questionCount: number;
  lastResponseType?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  conversationHistory: string[];
  activeThread?: number;
  entities: Entity[];
  userPreferences: {
    preferredTechnologies?: string[];
    budget?: string;
    timeline?: string;
    communicationStyle?: 'formal' | 'casual';
    previousInteractions?: number;
    businessType?: 'startup' | 'small_business' | 'enterprise' | 'agency' | 'individual';
    industry?: string;
    urgencyLevel?: 'urgent' | 'standard' | 'relaxed';
    lastInteractionTimestamp?: Date;
  };
  conversationSummary?: string;
  recentTopics: string[];
  userMood?: {
    current: 'positive' | 'negative' | 'neutral' | 'confused' | 'impatient' | 'interested';
    intensity: number;
    history: Array<{mood: string, timestamp: Date}>;
  };
}
const nlp = {
  extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];
    const lowerText = text.toLowerCase();

    // Helper function to check for word boundaries to avoid partial matches
    const hasWordWithBoundary = (text: string, word: string): boolean => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(text);
    };

    // Helper function to check for phrases with more context
    const hasPhrase = (text: string, phrase: string): boolean => {
      return text.includes(phrase);
    };

    // Helper function to calculate Levenshtein distance for fuzzy matching
    const levenshteinDistance = (a: string, b: string): number => {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;

      const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

      for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
      for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost
          );
        }
      }

      return matrix[a.length][b.length];
    };

    // Helper function for fuzzy matching with threshold
    const fuzzyMatch = (text: string, term: string, threshold = 0.8): boolean => {
      if (text.includes(term)) return true;

      const words = text.split(/\s+/);
      for (const word of words) {
        if (word.length < 3) continue; // Skip very short words

        const maxLength = Math.max(word.length, term.length);
        const distance = levenshteinDistance(word.toLowerCase(), term.toLowerCase());
        const similarity = (maxLength - distance) / maxLength;

        if (similarity >= threshold) return true;
      }

      return false;
    };

    // Enhanced service detection with expanded options and better matching
    const services = {
      'website': ['website', 'web site', 'site', 'webpage', 'landing page', 'web presence', 'online presence'],
      'ecommerce': ['ecommerce', 'e-commerce', 'online store', 'shop', 'shopping cart', 'web shop', 'online marketplace', 'sell online'],
      'app': ['app', 'application', 'mobile app', 'ios app', 'android app', 'web app', 'progressive web app', 'pwa', 'native app', 'mobile application'],
      'consulting': ['consulting', 'consultation', 'advice', 'guidance', 'strategy', 'expert advice', 'professional opinion', 'assessment'],
      'development': ['development', 'coding', 'programming', 'building', 'creating', 'software development', 'web development', 'app development', 'custom development'],
      'design': ['design', 'ui', 'ux', 'user interface', 'user experience', 'graphic design', 'web design', 'visual design', 'interface design', 'responsive design'],
      'seo': ['seo', 'search engine optimization', 'google ranking', 'search ranking', 'organic traffic', 'search visibility'],
      'maintenance': ['maintenance', 'support', 'updates', 'upkeep', 'ongoing support', 'website maintenance', 'regular updates'],
      'hosting': ['hosting', 'web hosting', 'server', 'cloud hosting', 'domain', 'website hosting']
    };

    Object.entries(services).forEach(([service, synonyms]) => {
      // Check for exact matches with word boundaries
      const exactMatches = synonyms.filter(synonym => hasWordWithBoundary(lowerText, synonym));
      if (exactMatches.length > 0) {
        entities.push({
          type: 'service',
          value: service,
          confidence: 0.95
        });
        return;
      }

      // Check for phrase matches (more context-aware)
      const phraseMatches = synonyms.filter(synonym => synonym.includes(' ') && hasPhrase(lowerText, synonym));
      if (phraseMatches.length > 0) {
        entities.push({
          type: 'service',
          value: service,
          confidence: 0.9
        });
        return;
      }

      // Check for fuzzy matches
      const fuzzyMatches = synonyms.filter(synonym =>
        synonym.length > 3 && fuzzyMatch(lowerText, synonym, 0.85)
      );
      if (fuzzyMatches.length > 0) {
        entities.push({
          type: 'service',
          value: service,
          confidence: 0.8
        });
        return;
      }

      // Check for partial matches as fallback
      if (synonyms.some(synonym => lowerText.includes(synonym))) {
        entities.push({
          type: 'service',
          value: service,
          confidence: 0.7
        });
      }
    });

    // Enhanced technology detection with expanded options
    const technologies = {
      'react': ['react', 'reactjs', 'react.js', 'react framework', 'react library'],
      'node': ['node', 'nodejs', 'node.js', 'server side', 'backend', 'server-side javascript'],
      'typescript': ['typescript', 'ts', 'typed javascript', 'type safety', 'static typing'],
      'javascript': ['javascript', 'js', 'ecmascript', 'es6', 'vanilla js', 'frontend scripting'],
      'mongodb': ['mongodb', 'mongo', 'nosql', 'document database', 'non-relational database'],
      'postgresql': ['postgresql', 'postgres', 'sql', 'database', 'relational database', 'sql database'],
      'firebase': ['firebase', 'firestore', 'realtime database', 'google firebase', 'firebase auth', 'firebase hosting'],
      'aws': ['aws', 'amazon web services', 'cloud', 'amazon cloud', 's3', 'ec2', 'lambda'],
      'wordpress': ['wordpress', 'wp', 'cms', 'content management system', 'wp theme', 'wp plugin'],
      'next.js': ['next.js', 'nextjs', 'next', 'server side rendering', 'ssr', 'static site generation'],
      'vue': ['vue', 'vuejs', 'vue.js', 'vue framework'],
      'angular': ['angular', 'angularjs', 'ng'],
      'tailwind': ['tailwind', 'tailwindcss', 'tailwind css', 'utility css', 'css framework'],
      'bootstrap': ['bootstrap', 'bootstrap css', 'bootstrap framework'],
      'graphql': ['graphql', 'gql', 'graph query language', 'api query language'],
      'rest': ['rest', 'restful', 'rest api', 'restful api', 'api'],
      'docker': ['docker', 'containerization', 'container', 'docker image', 'docker container'],
      'kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
      'ci/cd': ['ci/cd', 'continuous integration', 'continuous deployment', 'devops', 'pipeline']
    };

    Object.entries(technologies).forEach(([tech, synonyms]) => {
      // Check for exact matches with word boundaries
      const exactMatches = synonyms.filter(synonym => hasWordWithBoundary(lowerText, synonym));
      if (exactMatches.length > 0) {
        entities.push({
          type: 'technology',
          value: tech,
          confidence: 0.95
        });
        return;
      }

      // Check for phrase matches
      const phraseMatches = synonyms.filter(synonym => synonym.includes(' ') && hasPhrase(lowerText, synonym));
      if (phraseMatches.length > 0) {
        entities.push({
          type: 'technology',
          value: tech,
          confidence: 0.9
        });
        return;
      }

      // Check for fuzzy matches
      const fuzzyMatches = synonyms.filter(synonym =>
        synonym.length > 3 && fuzzyMatch(lowerText, synonym, 0.85)
      );
      if (fuzzyMatches.length > 0) {
        entities.push({
          type: 'technology',
          value: tech,
          confidence: 0.85
        });
        return;
      }

      // Check for partial matches as fallback
      if (synonyms.some(synonym => lowerText.includes(synonym))) {
        entities.push({
          type: 'technology',
          value: tech,
          confidence: 0.8
        });
      }
    });

    // Enhanced price detection with more patterns
    const pricePatterns = [
      // Exact dollar amounts
      /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
      // Numbers followed by dollars/USD
      /\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|usd)/gi,
      // Budget/cost/price of/around/about $X
      /(?:budget|cost|price|quote|charge|fee|rate)\s+(?:of|around|about|approximately|roughly|in the range of)?\s+\$?\d+(?:,\d{3})*(?:\.\d{2})?/gi,
      // Price ranges
      /\$\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:to|-)\s*\$?\d+(?:,\d{3})*(?:\.\d{2})?/g,
      // X dollars/USD
      /\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:dollars?|usd)/gi,
      // Budget constraints
      /(?:budget|cost|price)\s+(?:limit|cap|ceiling|maximum|constraint|restriction)\s+(?:of|is|at)?\s+\$?\d+(?:,\d{3})*(?:\.\d{2})?/gi,
      // Affordable/cheap/expensive
      /(?:affordable|cheap|inexpensive|budget-friendly|cost-effective|economical|expensive|premium|high-end|luxury)/gi
    ];

    for (const pattern of pricePatterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'price',
            value: match,
            confidence: pattern.toString().includes('affordable|cheap') ? 0.7 : 0.9
          });
        });
      }
    }

    // Enhanced timeline detection with more patterns
    const timelinePatterns = [
      // Specific timeframes
      /(?:\d+\s*(?:days?|weeks?|months?|years?))/gi,
      // Urgency indicators
      /(?:asap|urgent|urgently|immediately|right away|as soon as possible|quickly|promptly|without delay|expedite)/gi,
      // Specific timeframes
      /(?:today|tomorrow|this week|next week|this month|next month|this year|next year)/gi,
      // Specific dates
      /(?:by|before|after|on)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today|next week|next month)/gi,
      // Specific dates with numbers
      /(?:by|before|after|on)\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?/gi,
      // Deadlines
      /(?:deadline|due date|due by|must be completed by|need it by|finish by|deliver by|launch by|go live by)/gi,
      // Project duration
      /(?:project|work|development)\s+(?:duration|timeframe|period|timeline)\s+(?:of|is)?\s+\d+\s*(?:days?|weeks?|months?|years?)/gi,
      // Relaxed timeline
      /(?:no rush|take your time|whenever|no hurry|not urgent|flexible timeline|flexible deadline|at your convenience|when you can)/gi
    ];

    for (const pattern of timelinePatterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            type: 'timeline',
            value: match,
            confidence: 0.85
          });
        });
      }
    }

    // Enhanced business type detection with more context
    const businessTypes = {
      'startup': ['startup', 'start-up', 'new company', 'new business', 'just starting', 'early stage', 'seed stage', 'launching soon', 'pre-launch', 'recently founded'],
      'small_business': ['small business', 'small company', 'local business', 'family business', 'mom and pop', 'boutique', 'small shop', 'small team', 'small operation'],
      'enterprise': ['enterprise', 'large company', 'corporation', 'big business', 'multinational', 'corporate', 'fortune 500', 'industry leader', 'established company'],
      'agency': ['agency', 'firm', 'consultancy', 'studio', 'creative agency', 'marketing agency', 'design agency', 'development agency', 'service provider'],
      'individual': ['individual', 'freelancer', 'personal', 'myself', 'solo', 'solopreneur', 'independent', 'one-person', 'personal project', 'side project', 'hobby project']
    };

    Object.entries(businessTypes).forEach(([type, synonyms]) => {
      // Check for exact matches with word boundaries
      const exactMatches = synonyms.filter(synonym => hasWordWithBoundary(lowerText, synonym));
      if (exactMatches.length > 0) {
        entities.push({
          type: 'business_type',
          value: type,
          confidence: 0.9
        });
        return;
      }

      // Check for phrase matches
      const phraseMatches = synonyms.filter(synonym => synonym.includes(' ') && hasPhrase(lowerText, synonym));
      if (phraseMatches.length > 0) {
        entities.push({
          type: 'business_type',
          value: type,
          confidence: 0.85
        });
        return;
      }

      // Check for partial matches as fallback
      if (synonyms.some(synonym => lowerText.includes(synonym))) {
        entities.push({
          type: 'business_type',
          value: type,
          confidence: 0.75
        });
      }
    });

    // Enhanced urgency detection with more context
    const urgencyPatterns = {
      'urgent': ['urgent', 'asap', 'immediately', 'right away', 'emergency', 'rush', 'deadline', 'tomorrow', 'today', 'quickly', 'critical', 'time-sensitive', 'pressing', 'high priority', 'can\'t wait', 'as soon as possible', 'expedite', 'fast-track'],
      'standard': ['soon', 'next week', 'standard', 'normal', 'regular', 'typical', 'usual', 'common', 'ordinary', 'standard timeline', 'reasonable timeframe', 'within a few weeks', 'moderate urgency'],
      'relaxed': ['whenever', 'no rush', 'take your time', 'relaxed', 'flexible', 'when you can', 'no hurry', 'at your convenience', 'not urgent', 'low priority', 'no deadline', 'flexible timeline', 'whenever it fits']
    };

    Object.entries(urgencyPatterns).forEach(([level, patterns]) => {
      // Check for exact matches with word boundaries
      const exactMatches = patterns.filter(pattern => hasWordWithBoundary(lowerText, pattern));
      if (exactMatches.length > 0) {
        entities.push({
          type: 'urgency',
          value: level,
          confidence: 0.9
        });
        return;
      }

      // Check for phrase matches
      const phraseMatches = patterns.filter(pattern => pattern.includes(' ') && hasPhrase(lowerText, pattern));
      if (phraseMatches.length > 0) {
        entities.push({
          type: 'urgency',
          value: level,
          confidence: 0.85
        });
        return;
      }

      // Check for partial matches as fallback
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        entities.push({
          type: 'urgency',
          value: level,
          confidence: 0.75
        });
      }
    });

    // Enhanced industry detection with more industries and better matching
    const industries = {
      'healthcare': ['healthcare', 'health care', 'medical', 'hospital', 'clinic', 'doctor', 'patient', 'health', 'wellness', 'telemedicine', 'pharma', 'pharmaceutical'],
      'finance': ['finance', 'financial', 'banking', 'bank', 'investment', 'fintech', 'insurance', 'wealth management', 'accounting', 'tax', 'credit', 'loan'],
      'education': ['education', 'school', 'university', 'college', 'academic', 'learning', 'teaching', 'student', 'course', 'training', 'e-learning', 'edtech'],
      'retail': ['retail', 'store', 'shop', 'shopping', 'merchant', 'commerce', 'consumer', 'product', 'merchandise', 'point of sale', 'pos', 'brick and mortar'],
      'technology': ['technology', 'tech', 'software', 'hardware', 'it', 'information technology', 'saas', 'startup', 'digital', 'computer', 'internet', 'web'],
      'manufacturing': ['manufacturing', 'factory', 'production', 'industrial', 'industry', 'assembly', 'fabrication', 'processing', 'supply chain'],
      'hospitality': ['hospitality', 'hotel', 'restaurant', 'cafe', 'catering', 'tourism', 'travel', 'accommodation', 'lodging', 'resort', 'vacation'],
      'real_estate': ['real estate', 'property', 'housing', 'apartment', 'home', 'house', 'commercial property', 'residential', 'leasing', 'rental', 'mortgage'],
      'entertainment': ['entertainment', 'media', 'film', 'movie', 'music', 'game', 'gaming', 'video', 'streaming', 'production', 'studio', 'broadcast'],
      'food': ['food', 'restaurant', 'cafe', 'catering', 'bakery', 'grocery', 'culinary', 'dining', 'meal', 'delivery', 'kitchen'],
      'automotive': ['automotive', 'car', 'vehicle', 'auto', 'dealership', 'repair', 'maintenance', 'transportation', 'fleet', 'mobility'],
      'fashion': ['fashion', 'clothing', 'apparel', 'wear', 'garment', 'textile', 'style', 'design', 'boutique', 'retail'],
      'beauty': ['beauty', 'cosmetic', 'makeup', 'skincare', 'salon', 'spa', 'wellness', 'personal care', 'grooming'],
      'fitness': ['fitness', 'gym', 'workout', 'exercise', 'health', 'wellness', 'training', 'sport', 'athletic', 'nutrition'],
      'legal': ['legal', 'law', 'attorney', 'lawyer', 'firm', 'counsel', 'compliance', 'regulation', 'litigation', 'contract'],
      'nonprofit': ['nonprofit', 'non-profit', 'ngo', 'charity', 'foundation', 'organization', 'social impact', 'cause', 'mission', 'volunteer'],
      'construction': ['construction', 'building', 'contractor', 'architecture', 'engineering', 'design', 'renovation', 'development', 'project'],
      'agriculture': ['agriculture', 'farming', 'farm', 'crop', 'livestock', 'agtech', 'food production', 'sustainable', 'organic']
    };

    Object.entries(industries).forEach(([industry, keywords]) => {
      // Check for exact matches with word boundaries
      const exactMatches = keywords.filter(keyword => hasWordWithBoundary(lowerText, keyword));
      if (exactMatches.length > 0) {
        entities.push({
          type: 'industry',
          value: industry,
          confidence: 0.9
        });
        return;
      }

      // Check for phrase matches
      const phraseMatches = keywords.filter(keyword => keyword.includes(' ') && hasPhrase(lowerText, keyword));
      if (phraseMatches.length > 0) {
        entities.push({
          type: 'industry',
          value: industry,
          confidence: 0.85
        });
        return;
      }

      // Check for partial matches as fallback
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        entities.push({
          type: 'industry',
          value: industry,
          confidence: 0.75
        });
      }
    });

    // Contact information detection
    const contactPatterns = [
      // Email addresses
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      // Phone numbers (various formats)
      /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
      // Contact requests
      /(?:contact|call|email|reach|get in touch|connect|talk|speak|message)/gi
    ];

    for (const pattern of contactPatterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Only add if it looks like a contact method, not just the word "contact"
          if (match.includes('@') || /\d/.test(match)) {
            entities.push({
              type: 'contact',
              value: match,
              confidence: 0.95
            });
          } else if (hasPhrase(lowerText, match) &&
                    (lowerText.includes('you') || lowerText.includes('me') ||
                     lowerText.includes('call') || lowerText.includes('email'))) {
            entities.push({
              type: 'contact',
              value: 'contact_request',
              confidence: 0.85
            });
          }
        });
      }
    }

    // Location detection
    const locationPatterns = [
      // Cities, countries, regions
      /(?:in|from|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      // Remote work indicators
      /(?:remote|remotely|work from home|wfh|virtual|online|anywhere|globally|worldwide)/gi,
      // Local indicators
      /(?:local|locally|in-person|on-site|on site|in the area|nearby|in our area|in my area)/gi
    ];

    for (const pattern of locationPatterns) {
      const matches = lowerText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Extract the location name from patterns like "in New York"
          if (match.match(/(?:in|from|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/)) {
            const locationName = match.replace(/(?:in|from|at|near|around)\s+/, '');
            entities.push({
              type: 'location',
              value: locationName,
              confidence: 0.8
            });
          } else if (match.match(/(?:remote|remotely|work from home|wfh|virtual|online|anywhere|globally|worldwide)/i)) {
            entities.push({
              type: 'location',
              value: 'remote',
              confidence: 0.85
            });
          } else if (match.match(/(?:local|locally|in-person|on-site|on site|in the area|nearby|in our area|in my area)/i)) {
            entities.push({
              type: 'location',
              value: 'local',
              confidence: 0.85
            });
          }
        });
      }
    }

    // Question detection
    if (lowerText.includes('?') ||
        lowerText.match(/\b(?:what|who|where|when|why|how|can|could|would|will|is|are|do|does|did|should|have|has|had)\b/i)) {
      entities.push({
        type: 'question',
        value: 'question',
        confidence: 0.9
      });
    }

    // Deduplicate entities by type and value
    const uniqueEntities: Entity[] = [];
    const seen = new Set<string>();

    entities.forEach(entity => {
      const key = `${entity.type}:${entity.value}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEntities.push(entity);
      }
    });

    return uniqueEntities;
  },
  classifyIntent(text: string, context: ConversationContext): {
    intent: string;
    confidence: number;
    subIntent?: string;
  } {
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\W+/).filter(word => word.length > 1);

    // Enhanced intent patterns with synonyms and related terms
    const intents = [
      {
        name: 'get_quote',
        patterns: ['price', 'cost', 'quote', 'expensive', 'cheap', 'budget', 'afford', 'pricing', 'rates', 'fee', 'charge', 'estimate', 'how much', 'package', 'plan', 'subscription', 'payment'],
        subIntents: {
          'budget_constraint': ['limited budget', 'tight budget', 'affordable', 'cheapest', 'low cost', 'economical'],
          'premium_service': ['premium', 'high quality', 'best', 'top tier', 'luxury', 'exclusive'],
          'payment_options': ['payment plan', 'installment', 'monthly', 'subscription', 'pay later', 'financing']
        }
      },
      {
        name: 'schedule_meeting',
        patterns: ['meet', 'schedule', 'appointment', 'discuss', 'talk', 'call', 'chat', 'consultation', 'zoom', 'teams', 'google meet', 'skype', 'conference', 'meeting', 'availability', 'calendar', 'when can we', 'let\'s talk'],
        subIntents: {
          'urgent_meeting': ['asap', 'urgent', 'today', 'tomorrow', 'this week'],
          'discovery_call': ['initial', 'discovery', 'first meeting', 'introduction', 'get to know'],
          'technical_discussion': ['technical meeting', 'technical discussion', 'technical call', 'developer meeting']
        }
      },
      {
        name: 'technical_info',
        patterns: ['how', 'tech', 'stack', 'built', 'framework', 'language', 'platform', 'technology', 'tools', 'software', 'development process', 'methodology', 'architecture', 'infrastructure', 'backend', 'frontend', 'database', 'hosting', 'cloud', 'security', 'performance'],
        subIntents: {
          'specific_technology': ['react', 'node', 'typescript', 'javascript', 'mongodb', 'postgresql', 'firebase', 'aws', 'wordpress'],
          'development_process': ['agile', 'scrum', 'waterfall', 'sprint', 'methodology', 'process'],
          'technical_requirements': ['requirements', 'specs', 'specifications', 'features', 'functionality']
        }
      },
      {
        name: 'portfolio',
        patterns: ['portfolio', 'example', 'work', 'project', 'previous', 'showcase', 'case study', 'sample', 'similar', 'reference', 'past work', 'client', 'delivered', 'completed', 'success story', 'testimonial'],
        subIntents: {
          'industry_specific': ['industry', 'sector', 'field', 'similar business', 'similar company'],
          'feature_specific': ['feature', 'functionality', 'capability', 'similar feature'],
          'design_examples': ['design', 'ui', 'ux', 'look and feel', 'aesthetic', 'visual']
        }
      },
      {
        name: 'support',
        patterns: ['help', 'issue', 'problem', 'bug', 'error', 'fix', 'broken', 'not working', 'trouble', 'difficulty', 'assistance', 'support', 'resolve', 'solution', 'troubleshoot', 'debug'],
        subIntents: {
          'urgent_support': ['urgent', 'emergency', 'critical', 'asap', 'immediately'],
          'technical_issue': ['technical', 'bug', 'error', 'crash', 'not loading', 'broken'],
          'guidance': ['guidance', 'advice', 'recommendation', 'suggestion', 'best practice']
        }
      },
      {
        name: 'timeline',
        patterns: ['timeline', 'deadline', 'timeframe', 'schedule', 'duration', 'how long', 'when', 'delivery', 'complete', 'finish', 'ready', 'launch', 'go live', 'release', 'milestone'],
        subIntents: {
          'urgent_timeline': ['urgent', 'rush', 'asap', 'tight deadline', 'as soon as possible'],
          'phased_approach': ['phase', 'stage', 'step', 'milestone', 'incremental', 'iterative'],
          'specific_date': ['specific date', 'by', 'before', 'after', 'next month', 'next week']
        }
      },
      {
        name: 'process',
        patterns: ['process', 'steps', 'procedure', 'workflow', 'how does it work', 'what happens', 'onboarding', 'getting started', 'begin', 'start', 'approach', 'methodology'],
        subIntents: {
          'contract_process': ['contract', 'agreement', 'terms', 'conditions', 'legal', 'paperwork'],
          'design_process': ['design process', 'mockup', 'prototype', 'wireframe', 'draft'],
          'development_process': ['development process', 'coding', 'building', 'implementation']
        }
      }
    ];

    // Calculate confidence scores for each intent
    const intentScores = intents.map(intent => {
      // Base confidence from direct pattern matches
      let patternMatches = 0;
      let patternWeight = 0;

      intent.patterns.forEach(pattern => {
        // Check for exact matches
        if (lowerText.includes(pattern)) {
          patternMatches++;
          patternWeight += 1.0;
        }
        // Check for partial matches (for multi-word patterns)
        else if (pattern.includes(' ') && pattern.split(' ').some(part => lowerText.includes(part))) {
          patternMatches++;
          patternWeight += 0.5;
        }
        // Check for word stem matches
        else if (words.some(word => word.startsWith(pattern) || pattern.startsWith(word))) {
          patternMatches++;
          patternWeight += 0.3;
        }
      });

      // Calculate base confidence
      let confidence = patternWeight / intent.patterns.length;

      // Boost confidence based on context
      if (context.conversationHistory.some(h => h.toLowerCase().includes(intent.name))) {
        confidence *= 1.2; // Boost if this intent was previously discussed
      }

      if (context.lastTopic === intent.name) {
        confidence *= 1.3; // Boost if this was the last topic
      }

      // Identify subIntent if applicable
      let subIntent = undefined;
      let maxSubIntentScore = 0;

      if (intent.subIntents) {
        Object.entries(intent.subIntents).forEach(([subIntentName, subPatterns]) => {
          const subScore = subPatterns.reduce((score: number, pattern: string) => {
            return score + (lowerText.includes(pattern) ? 1 : 0);
          }, 0) / subPatterns.length;

          if (subScore > 0.3 && subScore > maxSubIntentScore) {
            maxSubIntentScore = subScore;
            subIntent = subIntentName;
          }
        });
      }

      return {
        name: intent.name,
        confidence,
        subIntent: subIntent
      };
    });

    // Sort by confidence and get the highest
    intentScores.sort((a, b) => b.confidence - a.confidence);
    const topIntent = intentScores[0];

    // If confidence is too low, default to general inquiry
    if (topIntent.confidence < 0.15) {
      return {
        intent: 'general_inquiry',
        confidence: 0.1
      };
    }

    return {
      intent: topIntent.name,
      confidence: topIntent.confidence,
      subIntent: topIntent.subIntent
    };
  },
  analyzeEmotion(text: string): {
    sentiment: 'positive' | 'negative' | 'neutral';
    emotions: string[];
    intensity: number;
    mood?: 'positive' | 'negative' | 'neutral' | 'confused' | 'impatient' | 'interested';
  } {
    const lowerText = text.toLowerCase();

    // Enhanced emotion detection with more nuanced categories and phrases
    const emotions = {
      excited: ['amazing', 'fantastic', 'awesome', 'incredible', 'excellent', 'love', 'great', 'wonderful', 'brilliant', 'outstanding', 'exceptional', 'superb', 'thrilled', 'excited', 'wow', 'cool', 'impressive'],
      satisfied: ['thanks', 'thank you', 'appreciate', 'grateful', 'perfect', 'exactly', 'good', 'nice', 'helpful', 'satisfied', 'pleased', 'content', 'happy with', 'works for me'],
      interested: ['interested', 'curious', 'tell me more', 'sounds good', 'want to know', 'would like', 'more information', 'details', 'learn more', 'sounds interesting', 'intriguing'],
      hopeful: ['hope', 'looking forward', 'excited about', 'can\'t wait', 'anticipate', 'eager', 'optimistic'],
      frustrated: ['annoying', 'frustrating', 'difficult', 'hard', 'confusing', 'complicated', 'complex', 'challenging', 'problem', 'issue', 'trouble', 'struggle', 'not working', 'doesn\'t work', 'failed', 'disappointed'],
      angry: ['angry', 'upset', 'mad', 'furious', 'irritated', 'annoyed', 'terrible', 'horrible', 'awful', 'ridiculous', 'unacceptable', 'poor', 'bad'],
      confused: ['confused', 'don\'t understand', 'unclear', 'not sure', 'what do you mean', 'explain', 'clarify', 'lost', 'puzzled', 'bewildered', 'perplexed'],
      impatient: ['asap', 'urgent', 'quickly', 'soon', 'immediate', 'hurry', 'fast', 'now', 'right away', 'promptly', 'without delay', 'time sensitive', 'deadline', 'running out of time'],
      concerned: ['worried', 'concerned', 'anxious', 'nervous', 'apprehensive', 'fear', 'afraid', 'risk', 'problem', 'issue', 'doubt', 'skeptical', 'not sure if']
    };

    // Sentiment modifiers - words or phrases that intensify emotions
    const intensifiers = ['very', 'really', 'extremely', 'absolutely', 'completely', 'totally', 'highly', 'especially', 'particularly', 'notably', 'remarkably', 'exceedingly', 'immensely', 'incredibly'];

    // Negation words that can flip sentiment
    const negations = ['not', 'no', 'never', 'neither', 'nor', 'barely', 'hardly', 'scarcely', 'doesn\'t', 'don\'t', 'can\'t', 'won\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t'];

    // Check for negations that might flip sentiment
    const hasNegation = negations.some(neg => {
      // Look for negation words as whole words, not as parts of other words
      const regex = new RegExp(`\\b${neg}\\b`, 'i');
      return regex.test(lowerText);
    });

    // Calculate emotion scores with context awareness
    let emotionScores: { [key: string]: number } = {};
    let totalIntensity = 0;

    // Split text into words and phrases for analysis
    const words = lowerText.split(/\s+/);
    const phrases: string[] = [];

    // Generate phrases (2-3 word combinations) for better context
    for (let i = 0; i < words.length - 1; i++) {
      phrases.push(words[i] + ' ' + words[i + 1]);
      if (i < words.length - 2) {
        phrases.push(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]);
      }
    }

    // Check for intensifiers to boost emotion scores
    const intensifierPresent = intensifiers.some(intensifier => lowerText.includes(intensifier));
    const intensifierMultiplier = intensifierPresent ? 1.5 : 1.0;

    // Calculate scores for each emotion
    Object.entries(emotions).forEach(([emotion, keywords]) => {
      let score: number = 0;

      // Check for keyword matches in words and phrases
      keywords.forEach(keyword => {
        // Check for exact word matches
        const wordMatches = words.filter(w => w === keyword).length;
        score += wordMatches * 0.3;

        // Check for partial word matches (contained within)
        const partialMatches = words.filter(w => w.includes(keyword) && w !== keyword).length;
        score += partialMatches * 0.1;

        // Check for phrase matches (more contextual)
        const phraseMatches = phrases.filter(p => p.includes(keyword)).length;
        score += phraseMatches * 0.2;
      });

      // Apply intensifier multiplier
      score *= intensifierMultiplier;

      // Handle negation by potentially flipping certain emotions
      if (hasNegation) {
        if (['excited', 'satisfied', 'hopeful'].includes(emotion)) {
          // Flip positive emotions to negative when negated
          emotionScores[emotion] = 0;
          if (score > 0) {
            // Convert to a negative emotion
            emotionScores['frustrated'] = (emotionScores['frustrated'] || 0) + score;
          }
        } else if (['frustrated', 'angry', 'concerned'].includes(emotion)) {
          // Flip negative emotions to neutral/positive when negated
          emotionScores[emotion] = 0;
          if (score > 0) {
            // Convert to a more neutral state
            emotionScores['neutral'] = (emotionScores['neutral'] || 0) + score * 0.5;
          }
        } else {
          // Other emotions like confused, impatient aren't typically flipped by negation
          emotionScores[emotion] = score;
        }
      } else {
        emotionScores[emotion] = score;
      }

      totalIntensity += emotionScores[emotion] || 0;
    });

    // Get dominant emotions sorted by score
    const dominantEmotions = Object.entries(emotionScores)
      .filter(([_, score]) => score > 0.1) // Filter out very low scores
      .sort((a, b) => b[1] - a[1])
      .map(([emotion]) => emotion);

    // Determine overall sentiment
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

    if (totalIntensity > 0.2) {
      const positiveEmotions = ['excited', 'satisfied', 'hopeful', 'interested'];
      const negativeEmotions = ['frustrated', 'angry', 'concerned'];

      const hasPositive = dominantEmotions.some(e => positiveEmotions.includes(e));
      const hasNegative = dominantEmotions.some(e => negativeEmotions.includes(e));

      if (hasPositive && !hasNegative) {
        sentiment = 'positive';
      } else if (hasNegative && !hasPositive) {
        sentiment = 'negative';
      } else if (hasPositive && hasNegative) {
        // Mixed emotions - determine which is stronger
        const positiveScore = positiveEmotions.reduce((sum, emotion) => sum + (emotionScores[emotion] || 0), 0);
        const negativeScore = negativeEmotions.reduce((sum, emotion) => sum + (emotionScores[emotion] || 0), 0);

        sentiment = positiveScore > negativeScore ? 'positive' : 'negative';
      }
    }

    // Determine user mood for more specific response tailoring
    let mood: 'positive' | 'negative' | 'neutral' | 'confused' | 'impatient' | 'interested' = 'neutral';

    if (dominantEmotions.includes('confused')) {
      mood = 'confused';
    } else if (dominantEmotions.includes('impatient')) {
      mood = 'impatient';
    } else if (dominantEmotions.includes('interested')) {
      mood = 'interested';
    } else if (sentiment === 'positive') {
      mood = 'positive';
    } else if (sentiment === 'negative') {
      mood = 'negative';
    }

    return {
      sentiment,
      emotions: dominantEmotions,
      intensity: Math.min(totalIntensity, 1),
      mood
    };
  },
  summarizeConversation(messages: Message[]): {
    summary: string;
    topics: string[];
    intents: string[];
    entities: Entity[];
    sentiment: 'positive' | 'negative' | 'neutral';
    userPreferences: Record<string, any>;
  } {
    const summary = {
      mainTopics: new Set<string>(),
      userIntents: new Set<string>(),
      keyEntities: new Map<string, Entity>(),
      sentiment: 'neutral' as 'positive' | 'negative' | 'neutral',
      positiveCount: 0,
      negativeCount: 0,
      userPreferences: {
        preferredTechnologies: new Set<string>(),
        businessType: undefined as string | undefined,
        urgencyLevel: undefined as string | undefined,
        industry: undefined as string | undefined,
        budget: undefined as string | undefined,
        timeline: undefined as string | undefined
      }
    };

    // Process all messages to extract information
    messages.forEach(msg => {
      // Only process user messages for intent and entity extraction
      if (msg.sender === 'user') {
        // Track intents
        if (msg.intent) {
          summary.userIntents.add(msg.intent);
          summary.mainTopics.add(msg.intent.replace('_', ' '));
        }

        // Track entities and extract user preferences
        if (msg.entities) {
          msg.entities.forEach(e => {
            // Store the entity with highest confidence if duplicates exist
            const key = `${e.type}:${e.value}`;
            if (!summary.keyEntities.has(key) || summary.keyEntities.get(key)!.confidence < e.confidence) {
              summary.keyEntities.set(key, e);
            }

            // Extract user preferences from entities
            switch (e.type) {
              case 'technology':
                summary.userPreferences.preferredTechnologies.add(e.value);
                break;
              case 'business_type':
                summary.userPreferences.businessType = e.value;
                break;
              case 'urgency':
                summary.userPreferences.urgencyLevel = e.value;
                break;
              case 'industry':
                summary.userPreferences.industry = e.value;
                break;
              case 'price':
                summary.userPreferences.budget = e.value;
                break;
              case 'timeline':
                summary.userPreferences.timeline = e.value;
                break;
            }
          });
        }
      }

      // Track sentiment for all messages
      if (msg.sentiment === 'positive') summary.positiveCount++;
      if (msg.sentiment === 'negative') summary.negativeCount++;
    });

    // Determine overall sentiment
    summary.sentiment = summary.positiveCount > summary.negativeCount
      ? 'positive'
      : summary.negativeCount > summary.positiveCount
        ? 'negative'
        : 'neutral';

    // Convert Sets to Arrays for the return value
    const topics = Array.from(summary.mainTopics);
    const intents = Array.from(summary.userIntents);
    const entities = Array.from(summary.keyEntities.values());

    // Convert preference sets to arrays
    const userPreferences = {
      preferredTechnologies: Array.from(summary.userPreferences.preferredTechnologies),
      businessType: summary.userPreferences.businessType,
      urgencyLevel: summary.userPreferences.urgencyLevel,
      industry: summary.userPreferences.industry,
      budget: summary.userPreferences.budget,
      timeline: summary.userPreferences.timeline
    };

    // Generate human-readable summary
    let summaryText = '';

    if (topics.length > 0) {
      summaryText += `Conversation focused on ${topics.join(', ')}. `;
    }

    if (intents.length > 0) {
      summaryText += `User showed interest in ${intents.map(i => i.replace('_', ' ')).join(', ')}. `;
    }

    if (userPreferences.preferredTechnologies.length > 0) {
      summaryText += `User mentioned technologies: ${userPreferences.preferredTechnologies.join(', ')}. `;
    }

    if (userPreferences.businessType) {
      summaryText += `User appears to be from a ${userPreferences.businessType.replace('_', ' ')}. `;
    }

    if (userPreferences.urgencyLevel) {
      summaryText += `Project urgency seems ${userPreferences.urgencyLevel}. `;
    }

    summaryText += `Overall sentiment: ${summary.sentiment}.`;

    return {
      summary: summaryText,
      topics,
      intents,
      entities,
      sentiment: summary.sentiment,
      userPreferences
    };
  }
};
export function ChatBox({
  onClose
}: {
  onClose: () => void;
}) {
  const {
    content
  } = useContent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    questionCount: 0,
    conversationHistory: [],
    entities: [],
    recentTopics: [],
    userPreferences: {
      communicationStyle: 'casual',
      previousInteractions: 0,
      lastInteractionTimestamp: new Date()
    },
    userMood: {
      current: 'neutral',
      intensity: 0,
      history: []
    }
  });

  const chatBoxRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout>();
  const getCompanyResponses = useCallback(() => {
    if (!content) return {
      welcome: "Welcome! I'm experiencing some technical difficulties. Please try again later.",
      portfolio: 'Portfolio information is currently unavailable.',
      team: 'Team information is currently unavailable.',
      services: 'Service information is currently unavailable.'
    };
    return {
      welcome: `Welcome to ${content.company?.name || 'Toiral Web Development'}! 👋 I'm your virtual assistant. How can I help you today?\n\n` +
        'I can assist you with:\n' +
        '• Our services and pricing\n' +
        '• Project timelines and process\n' +
        '• Technology expertise\n' +
        '• Portfolio showcase\n' +
        '• Scheduling consultations\n\n' +
        'Feel free to ask me anything about our web development services!',
      portfolio: content?.portfolio && content.portfolio.length > 0 ? `🎨 Here are some of our recent projects:\n\n${content.portfolio.slice(0, 3).map(project => `• ${project.title}: ${project.description}`).join('\n')}\n\nWould you like to see more of our work?` : "We're currently updating our portfolio. Would you like to schedule a call to discuss your project?",
      team: content?.about?.teamMembers && content.about.teamMembers.length > 0 ? `👨‍💼 Our expert team includes:\n\n${content.about.teamMembers.map(member => `• ${member.name} - ${member.role}`).join('\n')}\n\nWould you like to know more about any team member?` : 'Our team information is being updated. Would you like to schedule a call?',
      services: content?.services && content.services.length > 0 ? `🛠️ Our services include:\n\n${content.services.map(service => `• ${service.name} (${service.duration})`).join('\n')}\n\nWhich service interests you?` : 'We offer custom web development solutions. Would you like to discuss your needs?',
      contact: `📞 You can reach us at:\n` +
        `• Phone: ${content.contact?.phone || 'Not available'}\n` +
        `• Email: ${content.contact?.email || 'Not available'}\n` +
        `• WhatsApp: ${content.contact?.whatsapp || 'Not available'}\n` +
        `• Hours: ${content.contact?.officeHours || 'Monday - Friday, 9:00 AM - 6:00 PM GMT+6'}`,
      about: `${content.company?.name || 'Toiral Web Development'} - ${content.company?.tagline || 'Creating Tomorrow\'s Web, Today'}\n\n` +
        `${content.about?.story ? content.about.story.slice(0, 200) + '...' : 'We are a web development company specializing in modern web technologies.'}`,
      pricing: `Our pricing is customized based on project requirements. Here's a general overview:\n\n` + `• Basic Website: Starting from $1,000\n` + `• E-commerce: Starting from $2,500\n` + `• Custom Web App: Starting from $5,000\n\n` + `Would you like to schedule a consultation for a detailed quote?`
    };
  }, [content]);
  const generateResponse = useCallback((input: string, currentContext: ConversationContext) => {
    const responses = getCompanyResponses() || {
      welcome: "Welcome to our website! How can I help you today?",
      portfolio: "We have many great projects in our portfolio.",
      team: "Our team consists of skilled professionals.",
      services: "We offer various web development services.",
      contact: "You can contact us through our contact form.",
      about: "We are a web development company.",
      pricing: "Our pricing depends on project requirements."
    };

    // Extract intent, subIntent, and entities
    const intentResult = nlp.classifyIntent(input, currentContext);
    const intent = intentResult.intent;
    const subIntent = intentResult.subIntent;

    // Analyze user's emotion and mood
    const emotionResult = nlp.analyzeEmotion(input);
    const mood = emotionResult.mood || 'neutral';
    const entities = nlp.extractEntities(input);

    // We'll use the entities directly for response generation

    // Default suggestions
    let suggestions = ['Tell me about your services', 'Show portfolio', 'Contact information'];
    let response = '';

    // Extract business type and urgency if present
    const businessType = entities.find(e => e.type === 'business_type')?.value ||
                         currentContext.userPreferences.businessType;

    const urgencyLevel = entities.find(e => e.type === 'urgency')?.value ||
                         currentContext.userPreferences.urgencyLevel;

    // Generate personalized greeting based on mood
    let greeting = '';
    if (currentContext.questionCount <= 1) {
      // First or second message
      greeting = 'Thanks for reaching out! ';
    } else if (mood === 'negative') {
      greeting = "I understand this might be frustrating. Let me help you with that. ";
    } else if (mood === 'confused') {
      greeting = "I see you might be a bit confused. Let me clarify. ";
    } else if (mood === 'impatient') {
      greeting = "I'll get right to the point. ";
    } else if (mood === 'interested') {
      greeting = "Great question! ";
    } else if (mood === 'positive') {
      greeting = "Wonderful! ";
    }

    // Generate response based on intent and context
    switch (intent) {
      case 'get_quote':
        response = responses.pricing || "Our pricing depends on project requirements.";

        // Personalize based on business type
        if (businessType === 'startup') {
          response += " We have special packages for startups that balance quality and budget constraints.";
        } else if (businessType === 'enterprise') {
          response += " For enterprise clients, we offer comprehensive solutions with priority support.";
        } else if (businessType === 'small_business') {
          response += " Our small business packages are designed to be cost-effective while meeting your specific needs.";
        }

        // Personalize based on subIntent
        if (subIntent === 'budget_constraint') {
          response += " We're flexible and can work with your budget to find the best solution.";
          suggestions = ['Budget-friendly options', 'Payment plans', 'Schedule consultation'];
        } else if (subIntent === 'premium_service') {
          response += " Our premium services include dedicated support and priority development.";
          suggestions = ['Premium features', 'Enterprise solutions', 'Schedule consultation'];
        } else {
          suggestions = ['Schedule consultation', 'View pricing details', 'Custom quote'];
        }
        break;

      case 'portfolio':
        response = responses.portfolio || "We have many great projects in our portfolio.";

        // Personalize based on detected entities
        const industry = entities.find(e => e.type === 'industry')?.value;
        if (industry) {
          response += ` We have experience working with clients in the ${industry} industry.`;
        }

        // Personalize based on subIntent
        if (subIntent === 'industry_specific') {
          suggestions = ['Industry expertise', 'Similar projects', 'Case studies'];
        } else if (subIntent === 'design_examples') {
          suggestions = ['UI/UX showcase', 'Design process', 'Brand identity work'];
        } else {
          suggestions = ['View more projects', 'Technical details', 'Contact us'];
        }
        break;

      case 'technical_info':
        response = 'We specialize in modern web technologies including React, TypeScript, and Node.js.';

        // Add details based on detected technologies
        const techEntities = entities.filter(e => e.type === 'technology');
        if (techEntities.length > 0) {
          const technologies = techEntities.map(e => e.value);
          response += ` You mentioned ${technologies.join(', ')}. We have extensive experience with these technologies.`;
        }

        // Personalize based on subIntent
        if (subIntent === 'specific_technology') {
          suggestions = ['Technology stack details', 'Development approach', 'Technical consultation'];
        } else if (subIntent === 'development_process') {
          suggestions = ['Our development process', 'Project management', 'Technical documentation'];
        } else {
          suggestions = ['View portfolio', 'Technical consultation', 'Get started'];
        }
        break;

      case 'schedule_meeting':
        response = "I'd be happy to help you schedule a meeting.";

        // Personalize based on urgency
        if (urgencyLevel === 'urgent') {
          response += " We understand this is urgent and can arrange a meeting as soon as today or tomorrow.";
          suggestions = ['Urgent meeting request', 'Today/Tomorrow availability', 'Contact directly'];
        } else if (urgencyLevel === 'relaxed') {
          response += " We can find a time that works best with your schedule in the coming weeks.";
          suggestions = ['View calendar', 'Flexible scheduling', 'Contact us'];
        } else {
          response += " When would be the best time for you?";
          suggestions = ['View availability', 'Contact us', 'Learn more'];
        }
        break;

      case 'timeline':
        response = "Our project timelines vary based on complexity and requirements.";

        // Personalize based on urgency
        if (urgencyLevel === 'urgent') {
          response += " For urgent projects, we can implement an accelerated development schedule.";
          suggestions = ['Rush development options', 'Expedited timeline', 'Priority service'];
        } else if (subIntent === 'phased_approach') {
          response += " We often recommend a phased approach to deliver value incrementally.";
          suggestions = ['Phased development', 'Milestone planning', 'Agile process'];
        } else {
          suggestions = ['Typical timelines', 'Project planning', 'Schedule consultation'];
        }
        break;

      case 'process':
        response = "Our process typically begins with a discovery phase to understand your requirements.";

        if (subIntent === 'design_process') {
          response += " Our design process involves wireframing, prototyping, and iterative feedback.";
          suggestions = ['Design methodology', 'UI/UX process', 'View design samples'];
        } else if (subIntent === 'development_process') {
          response += " We follow an agile development methodology with regular updates and demos.";
          suggestions = ['Development workflow', 'Technology stack', 'Quality assurance'];
        } else {
          suggestions = ['Project phases', 'Getting started', 'Schedule consultation'];
        }
        break;

      case 'support':
        response = "We provide comprehensive support for all our projects.";

        if (subIntent === 'urgent_support') {
          response += " For urgent issues, we have priority support channels available.";
          suggestions = ['Support options', 'Emergency contact', 'Service level agreements'];
        } else if (subIntent === 'technical_issue') {
          response += " Our technical team can help diagnose and resolve any issues you're experiencing.";
          suggestions = ['Technical support', 'Troubleshooting', 'Submit a ticket'];
        } else {
          suggestions = ['Support plans', 'Maintenance packages', 'Contact support'];
        }
        break;

      default:
        // Handle general inquiries or fallback
        if (input.toLowerCase().includes('portfolio')) {
          response = responses.portfolio || "We have many great projects in our portfolio.";
        } else if (input.toLowerCase().includes('team')) {
          response = responses.team || "Our team consists of skilled professionals.";
        } else if (input.toLowerCase().includes('contact')) {
          response = responses.contact || "You can contact us through our contact form.";
        } else if (input.toLowerCase().includes('price') || input.toLowerCase().includes('cost')) {
          response = responses.pricing || "Our pricing depends on project requirements.";
        } else {
          // General response
          response = 'I can help you with our services, portfolio, team information, or scheduling a meeting. What would you like to know?';

          // Suggest topics based on detected entities
          if (entities.some(e => e.type === 'business_type')) {
            suggestions = ['Services for your business', 'Pricing options', 'Schedule consultation'];
          } else if (entities.some(e => e.type === 'technology')) {
            suggestions = ['Our tech stack', 'Development process', 'View portfolio'];
          } else if (entities.some(e => e.type === 'industry')) {
            suggestions = ['Industry experience', 'Relevant case studies', 'Specialized services'];
          } else {
            suggestions = ['Our services', 'View portfolio', 'Contact information'];
          }
        }
    }

    // Add personalized greeting to the response
    response = greeting + response;

    // Add personalized closing based on context
    if (currentContext.questionCount > 3 && !response.includes('anything else')) {
      response += " Is there anything else you'd like to know?";
    }

    return {
      response,
      suggestions,
      entities
    };
  }, [getCompanyResponses]);
  const simulateTyping = useCallback((text: string) => {
    const wordsPerMinute = 200;
    const averageWordLength = 5;
    const timePerChar = 60 / (wordsPerMinute * averageWordLength) * 1000;
    return Math.min(Math.max(text.length * timePerChar, 1000), 3000);
  }, []);


  const handleSend = useCallback(() => {
    if (!inputText.trim()) return;

    // Process user message
    const userInput = inputText.trim();

    // Regular chatbot flow
    // Analyze user input
    const entities = nlp.extractEntities(userInput);
    const intentResult = nlp.classifyIntent(userInput, context);
    const emotionResult = nlp.analyzeEmotion(userInput);

    // Create user message with analysis results
    const userMessage: Message = {
      id: Date.now(),
      text: userInput,
      sender: 'user' as const,
      timestamp: new Date(),
      entities: entities,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      sentiment: emotionResult.sentiment
    };

    // Add message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Update conversation context
    setContext(prev => {
      // Extract business type and urgency if present
      const businessTypeEntity = entities.find(e => e.type === 'business_type');
      const urgencyLevelEntity = entities.find(e => e.type === 'urgency');
      const industry = entities.find(e => e.type === 'industry')?.value;

      // Extract technologies
      const technologies = entities
        .filter(e => e.type === 'technology')
        .map(e => e.value);

      // Update user preferences
      const updatedPreferences = { ...prev.userPreferences };

      if (businessTypeEntity?.value) {
        // Type assertion to ensure it matches the expected type
        const businessType = businessTypeEntity.value as 'startup' | 'small_business' | 'enterprise' | 'agency' | 'individual';
        updatedPreferences.businessType = businessType;
      }

      if (urgencyLevelEntity?.value) {
        // Type assertion to ensure it matches the expected type
        const urgencyLevel = urgencyLevelEntity.value as 'urgent' | 'standard' | 'relaxed';
        updatedPreferences.urgencyLevel = urgencyLevel;
      }

      if (industry) {
        updatedPreferences.industry = industry;
      }

      if (technologies.length > 0) {
        updatedPreferences.preferredTechnologies = [
          ...(prev.userPreferences.preferredTechnologies || []),
          ...technologies
        ].filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
      }

      // Update user mood
      const updatedMood = emotionResult.mood || 'neutral';

      return {
        ...prev,
        questionCount: prev.questionCount + 1,
        conversationHistory: [...prev.conversationHistory, userInput],
        lastTopic: intentResult.intent,
        // Deduplicate entities by type and value
        entities: [
          ...prev.entities,
          ...entities.filter(newEntity =>
            !prev.entities.some(existingEntity =>
              existingEntity.type === newEntity.type &&
              existingEntity.value === newEntity.value
            )
          )
        ],
        recentTopics: [intentResult.intent, ...(prev.recentTopics || [])].slice(0, 5),
        userPreferences: updatedPreferences,
        userMood: {
          current: updatedMood,
          intensity: emotionResult.intensity,
          history: [
            ...(prev.userMood?.history || []),
            { mood: updatedMood, timestamp: new Date() }
          ]
        }
      };
    });

    // Clear any existing typing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Generate and display response after a delay
    typingTimerRef.current = setTimeout(() => {
      const responseData = generateResponse(userInput, context);

      // Create system message
      const systemMessage: Message = {
        id: Date.now(),
        text: responseData.response,
        sender: 'system',
        timestamp: new Date(),
        suggestions: responseData.suggestions,
        entities: responseData.entities
      };

      setMessages(prev => [...prev, systemMessage]);
      setIsTyping(false);
    }, simulateTyping(userInput));
  }, [inputText, context, generateResponse, simulateTyping, nlp]);
  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInputText(suggestion);
    setTimeout(() => handleSend(), 0);
  }, [handleSend]);
  useEffect(() => {
    const responses = getCompanyResponses();
    // Create a more dynamic welcome message with appropriate suggestions
    setMessages([{
      id: 1,
      text: responses.welcome,
      sender: 'system',
      timestamp: new Date(),
      suggestions: [
        'Tell me about your services',
        'Show portfolio',
        'Meet the team',
        'How much do you charge?'
      ]
    }]);
  }, [getCompanyResponses]);
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // Clean up typing timer when component unmounts
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  if (!content) {
    return <div className="p-4 bg-gray-200 text-black">
        <div className="flex flex-col h-96 items-center justify-center">
          <div className="text-gray-600 font-mono">Loading chat...</div>
        </div>
      </div>;
  }



  return <div className="p-4 bg-gray-200 text-black">
      <div className="flex flex-col h-96">
        <div ref={chatBoxRef} className="flex-grow border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 p-2 mb-4 overflow-y-auto font-mono">
          {messages.map(message => <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-blue-900' : 'text-gray-700'}`}>
              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[50px]">
                  {message.sender === 'user' ? 'You:' : `${content.company?.name?.split(' ')[0] || 'Toiral'}:`}
                </span>
                <div className="flex-1">
                  <span className="whitespace-pre-line">{message.text}</span>
                  {message.suggestions && message.suggestions.length > 0 && <div className="mt-2 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => <Win95Button key={index} className="px-3 py-1 text-sm font-mono flex items-center" onClick={() => handleSuggestionClick(suggestion)}>
                          <ChevronRightIcon className="w-3 h-3 mr-1" />
                          {suggestion}
                        </Win95Button>)}
                    </div>}
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
                </span>
              </div>
            </div>)}
          {isTyping && <div className="text-gray-500 animate-pulse">
              {content.company?.name?.split(' ')[0] || 'Toiral'} is typing...
            </div>}


        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow p-2 font-mono border-2 border-gray-600 bg-white border-t-gray-800 border-l-gray-800 resize-none"
              placeholder="Type your message... (try asking about our services, team, or projects)"
              rows={2}
            />
            <Win95Button
              className="px-4 py-2 font-mono whitespace-nowrap"
              onClick={handleSend}
            >
              <SendIcon className="w-4 h-4" />
            </Win95Button>
          </div>
          <div className="flex justify-end">
            <Win95Button className="px-4 py-2 font-mono" onClick={onClose}>
              Close Chat
            </Win95Button>
          </div>
        </div>
      </div>
    </div>;
}