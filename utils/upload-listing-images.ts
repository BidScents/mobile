import { supabase } from '@/lib/supabase'
import { decode } from 'base64-arraybuffer'
import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { getImgExtension } from './getImgExtension'



/**
 * Delete uploaded images from storage
 */
const cleanupUploadedImages = async (filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) return
  
  try {
    console.log(`Cleaning up ${filePaths.length} uploaded images...`)
    
    // Delete images one by one to ensure it works
    const deletePromises = filePaths.map(async (filePath) => {
      try {
        const { error } = await supabase.storage
          .from('listing-images')
          .remove([filePath]) // Supabase remove expects an array
        
        if (error) {
          console.error(`Failed to delete ${filePath}:`, error)
        } else {
          console.log(`Successfully deleted ${filePath}`)
        }
      } catch (error) {
        console.error(`Error deleting ${filePath}:`, error)
      }
    })
    
    await Promise.all(deletePromises)
    console.log('Cleanup completed')
    
  } catch (error) {
    console.error('Error during image cleanup:', error)
  }
}

/**
 * Upload a single listing image with retry logic
 */
const uploadSingleImageWithRetry = async (
  imageUri: string, 
  userId: string,
  imageIndex: number
): Promise<{ path: string; filePath: string }> => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' })
  const uuid = Crypto.randomUUID()
  const { contentType, ext } = getImgExtension(imageUri)
  const filePath = `listing_${uuid}${ext}`
  
  const attemptUpload = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(filePath, decode(base64), {
          contentType,
          upsert: false
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
            contentType,
            upsert: false
          })
        
        if (retryError) throw retryError
        return data.path
      }
      throw error
    }
  }
  
  // Keep trying until user succeeds or chooses to cancel
  while (true) {
    try {
      const path = await attemptUpload()
      return { path, filePath }
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
        throw new Error('USER_CANCELLED')
      }
      
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
  
  const uploadedResults: { path: string; filePath: string }[] = []
  const uploadedUrls: string[] = []
  
  try {
    for (let i = 0; i < imageUris.length; i++) {
      console.log(`Uploading image ${i + 1} of ${imageUris.length}`)
      
      const result = await uploadSingleImageWithRetry(imageUris[i], userId, i)
      uploadedResults.push(result)
      uploadedUrls.push(`listing-images/${result.path}`)
      
      // Call progress callback if provided
      onProgress?.(i + 1, imageUris.length)
    }
    
    return uploadedUrls
    
  } catch (error: any) {
    // Clean up any uploaded images on failure
    if (uploadedResults.length > 0) {
      console.log(`Cleaning up ${uploadedResults.length} uploaded images due to error...`)
      const filePathsToDelete = uploadedResults.map(result => result.filePath)
      await cleanupUploadedImages(filePathsToDelete)
    }
    
    throw error
  }
}