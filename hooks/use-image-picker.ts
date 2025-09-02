import { useCameraPermissions } from 'expo-camera'
import * as FileSystem from 'expo-file-system'
import * as ImagePicker from 'expo-image-picker'
import { useCallback } from 'react'
import { Alert, Linking, Platform } from 'react-native'

export interface ImagePickerResult {
  uri: string
  width?: number
  height?: number
  fileSize?: number
  type?: string
}

export interface ImagePickerOptions {
  allowsEditing?: boolean
  aspect?: [number, number]
  quality?: number
  allowMultiple?: boolean
  maxImages?: number
  maxSizeInMB?: number
}

export interface ImagePickerHook {
  pickFromGallery: () => Promise<ImagePickerResult[]>
  takePhoto: () => Promise<ImagePickerResult | null>
  checkImageSize: (uri: string, maxSizeInMB?: number) => Promise<boolean>
  cameraPermission: any
  requestCameraPermission: () => Promise<any>
}

export const useImagePicker = (options: ImagePickerOptions = {}): ImagePickerHook => {
  const {
    allowsEditing = true,
    aspect = [4, 3],
    quality = 0.8,
    allowMultiple = false,
    maxImages = 1,
    maxSizeInMB = 10
  } = options

  const [cameraPermission, requestCameraPermission] = useCameraPermissions()

  const checkImageSize = useCallback(async (uri: string, maxSize = maxSizeInMB): Promise<boolean> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (fileInfo.exists && fileInfo.size) {
        const sizeInMB = fileInfo.size / (1024 * 1024)
        if (sizeInMB > maxSize) {
          Alert.alert(
            'Image Too Large',
            `This image is ${sizeInMB.toFixed(1)}MB. Please choose an image smaller than ${maxSize}MB.`
          )
          return false
        }
      }
      return true
    } catch (error) {
      console.error('Error checking file size:', error)
      return true // Allow if we can't check
    }
  }, [maxSizeInMB])

  const pickFromGallery = useCallback(async (): Promise<ImagePickerResult[]> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: allowMultiple,
        quality,
        allowsEditing: !allowMultiple, // Only allow editing for single image
        aspect: allowsEditing ? aspect : undefined,
        selectionLimit: allowMultiple ? maxImages : 1,
      })

      if (result.canceled || !result.assets) {
        return []
      }

      // Validate file sizes
      const validAssets: ImagePickerResult[] = []
      for (const asset of result.assets) {
        const isValidSize = await checkImageSize(asset.uri)
        if (isValidSize) {
          validAssets.push({
            uri: asset.uri,
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize,
            type: asset.type
          })
        }
      }

      return validAssets
    } catch (error) {
      console.error('Gallery selection failed:', error)
      Alert.alert('Error', 'Failed to select images from gallery')
      return []
    }
  }, [allowMultiple, quality, allowsEditing, aspect, maxImages, checkImageSize])

  const takePhoto = useCallback(async (): Promise<ImagePickerResult | null> => {
    try {
      // Check camera permission
      if (!cameraPermission) {
        console.log('Camera permission still loading...')
        return null
      }

      if (!cameraPermission.granted) {
        if (cameraPermission.canAskAgain) {
          const permissionResult = await requestCameraPermission()
          if (!permissionResult.granted) {
            Alert.alert(
              'Camera Permission Required',
              'This app needs camera access to take photos.',
              [{ text: 'OK' }]
            )
            return null
          }
        } else {
          Alert.alert(
            'Camera Permission Required',
            'Camera permission was previously denied. Please enable it in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:')
                }
              }}
            ]
          )
          return null
        }
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality,
        allowsEditing,
        aspect: allowsEditing ? aspect : undefined,
      })

      if (result.canceled || !result.assets || !result.assets[0]) {
        return null
      }

      const asset = result.assets[0]
      const isValidSize = await checkImageSize(asset.uri)
      
      if (!isValidSize) {
        return null
      }

      return {
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileSize: asset.fileSize,
        type: asset.type
      }
    } catch (error) {
      console.error('Camera capture failed:', error)
      Alert.alert('Error', 'Failed to take photo')
      return null
    }
  }, [cameraPermission, requestCameraPermission, quality, allowsEditing, aspect, checkImageSize])

  return {
    pickFromGallery,
    takePhoto,
    checkImageSize,
    cameraPermission,
    requestCameraPermission
  }
}