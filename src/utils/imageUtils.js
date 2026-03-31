/**
 * Image compression and resizing utilities
 *
 * Compresses profile images to reduce localStorage usage
 * and improve performance on mobile devices.
 */

const DEFAULT_MAX_SIZE = 200 // Max dimension in pixels
const DEFAULT_QUALITY = 0.8 // JPEG quality (0-1)

/**
 * Compress and resize an image file
 *
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxSize - Maximum width/height in pixels (default: 200)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @returns {Promise<string>} - Base64 data URL of compressed image
 */
export function compressImage(file, options = {}) {
  const maxSize = options.maxSize || DEFAULT_MAX_SIZE
  const quality = options.quality || DEFAULT_QUALITY

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type'))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Failed to read file'))

    reader.onload = (e) => {
      const img = new Image()

      img.onerror = () => reject(new Error('Failed to load image'))

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width)
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height)
            height = maxSize
          }
        }

        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')

        // Use better image smoothing for downscaling
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to compressed JPEG
        // Use JPEG for photos (smaller than PNG for photographic content)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)

        resolve(compressedDataUrl)
      }

      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Compress an image with a callback interface (for simpler integration)
 *
 * @param {File} file - The image file to compress
 * @param {Function} onSuccess - Callback with compressed base64 string
 * @param {Function} onError - Optional error callback
 * @param {Object} options - Compression options
 */
export function compressImageCallback(file, onSuccess, onError, options = {}) {
  compressImage(file, options)
    .then(onSuccess)
    .catch(onError || (() => {}))
}
