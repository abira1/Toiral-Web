import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, off, push, set, get } from 'firebase/database';
import { Win95Button } from '../Win95Button';
import { useAuth } from '../../contexts/AuthContext';
import { MessageSquareIcon, PlusIcon, UsersIcon, ClockIcon, ImageIcon, XIcon, HeartIcon, InfoIcon } from 'lucide-react';
import { ForumTopic } from './ForumTopic';
import { ForumBreadcrumbs } from './ForumBreadcrumbs';
import { CategoryCard } from './CategoryCard';
import { TopicCard } from './TopicCard';

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
  authorPhotoURL?: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  replies: number;
  lastReplyAt?: string;
  lastReplyAuthor?: string;
  lastReplyAuthorPhotoURL?: string;
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

export function CommunityForum() {
  const { isAuthenticated, user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);
  const [newTopic, setNewTopic] = useState({
    title: '',
    content: ''
  });
  const [topicImage, setTopicImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories and topics from Firebase
  useEffect(() => {
    const categoriesRef = ref(database, 'community/categories');
    const topicsRef = ref(database, 'community/topics');

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

        // Sort topics by creation date (newest first)
        topicsArray.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setTopics(topicsArray);
      } else {
        setTopics([]);
      }

      setLoading(false);
    };

    onValue(categoriesRef, handleCategoriesData, (error) => {
      console.error('Error loading categories:', error);
      setError('Failed to load forum categories');
      setLoading(false);
    });

    onValue(topicsRef, handleTopicsData, (error) => {
      console.error('Error loading topics:', error);
      setError('Failed to load forum topics');
      setLoading(false);
    });

    return () => {
      off(categoriesRef);
      off(topicsRef);
    };
  }, []);

  // Create a new topic
  const handleCreateTopic = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to create a topic');
      return;
    }

    if (!selectedCategory) {
      setError('Please select a category');
      return;
    }

    if (!newTopic.title.trim() || !newTopic.content.trim()) {
      setError('Please provide both title and content');
      return;
    }

    try {
      const topicsRef = ref(database, 'community/topics');
      const newTopicRef = push(topicsRef);

      // Upload image if present
      let imageUrl = '';
      if (topicImage) {
        // Convert image to base64 for Firebase Realtime Database
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(topicImage);
        });
      }

      const topicData: Omit<ForumTopic, 'id'> = {
        title: newTopic.title.trim(),
        content: newTopic.content.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || null,
        categoryId: selectedCategory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        replies: 0,
        ...(imageUrl && { imageUrl })
      };

      await set(newTopicRef, topicData);

      // Reset form
      setNewTopic({
        title: '',
        content: ''
      });
      setTopicImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setShowNewTopicForm(false);

    } catch (error) {
      console.error('Error creating topic:', error);
      setError('Failed to create topic');
    }
  };

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

    setTopicImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setTopicImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white border-2 border-gray-300 rounded-lg">
            <span className="text-gray-500 font-mono">Loading community forum...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-red-100 border-2 border-red-300 rounded-lg">
            <span className="text-red-500 font-mono">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  // If a topic is selected, show the topic view
  if (selectedTopic) {
    const topic = topics.find(t => t.id === selectedTopic);

    if (!topic) {
      return (
        <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12 bg-red-100 border-2 border-red-300 rounded-lg">
              <span className="text-red-500 font-mono">Topic not found</span>
            </div>
            <Win95Button
              onClick={() => setSelectedTopic(null)}
              className="mt-4 px-4 py-2 font-mono"
            >
              Back to Forum
            </Win95Button>
          </div>
        </div>
      );
    }

    return (
      <ForumTopic
        topicId={selectedTopic}
        onBack={() => setSelectedTopic(null)}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Forum Header */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <h2 className="font-bold font-mono text-xl mb-2">Community Forum</h2>
          <p className="font-mono text-sm text-gray-600">
            Join our community discussions. Share ideas, ask questions, and connect with other users.
          </p>
        </div>

        {/* Breadcrumb Navigation */}
        <ForumBreadcrumbs
          items={[
            {
              id: 'home',
              label: 'Forum Home',
              onClick: () => {
                setSelectedCategory(null);
                setSelectedTopic(null);
              }
            },
            ...(selectedCategory ? [{
              id: selectedCategory,
              label: categories.find(c => c.id === selectedCategory)?.name || 'Category',
              onClick: () => {
                setSelectedTopic(null);
              }
            }] : [])
          ]}
        />

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-300 text-red-700 font-mono text-sm flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Categories */}
        {!selectedCategory && (
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-gray-300 border-b-2 border-gray-400 p-3 flex justify-between items-center">
              <h3 className="font-bold font-mono">Forum Categories</h3>
              <span className="font-mono text-xs text-gray-600">{categories.length} {categories.length === 1 ? 'category' : 'categories'}</span>
            </div>

            {categories.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-mono text-gray-600">No categories available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
                {categories.map(category => {
                  const topicCount = topics.filter(t => t.categoryId === category.id).length;
                  return (
                    <CategoryCard
                      key={category.id}
                      id={category.id}
                      name={category.name}
                      description={category.description}
                      icon={category.icon}
                      topicCount={topicCount}
                      isSelected={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Topics */}
        {selectedCategory && (
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-gray-300 border-b-2 border-gray-400 p-3 flex justify-between items-center">
              <h3 className="font-bold font-mono">
                Topics in {categories.find(c => c.id === selectedCategory)?.name}
              </h3>

              {isAuthenticated ? (
                <Win95Button
                  onClick={() => setShowNewTopicForm(!showNewTopicForm)}
                  className="px-3 py-1 font-mono text-sm flex items-center"
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  New Topic
                </Win95Button>
              ) : (
                <span className="font-mono text-sm text-gray-600">Login to create topics</span>
              )}
            </div>

            {/* New Topic Form */}
            {showNewTopicForm && (
              <div className="p-4 bg-gray-100 border-b-2 border-gray-300">
                <h4 className="font-bold font-mono mb-3">Create New Topic</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block font-mono text-sm mb-1">Title</label>
                    <input
                      type="text"
                      value={newTopic.title}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 font-mono border-2 border-gray-400"
                      placeholder="Topic title"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-sm mb-1">Content</label>
                    <textarea
                      value={newTopic.content}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full p-2 font-mono border-2 border-gray-400 min-h-[100px]"
                      placeholder="Write your topic content here..."
                    />
                  </div>

                  {/* Image upload */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        className="hidden"
                        id="topic-image-upload"
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

                  <div className="flex justify-end gap-2">
                    <Win95Button
                      onClick={() => {
                        setShowNewTopicForm(false);
                        setTopicImage(null);
                        setImagePreview(null);
                        setError(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="px-3 py-1 font-mono text-sm"
                    >
                      Cancel
                    </Win95Button>
                    <Win95Button
                      onClick={handleCreateTopic}
                      className="px-3 py-1 font-mono text-sm"
                    >
                      Create Topic
                    </Win95Button>
                  </div>
                </div>
              </div>
            )}

            {/* Topics List */}
            {topics.filter(topic => topic.categoryId === selectedCategory).length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-mono text-gray-600">No topics in this category yet</p>
                {isAuthenticated && (
                  <p className="font-mono text-sm text-gray-500 mt-2">
                    Be the first to create a topic!
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 p-6">
                {topics
                  .filter(topic => topic.categoryId === selectedCategory)
                  .map(topic => (
                    <TopicCard
                      key={topic.id}
                      title={topic.title}
                      content={topic.content}
                      authorName={topic.authorName}
                      createdAt={topic.createdAt}
                      replies={topic.replies}
                      views={topic.views || 0}
                      isPinned={topic.isPinned}
                      isLocked={topic.isLocked}
                      loveCount={topic.loveCount}
                      lastReplyAt={topic.lastReplyAt}
                      lastReplyAuthor={topic.lastReplyAuthor}
                      imageUrl={topic.imageUrl}
                      onClick={() => setSelectedTopic(topic.id)}
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
