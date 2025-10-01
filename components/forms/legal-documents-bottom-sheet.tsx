import { AnimatedTabHeader } from '@/components/ui/animated-tab-header'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

export interface LegalDocumentsBottomSheetMethods {
  present: () => void
  dismiss: () => void
  presentWithTab: (tabKey: 'privacy' | 'terms') => void
}

const TABS = [
  { key: 'privacy', title: 'Privacy Policy' },
  { key: 'terms', title: 'Terms of Service' }
]

const PRIVACY_POLICY_TEXT = `BIDSCENTS PRIVACY POLICY
Last Updated: Oct 1, 2025

OVERVIEW
The establishment of Bidscents is grounded on the aim to connect fragrance enthusiasts in a trusted marketplace where anyone can buy and sell authentic perfumes with confidence. We are a community built on trust and authenticity. A fundamental part of earning that trust means being clear about how we use your information and protecting your human right to privacy.

This Privacy Policy describes how Bidscents Global (Registration No. 202503092286 (003715687-V)) and its affiliates ("we," "us," or "Bidscents"), process personal information in relation to your use of the Bidscents Platform. Depending on where you live and what you are doing on the Bidscents Platform, supplemental privacy pages may apply to you.

TABLE OF CONTENTS
Who Controls My Personal Information
Personal Information We Collect
How We Use the Information We Collect
Sharing and Disclosure
Third-Party Partners and Integrations
Authentication and Verification Services
Your Rights
Retention
Security
Changes to This Privacy Policy
Contact Information
Definitions

1. WHO CONTROLS MY PERSONAL INFORMATION

1.1 Controller. Where this Policy mentions "Bidscents," "we," "us," or "our," it refers to Bidscents Global (Registration No. 202503092286 (003715687-V)), the company that is responsible for your information under this Privacy Policy (the "Controller").

1.2 Payments Controller. This Privacy Policy also applies to the Payment Services provided to you by our payment processing partners. When using the Payment Services, you will also be providing your personal information to payment processors, which will be responsible for your payment-related information.

1.3 Authentication Controller. This Privacy Policy applies to our fragrance authentication services, where we verify the authenticity of perfumes sold on our platform.

2. PERSONAL INFORMATION WE COLLECT

2.1 Information Needed to Use the Bidscents Platform. We collect personal information about you when you use the Bidscents Platform. Without it, we may not be able to provide all services requested. This information includes:

2.1.1 Contact, Account, and Profile Information. Such as your first name, last name, phone number, postal address, email address, date of birth, and profile photo, some of which will depend on the features you use.

2.1.2 Identity Verification Information. Where appropriate, we may ask you for an image of your government-issued ID document(s), passport, national ID card, or driving license when we verify your identity for seller accounts or high-value transactions.

2.1.3 Payment Transaction Information. Such as payment account, credit card information, bank account information, payment instrument used, date and time, payment amount, payment instrument expiration date and billing postcode, email address used for transaction purposes, and other related transaction details.

2.1.4 Listing Information. When you create a listing, we collect information about the fragrance you're selling, including brand, size, condition, photos, description, and pricing information.

2.2 Information You Choose to Give Us. You can choose to provide us with additional personal information, including:

2.2.1 Additional Profile Information. Such as preferred language(s), city, personal description, fragrance preferences, collecting interests, and any additional profile information you provide.

2.2.2 Fragrance Collection Information. Such as your wishlist, collection details, favorite brands, and fragrance preferences to help personalize your experience.

2.2.3 Authentication Request Information. When you request authentication services, we collect detailed information about the fragrance, including photos, purchase history, and any documentation you provide.

2.2.4 Communications Information. Such as messages between buyers and sellers, customer support communications, reviews and ratings, and other communications on or through the Bidscents Platform.

2.2.5 User-Generated Content. Such as photos of fragrances, reviews, collection showcases, and other content you choose to provide.

2.2.6 Support Information. Such as chat information and messages collected to provide customer support services, including investigating disputes and monitoring and improving our support processes.

2.3 Information Automatically Collected by Using the Bidscents Platform. When you use the Bidscents Platform, we automatically collect certain information. This information may include:

2.3.1 Geolocation Information. Such as precise or approximate location determined from your IP address or device GPS, which helps us show relevant listings and shipping options.

2.3.2 Usage Information. Such as searches for fragrances, listings you have viewed or saved, purchases you have made, pages you've viewed, and other actions on the Bidscents Platform.

2.3.3 Device Information. Such as IP address, hardware and software information, device information, unique identifiers, crash data, and read receipts.

2.3.4 Cookies and Similar Technologies. As described in our Cookie Policy.

2.4 Information We Collect from Third Parties. We may collect personal information from other sources, such as:

2.4.1 Authentication Partners. Information from fragrance authentication services and verification partners to confirm product authenticity.

2.4.2 Background Information Providers. To the extent permitted by applicable laws, we may obtain reports about you and/or your background for seller verification purposes.

2.4.3 Social Media and Third-Party Applications. If you choose to link your Bidscents account with social media or other services, we may receive profile information as authorized by you.

2.4.4 Shipping Partners. Information from shipping providers about package delivery and tracking.

2.4.5 Financial Institutions. If you elect to pay with funds from your bank account, we may receive certain information from your financial institution.

3. HOW WE USE INFORMATION WE COLLECT

We use personal information as outlined in this Privacy Policy and in compliance with the Personal Data Protection Act 2010 (Malaysia) and other applicable laws.

3.1 Provide the Bidscents Platform. We may process this information to:
Enable you to access the Bidscents Platform and make and receive payments
Facilitate buying and selling of fragrances
Enable communication between buyers and sellers
Process transactions and manage listings
Provide customer support
Send you updates, security alerts, and account notifications
Enable authentication and verification services

3.2 Improve and Develop the Bidscents Platform. We may process this information to:
Perform analytics and conduct research
Improve our fragrance authentication processes
Develop new features and services
Provide customer service training
Enhance our search and recommendation algorithms

3.3 Personalize and Customize the Bidscents Platform. We may process this information to:
Personalize your experience based on your fragrance preferences and search history
Recommend fragrances and sellers that match your interests
Customize your marketplace feed
Tailor your experience with Bidscents

3.4 Safeguard the Bidscents Platform and Community. We may process this information to:
Verify the authenticity of fragrances listed on our platform
Detect, prevent, and address fraud and security risks
Verify or authenticate information provided by users
Conduct background checks on sellers
Protect our community from counterfeit products and fraudulent activities
Resolve disputes between buyers and sellers
Enforce our Terms of Service and authentication policies
Ensure compliance with anti-counterfeiting laws and regulations

3.5 Provide, Personalize, Measure, and Improve our Marketing. We may process this information to:
Send you promotional messages about new fragrances and features
Show personalized recommendations
Administer referral programs and promotional activities
Analyze user preferences to improve our services

3.6 Analyze Communications. We may review communications for safety, fraud prevention, and customer support purposes. We scan messages to prevent sharing of contact information outside the platform and to identify potential policy violations.

3.7 Provide Authentication Services. Personal information is used to:
Authenticate fragrances submitted for verification
Maintain records of authenticated products
Provide authentication certificates
Investigate suspected counterfeit products
Collaborate with brands and law enforcement regarding counterfeits

4. SHARING AND DISCLOSURE

4.1 Sharing With Your Consent. Where you provide consent, we share your information as described at the time of consent, such as when connecting with social media or participating in promotional activities.

4.2 Who We Share With.

4.2.1 Other Users. To facilitate transactions, we share necessary information between buyers and sellers, including:
Contact information for completed transactions
Shipping addresses for buyers
Basic profile information
Transaction history for reputation purposes

4.2.2 Authentication Partners. We may share fragrance information with authentication specialists and verification services to confirm product authenticity.

4.2.3 Service Providers. We share personal information with service providers who help us:
Process payments and handle financial transactions
Verify user identity and conduct background checks
Provide shipping and logistics services
Offer customer support
Detect fraud and maintain platform security
Authenticate fragrances and detect counterfeits

4.2.4 Brand Partners. When investigating suspected counterfeits, we may share information with fragrance brands and their authorized representatives.

4.2.5 Corporate Affiliates. We may share information within our corporate family to provide integrated services and support.

4.3 Why We May Share Your Information.

4.3.1 Build Your Public Profile. Information you choose to share publicly may include:
Your seller profile and ratings
Public reviews and feedback
Listed fragrances and collection showcases
Authentication achievements and seller badges

4.3.2 Comply with Law and Protect Rights. We may disclose your information to:
Comply with legal obligations and respond to legal requests
Investigate and prevent fraud, counterfeiting, and other illegal activities
Protect the safety and rights of our users and the public
Enforce our Terms of Service and policies
Respond to claims of intellectual property infringement

4.3.3 Business Transfers. If Bidscents is involved in a merger, acquisition, or sale of assets, we may transfer your information as part of that transaction.

5. THIRD-PARTY PARTNERS AND INTEGRATIONS

5.1 Payment Processors. We work with third-party payment processors to handle transactions. These partners have their own privacy policies governing how they handle your payment information.

5.2 Shipping Partners. We integrate with shipping providers who may have access to shipping addresses and package information.

5.3 Authentication Services. We may work with third-party authentication experts who help verify fragrance authenticity.

5.4 Social Media Integration. Parts of Bidscents may link to social media services. Your use of these services is subject to their privacy policies.

6. AUTHENTICATION AND VERIFICATION SERVICES

6.1 Authentication Process. When you request authentication services, we:
Examine submitted fragrances using various verification methods
Compare products against authentic reference materials
Document authentication results
Provide certificates of authenticity
Maintain records for future reference

6.2 Information Collected. For authentication services, we collect:
Detailed photos of the fragrance and packaging
Product serial numbers and batch codes
Purchase history and documentation
Physical product for inspection (when applicable)
Seller and buyer information

6.3 Authentication Data Use. Authentication data is used to:
Verify product authenticity
Build our authentication database
Improve our verification processes
Investigate patterns of counterfeit activity
Provide reports to brands and law enforcement

7. YOUR RIGHTS

You may exercise rights including:

7.1 Access. You may access your personal information.

7.2 Correction. You may correct inaccurate personal information.

7.3 Deletion. You may request deletion of your personal information, subject to certain exceptions.

7.4 Restriction. You may request that we limit how we process your personal information.

7.5 Objection. You may object to our processing of your personal information.

7.6 Managing Your Information. You may access and update your personal information through your account settings.

8. RETENTION

8.1 Retention Periods. We retain personal information for as long as needed for the purposes outlined in this policy, including:
The length of time you have an account with us
Legal, tax, and regulatory requirements
Authentication records for product verification
Transaction records for dispute resolution
Information needed to protect our rights and safety

8.2 Authentication Records. Authentication data may be retained longer to maintain the integrity of our verification database and assist in ongoing anti-counterfeiting efforts.

9. SECURITY

We implement administrative, technical, and physical security measures to protect your information against unauthorized access, loss, destruction, or alteration. This includes:
Encryption of sensitive data
Secure storage of authentication records
Regular security audits and monitoring
Access controls and authentication requirements
Employee training on data protection

10. CHANGES TO THIS PRIVACY POLICY

We may modify this Privacy Policy at any time in accordance with applicable law. Material changes will be communicated at least 30 days before the effective date. Continued use of the platform after changes become effective constitutes acceptance of the revised policy.

11. CONTACT INFORMATION

For questions about this Privacy Policy or our handling of personal information:

Bidscents Global
Registration No. 202503092286 (003715687-V)
No 49 Jalan Taman Ibu Kota, Taman Ibu Kota
53100 Gombak, Wilayah Persekutuan Malaysia
Email: support@bidscents.com

For data protection matters under the Personal Data Protection Act 2010 (Malaysia), you may also contact our Data Protection Officer at the above address.

12. DEFINITIONS

"Bidscents Platform" means the services provided by Bidscents, including our website, mobile applications, and related services.

"Authentication" means the process of verifying that a fragrance is genuine and not counterfeit.

"User" means any person who uses the Bidscents Platform, whether as a buyer, seller, or browser.

"Listing" means a fragrance offered for sale on the Bidscents Platform.

"Transaction" means the purchase and sale of a fragrance through the Bidscents Platform.

Undefined terms in this Privacy Policy have the same definition as in our Terms of Service.

This Privacy Policy is effective as of Oct 1, 2025 and applies to all users of the Bidscents Platform.`

const TERMS_OF_SERVICE_TEXT = `TERMS OF SERVICE

Welcome to BidScents, an online marketplace for buying, selling, and bidding on preowned fragrances. By accessing or using our website and services (the "Platform"), you agree to be bound by the following terms and conditions ("Terms"). Please read them carefully before using the Platform.

1. GENERAL OVERVIEW

BidScents is a platform that facilitates peer-to-peer transactions between individual buyers and sellers of fragrances. The Platform enables users to list, buy, and bid on preowned perfumes through direct sales or time-limited auctions.

2. USER RESPONSIBILITIES

By using BidScents, you agree that:

• You are at least 16 years old or have permission from a legal guardian.
• All information you provide is accurate and up to date.
• You will not engage in any illegal, abusive, or fraudulent activity on the platform.
• You are responsible for all activity under your account.

3. LISTINGS & TRANSACTIONS

• All listings must be truthful and accurately represent the condition, authenticity, and details of the fragrance.
• BidScents does not guarantee the accuracy of any listing or the quality/authenticity of any product.
• Users are solely responsible for their decision to buy, sell, or bid on any item.

4. SHIPPING AND DELIVERY

• Sellers are responsible for shipping the items in a timely and secure manner.
• BidScents does not guarantee the delivery or condition of items shipped.
• Buyers are encouraged to communicate with sellers and confirm shipment details through our messaging system.
• Disputes regarding undelivered or damaged goods must be resolved between the buyer and the seller. We may assist but are not liable for the outcome.

5. AUCTIONS AND BIDDING

• All bids placed are final and binding.
• If you win an auction, you are legally obligated to complete the purchase within the stated payment window.
• If you fail to pay, your account may be suspended or banned.

6. BUYER PROTECTION AND ESCROW

• In some cases, BidScents may offer escrow services to hold funds until delivery is confirmed.
• However, BidScents does not guarantee refunds, replacements, or delivery of items.
• Disputes may be reviewed by our team, but BidScents does not accept liability for the resolution or outcome.

7. LIMITATION OF LIABILITY

BidScents, its founders, partners, and affiliates shall not be held liable for any:

• Financial loss incurred due to transaction disputes, failed shipments, scams, or fraud.
• Lost, stolen, damaged, or misrepresented products sold on the platform.
• Errors, delays, or service interruptions on the Platform.
• Any indirect, incidental, or consequential damages arising from use of the Platform.

You agree that you are using BidScents at your own risk, and you understand that BidScents acts only as a facilitator and not a party to any transaction.

8. PROHIBITED ITEMS AND ACTIVITY

You may not list, sell, or promote:

• Counterfeit or fake perfumes.
• Fragrances containing illegal or hazardous substances.
• Fraudulent listings or spam.
• Any content that violates local or international laws.

Violation of these policies may result in account termination or legal action.

9. ACCOUNT TERMINATION

We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent behavior, or disrupt the community. In such cases, any pending earnings or unresolved disputes may be withheld at our discretion.

10. INTELLECTUAL PROPERTY

All content on the Platform including the BidScents name, logo, design, and software code is protected by copyright and intellectual property laws. You may not reproduce, duplicate, or exploit any part of the Platform without written permission.

11. MODIFICATIONS TO TERMS

BidScents reserves the right to modify or update these Terms at any time. Users will be notified of changes, and continued use of the Platform after changes are posted will constitute acceptance of those changes.

Last Updated: 14 April 2025`

export const LegalDocumentsBottomSheet = forwardRef<LegalDocumentsBottomSheetMethods>((props, ref) => {
  const bottomSheetRef = React.useRef<BottomSheetModalMethods>(null)
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')

  useImperativeHandle(ref, () => ({
    present: () => bottomSheetRef.current?.present(),
    dismiss: () => bottomSheetRef.current?.dismiss(),
    presentWithTab: (tabKey: 'privacy' | 'terms') => {
      setActiveTab(tabKey)
      bottomSheetRef.current?.present()
    },
  }))

  const handleTabPress = (tabKey: string) => {
    setActiveTab(tabKey as 'privacy' | 'terms')
  }

  const renderContent = () => {
    const content = activeTab === 'privacy' ? PRIVACY_POLICY_TEXT : TERMS_OF_SERVICE_TEXT
    
    return (
      <ScrollView 
        style={{ flex: 1, maxHeight: 600 }}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text 
          fontSize="$4" 
          lineHeight="$6" 
          color="$foreground"
          whiteSpace="pre-line"
        >
          {content}
        </Text>
      </ScrollView>
    )
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      enableDynamicSizing={true}
    >
      <YStack gap="$4" paddingBottom="$5">
        <AnimatedTabHeader
          tabs={TABS}
          activeTabKey={activeTab}
          onTabPress={handleTabPress}
          headerProps={{
            marginTop: '$2',
            fontSize: '$5',
            fontWeight: '500',
            paddingHorizontal: '$2',
          }}
        />
        
        <YStack paddingHorizontal="$4">
          {renderContent()}
        </YStack>
      </YStack>
    </BottomSheet>
  )
})

LegalDocumentsBottomSheet.displayName = 'LegalDocumentsBottomSheet'