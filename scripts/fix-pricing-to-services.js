// Simple script to fix the pricing to services migration issue
// This script will be run in the browser console to update the theme settings

console.log('🔧 Fixing Pricing to Services Migration...');

// Clear localStorage theme settings to force reload from Firebase
localStorage.removeItem('themeSettings');
console.log('✅ Cleared localStorage theme settings');

// Force reload the page to apply changes
console.log('🔄 Reloading page to apply changes...');
window.location.reload();
