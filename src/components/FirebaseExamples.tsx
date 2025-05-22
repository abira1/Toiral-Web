import React, { useState, useEffect } from 'react';
import { Win95Button } from './Win95Button';
import { 
  writeData, 
  readData, 
  pushData, 
  updateData, 
  deleteData, 
  subscribeToData, 
  queryByChild 
} from '../firebase/database';

export function FirebaseExamples() {
  const [activeTab, setActiveTab] = useState<'messages' | 'users' | 'products'>('messages');
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Subscribe to messages
        const unsubscribeMessages = subscribeToData('messages', (data) => {
          if (data) {
            const messagesArray = Object.entries(data).map(([id, message]) => ({
              id,
              ...(message as object)
            }));
            setMessages(messagesArray);
          } else {
            setMessages([]);
          }
        });
        
        // Subscribe to users
        const unsubscribeUsers = subscribeToData('users', (data) => {
          if (data) {
            const usersArray = Object.entries(data).map(([id, user]) => ({
              id,
              ...(user as object)
            }));
            setUsers(usersArray);
          } else {
            setUsers([]);
          }
        });
        
        // Subscribe to products
        const unsubscribeProducts = subscribeToData('products', (data) => {
          if (data) {
            const productsArray = Object.entries(data).map(([id, product]) => ({
              id,
              ...(product as object)
            }));
            setProducts(productsArray);
          } else {
            setProducts([]);
          }
        });
        
        setLoading(false);
        
        // Cleanup subscriptions on unmount
        return () => {
          unsubscribeMessages();
          unsubscribeUsers();
          unsubscribeProducts();
        };
      } catch (err) {
        setError('Error loading data: ' + (err instanceof Error ? err.message : String(err)));
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Message handlers
  const handleAddMessage = async () => {
    if (newMessage.trim() === '') return;
    
    try {
      await pushData('messages', {
        text: newMessage,
        timestamp: Date.now(),
        author: 'User'
      });
      
      setNewMessage('');
    } catch (err) {
      setError('Error adding message: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteData(`messages/${id}`);
    } catch (err) {
      setError('Error deleting message: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleClearAllMessages = async () => {
    try {
      await writeData('messages', null);
    } catch (err) {
      setError('Error clearing messages: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // User handlers
  const handleAddUser = async () => {
    if (newUserName.trim() === '' || newUserEmail.trim() === '') return;
    
    try {
      const userId = `user_${Date.now()}`;
      await writeData(`users/${userId}`, {
        name: newUserName,
        email: newUserEmail,
        createdAt: Date.now(),
        status: 'active'
      });
      
      setNewUserName('');
      setNewUserEmail('');
    } catch (err) {
      setError('Error adding user: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteData(`users/${id}`);
    } catch (err) {
      setError('Error deleting user: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUpdateUserStatus = async (id: string, status: string) => {
    try {
      await updateData(`users/${id}`, { 
        status,
        updatedAt: Date.now()
      });
    } catch (err) {
      setError('Error updating user: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Product handlers
  const handleAddProduct = async () => {
    if (newProductName.trim() === '' || newProductPrice.trim() === '') return;
    
    try {
      const productId = `product_${Date.now()}`;
      await writeData(`products/${productId}`, {
        name: newProductName,
        price: parseFloat(newProductPrice),
        createdAt: Date.now(),
        inStock: true
      });
      
      setNewProductName('');
      setNewProductPrice('');
    } catch (err) {
      setError('Error adding product: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteData(`products/${id}`);
    } catch (err) {
      setError('Error deleting product: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleToggleProductStock = async (id: string, currentInStock: boolean) => {
    try {
      await updateData(`products/${id}`, { 
        inStock: !currentInStock,
        updatedAt: Date.now()
      });
    } catch (err) {
      setError('Error updating product: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="p-6 bg-gray-200 text-black max-h-[80vh] overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="font-mono text-xl font-bold mb-4">Firebase Realtime Database Examples</h2>
        
        {/* Error display */}
        {error && (
          <div className="bg-red-100 border-2 border-red-400 p-3 mb-4 font-mono text-red-700">
            <p>{error}</p>
            <Win95Button 
              onClick={() => setError(null)} 
              className="mt-2 px-2 py-1 font-mono text-sm"
            >
              Dismiss
            </Win95Button>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex mb-4 border-b-2 border-gray-400">
          <Win95Button 
            onClick={() => setActiveTab('messages')} 
            className={`px-4 py-2 font-mono ${activeTab === 'messages' ? 'bg-blue-100' : ''}`}
          >
            Messages
          </Win95Button>
          <Win95Button 
            onClick={() => setActiveTab('users')} 
            className={`px-4 py-2 font-mono ${activeTab === 'users' ? 'bg-blue-100' : ''}`}
          >
            Users
          </Win95Button>
          <Win95Button 
            onClick={() => setActiveTab('products')} 
            className={`px-4 py-2 font-mono ${activeTab === 'products' ? 'bg-blue-100' : ''}`}
          >
            Products
          </Win95Button>
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="bg-white p-4 border-2 border-gray-400 mb-4">
            <p className="font-mono text-gray-600">Loading data...</p>
          </div>
        )}
        
        {/* Messages Tab */}
        {activeTab === 'messages' && !loading && (
          <div>
            {/* Message input */}
            <div className="flex mb-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mr-2 font-mono"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMessage()}
              />
              <Win95Button onClick={handleAddMessage} className="px-4 py-2 font-mono">
                Send
              </Win95Button>
            </div>
            
            {/* Messages list */}
            <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-4">
              <h3 className="font-mono font-bold mb-2">Messages</h3>
              
              {messages.length === 0 ? (
                <p className="font-mono text-gray-600">No messages yet. Send your first message!</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((message) => (
                    <div key={message.id} className="flex justify-between items-start p-2 border border-gray-300">
                      <div>
                        <p className="font-mono">{message.text}</p>
                        <p className="font-mono text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Win95Button 
                        onClick={() => handleDeleteMessage(message.id)} 
                        className="px-2 py-1 font-mono text-sm"
                      >
                        Delete
                      </Win95Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Clear all button */}
            <div className="flex justify-end">
              <Win95Button 
                onClick={handleClearAllMessages} 
                className="px-4 py-2 font-mono bg-red-100 hover:bg-red-200"
              >
                Clear All Messages
              </Win95Button>
            </div>
          </div>
        )}
        
        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <div>
            {/* User input */}
            <div className="flex flex-col md:flex-row mb-4">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Name"
                className="flex-1 p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-2 md:mb-0 md:mr-2 font-mono"
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-2 md:mb-0 md:mr-2 font-mono"
              />
              <Win95Button onClick={handleAddUser} className="px-4 py-2 font-mono">
                Add User
              </Win95Button>
            </div>
            
            {/* Users list */}
            <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-4">
              <h3 className="font-mono font-bold mb-2">Users</h3>
              
              {users.length === 0 ? (
                <p className="font-mono text-gray-600">No users yet. Add your first user!</p>
              ) : (
                <div className="space-y-2">
                  {users.map((user) => (
                    <div key={user.id} className="flex justify-between items-start p-2 border border-gray-300">
                      <div>
                        <p className="font-mono font-bold">{user.name}</p>
                        <p className="font-mono text-sm">{user.email}</p>
                        <p className="font-mono text-xs text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-mono rounded ${
                            user.status === 'active' ? 'bg-green-100 text-green-800' : 
                            user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Win95Button 
                          onClick={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'inactive' : 'active')} 
                          className="px-2 py-1 font-mono text-sm"
                        >
                          Toggle Status
                        </Win95Button>
                        <Win95Button 
                          onClick={() => handleDeleteUser(user.id)} 
                          className="px-2 py-1 font-mono text-sm bg-red-100"
                        >
                          Delete
                        </Win95Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Products Tab */}
        {activeTab === 'products' && !loading && (
          <div>
            {/* Product input */}
            <div className="flex flex-col md:flex-row mb-4">
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Product Name"
                className="flex-1 p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-2 md:mb-0 md:mr-2 font-mono"
              />
              <input
                type="number"
                value={newProductPrice}
                onChange={(e) => setNewProductPrice(e.target.value)}
                placeholder="Price"
                className="flex-1 p-2 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-2 md:mb-0 md:mr-2 font-mono"
              />
              <Win95Button onClick={handleAddProduct} className="px-4 py-2 font-mono">
                Add Product
              </Win95Button>
            </div>
            
            {/* Products list */}
            <div className="bg-white p-4 border-2 border-gray-400 border-r-gray-800 border-b-gray-800 mb-4">
              <h3 className="font-mono font-bold mb-2">Products</h3>
              
              {products.length === 0 ? (
                <p className="font-mono text-gray-600">No products yet. Add your first product!</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div key={product.id} className="flex justify-between items-start p-2 border border-gray-300">
                      <div>
                        <p className="font-mono font-bold">{product.name}</p>
                        <p className="font-mono text-sm">${product.price.toFixed(2)}</p>
                        <p className="font-mono text-xs text-gray-500">
                          Added: {new Date(product.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-mono rounded ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Win95Button 
                          onClick={() => handleToggleProductStock(product.id, product.inStock)} 
                          className="px-2 py-1 font-mono text-sm"
                        >
                          Toggle Stock
                        </Win95Button>
                        <Win95Button 
                          onClick={() => handleDeleteProduct(product.id)} 
                          className="px-2 py-1 font-mono text-sm bg-red-100"
                        >
                          Delete
                        </Win95Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
