// Maximum sizes in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_COMPRESSED_SIZE = 20 * 1024 * 1024; // 20MB

export const compressImage = async (file: File): Promise<string> => {
  // First check if the image needs compression
  if (file.size <= MAX_IMAGE_SIZE) {
    return fileToBase64(file);
  }

  // Reject if file is too large even for compression
  if (file.size > MAX_COMPRESSED_SIZE) {
    throw new Error('Image is too large. Maximum size is 20MB.');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      const maxDimension = 1200; // Max width/height after compression

      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Start with high quality
      let quality = 0.7;
      let base64 = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until we get under MAX_IMAGE_SIZE
      while (base64.length > MAX_IMAGE_SIZE && quality > 0.1) {
        quality -= 0.1;
        base64 = canvas.toDataURL('image/jpeg', quality);
      }

      if (base64.length > MAX_IMAGE_SIZE) {
        reject(new Error('Unable to compress image to required size'));
      } else {
        resolve(base64);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    
    // Create object URL from file
    img.src = URL.createObjectURL(file);
  });
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};