import { database } from './config';
import { ref, get, set, push, update, remove, onValue, off } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

// Types
interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  lastReplyAt?: string;
  lastReplyAuthor?: string;
  lastReplyAuthorPhotoURL?: string | null;
  isPinned?: boolean;
  isLocked?: boolean;
  imageUrl?: string;
  loves?: {
    [userId: string]: {
      timestamp: string;
    }
  };
  loveCount?: number;
}

interface ForumPost {
  id: string;
  topicId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string | null;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  imageUrl?: string;
  loves?: {
    [userId: string]: {
      timestamp: string;
    }
  };
  loveCount?: number;
}

// Get forum categories
export const getForumCategories = async (): Promise<ForumCategory[]> => {
  try {
    const snapshot = await get(ref(database, 'community/categories'));
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      const categoriesArray = Object.keys(categoriesData).map(key => ({
        id: key,
        ...categoriesData[key]
      }));

      // Sort categories by order
      categoriesArray.sort((a, b) => a.order - b.order);

      return categoriesArray;
    }
    return [];
  } catch (error) {
    console.error('Error getting forum categories:', error);
    throw error;
  }
};

// Add a forum category
export const addForumCategory = async (category: Omit<ForumCategory, 'id'>): Promise<string> => {
  try {
    const categoriesRef = ref(database, 'community/categories');
    const newCategoryRef = push(categoriesRef);

    await set(newCategoryRef, category);

    return newCategoryRef.key || '';
  } catch (error) {
    console.error('Error adding forum category:', error);
    throw error;
  }
};

// Update a forum category
export const updateForumCategory = async (categoryId: string, updates: Partial<ForumCategory>): Promise<void> => {
  try {
    const categoryRef = ref(database, `community/categories/${categoryId}`);
    await update(categoryRef, updates);
  } catch (error) {
    console.error('Error updating forum category:', error);
    throw error;
  }
};

// Delete a forum category
export const deleteForumCategory = async (categoryId: string): Promise<void> => {
  try {
    const categoryRef = ref(database, `community/categories/${categoryId}`);
    await remove(categoryRef);
  } catch (error) {
    console.error('Error deleting forum category:', error);
    throw error;
  }
};

// Get forum topics
export const getForumTopics = async (categoryId?: string): Promise<ForumTopic[]> => {
  try {
    const snapshot = await get(ref(database, 'community/topics'));
    if (snapshot.exists()) {
      const topicsData = snapshot.val();
      let topicsArray = Object.keys(topicsData).map(key => ({
        id: key,
        ...topicsData[key]
      }));

      // Filter by category if provided
      if (categoryId) {
        topicsArray = topicsArray.filter(topic => topic.categoryId === categoryId);
      }

      // Sort topics: pinned first, then by creation date (newest first)
      topicsArray.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      return topicsArray;
    }
    return [];
  } catch (error) {
    console.error('Error getting forum topics:', error);
    throw error;
  }
};

// Get a single forum topic
export const getForumTopic = async (topicId: string): Promise<ForumTopic | null> => {
  try {
    const snapshot = await get(ref(database, `community/topics/${topicId}`));
    if (snapshot.exists()) {
      return {
        id: topicId,
        ...snapshot.val()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting forum topic:', error);
    throw error;
  }
};

// Add a forum topic
export const addForumTopic = async (topic: Omit<ForumTopic, 'id'>): Promise<string> => {
  try {
    const topicsRef = ref(database, 'community/topics');
    const newTopicRef = push(topicsRef);

    await set(newTopicRef, topic);

    return newTopicRef.key || '';
  } catch (error) {
    console.error('Error adding forum topic:', error);
    throw error;
  }
};

// Update a forum topic
export const updateForumTopic = async (topicId: string, updates: Partial<ForumTopic>): Promise<void> => {
  try {
    const topicRef = ref(database, `community/topics/${topicId}`);
    await update(topicRef, updates);
  } catch (error) {
    console.error('Error updating forum topic:', error);
    throw error;
  }
};

// Delete a forum topic
export const deleteForumTopic = async (topicId: string): Promise<void> => {
  try {
    const topicRef = ref(database, `community/topics/${topicId}`);
    await remove(topicRef);
  } catch (error) {
    console.error('Error deleting forum topic:', error);
    throw error;
  }
};

// Get forum posts for a topic
export const getForumPosts = async (topicId: string): Promise<ForumPost[]> => {
  try {
    const snapshot = await get(ref(database, 'community/posts'));
    if (snapshot.exists()) {
      const postsData = snapshot.val();
      const postsArray = Object.keys(postsData)
        .map(key => ({
          id: key,
          ...postsData[key]
        }))
        .filter(post => post.topicId === topicId);

      // Sort posts by creation date (oldest first)
      postsArray.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return postsArray;
    }
    return [];
  } catch (error) {
    console.error('Error getting forum posts:', error);
    throw error;
  }
};

// Add a forum post
export const addForumPost = async (post: Omit<ForumPost, 'id'>): Promise<string> => {
  try {
    const postsRef = ref(database, 'community/posts');
    const newPostRef = push(postsRef);

    await set(newPostRef, post);

    // Update topic with reply count and last reply info
    const topicRef = ref(database, `community/topics/${post.topicId}`);
    const topicSnapshot = await get(topicRef);

    if (topicSnapshot.exists()) {
      const topic = topicSnapshot.val();
      await update(topicRef, {
        replies: (topic.replies || 0) + 1,
        lastReplyAt: post.createdAt,
        lastReplyAuthor: post.authorName,
        lastReplyAuthorPhotoURL: post.authorPhotoURL || null
      });
    }

    return newPostRef.key || '';
  } catch (error) {
    console.error('Error adding forum post:', error);
    throw error;
  }
};

// Add a love reaction to a post
export const addLoveToPost = async (
  postId: string,
  userId: string
): Promise<void> => {
  try {
    const postRef = ref(database, `community/posts/${postId}`);
    const postSnapshot = await get(postRef);

    if (!postSnapshot.exists()) {
      throw new Error('Post not found');
    }

    const post = postSnapshot.val();
    const loves = post.loves || {};
    const currentLoveCount = post.loveCount || 0;

    // Check if user already loved this post
    if (loves[userId]) {
      // User already loved, so remove it
      const updatedLoves = { ...loves };
      delete updatedLoves[userId];

      await update(postRef, {
        loves: updatedLoves,
        loveCount: Math.max(0, currentLoveCount - 1)
      });
    } else {
      // Add new love
      await update(postRef, {
        [`loves/${userId}`]: {
          timestamp: new Date().toISOString()
        },
        loveCount: currentLoveCount + 1
      });
    }

  } catch (error) {
    console.error('Error adding love to post:', error);
    throw error;
  }
};

// Add a love reaction to a topic
export const addLoveToTopic = async (
  topicId: string,
  userId: string
): Promise<void> => {
  try {
    const topicRef = ref(database, `community/topics/${topicId}`);
    const topicSnapshot = await get(topicRef);

    if (!topicSnapshot.exists()) {
      throw new Error('Topic not found');
    }

    const topic = topicSnapshot.val();
    const loves = topic.loves || {};
    const currentLoveCount = topic.loveCount || 0;

    // Check if user already loved this topic
    if (loves[userId]) {
      // User already loved, so remove it
      const updatedLoves = { ...loves };
      delete updatedLoves[userId];

      await update(topicRef, {
        loves: updatedLoves,
        loveCount: Math.max(0, currentLoveCount - 1)
      });
    } else {
      // Add new love
      await update(topicRef, {
        [`loves/${userId}`]: {
          timestamp: new Date().toISOString()
        },
        loveCount: currentLoveCount + 1
      });
    }

  } catch (error) {
    console.error('Error adding love to topic:', error);
    throw error;
  }
};

// Check if user has loved a post
export const hasUserLovedPost = async (
  postId: string,
  userId: string
): Promise<boolean> => {
  try {
    const loveRef = ref(database, `community/posts/${postId}/loves/${userId}`);
    const snapshot = await get(loveRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking if user loved post:', error);
    throw error;
  }
};

// Update a forum post
export const updateForumPost = async (postId: string, updates: Partial<ForumPost>): Promise<void> => {
  try {
    const postRef = ref(database, `community/posts/${postId}`);

    // Mark as edited if content is being updated
    if (updates.content) {
      updates.isEdited = true;
      updates.updatedAt = new Date().toISOString();
    }

    await update(postRef, updates);
  } catch (error) {
    console.error('Error updating forum post:', error);
    throw error;
  }
};

// Delete a forum post
export const deleteForumPost = async (postId: string): Promise<void> => {
  try {
    // Get post data first to update topic
    const postRef = ref(database, `community/posts/${postId}`);
    const postSnapshot = await get(postRef);

    if (postSnapshot.exists()) {
      const post = postSnapshot.val();

      // Update topic reply count
      const topicRef = ref(database, `community/topics/${post.topicId}`);
      const topicSnapshot = await get(topicRef);

      if (topicSnapshot.exists()) {
        const topic = topicSnapshot.val();
        if (topic.replies > 0) {
          await update(topicRef, {
            replies: topic.replies - 1
          });
        }
      }
    }

    // Delete the post
    await remove(postRef);
  } catch (error) {
    console.error('Error deleting forum post:', error);
    throw error;
  }
};

// Subscribe to forum categories
export const subscribeToForumCategories = (
  callback: (categories: ForumCategory[]) => void,
  errorCallback?: (error: Error) => void
): (() => void) => {
  const categoriesRef = ref(database, 'community/categories');

  const handleData = (snapshot: any) => {
    if (snapshot.exists()) {
      const categoriesData = snapshot.val();
      const categoriesArray = Object.keys(categoriesData).map(key => ({
        id: key,
        ...categoriesData[key]
      }));

      // Sort categories by order
      categoriesArray.sort((a, b) => a.order - b.order);

      callback(categoriesArray);
    } else {
      callback([]);
    }
  };

  const handleError = (error: Error) => {
    console.error('Error in forum categories subscription:', error);
    if (errorCallback) {
      errorCallback(error);
    }
  };

  onValue(categoriesRef, handleData, handleError);

  // Return unsubscribe function
  return () => off(categoriesRef);
};

// Initialize community forum with default categories
export const initializeCommunityForum = async (): Promise<void> => {
  try {
    const categoriesSnapshot = await get(ref(database, 'community/categories'));

    // Only initialize if the collection doesn't exist
    if (!categoriesSnapshot.exists()) {
      const defaultCategories = [
        {
          name: 'General Discussion',
          description: 'General topics and discussions about our services',
          order: 0
        },
        {
          name: 'Questions & Support',
          description: 'Ask questions and get help from our community',
          order: 1
        },
        {
          name: 'Showcase',
          description: 'Share your projects and get feedback',
          order: 2
        },
        {
          name: 'Suggestions',
          description: 'Suggest new features or improvements',
          order: 3
        }
      ];

      // Add default categories
      for (const [index, category] of defaultCategories.entries()) {
        const categoryRef = ref(database, `community/categories/${uuidv4()}`);
        await set(categoryRef, {
          ...category,
          order: index
        });
      }

      console.log('Community forum initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing community forum:', error);
    throw error;
  }
};
