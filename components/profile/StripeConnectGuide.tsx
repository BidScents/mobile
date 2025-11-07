import { Text, YStack } from "tamagui";

export function StripeConnectGuide() {
  return (
    <YStack
      backgroundColor="$background"
      borderRadius="$6"
      padding="$4"
      marginTop="$2"
      gap="$4"
      borderWidth={1}
      borderColor="$border"
    >
      <Text fontSize="$5" fontWeight="600" color="$foreground">
        Stripe Connect Onboarding Guide
      </Text>
      
      <YStack gap="$3">
        <Text fontSize="$4" color="$mutedForeground" lineHeight="$5">
          To start selling and receiving payouts, you need to set up a Stripe Connect account. 
          Funds typically take around 6 business days to reach your bank account after completion.
        </Text>

        <YStack gap="$4">
          {/* Step 1 */}
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              Step 1: Access Stripe Connect Setup
            </Text>
            <YStack gap="$1" paddingLeft="$3">
              <Text fontSize="$3" color="$mutedForeground">• Log in to the BidScents app</Text>
              <Text fontSize="$3" color="$mutedForeground">• Go to Profile → Seller Dashboard → Complete Onboarding</Text>
              <Text fontSize="$3" color="$mutedForeground">• Fill in your email to start</Text>
            </YStack>
          </YStack>

          {/* Step 2 */}
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              Step 2: Complete Stripe Registration
            </Text>
            <YStack gap="$1" paddingLeft="$3">
              <Text fontSize="$3" color="$mutedForeground">• Full name / Business name</Text>
              <Text fontSize="$3" color="$mutedForeground">• Email address and IC/Business registration number</Text>
              <Text fontSize="$3" color="$mutedForeground">• Home Address and IC Number</Text>
              <Text fontSize="$3" color="$mutedForeground">• MY TIN (if you dont have any, use 123456-A)</Text>
              <Text fontSize="$3" color="$mutedForeground">• SST Registration (if applicable)</Text>
            </YStack>
          </YStack>

          {/* Step 3 */}
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              Step 3: Link Your Bank Account
            </Text>
            <YStack gap="$1" paddingLeft="$3">
              <Text fontSize="$3" color="$mutedForeground">• Add your bank account for payouts</Text>
              <Text fontSize="$3" color="$mutedForeground">• Ensure account name matches your registered name</Text>
              <Text fontSize="$3" color="$mutedForeground">• Select your payout schedule</Text>
            </YStack>
          </YStack>

          {/* Step 4 */}
          <YStack gap="$2">
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              Step 4: Statement Descriptor & Support
            </Text>
            <YStack gap="$1" paddingLeft="$3">
              <Text fontSize="$3" color="$mutedForeground">• Fill in your name and phone number</Text>
              <Text fontSize="$3" color="$mutedForeground">• Complete customer support details</Text>
            </YStack>
          </YStack>

          {/* Important Notes */}
          <YStack gap="$2" backgroundColor="$mutedHighlight" padding="$3" borderRadius="$4">
            <Text fontSize="$4" fontWeight="600" color="$foreground">
              Important Notes:
            </Text>
            <YStack gap="$1">
              <Text fontSize="$3" color="$mutedForeground">• Stripe may require 2-Factor Authentication (download Google Authenticator or Duo Mobile)</Text>
              <Text fontSize="$3" color="$mutedForeground">• Profile review takes up to 10 minutes</Text>
              <Text fontSize="$3" color="$mutedForeground">• Use the + button in chat to create secure transactions</Text>
              <Text fontSize="$3" color="$mutedForeground">• Funds take approximately 6 business days to reach your account</Text>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  );
}