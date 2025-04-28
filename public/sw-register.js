// Service Worker Registration Script
// This script should be loaded in the main application

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
        
        // Check for updates on page load
        registration.update();
        
        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('New Service Worker controlling the page');
        });
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
  
  // Handle offline/online status changes
  window.addEventListener('online', () => {
    console.log('Application is online. Sync may occur.');
    document.body.classList.remove('offline');
    document.body.classList.add('online');
    
    // Display a notification to the user
    if (document.getElementById('offline-notification')) {
      document.getElementById('offline-notification').style.display = 'none';
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('Application is offline. Using cached resources.');
    document.body.classList.remove('online');
    document.body.classList.add('offline');
    
    // You could display a notification to the user
    if (document.getElementById('offline-notification')) {
      document.getElementById('offline-notification').style.display = 'block';
    }
  });
  
  // Add Update notification when a new service worker is waiting
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
      // Show a notification to the user that a new version is available
      console.log('New version available! Refresh the page to update.');
      
      // You could display a UI element to prompt the user to refresh
      if (document.getElementById('update-notification')) {
        document.getElementById('update-notification').style.display = 'block';
      }
    }
  });
} else {
  console.log('Service Workers are not supported in this browser.');
} 