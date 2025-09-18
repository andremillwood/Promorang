// Image upload functionality for brand logos and other images

interface ImageUploadResult {
  url: string;
  filename: string;
}

export async function handleImageUpload(
  formData: FormData,
  env: any,
  userId: string
): Promise<ImageUploadResult> {
  const image = formData.get('image') as File;
  
  if (!image) {
    throw new Error('No image provided');
  }

  // Validate image
  if (!image.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  // Check size (15MB limit for better compatibility)
  if (image.size > 15 * 1024 * 1024) {
    throw new Error('Image must be smaller than 15MB');
  }

  // Generate unique filename
  const fileExtension = image.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const filename = `user-${userId}-${timestamp}-${randomStr}.${fileExtension}`;

  // Upload to R2
  try {
    const arrayBuffer = await image.arrayBuffer();
    
    await env.R2_BUCKET.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: image.type,
      },
    });

    // Return the public URL
    const publicUrl = `https://${env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${filename}`;
    
    return {
      url: publicUrl,
      filename: filename
    };
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload image');
  }
}
