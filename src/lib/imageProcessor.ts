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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image in browser'));
      img.onload = () => {
        try {
          const originalWidth = img.naturalWidth;
          const originalHeight = img.naturalHeight;

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
          if (!ctx) throw new Error('Could not get 2D canvas context');

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
          if (!thumbCtx) throw new Error('Could not get thumbnail canvas context');

          thumbCtx.imageSmoothingEnabled = true;
          thumbCtx.imageSmoothingQuality = 'high';
          thumbCtx.drawImage(img, 0, 0, thumbWidth, thumbHeight);

          // Export to blobs
          canvas.toBlob(
            (mainBlob) => {
              if (!mainBlob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              thumbCanvas.toBlob(
                (thumbBlob) => {
                  if (!thumbBlob) {
                    reject(new Error('Failed to generate thumbnail'));
                    return;
                  }

                  resolve({
                    file: mainBlob,
                    thumbnailFile: thumbBlob,
                    width: targetWidth,
                    height: targetHeight,
                    size: mainBlob.size,
                  });
                },
                'image/jpeg',
                0.80
              );
            },
            'image/jpeg',
            0.85
          );
        } catch (err) {
          reject(err);
        }
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Checks video size, extracts duration & dimensions,
 * and captures a frame thumbnail at 0.5s into a 400px JPEG.
 */
export async function processVideoBeforeUpload(file: File): Promise<ProcessedVideoResult> {
  const isOver50MB = file.size > 50 * 1024 * 1024;

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Unable to parse video file'));
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;

      // Seek to 0.5s or 10% of duration to capture a representative thumbnail
      video.currentTime = Math.min(0.5, Math.max(0.1, duration * 0.1));
    };

    video.onseeked = () => {
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
          reject(new Error('Canvas context not available for video thumbnail'));
          return;
        }

        ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);

        thumbCanvas.toBlob(
          (thumbBlob) => {
            cleanup();
            if (!thumbBlob) {
              reject(new Error('Failed to create video thumbnail blob'));
              return;
            }

            resolve({
              file,
              thumbnailFile: thumbBlob,
              width: video.videoWidth,
              height: video.videoHeight,
              duration: video.duration,
              size: file.size,
              isOver50MB,
            });
          },
          'image/jpeg',
          0.80
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    };
  });
}
