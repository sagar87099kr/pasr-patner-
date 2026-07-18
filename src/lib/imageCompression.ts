export const compressImage = (file: File, maxSizeMB: number = 1): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Scale down if larger than 1200px
        const max_width = 1200;
        const max_height = 1200;
        if (width > height) {
          if (width > max_width) {
            height = Math.round((height *= max_width / width));
            width = max_width;
          }
        } else {
          if (height > max_height) {
            width = Math.round((width *= max_height / height));
            height = max_height;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        // Fill white background for transparent images (e.g. PNGs) since we are converting to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Reduce quality until it fits under maxSizeMB (approximate base64 size)
        // 1MB = 1048576 bytes. Base64 is about 33% larger than binary.
        // So target length is maxSizeMB * 1048576 * 1.37
        const targetLength = maxSizeMB * 1024 * 1024 * 1.37;
        
        while (dataUrl.length > targetLength && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(dataUrl);
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};
