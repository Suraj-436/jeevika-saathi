// src/utils/loadGoogleMaps.js
// Safe dynamic script loader for Google Maps JavaScript API
// Reads VITE_GOOGLE_MAPS_API_KEY from environment variables.

let loadPromise = null;

export function loadGoogleMapsScript() {
  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || apiKey.trim() === '') {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY is not configured in .env'));
  }

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = '__initJeevikaGoogleMapsCallback';
    
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('Google Maps SDK loaded but maps object missing'));
      }
    };

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window[callbackName];
      loadPromise = null;
      reject(new Error('Failed to load Google Maps script from Google servers'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
