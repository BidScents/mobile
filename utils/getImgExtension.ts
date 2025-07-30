/**
 * Get content type and extension from URI
 */
export const getImgExtension = (uri: string) => {
  const extension = uri.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'png':
      return { contentType: 'image/png', ext: '.png' }
    case 'webp':
      return { contentType: 'image/webp', ext: '.webp' }
    case 'jpg':
    case 'jpeg':
    default:
      return { contentType: 'image/jpeg', ext: '.jpg' }
  }
}