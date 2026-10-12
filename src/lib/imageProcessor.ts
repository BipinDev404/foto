/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessedImageResult {
  file: Blob;
  thumbnailFile: Blob;
  width: number;
  height: number;
  size: number;
}

export interface ProcessedVideoResult {
  file: File;
  thumbnailFile: Blob;
  width: number;
  height: number;
  duration: number;
  size: number;
  isOver50MB: boolean;
}

/**
 * Resizes an image file to max 2000px (JPEG 0.85)
 * and generates a 400px thumbnail (JPEG 0.80)
 */
export async function processImageBeforeUpload(file: File): Promise<ProcessedImageResult> {
  return new Promise((resolve) => {
    // If not standard decodable image or SVG, resolve directly with original file
    if (file.type === 'image/svg+xml') {
      resolve({
        file,
        thumbnailFile: file,
        width: 800,
        height: 600,
        size: file.size,
      });
      return;
    }

    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve({
        file,
        thumbnailFile: file,
        width: 1200,
        height: 800,
        size: file.size,
      });
      return;
    }

    const img = new Image();

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      cleanup();
      // Graceful fallback to original file instead of rejecting
      resolve({
        file,
        thumbnailFile: file,
        width: 1200,
        height: 800,
        size: file.size,
      });
    };

    img.onload = () => {
      try {
        const originalWidth = img.naturalWidth || 1200;
        const originalHeight = img.naturalHeight || 800;

        // 1. Calculate dimensions for max 2000px
        const maxDimension = 2000;
        let targetWidth = originalWidth;
        let targetHeight = originalHeight;

        if (originalWidth > maxDimension || originalHeight > maxDimension) {
          if (originalWidth > originalHeight) {
            targetWidth = maxDimension;
            targetHeight = Math.round((originalHeight * maxDimension) / originalWidth);
          } else {
            targetHeight = maxDimension;
            targetWidth = Math.round((originalWidth * maxDimension) / originalHeight);
          }
        }

        // Main canvas (max 2000px)
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          resolve({
            file,
            thumbnailFile: file,
            width: originalWidth,
            height: originalHeight,
            size: file.size,
          });
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // 2. Thumbnail canvas (max 400px)
        const thumbMaxDimension = 400;
        let thumbWidth = originalWidth;
        let thumbHeight = originalHeight;

        if (originalWidth > thumbMaxDimension || originalHeight > thumbMaxDimension) {
          if (originalWidth > originalHeight) {
            thumbWidth = thumbMaxDimension;
            thumbHeight = Math.round((originalHeight * thumbMaxDimension) / originalWidth);
          } else {
            thumbHeight = thumbMaxDimension;
            thumbWidth = Math.round((originalWidth * thumbMaxDimension) / originalHeight);
          }
        }

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (!thumbCtx) {
          cleanup();
          resolve({
            file,
            thumbnailFile: file,
            width: targetWidth,
            height: targetHeight,
            size: file.size,
          });
          return;
        }

        thumbCtx.imageSmoothingEnabled = true;
        thumbCtx.imageSmoothingQuality = 'high';
        thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

        // Export to blobs
        canvas.toBlob(
          (mainBlob) => {
            const finalMain = mainBlob || file;
            thumbCanvas.toBlob(
              (thumbBlob) => {
                cleanup();
                resolve({
                  file: finalMain,
                  thumbnailFile: thumbBlob || finalMain,
                  width: targetWidth,
                  height: targetHeight,
                  size: finalMain.size,
                });
              },
              'image/jpeg',
              0.80
            );
          },
          'image/jpeg',
          0.85
        );
      } catch {
        cleanup();
        resolve({
          file,
          thumbnailFile: file,
          width: 1200,
          height: 800,
          size: file.size,
        });
      }
    };

    img.src = objectUrl;
  });
}

/**
 * Checks video size, extracts duration & dimensions,
 * and captures a frame thumbnail at 0.5s into a 400px JPEG.
 */
export async function processVideoBeforeUpload(file: File): Promise<ProcessedVideoResult> {
  const isOver50MB = file.size > 50 * 1024 * 1024;

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let objectUrl = '';
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      resolve({
        file,
        thumbnailFile: file,
        width: 1920,
        height: 1080,
        duration: 0,
        size: file.size,
        isOver50MB,
      });
      return;
    }
    video.src = objectUrl;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    // Timeout safety fallback (3s)
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({
        file,
        thumbnailFile: file,
        width: 1920,
        height: 1080,
        duration: 0,
        size: file.size,
        isOver50MB,
      });
    }, 3000);

    video.onerror = () => {
      clearTimeout(timeoutId);
      cleanup();
      resolve({
        file,
        thumbnailFile: file,
        width: 1920,
        height: 1080,
        duration: 0,
        size: file.size,
        isOver50MB,
      });
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      video.currentTime = Math.min(0.5, Math.max(0.1, duration * 0.1));
    };

    video.onseeked = () => {
      clearTimeout(timeoutId);
      try {
        const originalWidth = video.videoWidth || 640;
        const originalHeight = video.videoHeight || 480;

        const thumbMaxDimension = 400;
        let thumbWidth = originalWidth;
        let thumbHeight = originalHeight;

        if (originalWidth > thumbMaxDimension || originalHeight > thumbMaxDimension) {
          if (originalWidth > originalHeight) {
            thumbWidth = thumbMaxDimension;
            thumbHeight = Math.round((originalHeight * thumbMaxDimension) / originalWidth);
          } else {
            thumbHeight = thumbMaxDimension;
            thumbWidth = Math.round((originalWidth * thumbMaxDimension) / originalHeight);
          }
        }

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbWidth;
        thumbCanvas.height = thumbHeight;
        const ctx = thumbCanvas.getContext('2d');

        if (!ctx) {
          cleanup();
          resolve({
            file,
            thumbnailFile: file,
            width: originalWidth,
            height: originalHeight,
            duration: video.duration || 0,
            size: file.size,
            isOver50MB,
          });
          return;
        }

        ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);

        thumbCanvas.toBlob(
          (thumbBlob) => {
            cleanup();
            resolve({
              file,
              thumbnailFile: thumbBlob || file,
              width: video.videoWidth || 1920,
              height: video.videoHeight || 1080,
              duration: video.duration || 0,
              size: file.size,
              isOver50MB,
            });
          },
          'image/jpeg',
          0.80
        );
      } catch {
        cleanup();
        resolve({
          file,
          thumbnailFile: file,
          width: 1920,
          height: 1080,
          duration: video.duration || 0,
          size: file.size,
          isOver50MB,
        });
      }
    };
  });
}
