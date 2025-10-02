import { supabase } from '@/lib/supabase'
import { decode } from 'base64-arraybuffer'
import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { getImgExtension } from './getImgExtension'

export interface ImageUploadConfig {
  bucket: string
  pathTemplate: string // e.g., "${variant}s/${variant}_${uuid}${ext}" or "messageFile_${uuid}${ext}"
  variant?: string // for profile images: 'profile' | 'cover'
  showUserPrompts?: boolean // whether to show retry/cancel alerts to user
}

export interface ImageUploadProgress {
  uploaded: number
  total: number
  currentFile?: string
}

export interface ImageUploadResult {
  path: string
  url: string
  filePath: string
}

/**
 * Upload a single image to Supabase storage with retry logic
 */
export const uploadSingleImage = async (
  imageUri: string,
  config: ImageUploadConfig,
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<ImageUploadResult> => {
  // Validate imageUri
  if (!imageUri || typeof imageUri !== 'string') {
    throw new Error('Image URI is required and must be a valid string')
  }

  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' })
  const { contentType, ext } = getImgExtension(imageUri)
  const uuid = Crypto.randomUUID()
  
  // Generate file path from template
  let filePath = config.pathTemplate
    .replace('${uuid}', uuid)
    .replace('${ext}', ext)
  
  if (config.variant) {
    filePath = filePath.replace(/\$\{variant\}/g, config.variant)
  }

  const attemptUpload = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from(config.bucket)
        .upload(filePath, decode(base64), {
          contentType,
          upsert: false
        })
      
      if (error) throw error
      return data.path
      
    } catch (error: any) {
      // Retry logic for network failures
      if (error.message?.includes('Network request failed')) {
        console.log(`Network failed for image, retrying once automatically...`)
        await new Promise(r => setTimeout(r, 2000))
        
        const { data, error: retryError } = await supabase.storage
          .from(config.bucket)
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
      onProgress?.({ uploaded: 0, total: 1, currentFile: filePath })
      const path = await attemptUpload()
      onProgress?.({ uploaded: 1, total: 1, currentFile: filePath })
      
      // Generate public URL
      const { data: { publicUrl } } = supabase.storage
        .from(config.bucket)
        .getPublicUrl(path)
      
      return {
        path,
        url: publicUrl,
        filePath
      }
      
    } catch (uploadError: any) {
      console.error(`Image upload failed:`, uploadError)
      
      // If user prompts disabled, just throw the error
      if (config.showUserPrompts === false) {
        throw uploadError
      }
      
      // Ask user what to do
      const choice = await new Promise<'retry' | 'cancel'>((resolve) => {
        Alert.alert(
          'Image Upload Failed',
          `${uploadError.message}\n\nWhat would you like to do?`,
          [
            { text: 'Try Again', onPress: () => resolve('retry') },
            { text: 'Cancel Upload', onPress: () => resolve('cancel'), style: 'cancel' }
          ]
        )
      })
      
      if (choice === 'cancel') {
        throw new Error('USER_CANCELLED')
      }
      
      console.log('User chose to retry image upload')
    }
  }
}

/**
 * Delete uploaded images from storage
 */
const cleanupUploadedImages = async (bucket: string, filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) return
  
  try {
    console.log(`Cleaning up ${filePaths.length} uploaded images from ${bucket}...`)
    
    const deletePromises = filePaths.map(async (filePath) => {
      try {
        const { error } = await supabase.storage
          .from(bucket)
          .remove([filePath])
        
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
 * Upload multiple images with progress tracking and cleanup on failure
 */
export const uploadMultipleImages = async (
  imageUris: string[],
  config: ImageUploadConfig,
  onProgress?: (progress: ImageUploadProgress) => void
): Promise<ImageUploadResult[]> => {
  if (imageUris.length === 0) {
    throw new Error('No images to upload')
  }
  
  console.log(`Starting parallel upload of ${imageUris.length} images`)
  
  // Track completed uploads for progress and cleanup
  let completedUploads = 0
  const successfulResults: ImageUploadResult[] = []
  
  // Create upload promises for all images
  const uploadPromises = imageUris.map(async (imageUri, index) => {
    try {
      const result = await uploadSingleImage(imageUri, {
        ...config,
        showUserPrompts: config.showUserPrompts !== false // Default to true for batch uploads
      })
      
      // Update progress when each upload completes
      completedUploads++
      onProgress?.({ 
        uploaded: completedUploads, 
        total: imageUris.length,
        currentFile: result.filePath 
      })
      
      return { success: true, result, index }
    } catch (error) {
      return { success: false, error, index }
    }
  })
  
  try {
    // Wait for all uploads to complete
    const results = await Promise.allSettled(uploadPromises)
    
    // Process results and maintain order
    const orderedResults: (ImageUploadResult | undefined)[] = new Array(imageUris.length)
    const errors: any[] = []
    
    for (const [index, promiseResult] of results.entries()) {
      if (promiseResult.status === 'fulfilled') {
        const uploadResult = promiseResult.value
        if (uploadResult.success) {
          orderedResults[uploadResult.index] = uploadResult.result
          successfulResults.push(uploadResult.result!)
        } else {
          errors.push({ index: uploadResult.index, error: uploadResult.error })
        }
      } else {
        errors.push({ index, error: promiseResult.reason })
      }
    }
    
    // If any uploads failed, clean up successful ones and throw error
    if (errors.length > 0) {
      if (successfulResults.length > 0) {
        console.log(`Cleaning up ${successfulResults.length} uploaded images due to ${errors.length} failed uploads...`)
        const filePathsToDelete = successfulResults.map(result => result.filePath)
        await cleanupUploadedImages(config.bucket, filePathsToDelete)
      }
      
      // Throw the first error encountered
      throw errors[0].error
    }
    
    console.log(`Successfully uploaded ${orderedResults.length} images in parallel`)
    return orderedResults.filter((result): result is ImageUploadResult => result !== undefined)
    
  } catch (error: any) {
    // Clean up any successful uploads if there was an unexpected error
    if (successfulResults.length > 0) {
      console.log(`Cleaning up ${successfulResults.length} uploaded images due to error...`)
      const filePathsToDelete = successfulResults.map(result => result.filePath)
      await cleanupUploadedImages(config.bucket, filePathsToDelete)
    }
    
    throw error
  }
}

// Predefined configurations for common use cases
export const ImageUploadConfigs = {
  profile: (variant: 'profile' | 'cover'): ImageUploadConfig => ({
    bucket: 'profile-images',
    pathTemplate: '${variant}s/${variant}_${uuid}${ext}',
    variant,
    showUserPrompts: true
  }),
  
  listing: (): ImageUploadConfig => ({
    bucket: 'listing-images', 
    pathTemplate: 'listing_${uuid}${ext}',
    showUserPrompts: true
  }),
  
  message: (): ImageUploadConfig => ({
    bucket: 'message-files',
    pathTemplate: 'messageFile_${uuid}${ext}',
    showUserPrompts: false // Don't show prompts for chat messages
  })
}