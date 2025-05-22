import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, off, set, push, remove, update } from 'firebase/database';
import { Win95Button } from '../Win95Button';
import { UserAvatar } from '../community/UserAvatar';
import { LazyImage } from '../LazyImage';
import {
  PlusIcon,
  TrashIcon,
  SaveIcon,
  AlertTriangleIcon,
  RefreshCwIcon,
  MessageSquareIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  LockIcon,
  UnlockIcon,
  PinIcon,
  HeartIcon,
  ImageIcon,
  XIcon
} from 'lucide-react';

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

export function ForumManager() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'topics' | 'posts'>('categories');
  const [newCategory, setNewCategory] = useState<Omit<ForumCategory, 'id'>>({
    name: '',
    description: '',
    order: 0,
    icon: ''
  });
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load forum data from Firebase
  useEffect(() => {
    const categoriesRef = ref(database, 'community/categories');
    const topicsRef = ref(database, 'community/topics');
    const postsRef = ref(database, 'community/posts');

    const handleCategoriesData = (snapshot: any) => {
      if (snapshot.exists()) {
        const categoriesData = snapshot.val();
        const categoriesArray = Object.keys(categoriesData).map(key => ({
          id: key,
          ...categoriesData[key]
        }));

        // Sort categories by order
        categoriesArray.sort((a, b) => a.order - b.order);

        setCategories(categoriesArray);
      } else {
        setCategories([]);
      }
    };

    const handleTopicsData = (snapshot: any) => {
      if (snapshot.exists()) {
        const topicsData = snapshot.val();
        const topicsArray = Object.keys(topicsData).map(key => ({
          id: key,
          ...topicsData[key]
        }));

        setTopics(topicsArray);
      } else {
        setTopics([]);
      }
    };

    const handlePostsData = (snapshot: any) => {
      if (snapshot.exists()) {
        const postsData = snapshot.val();
        const postsArray = Object.keys(postsData).map(key => ({
          id: key,
          ...postsData[key]
        }));

        setPosts(postsArray);
      } else {
        setPosts([]);
      }

      setLoading(false);
    };

    onValue(categoriesRef, handleCategoriesData, (error) => {
      console.error('Error loading categories:', error);
      setError('Failed to load forum categories');
    });

    onValue(topicsRef, handleTopicsData, (error) => {
      console.error('Error loading topics:', error);
      setError('Failed to load forum topics');
    });

    onValue(postsRef, handlePostsData, (error) => {
      console.error('Error loading posts:', error);
      setError('Failed to load forum posts');
      setLoading(false);
    });

    return () => {
      off(categoriesRef);
      off(topicsRef);
      off(postsRef);
    };
  }, []);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('File must be an image');
      return;
    }

    setCategoryImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setCategoryImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Add a new category
  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || !newCategory.description.trim()) {
      setError('Please provide both name and description');
      return;
    }

    try {
      setSaving(true);

      const categoriesRef = ref(database, 'community/categories');
      const newCategoryRef = push(categoriesRef);

      // Upload image if present
      let iconUrl = '';
      if (categoryImage) {
        // Convert image to base64 for Firebase Realtime Database
        const reader = new FileReader();
        iconUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(categoryImage);
        });
      }

      await set(newCategoryRef, {
        name: newCategory.name.trim(),
        description: newCategory.description.trim(),
        order: categories.length, // Set order to the end of the list
        ...(iconUrl && { icon: iconUrl })
      });

      // Reset form
      setNewCategory({
        name: '',
        description: '',
        order: 0,
        icon: ''
      });
      setCategoryImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setSuccess('Category added successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  // Remove a category
  const handleRemoveCategory = async (categoryId: string) => {
    // Check if there are topics in this category
    const topicsInCategory = topics.filter(topic => topic.categoryId === categoryId);

    if (topicsInCategory.length > 0) {
      if (!window.confirm(`This category contains ${topicsInCategory.length} topics. Deleting it will also delete all topics and posts within. Are you sure?`)) {
        return;
      }

      // Delete all topics in this category
      for (const topic of topicsInCategory) {
        // Delete all posts in this topic
        const postsInTopic = posts.filter(post => post.topicId === topic.id);
        for (const post of postsInTopic) {
          await remove(ref(database, `community/posts/${post.id}`));
        }

        // Delete the topic
        await remove(ref(database, `community/topics/${topic.id}`));
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete this category?`)) {
        return;
      }
    }

    try {
      setSaving(true);

      await remove(ref(database, `community/categories/${categoryId}`));

      setSuccess('Category removed successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error removing category:', error);
      setError('Failed to remove category');
    } finally {
      setSaving(false);
    }
  };

  // Move category up or down in order
  const handleMoveCategory = async (categoryId: string, direction: 'up' | 'down') => {
    const categoryIndex = categories.findIndex(cat => cat.id === categoryId);
    if (categoryIndex === -1) return;

    // Can't move first category up or last category down
    if (
      (direction === 'up' && categoryIndex === 0) ||
      (direction === 'down' && categoryIndex === categories.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === 'up' ? categoryIndex - 1 : categoryIndex + 1;

    try {
      setSaving(true);

      // Swap orders
      const currentOrder = categories[categoryIndex].order;
      const swapOrder = categories[swapIndex].order;

      await update(ref(database, `community/categories/${categoryId}`), {
        order: swapOrder
      });

      await update(ref(database, `community/categories/${categories[swapIndex].id}`), {
        order: currentOrder
      });

      setSuccess('Category order updated');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error updating category order:', error);
      setError('Failed to update category order');
    } finally {
      setSaving(false);
    }
  };

  // Toggle topic pinned status
  const handleToggleTopicPin = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    try {
      setSaving(true);

      await update(ref(database, `community/topics/${topicId}`), {
        isPinned: !topic.isPinned
      });

      setSuccess(`Topic ${topic.isPinned ? 'unpinned' : 'pinned'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error toggling topic pin:', error);
      setError('Failed to update topic');
    } finally {
      setSaving(false);
    }
  };

  // Toggle topic locked status
  const handleToggleTopicLock = async (topicId: string) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return;

    try {
      setSaving(true);

      await update(ref(database, `community/topics/${topicId}`), {
        isLocked: !topic.isLocked
      });

      setSuccess(`Topic ${topic.isLocked ? 'unlocked' : 'locked'} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error toggling topic lock:', error);
      setError('Failed to update topic');
    } finally {
      setSaving(false);
    }
  };

  // Delete a topic
  const handleDeleteTopic = async (topicId: string) => {
    // Check if there are posts in this topic
    const postsInTopic = posts.filter(post => post.topicId === topicId);

    if (postsInTopic.length > 0) {
      if (!window.confirm(`This topic contains ${postsInTopic.length} posts. Are you sure you want to delete it?`)) {
        return;
      }

      // Delete all posts in this topic
      for (const post of postsInTopic) {
        await remove(ref(database, `community/posts/${post.id}`));
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete this topic?`)) {
        return;
      }
    }

    try {
      setSaving(true);

      await remove(ref(database, `community/topics/${topicId}`));

      setSuccess('Topic deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting topic:', error);
      setError('Failed to delete topic');
    } finally {
      setSaving(false);
    }
  };

  // Delete a post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm(`Are you sure you want to delete this post?`)) {
      return;
    }

    try {
      setSaving(true);

      const post = posts.find(p => p.id === postId);
      if (post) {
        // Update topic reply count
        const topic = topics.find(t => t.id === post.topicId);
        if (topic && topic.replies > 0) {
          await update(ref(database, `community/topics/${post.topicId}`), {
            replies: topic.replies - 1
          });
        }
      }

      await remove(ref(database, `community/posts/${postId}`));

      setSuccess('Post deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    } finally {
      setSaving(false);
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-4 bg-white border-2 border-gray-400">
        <p className="font-mono text-center">Loading forum data...</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="bg-white border-2 border-gray-400 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-mono font-bold text-lg">Community Forum Manager</h3>
          <div className="flex gap-2">
            <Win95Button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 font-mono text-sm ${activeTab === 'categories' ? 'bg-blue-100' : ''}`}
            >
              Categories
            </Win95Button>
            <Win95Button
              onClick={() => setActiveTab('topics')}
              className={`px-3 py-1 font-mono text-sm ${activeTab === 'topics' ? 'bg-blue-100' : ''}`}
            >
              Topics
            </Win95Button>
            <Win95Button
              onClick={() => setActiveTab('posts')}
              className={`px-3 py-1 font-mono text-sm ${activeTab === 'posts' ? 'bg-blue-100' : ''}`}
            >
              Posts
            </Win95Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border-2 border-red-400 text-red-700 font-mono text-sm flex items-center">
            <AlertTriangleIcon className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border-2 border-green-400 text-green-700 font-mono text-sm">
            {success}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="mb-6 p-4 bg-gray-100 border-2 border-gray-300">
              <h4 className="font-mono font-bold mb-3 flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Add New Category
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block font-mono text-sm mb-1">Category Name</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 font-mono border-2 border-gray-400"
                    placeholder="Category name"
                  />
                </div>
                <div>
                  <label className="block font-mono text-sm mb-1">Description</label>
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 font-mono border-2 border-gray-400"
                    placeholder="Category description"
                  />
                </div>

                {/* Category Image Upload */}
                <div>
                  <label className="block font-mono text-sm mb-1">Category Image</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                        id="category-image-upload"
                      />
                      <Win95Button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 font-mono text-sm flex items-center"
                      >
                        <ImageIcon className="w-4 h-4 mr-1" />
                        Add Image
                      </Win95Button>

                      {imagePreview && (
                        <Win95Button
                          onClick={handleRemoveImage}
                          className="px-3 py-1 font-mono text-sm flex items-center bg-red-100"
                        >
                          <XIcon className="w-4 h-4 mr-1" />
                          Remove Image
                        </Win95Button>
                      )}
                    </div>

                    {imagePreview && (
                      <div className="mt-2 relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full max-h-64 border-2 border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Win95Button
                    onClick={handleAddCategory}
                    className="px-3 py-1 font-mono text-sm flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <RefreshCwIcon className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <PlusIcon className="w-4 h-4 mr-1" />
                    )}
                    Add Category
                  </Win95Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <h4 className="font-mono font-bold">Manage Categories</h4>
              <span className="font-mono text-xs text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </span>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-8 bg-gray-100 border-2 border-gray-300">
                <p className="font-mono text-gray-600">No categories available</p>
                <p className="font-mono text-sm text-gray-500 mt-2">
                  Add your first category using the form above.
                </p>
              </div>
            ) : (
              <div className="border-2 border-gray-300">
                <div className="bg-gray-300 p-2 font-mono text-sm font-bold grid grid-cols-12 gap-2">
                  <div className="col-span-6">Category</div>
                  <div className="col-span-2 text-center">Topics</div>
                  <div className="col-span-4 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {categories.map((category) => {
                    const topicCount = topics.filter(topic => topic.categoryId === category.id).length;
                    return (
                      <div key={category.id} className="p-3 bg-white hover:bg-gray-50">
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 flex items-center justify-center bg-gray-200 border-2 border-t-white border-l-white border-b-gray-800 border-r-gray-800 overflow-hidden">
                                {category.icon ? (
                                  <LazyImage
                                    src={category.icon}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22100%22%20height%3D%22100%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E%3C%2Ftext%3E%3C%2Fsvg%3E";
                                    }}
                                  />
                                ) : (
                                  <MessageSquareIcon className="w-6 h-6 text-gray-600" />
                                )}
                              </div>
                              <div>
                                <h5 className="font-bold font-mono">{category.name}</h5>
                                <p className="font-mono text-sm text-gray-600">{category.description}</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2 text-center">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 border border-gray-200">
                              {topicCount}
                            </span>
                          </div>

                          <div className="col-span-4 flex justify-end gap-2">
                            <Win95Button
                              onClick={() => handleMoveCategory(category.id, 'up')}
                              className="px-2 py-1 font-mono text-sm"
                              disabled={categories.indexOf(category) === 0}
                              title="Move Up"
                            >
                              <ArrowUpIcon className="w-4 h-4" />
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleMoveCategory(category.id, 'down')}
                              className="px-2 py-1 font-mono text-sm"
                              disabled={categories.indexOf(category) === categories.length - 1}
                              title="Move Down"
                            >
                              <ArrowDownIcon className="w-4 h-4" />
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleRemoveCategory(category.id)}
                              className="px-2 py-1 font-mono text-sm bg-red-100"
                              title="Delete Category"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Win95Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-mono font-bold">Manage Topics</h4>
              <div className="flex gap-2 items-center">
                <span className="font-mono text-xs text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300">
                  {topics.length} {topics.length === 1 ? 'topic' : 'topics'}
                </span>

                {/* Filter by category dropdown could be added here */}
              </div>
            </div>

            {topics.length === 0 ? (
              <div className="text-center py-8 bg-gray-100 border-2 border-gray-300">
                <p className="font-mono text-gray-600">No topics available</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300">
                <div className="bg-gray-300 p-2 font-mono text-sm font-bold grid grid-cols-12 gap-2">
                  <div className="col-span-7">Topic</div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-3 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {topics.map((topic) => {
                    const category = categories.find(c => c.id === topic.categoryId);
                    return (
                      <div key={topic.id} className="p-3 bg-white hover:bg-gray-50">
                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-7">
                            <div className="flex flex-col">
                              <h5 className="font-bold font-mono flex items-center gap-2">
                                <div className="flex gap-1">
                                  {topic.isPinned && (
                                    <div title="Pinned">
                                      <PinIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                  )}
                                  {topic.isLocked && (
                                    <div title="Locked">
                                      <LockIcon className="w-4 h-4 text-red-600" />
                                    </div>
                                  )}
                                </div>
                                {topic.title}
                              </h5>
                              <p className="font-mono text-sm text-gray-600 line-clamp-2 mt-1">{topic.content}</p>

                              {/* Topic image (if any) */}
                              {topic.imageUrl && (
                                <div className="mt-2 mb-2 flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 border border-blue-100 text-xs">
                                    <ImageIcon className="w-3 h-3 text-blue-500" />
                                    <span className="font-mono">Has image</span>
                                  </div>
                                  <img
                                    src={topic.imageUrl}
                                    alt="Topic attachment"
                                    className="max-w-[80px] max-h-[50px] border border-gray-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";
                                    }}
                                  />
                                </div>
                              )}

                              <div className="mt-2 font-mono text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                                <span className="flex items-center gap-1">
                                  <UserAvatar username={topic.authorName} photoURL={topic.authorPhotoURL} size="small" className="w-5 h-5 text-[10px]" />
                                  {topic.authorName}
                                </span>
                                <span>{formatDate(topic.createdAt)}</span>
                                <div className="flex items-center gap-1">
                                  <span>{topic.views} views</span>
                                  <span>•</span>
                                  <span>{topic.replies} replies</span>
                                </div>
                                {topic.loveCount && topic.loveCount > 0 && (
                                  <span className="flex items-center gap-1 text-red-500">
                                    <HeartIcon className="w-3 h-3" />
                                    {topic.loveCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="col-span-2">
                            <span className="font-mono text-sm bg-gray-100 px-2 py-1 border border-gray-200">
                              {category?.name || 'Unknown'}
                            </span>
                          </div>

                          <div className="col-span-3 flex justify-end gap-2">
                            <Win95Button
                              onClick={() => handleToggleTopicPin(topic.id)}
                              className={`px-2 py-1 font-mono text-sm ${topic.isPinned ? 'bg-blue-100' : ''}`}
                              title={topic.isPinned ? "Unpin Topic" : "Pin Topic"}
                            >
                              <PinIcon className={`w-4 h-4 ${topic.isPinned ? 'text-blue-600' : ''}`} />
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleToggleTopicLock(topic.id)}
                              className={`px-2 py-1 font-mono text-sm ${topic.isLocked ? 'bg-red-100' : ''}`}
                              title={topic.isLocked ? "Unlock Topic" : "Lock Topic"}
                            >
                              {topic.isLocked ? (
                                <UnlockIcon className="w-4 h-4" />
                              ) : (
                                <LockIcon className="w-4 h-4" />
                              )}
                            </Win95Button>
                            <Win95Button
                              onClick={() => handleDeleteTopic(topic.id)}
                              className="px-2 py-1 font-mono text-sm bg-red-100"
                              title="Delete Topic"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Win95Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-mono font-bold">Manage Posts</h4>
              <span className="font-mono text-xs text-gray-600 bg-gray-200 px-2 py-1 border border-gray-300">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-8 bg-gray-100 border-2 border-gray-300">
                <p className="font-mono text-gray-600">No posts available</p>
              </div>
            ) : (
              <div className="border-2 border-gray-300">
                <div className="bg-gray-300 p-2 font-mono text-sm font-bold grid grid-cols-12 gap-2">
                  <div className="col-span-3">Topic</div>
                  <div className="col-span-6">Content</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                <div className="divide-y divide-gray-200">
                  {posts.map((post) => {
                    const topic = topics.find(t => t.id === post.topicId);
                    const category = topic ? categories.find(c => c.id === topic.categoryId) : null;

                    return (
                      <div key={post.id} className="p-3 bg-white hover:bg-gray-50">
                        <div className="grid grid-cols-12 gap-2 items-start">
                          <div className="col-span-3">
                            <div className="flex flex-col">
                              <h5 className="font-bold font-mono text-sm line-clamp-2">
                                {topic?.title || 'Unknown Topic'}
                              </h5>
                              {category && (
                                <span className="font-mono text-xs text-gray-500 mt-1">
                                  in {category.name}
                                </span>
                              )}
                              <span className="font-mono text-xs text-gray-500 mt-1">
                                {formatDate(post.createdAt)}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-6">
                            <div className="flex flex-col">
                              <p className="font-mono text-sm text-gray-600 line-clamp-3 bg-gray-50 p-2 border border-gray-200">
                                {post.content}
                              </p>

                              {/* Post image (if any) */}
                              {post.imageUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 border border-blue-100 text-xs">
                                    <ImageIcon className="w-3 h-3 text-blue-500" />
                                    <span className="font-mono">Has image</span>
                                  </div>
                                  <img
                                    src={post.imageUrl}
                                    alt="Post attachment"
                                    className="max-w-[80px] max-h-[50px] border border-gray-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";
                                    }}
                                  />
                                </div>
                              )}

                              {/* Love count */}
                              {post.loveCount && post.loveCount > 0 && (
                                <div className="mt-2 flex items-center gap-1">
                                  <HeartIcon className="w-3 h-3 text-red-500" />
                                  <span className="font-mono text-xs">{post.loveCount} loves</span>
                                </div>
                              )}

                              {post.isEdited && (
                                <span className="font-mono text-xs text-gray-500 italic mt-1">
                                  Edited on {formatDate(post.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="col-span-2">
                            <div className="flex items-center gap-2">
                              <UserAvatar username={post.authorName} photoURL={post.authorPhotoURL} size="small" className="w-6 h-6" />
                              <span className="font-mono text-sm">
                                {post.authorName}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-1 flex justify-end">
                            <Win95Button
                              onClick={() => handleDeletePost(post.id)}
                              className="px-2 py-1 font-mono text-sm bg-red-100"
                              title="Delete Post"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Win95Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
