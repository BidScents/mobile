
import { supabase } from '@/lib/supabase'
import { decode } from 'base64-arraybuffer'
import * as Crypto from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import { Alert } from 'react-native'
import { getImgExtension } from './getImgExtension'

/**
 * Upload a single profile image with retry logic
 */
export const uploadProfileImage = async (
  imageUri: string, 
  variant: 'profile' | 'cover', 
): Promise<string> => {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: 'base64' })
  const { contentType, ext } = getImgExtension(imageUri)
  const uuid = Crypto.randomUUID()
  const filePath = `${variant}s/${variant}_${uuid}${ext}`
  
  const attemptUpload = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.storage
        .from('profile-images')
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
          .from('profile-images')
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
      return await attemptUpload()
      
    } catch (uploadError: any) {
      console.error(`Image upload failed:`, uploadError)
      
      // Ask user what to do
      const choice = await new Promise<'retry' | 'cancel'>((resolve) => {
        Alert.alert(
          `Image Upload Failed`,
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
      
      console.log(`User chose to retry image upload`)
    }
  }
}