/**
 * RevenueCat Purchase Hooks
 * 
 * Handles RevenueCat offerings and purchase flow for mobile subscriptions
 */

import { AuthService } from '@/utils/auth-service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Alert } from 'react-native'
import Purchases, { PURCHASES_ERROR_CODE, PurchasesPackage } from 'react-native-purchases'
import { queryKeys } from './query-keys'
import { useClaimBoost } from './use-payments'

// Types matching the existing plan structure
export interface RevenueCatPlan {
  id: string
  type: 'weekly_swap' | 'monthly_swap' | 'yearly_swap'
  title: string
  subtitle: string
  price: string
  billing: string
  features: string[]
  popular: boolean
  rawPrice: number // Price in cents
  duration: number // Duration in days
  freeTrialDays: number
  package: PurchasesPackage
}

/**
 * Get RevenueCat offerings and transform to plan structure
 */
export const useRevenueCatOfferings = () => {
  return useQuery({
    queryKey: ['revenuecat-offerings'],
    queryFn: async (): Promise<RevenueCatPlan[]> => {
      try {
        const offerings = await Purchases.getOfferings()
        
        if (!offerings.current || offerings.current.availablePackages.length === 0) {
          throw new Error('No RevenueCat offerings available')
        }

        const plans: RevenueCatPlan[] = []
        
        // Transform each package to our plan structure
        for (const pkg of offerings.current.availablePackages) {
          const product = pkg.product
          
          // Map RevenueCat package types to our plan types
          let planType: 'weekly_swap' | 'monthly_swap' | 'yearly_swap'
          let durationDays: number
          let billing: string
          let popular = false
          
          switch (pkg.packageType) {
            case 'WEEKLY':
              planType = 'weekly_swap'
              durationDays = 7
              billing = ' / week'
              break
            case 'MONTHLY':
              planType = 'monthly_swap'
              durationDays = 30
              billing = ' / month'
              popular = true // Mark monthly as popular
              break
            case 'ANNUAL':
              planType = 'yearly_swap'
              durationDays = 365
              billing = ' / year'
              break
            default:
              continue // Skip unknown package types
          }

          // Calculate features based on plan type
          const features: string[] = []
          
          if (planType === 'weekly_swap') {
            features.push('Swap Access')
          } else if (planType === 'monthly_swap') {
            features.push('7 day free trial')
            features.push('1 Normal boost credit')
          } else{
            features.push('3 Normal boost credits')
            features.push('3 Premium boost credits')
          }

          const plan: RevenueCatPlan = {
            id: pkg.identifier,
            type: planType,
            title: product.title,
            subtitle: product.description,
            price: product.priceString,
            billing,
            features,
            popular,
            rawPrice: Math.round(product.price * 100), // Convert to cents
            duration: durationDays,
            freeTrialDays: 0, // No free trial for now
            package: pkg
          }

          plans.push(plan)
        }

        // Sort plans: weekly, monthly, yearly
        const sortOrder = ['weekly_swap', 'monthly_swap', 'yearly_swap']
        plans.sort((a, b) => sortOrder.indexOf(a.type) - sortOrder.indexOf(b.type))

        return plans
      } catch (error) {
        console.error('Error fetching RevenueCat offerings:', error)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

/**
 * Purchase a RevenueCat package
 */
export const useRevenueCatPurchase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log(`Attempting to purchase package: ${pkg.identifier}`)
      
      const purchaseResult = await Purchases.purchasePackage(pkg)
      
      console.log('Purchase successful:', purchaseResult)
      
      return purchaseResult
    },
    retry: false,
    onSuccess: async () => {
      // Refresh RevenueCat customer info
      Purchases.getCustomerInfo()
      
      // Refresh user auth state to get updated subscription
      AuthService.refreshCurrentUser()
      
      // Invalidate offerings in case they changed
      queryClient.invalidateQueries({ queryKey: ['revenuecat-offerings'] })
    },
    onError: (error: any) => {
      console.error('Purchase failed:', error)
      
      // Check for cancellation by message content or error code
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : String(error)
      
      // Don't show alert for user cancellation
      if (errorMessage.toLowerCase().includes('cancelled') || 
          (error && typeof error === 'object' && 'code' in error && 
           (error as any).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)) {
        return
      }

      // Show appropriate error alert for all other errors
      Alert.alert(
        'Subscription Failed',
        `Failed to create subscription: ${error?.message || 'Unknown error'}\n\nPlease try again or contact support.`
      )
    },
  })
}

/**
 * Get current RevenueCat customer info
 */
export const useRevenueCatCustomerInfo = () => {
  return useQuery({ 
    queryKey: ['revenuecat-customer-info'],
    queryFn: async () => {
      try {
        return await Purchases.getCustomerInfo()
      } catch (error) {
        console.error('Error fetching customer info:', error)
        throw error
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnMount: "always"
  })
}

/**
 * Product identifiers for RevenueCat boost consumables
 */
export const BOOST_PRODUCT_IDS = {
  NORMAL_BOOST: 'normal_boost',
  PREMIUM_BOOST: 'premium_boost',
} as const

/**
 * Boost product information with pricing
 */
export interface BoostProduct {
  identifier: string
  title: string
  description: string
  price: string
  priceValue: number
  currencyCode: string
  type: 'normal_boost' | 'premium_boost'
  storeProduct: any // The actual RevenueCat store product
}

/**
 * Get RevenueCat boost products with pricing information
 */
export const useRevenueCatBoostProducts = () => {
  return useQuery({
    queryKey: ['revenuecat-boost-products'],
    queryFn: async (): Promise<BoostProduct[]> => {
      try {
        const productIds = Object.values(BOOST_PRODUCT_IDS)
        const products = await Purchases.getProducts(productIds)
        
        return products.map(product => ({
          identifier: product.identifier,
          title: product.title,
          description: product.description,
          price: product.priceString,
          priceValue: product.price,
          currencyCode: product.currencyCode,
          type: product.identifier as 'normal_boost' | 'premium_boost',
          storeProduct: product,
        }))
      } catch (error) {
        console.error('Error fetching boost products:', error)
        throw error
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  })
}

/**
 * Restore RevenueCat purchases
 */
export const useRevenueCatRestore = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      console.log('Attempting to restore RevenueCat purchases')
      
      const restoreResult = await Purchases.restorePurchases()
      
      console.log('Restore successful:', restoreResult)
      
      return restoreResult
    },
    retry: false,
    onSuccess: async () => {
      // Refresh RevenueCat customer info
      Purchases.getCustomerInfo()
      
      // Refresh user auth state to get updated subscription
      AuthService.refreshCurrentUser()
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['revenuecat-customer-info'] })
      queryClient.invalidateQueries({ queryKey: ['revenuecat-offerings'] })
      
      // Show success message
      Alert.alert(
        'Purchases Restored',
        'Your purchases have been successfully restored.'
      )
    },
    onError: (error: any) => {
      console.error('Restore failed:', error)
      
      // Check for cancellation by message content or error code
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : String(error)
      
      // Don't show alert for user cancellation
      if (errorMessage.toLowerCase().includes('cancelled') || 
          (error && typeof error === 'object' && 'code' in error && 
           (error as any).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)) {
        return
      }

      // Handle specific error for "Keep with original App User ID" behavior
      if (errorMessage.toLowerCase().includes('different') || 
          errorMessage.toLowerCase().includes('user id') ||
          errorMessage.toLowerCase().includes('original')) {
        Alert.alert(
          'Restore Failed',
          'These purchases were made with a different account. Please sign in with the original account that made the purchase, or contact support for assistance.'
        )
        return
      }

      // Show generic error for all other cases
      Alert.alert(
        'Restore Failed',
        `Failed to restore purchases: ${error?.message || 'Unknown error'}`
      )
    },
  })
}

/**
 * Purchase a RevenueCat boost consumable
 */
export const useRevenueCatBoostPurchase = () => {
  const queryClient = useQueryClient()

  const claimBoost = useClaimBoost()

  return useMutation({
    mutationFn: async ({ productIdentifier, listingId }: { productIdentifier: string; listingId?: string }) => {
      console.log(`Attempting to purchase boost: ${productIdentifier}`)
      
      // Get the product first, then purchase it
      const products = await Purchases.getProducts([productIdentifier])
      const product = products[0]
      
      if (!product) {
        throw new Error(`Product ${productIdentifier} not found`)
      }
      
      const purchaseResult = await Purchases.purchaseStoreProduct(product)
      
      console.log('Boost purchase successful:', purchaseResult)
      
      return purchaseResult
    },
    onSuccess: async (purchaseResult, { listingId }) => {
      setTimeout(() => {
        if (listingId) {
          claimBoost.mutate({ requestId: purchaseResult.transaction.transactionIdentifier, listingId })
        }
      }, 1000);
      
      // Refresh RevenueCat customer info
      Purchases.getCustomerInfo()
      
      // Refresh user auth state to get updated boost credits
      AuthService.refreshCurrentUser()
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['revenuecat-customer-info'] })
      queryClient.invalidateQueries({ queryKey: ['revenuecat-boost-products'] })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.listings.featured })

    },
    onError: (error: any) => {
      console.error('Boost purchase failed:', error)
      
      // Check for cancellation by message content or error code
      const errorMessage = error && typeof error === 'object' && 'message' in error 
        ? (error as any).message 
        : String(error)
      
      // Don't show alert for user cancellation
      if (errorMessage.toLowerCase().includes('cancelled') || 
          (error && typeof error === 'object' && 'code' in error && 
           (error as any).code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR)) {
        return
      }

      // Show appropriate error alert for all other errors
      Alert.alert(
        'Purchase Failed',
        `Failed to purchase boost: ${error?.message || 'Unknown error'}\n\nPlease try again or contact support.`
      )
    },
  })
}