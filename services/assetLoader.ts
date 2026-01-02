
/**
 * Preloads an image by creating an Image object.
 * Returns a promise that resolves when the image is fully loaded.
 */
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = src;
    
    const onLoad = () => resolve();
    const onError = () => resolve(); // Resolve on error to avoid blocking the queue

    // 'decode' forces the browser to decode the image data, ensuring it's ready to paint.
    if (img.decode) {
      img.decode()
        .then(onLoad)
        .catch(() => {
           // Fallback if decode fails or isn't supported
           img.onload = onLoad;
           img.onerror = onError;
        });
    } else {
      img.onload = onLoad;
      img.onerror = onError;
    }
  });
};

/**
 * Preloads a video.
 * We wait for 'canplaythrough' to ensure enough data is buffered for smooth playback.
 */
const preloadVideo = (src: string): Promise<void> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = src;
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    
    const onLoaded = () => {
      cleanup();
      resolve();
    };

    const onError = () => {
      cleanup();
      resolve(); 
    };

    const cleanup = () => {
      video.removeEventListener('canplaythrough', onLoaded);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('error', onError);
      video.remove();
    };

    video.addEventListener('canplaythrough', onLoaded);
    video.addEventListener('loadeddata', onLoaded); 
    video.addEventListener('error', onError);
    
    video.load();

    // Timeout after 3 seconds to prevent stalling
    setTimeout(() => {
        cleanup();
        resolve();
    }, 3000);
  });
};

/**
 * Main function to preload a list of URLs with Concurrency Limiting.
 * This prevents "net::ERR_INSUFFICIENT_RESOURCES" when loading hundreds of files.
 */
export const preloadAssets = async (urls: string[], onProgress: (percent: number) => void) => {
  // Deduplicate and filter URLs
  const uniqueUrls = [...new Set(urls)].filter(url => url && url.length > 0);
  const total = uniqueUrls.length;
  let loadedCount = 0;

  if (total === 0) {
    onProgress(100);
    return;
  }

  // Max concurrent requests
  const CONCURRENCY_LIMIT = 5; 

  const processItem = async (url: string) => {
    const isVideo = url.toLowerCase().endsWith('.mp4') || 
                    url.toLowerCase().endsWith('.webm') || 
                    url.includes('/video/');
    try {
      if (isVideo) {
        await preloadVideo(url);
      } else {
        await preloadImage(url);
      }
    } catch (e) {
      // Ignore errors
    } finally {
      loadedCount++;
      const percent = Math.round((loadedCount / total) * 100);
      onProgress(percent);
    }
  };

  // Batched Execution Strategy
  const batches = [];
  for (let i = 0; i < uniqueUrls.length; i += CONCURRENCY_LIMIT) {
      batches.push(uniqueUrls.slice(i, i + CONCURRENCY_LIMIT));
  }

  for (const batch of batches) {
      await Promise.all(batch.map(url => processItem(url)));
  }
  
  // Ensure we hit 100% at the end
  onProgress(100);
};
