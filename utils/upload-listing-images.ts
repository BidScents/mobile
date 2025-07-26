import { supabase } from '@/lib/supabase'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'

/**
 * Upload a single listing image with retry logic
 */
const uploadSingleImageWithRetry = async (
  imageUri: string, 
  userId: string,
  imageIndex: number
): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' })
  const uuid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  
  const attemptUpload = async (): Promise<string> => {
    const filePath = `listing_${uuid}.jpg`
    
    try {
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, decode(base64), {
          contentType: 'image/jpeg',
          upsert: false // Don't overwrite, each image should be unique
        })
      
      if (error) throw error
      
      return data.path
      
    } catch (error: any) {
      // Retry logic for network failures
      if (error.message?.includes('Network request failed')) {
        console.log(`Network failed for image ${imageIndex + 1}, retrying once automatically...`)
        await new Promise(r => setTimeout(r, 2000))
        
        const { data, error: retryError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, decode(base64), {
            contentType: 'image/jpeg',
            upsert: false
          })
        
        if (retryError) throw retryError
        
        return data.path
      }
      throw error
    }
  }
  
  // Keep trying until user succeeds or chooses to skip
  while (true) {
    try {
      return await attemptUpload()
    } catch (uploadError: any) {
      console.error(`Image ${imageIndex + 1} upload failed:`, uploadError)
      
      // Ask user what to do
      const choice = await new Promise<'retry' | 'cancel'>((resolve) => {
        Alert.alert(
          `Image ${imageIndex + 1} Upload Failed`,
          `${uploadError.message}\n\nWhat would you like to do?`,
          [
            { text: 'Try Again', onPress: () => resolve('retry') },
            { text: 'Cancel Listing', onPress: () => resolve('cancel'), style: 'cancel' }
          ]
        )
      })
      
      if (choice === 'cancel') {
        throw new Error('USER_CANCELLED') // Special error to indicate user cancelled
      }
      
      // If choice === 'retry', the while loop continues and tries again
      console.log(`User chose to retry image ${imageIndex + 1} upload`)
    }
  }
}

/**
 * Upload all listing images and return array of URLs
 */
export const uploadListingImages = async (
  imageUris: string[],
  userId: string,
  onProgress?: (uploaded: number, total: number) => void
): Promise<string[]> => {
  if (imageUris.length === 0) {
    throw new Error('No images to upload')
  }
  
  const uploadedUrls: string[] = []
  
  try {
    for (let i = 0; i < imageUris.length; i++) {
      console.log(`Uploading image ${i + 1} of ${imageUris.length}`)
      
      const url = await uploadSingleImageWithRetry(imageUris[i], userId, i)
      uploadedUrls.push("listing-images/" + url)
      
      // Call progress callback if provided
      onProgress?.(i + 1, imageUris.length)
    }
    
    return uploadedUrls
    
  } catch (error: any) {
    // If user cancelled or any other error, clean up uploaded images
    if (uploadedUrls.length > 0) {
      console.log('Cleaning up uploaded images due to error...')
      // Note: In production, implement cleanup
      // For now, we'll leave them as orphaned files
    }
    
    throw error
  }
}