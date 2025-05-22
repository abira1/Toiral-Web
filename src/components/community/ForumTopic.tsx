import React, { useState, useEffect, useRef } from 'react';
import { database } from '../../firebase/config';
import { ref, onValue, off, push, set, update } from 'firebase/database';
import { Win95Button } from '../Win95Button';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeftIcon,
  ClockIcon,
  SendIcon,
  ImageIcon,
  HeartIcon,
  XIcon,
  EyeIcon,
  InfoIcon,
  PinIcon,
  LockIcon
} from 'lucide-react';
import { addLoveToPost, addLoveToTopic } from '../../firebase/communityDatabase';
import { ForumBreadcrumbs } from './ForumBreadcrumbs';

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

interface ForumTopicProps {
  topicId: string;
  onBack: () => void;
}

export function ForumTopic({ topicId, onBack }: ForumTopicProps) {
  const { isAuthenticated, user } = useAuth();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load topic and posts from Firebase
  useEffect(() => {
    const topicRef = ref(database, `community/topics/${topicId}`);
    const postsRef = ref(database, 'community/posts');
    let viewCountUpdated = false;

    const handleTopicData = (snapshot: any) => {
      if (snapshot.exists()) {
        const topicData = snapshot.val();
        setTopic({
          id: topicId,
          ...topicData
        });

        // Increment view count only once when the component mounts
        if (!viewCountUpdated) {
          viewCountUpdated = true;
          // Use a separate reference to avoid triggering the listener again
          const updateViewsRef = ref(database, `community/topics/${topicId}/views`);
          update(updateViewsRef, (topicData.views || 0) + 1);
        }
      } else {
        setTopic(null);
        setError('Topic not found');
      }
    };

    const handlePostsData = (snapshot: any) => {
      if (snapshot.exists()) {
        const postsData = snapshot.val();
        const postsArray = Object.keys(postsData)
          .map(key => ({
            id: key,
            ...postsData[key]
          }))
          .filter(post => post.topicId === topicId);

        // Sort posts by creation date
        postsArray.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        setPosts(postsArray);
      } else {
        setPosts([]);
      }

      setLoading(false);
    };

    onValue(topicRef, handleTopicData, (error) => {
      console.error('Error loading topic:', error);
      setError('Failed to load topic');
      setLoading(false);
    });

    onValue(postsRef, handlePostsData, (error) => {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
      setLoading(false);
    });

    return () => {
      off(topicRef);
      off(postsRef);
    };
  }, [topicId]);

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

    setReplyImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setReplyImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle love reaction for posts
  const handleLoveReaction = async (postId: string) => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to react to posts');
      return;
    }

    try {
      await addLoveToPost(postId, user.uid);
    } catch (error) {
      console.error('Error handling love reaction:', error);
      setError('Failed to update reaction');
    }
  };

  // Handle love reaction for topics
  const handleLoveTopic = async () => {
    if (!isAuthenticated || !user || !topicId) {
      setError('You must be logged in to react to topics');
      return;
    }

    try {
      await addLoveToTopic(topicId, user.uid);
    } catch (error) {
      console.error('Error handling topic love reaction:', error);
      setError('Failed to update reaction');
    }
  };

  // Submit a reply
  const handleSubmitReply = async () => {
    if (!isAuthenticated || !user) {
      setError('You must be logged in to reply');
      return;
    }

    if (!replyContent.trim() && !replyImage) {
      setError('Reply must contain text or an image');
      return;
    }

    try {
      setSubmitting(true);

      // Upload image if present
      let imageUrl = '';
      if (replyImage) {
        // Convert image to base64 for Firebase Realtime Database
        const reader = new FileReader();
        imageUrl = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(replyImage);
        });
      }

      const postsRef = ref(database, 'community/posts');
      const newPostRef = push(postsRef);

      const postData: Omit<ForumPost, 'id'> = {
        topicId,
        content: replyContent.trim(),
        authorId: user.uid,
        authorName: user.displayName || 'Anonymous',
        authorPhotoURL: user.photoURL || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(imageUrl && { imageUrl })
      };

      await set(newPostRef, postData);

      // Update topic with reply count and last reply info
      if (topic) {
        const topicRef = ref(database, `community/topics/${topicId}`);
        await update(topicRef, {
          replies: (topic.replies || 0) + 1,
          lastReplyAt: new Date().toISOString(),
          lastReplyAuthor: user.displayName || 'Anonymous',
          lastReplyAuthorPhotoURL: user.photoURL || null
        });
      }

      // Clear reply input
      setReplyContent('');
      setReplyImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      setError('Failed to submit reply');
    } finally {
      setSubmitting(false);
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
      <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-white border-2 border-gray-300 rounded-lg">
            <span className="text-gray-500 font-mono">Loading topic...</span>
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
          <Win95Button
            onClick={onBack}
            className="mt-4 px-4 py-2 font-mono flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Forum
          </Win95Button>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12 bg-red-100 border-2 border-red-300 rounded-lg">
            <span className="text-red-500 font-mono">Topic not found</span>
          </div>
          <Win95Button
            onClick={onBack}
            className="mt-4 px-4 py-2 font-mono flex items-center"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Forum
          </Win95Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Breadcrumb Navigation */}
        <ForumBreadcrumbs
          items={[
            {
              id: 'home',
              label: 'Forum Home',
              onClick: onBack
            }
          ]}
        />

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border-2 border-red-300 text-red-700 font-mono text-sm flex items-center gap-2">
            <InfoIcon className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Topic Header */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-center gap-2 mb-2">
            {topic.isPinned && (
              <div title="Pinned Topic">
                <PinIcon className="w-5 h-5 text-blue-600" />
              </div>
            )}
            {topic.isLocked && (
              <div title="Locked Topic">
                <LockIcon className="w-5 h-5 text-red-600" />
              </div>
            )}
            <h2 className="font-bold font-mono text-xl">{topic.title}</h2>
          </div>

          <div className="flex flex-wrap justify-between items-center text-sm font-mono text-gray-600 gap-y-2">
            <div className="flex items-center gap-2">
              <span>{topic.authorName}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>{formatDate(topic.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <EyeIcon className="w-4 h-4" />
                <span>{topic.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>

        {/* Original Post */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold font-mono">{topic.authorName}</h3>
                <span className="font-mono text-xs text-gray-500">{formatDate(topic.createdAt)}</span>
              </div>
              <div className="font-mono whitespace-pre-wrap bg-gray-50 p-3 border border-gray-200 rounded-sm">{topic.content}</div>

              {/* Topic image */}
              {topic.imageUrl && (
                <div className="mt-4">
                  <img
                    src={topic.imageUrl}
                    alt="Topic attachment"
                    className="max-w-full max-h-96 border-2 border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";
                    }}
                  />
                </div>
              )}

              {/* Topic Love Reaction */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Win95Button
                  onClick={handleLoveTopic}
                  className="px-2 py-1 flex items-center gap-1 text-xs"
                  title="Love this topic"
                >
                  <HeartIcon className="w-4 h-4 text-red-500" />
                  <span className="ml-1 font-bold">
                    {topic.loveCount ? topic.loveCount : 0}
                  </span>
                </Win95Button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {posts.length > 0 && (
          <div className="bg-white border-2 border-gray-400">
            <div className="bg-gray-300 border-b-2 border-gray-400 p-3 flex justify-between items-center">
              <h3 className="font-bold font-mono">Replies</h3>
              <span className="font-mono text-xs text-gray-600">{posts.length} {posts.length === 1 ? 'reply' : 'replies'}</span>
            </div>
            <div className="divide-y divide-gray-200">
              {posts.map(post => (
                <div key={post.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold font-mono">{post.authorName}</h3>
                        <span className="font-mono text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                      </div>

                      {/* Post content */}
                      {post.content && (
                        <div className="font-mono whitespace-pre-wrap mb-3 bg-gray-50 p-3 border border-gray-200 rounded-sm">{post.content}</div>
                      )}

                      {/* Post image */}
                      {post.imageUrl && (
                        <div className="mt-2 mb-3">
                          <img
                            src={post.imageUrl}
                            alt="Post attachment"
                            className="max-w-full max-h-96 border-2 border-gray-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%22400%22%20height%3D%22300%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3EImage%20Not%20Found%3C%2Ftext%3E%3C%2Fsvg%3E";
                            }}
                          />
                        </div>
                      )}

                      {/* Love Reaction */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Win95Button
                          onClick={() => handleLoveReaction(post.id)}
                          className="px-2 py-1 flex items-center gap-1 text-xs"
                          title="Love this post"
                        >
                          <HeartIcon className="w-4 h-4 text-red-500" />
                          <span className="ml-1 font-bold">
                            {post.loveCount ? post.loveCount : 0}
                          </span>
                        </Win95Button>
                      </div>

                      {post.isEdited && (
                        <div className="mt-2 font-mono text-xs text-gray-500 italic">
                          Edited on {formatDate(post.updatedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reply Form */}
        <div className="bg-white border-2 border-gray-400 p-4">
          <h3 className="font-bold font-mono mb-3">Post a Reply</h3>

          {!isAuthenticated ? (
            <div className="p-4 bg-gray-100 text-center">
              <p className="font-mono text-gray-600 mb-2">You must be logged in to reply</p>
              <Win95Button
                onClick={() => {
                  // Find the login icon and simulate a click
                  const loginIcon = document.querySelector('[data-icon="userProfile"]');
                  if (loginIcon) {
                    (loginIcon as HTMLElement).click();
                  } else {
                    // Alternative method: dispatch a custom event to open the login dialog
                    const event = new CustomEvent('openDialog', {
                      detail: { id: 'login' }
                    });
                    window.dispatchEvent(event);
                  }
                }}
                className="px-4 py-2 font-mono"
              >
                Login
              </Win95Button>
            </div>
          ) : topic.isLocked ? (
            <div className="p-4 bg-gray-100 text-center">
              <p className="font-mono text-gray-600 mb-2 flex items-center justify-center gap-2">
                <LockIcon className="w-4 h-4" />
                This topic is locked and cannot be replied to
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-sm">{user?.displayName || 'Anonymous'}</span>
              </div>

              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="w-full p-2 font-mono border-2 border-gray-400 min-h-[100px]"
                placeholder="Write your reply here..."
                disabled={submitting}
              />

              {/* Image upload */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                    id="image-upload"
                    disabled={submitting}
                  />
                  <Win95Button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 font-mono text-sm flex items-center"
                    disabled={submitting}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Add Image
                  </Win95Button>

                  {imagePreview && (
                    <Win95Button
                      onClick={handleRemoveImage}
                      className="px-3 py-1 font-mono text-sm flex items-center bg-red-100"
                      disabled={submitting}
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

              {error && (
                <div className="p-3 bg-red-100 border-2 border-red-300 text-red-700 font-mono text-sm flex items-center gap-2">
                  <InfoIcon className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end">
                <Win95Button
                  onClick={handleSubmitReply}
                  className="px-4 py-2 font-mono flex items-center"
                  disabled={submitting || (!replyContent.trim() && !replyImage)}
                >
                  {submitting ? (
                    <span>Submitting...</span>
                  ) : (
                    <>
                      <SendIcon className="w-4 h-4 mr-2" />
                      Post Reply
                    </>
                  )}
                </Win95Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
