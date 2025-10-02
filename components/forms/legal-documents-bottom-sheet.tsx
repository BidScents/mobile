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

const TERMS_OF_SERVICE_TEXT = `Welcome to BidScents! Let’s Start with the Essentials
1. About You and Us
Who we are.
Hi and welcome! You’ve just joined BidScents Global., a community-first fragrance marketplace with a mission to make scent collecting fun, secure, and sustainable. In these Terms, we’ll refer to ourselves as “BidScents,” “we,” “us,” or “our.” Our registered office is in Malaysia, and we operate globally through our website, mobile apps, and related services (we call these together, the “Platform”). You may also see us mention our affiliates, these are companies working with or under BidScents to help deliver a smoother experience.
What we do.
BidScents is your trusted space to buy, sell, bid, and swap both new and pre-loved fragrances. We offer:
Marketplace Hosting – We provide a digital platform where fragrance enthusiasts can connect. We’re not the buyer or seller in any listing. We simply host the marketplace and facilitate connections. Any transaction you enter into is directly between you and the other user.
Escrow & Buyer Assurance – To help build confidence in every transaction, we collect payment on behalf of the seller and only release it once the buyer confirms the item has arrived in the agreed condition. If something goes wrong—like a parcel getting lost, damaged, or the item not being as described—our support team will step in, subject to these Terms.
Optional Tools & Services – We offer additional tools such as visibility boosts, bid-only listings, swap-matching, and authentication guidance to help you get more out of the platform. Some of these services come with a small fee to support platform quality and safety—details can be found throughout these Terms.
We take full responsibility for the services we provide directly—always in accordance with applicable laws and the commitments we make in this agreement. However, please remember: we don’t own or inspect the fragrances listed, and we’re not liable for how individual users act, buy, sell, or ship.

About You (and All Our Users).
To join our community and use the BidScents Platform, you confirm that you:
Are at least 18 years old,
Have successfully created a verified user account,
Will use BidScents only for personal purposes, unless you’ve been approved as a Verified Seller,
Have the legal capacity and right to enter into transactions, and
Agree to these Terms of Service and all platform rules, such as our Catalogue and Community Guidelines.

Your Role on the Platform.
You can take part in our community as either (or both):
A Seller, who lists fragrances or fragrance-related items (each, an Item) on our digital catalogue,
A Buyer, who browses, purchases, places bids, or initiates swaps on those Items.
To complete a purchase, simply follow the checkout flow: add to cart or place a bid, enter your payment info, and confirm the transaction. We’ll handle the rest via our secure escrow process.

Pro Sellers & Commercial Transactions.
In some regions or categories, you may encounter sellers designated as “Verified Sellers” (marked with a badge). These users operate with professional seller status and may offer extra transparency, authentication, or fulfillment services. Transactions with Verified Sellers are subject to additional terms and regional consumer laws, where applicable.
2. How Transactions Work on BidScents
Peer-to-Peer with Protection
BidScents is built on a peer-to-peer marketplace model, meaning our users interact directly with one another to buy, sell, or swap fragrances. To ensure safety and fairness in every transaction, we’ve designed a simple but secure system:
Payment & Escrow
For all standard listings, including fixed-price sales and auctions, the Buyer will complete payment via a secure link to our platform’s Stripe-managed escrow system. This protects both parties by holding the funds until the Buyer confirms that the item has been received in the expected condition. Do note that the swap market will not require any form of escrow by Stripe.
Escrow Fee: A small fee is applied to each transaction to help maintain this level of safety and support. This includes:
RM1.00 fixed fee, plus
3.5% of the item price
This fee is charged to the Seller at the point of listings and will be clearly displayed before confirming any withdrawals.
Do note that the fees of RM1+3% is charged by Stripe and not BidScents. We use Stripe to process our payment.
Step-by-Step Flow of a Transaction:
Browsing & Chat: A Buyer browses listings and selects an item. They can then enter a chat with the Seller directly to ask questions, negotiate, or discuss details.
Transaction Setup: The Seller will create a custom transaction from the chat based on the agreed terms (price, quantity, shipping method).
Payment & Escrow: The Buyer completes payment through our secure checkout process, which places funds into escrow.
Shipping: The seller and buyer can negotiate on who will bear the shipping cost. The Seller ships the item as agreed.
Confirmation & Release: Once the Buyer confirms they have received the item in acceptable condition, BidScents releases the funds to the Seller.
Swap Market Access
Love trading scents? We offer a dedicated Swap Market where users can exchange items without monetary transactions. Here’s how it works:
Free to Swap: Users don’t pay per swap. Once inside the Swap Market, swapping is completely free.
Subscription Required: To access the Swap Market, users must be active subscribers to our Pro Plan. This paid plan helps us reduce fraud and maintain a safe space by adding an extra layer of commitment and verification.
No Escrow for Swaps: Because no money changes hands in a swap, BidScents does not act as an escrow agent. While we encourage users to act honestly and use tracking for shipments, we cannot guarantee outcomes or offer dispute resolution for swap-based exchanges. However, if scams still happen in the swap market, victims may email BidScents (support@bidscents.com) to ask for the perpetrator details since they also paid for the Pro Plan and BidScents may have their payment details. This however does not guarantee if the swap item can be retrieved back. We will assist as much as possible in order to help the victims up to a certain extent.


3. How to Reach Us
We’re here to help ensure that BidScents remains a trusted, respectful, and secure platform for everyone. If you need to get in touch, here are the ways to do it:
Reporting a Problem
If you believe another user has violated our Terms, engaged in unlawful behavior, or listed an item that infringes on someone else’s rights, please let us know right away. You can:
Use the in-app reporting feature available in chat (coming soon)
Or, if you’re specifically reporting content that may breach intellectual property rights (such as counterfeit items), please use the downvote button at the listings and any listings that have too many downvotes from other users will be frozen. 
We take these matters seriously and will assist affected parties where appropriate. We may also cooperate with law enforcement or regulatory bodies if required by law.

Dispute Resolution
If you experience an issue directly with BidScents (such as a service-related dispute), we encourage you to reach out so we can work toward a resolution. Please contact us by completing our dispute form, and our team will do its best to review and respond as promptly as possible. We will contact you through our support email at support@bidscents.com. To help us assist you more efficiently, please include:
Your registered username or email
Relevant order or listing ID
A clear description of your issue or request
Any supporting screenshots or evidence, if applicable
Providing complete and accurate information upfront helps us resolve your concerns faster and with fewer delays.
General Questions or Notices
For general inquiries, platform feedback, or to send us a formal notice, feel free to email us at admin@bidscents.com.
4. Becoming a BidScents User
Creating Your Account
To join BidScents, you’ll need to set up a user account by providing a valid email address, creating a unique username, and setting a secure password. Please note that we do not accept masked or disposable email addresses during registration, as they limit our ability to verify and protect your account.
Account Verification & Security
To help maintain the integrity and safety of our platform, we may ask you at any point to:
Verify your identity or contact details, such as your phone number, email address, or linked payment method
Provide additional documentation or relevant information
Update or correct your account details
Respond to basic security questions
These actions help us ensure that only you have access to your account and that all transactions are genuine. If you fail to provide accurate information or don’t cooperate with these requests, we may restrict or suspend your account to protect you and others.
One Account Rule
Each user is allowed to maintain only one personal account. If your original account is compromised (for example, due to unauthorized access), you may create a replacement account once we verify the issue.
You may also maintain one personal account and one Verified Seller account, provided that each uses a different email and they operate as separate identities. Verified Seller accounts are subject to their own terms and approval process.
Promotions & Limited-Time Features
From time to time, BidScents may run special events like giveaways, limited offers, or in-app games. Participation may be subject to eligibility rules, and during such promotions, certain features of the platform may be temporarily adjusted or paused. These will always be communicated clearly in advance.
Third-Party Tools
Some features on BidScents may be powered by third-party services. In the case of BidScents, we use Stripe to process our payment services. If you use these features, you’ll be asked to review and accept that provider’s terms before continuing. We’ll make sure links to those policies are easily accessible.
Platform Updates & Layout Changes
To give you the best experience, we may occasionally reorganize how products, ads, or listings are displayed on the platform. These changes won’t affect your content or your rights under these Terms, but they help us improve usability and highlight relevant listings or features.

4. Seller Wallet Setup and Payment Processing
4.1 Mandatory Wallet Setup
All Users intending to act as Sellers on the BidScents platform are required to establish a payment wallet through Stripe Connect, our third-party payment service provider. The creation of a Stripe Connect account is a condition precedent to the ability to list, sell, and receive proceeds from any transactions on the Platform. Buyers are not required to complete this process.
4.2 Stripe Connect Onboarding
Upon initiating the wallet setup process, Sellers will be redirected to Stripe’s secure onboarding environment. Sellers must complete all registration steps prescribed by Stripe, including but not limited to the provision of accurate personal and business information.
4.3 Know Your Customer (KYC) Verification
Pursuant to regulatory and compliance requirements, Stripe may require Sellers to complete identity verification (KYC). Sellers agree to promptly provide any documents, information, or confirmations reasonably requested by Stripe or BidScents in order to complete such verification. Failure to comply with KYC requirements may result in suspension or denial of the ability to sell on the Platform.
4.4 Bank Account Linkage
Each Seller must link a valid, active personal bank account to their Stripe Connect account for the purpose of receiving payouts. Sellers acknowledge and agree that all withdrawals shall be made exclusively through such linked account, and that BidScents shall have no liability for any errors, delays, or failures arising from the Seller’s provision of incorrect or incomplete banking information.
4.5 Activation of Selling Privileges
Only upon successful completion of the Stripe Connect account creation, KYC verification, and bank account linkage will a Seller be permitted to list items on the Platform. BidScents reserves the right to deny, suspend, or revoke selling privileges where the Seller fails to meet these requirements, or where Stripe declines or revokes the Seller’s account for any reason.
4.6 Stripe Terms
Sellers acknowledge and agree that all payments, refunds, and payouts are processed exclusively by Stripe and are subject to Stripe’s Terms of Service in addition to these Terms. BidScents shall not be liable for any losses, claims, or damages arising from or related to Stripe’s services.


5. How We Use Information You Share with Us
Your Personal Data
We collect and use your personal data in order to deliver the services promised under these Terms. For full details on how we gather, store, and protect your data, please read our Privacy Policy.
We take data protection seriously and use reasonable measures to keep your information safe. However, no online system is entirely immune to threats, and while we strive for strong security, we can’t guarantee that unauthorized parties will never gain access. Please be thoughtful about what information you share, as you do so at your own discretion and risk.
How We Use Content You Share
By uploading or submitting any content to BidScents (like product photos, descriptions, or feedback), you grant us a worldwide, non-exclusive, royalty-free right to use, display, and adapt that content across any platform or media channel, including for operational, promotional, and advertising purposes. This includes use on websites, social platforms (like Instagram or TikTok), in-app banners, print publications, and more.
If you prefer not to allow your content to be used for advertising, you can opt out at any time through your account settings. This won’t affect your use of the marketplace itself.
6. What You Can and Cannot Do on BidScents
We’ve built BidScents to be a respectful, secure, and inspiring space for fragrance lovers everywhere. To keep it that way, we rely on all users to follow some essential guidelines when using our services.
What You Agree to Do
By joining BidScents, you agree to:
Follow these Terms of Service and all applicable laws when using the platform
Provide accurate and up-to-date information, including your contact and shipping details — and update your account promptly if anything changes
Keep your login credentials private and secure. If you suspect that someone else has accessed your account, notify us immediately
Only share content or listings via approved platform tools, like the “Share” button — especially when posting to social media or external channels
Only upload content you have the rights to use, such as your own photos and descriptions. You’re fully responsible for any content you publish on BidScents
What You Must Not Do
To protect the community and the smooth operation of the site, you must never:
Use BidScents for anything illegal, unethical, or harmful, including violating the privacy, rights, or intellectual property of others
Use unauthorized software or tools (like bots, scrapers, or crawlers) to manipulate listings, boost visibility, favorite items, or register accounts
Disrupt the platform or damage another user’s device with harmful software, scripts, or plugins
Copy, modify, distribute, or reuse any content from BidScents for commercial purposes without our written permission
Attempt to reverse engineer, disassemble, or data-mine any part of our website or app
Upload or share harmful or offensive content, including anything that promotes violence, hate speech, self-harm, discrimination, terrorism, cult activity, or the exploitation of any individual or group
Abuse listing visibility, such as repeatedly deleting and re-listing the same item or bulk-uploading duplicate items to game the system
Collect or use private information about other users without their permission — including contact details, listings, or activity
Advertise or promote external websites, businesses, or services through your listings, content, or messages on BidScents
We take violations seriously, and accounts that break these rules may be restricted, suspended, or removed. Our goal is to ensure that every user feels safe, respected, and excited to take part in the BidScents community.
7. How We Handle Policy Violations and Platform Misuse
At BidScents, we’re committed to keeping the platform safe, fair, and enjoyable for everyone. To protect our users and uphold the integrity of the community, we may need to take certain actions if someone breaches our Terms or misuses our platform.
What Happens If You Break the Rules
If we identify any misuse, violation of these Terms, or unlawful activity, we may take one or more of the following corrective steps:
Send a warning message, reminding you of the rules
Remove or adjust your listings in the Catalogue if they breach our policies
Demote, hide, or remove your content from public view
Hide private messages that may be abusive, inappropriate, or violate our policies
Temporarily restrict your account features, such as chat, listing visibility, or bidding access
Report your activity to legal authorities, especially if there is a potential threat to someone’s safety
We always aim to act proportionately and fairly, based on the nature of the violation.
Account Blocking: When and Why
We may temporarily or permanently block your account if:
You repeatedly ignore our warnings or continue to breach our Terms
You seriously violate our Terms by, for example:
Providing false or misleading information during registration
Refusing to verify your identity or update account details
Abusing platform features or manipulating listing visibility
We detect fraud, scamming, or harmful activity through automated systems or partner alerts
You are under 18 years old and using the platform
Your use of the site presents a security threat, violates applicable law, or puts others at risk
Blocking your account means:
You’ll lose access to your account and its features (except support)
Your listings will be removed from public view
Any fees paid for seller services are non-refundable
Pending payouts or transactions may be cancelled or refunded to Buyers in fraud-related or payment processor-flagged situations
You may be barred from creating a new account in the future
Bidding Abuse & Temporary Suspensions
We take misuse of the bidding system seriously. If you win an auction but fail to complete payment, this is considered joy-bidding — a serious violation of trust on our platform. Accounts caught doing this may be temporarily suspended for 14 days. Repeated or intentional abuse may lead to permanent bans.
How We Detect Violations
We may use a combination of:
Automated systems to detect suspicious behavior (e.g. bots, repeated relisting, fake bids, login attempts from flagged IPs)
Reports from payment providers like Stripe, who may flag identity fraud, chargeback abuse, or illegal use
Notifications from legal authorities, where appropriate
We reserve the right to act on these signals immediately, especially where user safety or legal compliance is concerned.
When We May Act Without Prior Notice
We may take immediate action without advance notice in cases such as:
Payment providers or our fraud systems flag your activity
You initiate a payment dispute under suspicious conditions
You share or upload illegal or abusive content
Your behavior puts other users or the site infrastructure at risk
Your use of automated tools violates these Terms
You’re found to be underage
Legal authorities prevent us from disclosing our actions in advance
In these cases, we will inform you of our reasons after the action is taken — unless prohibited by law or ongoing investigations.
Your Right to Respond or Appeal
If we block your account or take corrective action, you will receive a statement of reasons explaining:
What actions were taken
Why we took them
Whether automated tools were involved
What your options for recourse are
You may appeal through our internal system (via a link provided in the message or email), where your case will be reviewed by a member of our team. You also retain the right to escalate your concerns legally through the appropriate national courts.

8. How Payments Work on BidScents
We want every transaction on BidScents to be smooth, secure, and transparent. Whether you’re buying a fragrance, boosting a listing, or subscribing to a Pro Plan, here’s how payments are handled.
Paying for Items or Services
You can pay for items or optional services on BidScents using:
A valid debit card
Any additional payment methods we may introduce in the future (e.g. FPX, Apple Pay, or e-wallets depending on your region)
All payments go through our trusted third-party partner, Stripe Connect, which securely processes transactions on our behalf. BidScents itself does not directly store or handle your payment information.
Our Escrow System for Secure Transactions
When you make a purchase (either fixed-price or auction-based), your payment is held securely in an escrow account managed by Stripe Connect. This protects both the Buyer and Seller.
Here’s how it works:
You select the item, agree with the Seller in chat, and pay through our secure checkout.
The funds are held in escrow until the Seller ships the item.
Once you confirm that you’ve received the item in acceptable condition, the funds are released to the Seller — minus any applicable platform fees.
This escrow process helps prevent fraud and gives Buyers peace of mind.
Boosting & Pro Plan Payments
If you choose to purchase optional services such as:
Boosting your listing to get more visibility in the catalogue, or
Subscribing to the Pro Plan to access features like the Swap Market
—you’ll be charged immediately at checkout. These payments are non-refundable once the service begins, and will also be processed securely via Stripe.
Currency & Regional Payments
BidScents processes payments in Malaysian Ringgit (MYR). If you’re making a payment using a card in a different currency, your bank or card provider may apply a currency conversion fee. BidScents does not control these charges, and they are not included in our platform fees.
Payment Security & Fraud Prevention
To keep our marketplace safe, we may:
Request additional verification (e.g. identity confirmation or payment proof) if we detect unusual activity
Decline or cancel payments if they appear to be unauthorized or fraudulent
Suspend features or block accounts involved in repeated payment disputes
Please ensure your card details are valid and up-to-date, and only use payment methods that belong to you.




Payments and Escrow
Escrow Process
All payments made by buyers are held in escrow through Stripe Connect until the transaction is completed. Funds will be automatically released to the seller 7 days after payment, unless the buyer reports “Item not received,” in which case the release is extended by 2 days. After this period, funds will be released automatically.
Buyer Confirmation
Buyers may confirm receipt and authenticity of the item at any time before the auto-release period ends. Once confirmed, funds are released immediately and the transaction is considered closed.
Disputes
If a buyer disputes a transaction before funds are released, BidScents will review the matter in good faith. However, BidScents does not guarantee resolution in favor of either party and may rely on Stripe’s final decision in the event of escalated disputes or chargebacks.

Payment Processing with Stripe
Stripe Connect Account
To create a listing and receive payments on BidScents, you must register for a Stripe Connect account (“Stripe Account”). By creating a Stripe Account, you agree to be bound by the Stripe Connected Account Agreement and Stripe Services Agreement, as updated from time to time by Stripe.


Verification and Compliance
Stripe may require you to provide certain personal or business information in order to verify your identity and comply with legal and regulatory requirements. You authorize BidScents to share your information with Stripe for this purpose. Failure to provide accurate and complete information may result in the inability to use BidScents’ selling features.


Payments and Payouts
All funds from buyers are collected and processed by Stripe on behalf of BidScents. Payouts to you are made by Stripe in accordance with their policies and timelines. BidScents does not hold seller funds directly and is not responsible for delays, errors, or withholding by Stripe.


Fees and Deductions
Applicable fees, including BidScents’ commission and any Stripe transaction fees, will be deducted automatically prior to payout. You authorize such deductions as a condition of using our platform.


Account Suspension or Termination
Stripe reserves the right to suspend or terminate your Stripe Account if it determines you have violated their agreements, engaged in fraudulent activity, or failed verification checks. If your Stripe Account is suspended or terminated, you may lose access to BidScents’ selling features.


Disclaimer
Stripe provides payment processing services independently of BidScents. BidScents does not control and is not liable for Stripe’s actions, decisions, or service interruptions.

In order to list an item for sale on BidScents, you must first successfully complete Stripe Connect onboarding and create a verified Stripe Account. Listings from non-verified sellers will not be permitted on the platform



Statement of Work (SOW) – Paid Services
Service Purchased
The Customer agrees to purchase the following service(s):
Boosting: A paid feature that increases the visibility of a specific listing within the BidScents marketplace for the purchased duration.
Pro Plan: A paid subscription that provides enhanced seller tools and features, including [list 2–3 exact benefits, e.g., analytics, higher listing limits, or premium placement].
Scope of Delivery
For Boosting, BidScents will ensure the specified listing is elevated in visibility on the platform for [X hours/days] from the time of purchase.
For Pro Plan, BidScents will activate the enhanced account features immediately upon successful payment and maintain access for the duration of the subscription period (weekly/monthly/annually).
Exclusions
BidScents does not guarantee sales, conversions, or specific buyer actions as a result of using Boosting or Pro Plan.
Refunds or reversals will not be provided once the service has been activated, regardless of listing performance or user satisfaction.
Completion of Service
The service is deemed fully delivered once the Boosting visibility period has been completed or once the Pro Plan features are made available to the user’s account.
Billing Policy
Payment Terms
All payments for BidScents paid services (including Boosting and Pro Plan) are due at the time of purchase.
Payments are processed securely through Stripe Connect. By using our Services, you agree to Stripe’s terms and conditions in addition to these Terms.
Billing Process
Once payment is confirmed, the purchased service will be activated immediately.
For subscription services (Pro Plan), billing will recur automatically at the interval selected (monthly or annually) until canceled by the User.
Refund Policy
All payments are final.
Refunds will not be issued once a service is activated or delivered.
Services such as Boosting are considered delivered once visibility is applied to the selected listing.
Services such as Pro Plan are considered delivered once premium account features are activated.
Credit Policy
BidScents does not provide credits, balances, or carry-overs for unused services or time periods once purchased.
Dispute Policy
By purchasing any BidScents paid service, you agree not to initiate a chargeback or payment dispute with your card issuer or bank.
All billing-related concerns must be raised directly with BidScents Customer Support. We will investigate and respond fairly.
If a chargeback or dispute is filed in violation of this policy, BidScents reserves the right to suspend or terminate your Account and recover any costs incurred.
Acknowledgement
By completing your purchase, you confirm that you have read, understood, and agreed to these Terms & Conditions.
9. Messaging and Reviews
Chat Responsibly
BidScents allows you to communicate directly with other users via private messaging. These chats are a great way to ask questions about a listing or discuss transaction details — but please use them respectfully and for legitimate purposes only.
You must not use the messaging feature to:
Send advertisements or promotional messages
Share harmful content or malicious software
Spam multiple users with identical or irrelevant messages
Harass, threaten, or send inappropriate or offensive content
If you misuse the chat function, we may restrict or disable your messaging access, suspend your account, or take other appropriate action.
Leaving a Review
After a transaction is completed, Buyers and Sellers can leave a review about their experience. All reviews should be honest, fair, and based on real interactions. We do not offer any form of compensation or incentives for reviews.
Please note: reviews are user-generated, and while we reserve the right to remove those that violate our rules (e.g. abusive, fake, or defamatory), we do not moderate every review before it’s posted.

10. Ending the Relationship
If You Want to Leave
You can close your BidScents account at any time and at no cost. Just go to your account settings or email us at support@bidscents.com.
Please note: if you have any ongoing transactions, your account will remain active until those are completed or resolved.
If We Need to End Things
We reserve the right to suspend or terminate your account and end these Terms by giving you 15 days’ notice — or immediately, if you've seriously violated our rules (as explained in Section 7).
All pending payouts or purchases will still be processed, subject to standard verification.

11. Selling on BidScents
What You’re Allowed to Sell
You must own the item you’re listing and have the full legal right to transfer it to a buyer. Your listings must also:
Comply with BidScents’ Catalogue Guidelines
Not include any prohibited or counterfeit items, as per our rules and Stripe’s acceptable use policies
Not be dropshipped, bulk-imported, or fake inventory that you do not physically have in your possession
Creating a Listing
When listing an item, you must upload your own photos and write an accurate description, including details on wear, defects, or modifications. Stock images or stolen descriptions aren’t allowed.
Publishing a listing means you’re making a public offer to sell — and that offer is active until the item is sold or withdrawn.
Offers & Counteroffers
Buyers may negotiate with you by making an offer or asking for a bundle price. A sale only occurs when the buyer clicks the “Pay” button and their payment is successfully processed.
Accepting a counteroffer does not guarantee a sale — the buyer still has the right not to proceed.
Withdrawing a Listing
You may remove your item from the site at any time, provided it hasn’t been sold yet or is not in the middle of an auction countdown.
How We Recommend Items
BidScents uses automated tools and algorithms to determine what appears in search results, recommendations, or feeds. These tools prioritize relevance, quality, and platform activity to help connect Buyers and Sellers more efficiently.

12. Buying on BidScents
How to Buy
To purchase an item, simply:
Click the “Buy” button or win the auction
Select your preferred delivery option
Complete payment securely through our checkout page
For fixed listings, you can also message the Seller to agree on price or bundles before they create a custom transaction for you.
What You’ll Pay
Each transaction may include:
The Item price (set by the Seller)
A Shipping fee (varies by courier)
An Escrow and protection fee of RM1.00 + 3.5% (covers secure transaction processing via Stripe)
Optional fees for services like Boosting or Pro Plans, if applicable
All payments are securely held in escrow until you confirm receipt of your item. Only then will the funds be released to the Seller.

Buying Outside the Platform
For your safety, all purchases must be made directly through BidScents. If you choose to buy or sell outside the platform (e.g. via WhatsApp, Instagram, or in-person meetups), we cannot protect your payment or enforce our policies.
These transactions are entirely at your own risk and are not covered by our Escrow or Dispute Resolution processes.
13. Overview of Escrow Process
BidScents acts as a neutral escrow party between Buyers and Sellers to facilitate a secure and trustworthy fragrance marketplace. When a Buyer completes a purchase, the payment is held in escrow until the Buyer confirms the item has been received and verified as authentic.

Item Received Confirmation
Once the Seller confirms shipment, the platform will prompt the Buyer to confirm item receipt. This process may be initiated in one of the following ways:
(For now) Manual Trigger: The “Item Received” button will appear once the Seller confirms shipping.
(Future Automation) Shipping API Integration: Once tracking confirms delivery, the “Item Received” button will be automatically triggered.
The Buyer has 48 hours from the appearance of the “Item Received” button to confirm receipt. Failure to act within this timeframe will result in automatic release of the escrowed funds to the Seller.

Post-Receipt Authentication Check
Upon confirming that the item has been received, the Buyer will immediately be prompted to verify the product’s authenticity via a second prompt:
“Is the item you received correct and authentic?”
The Buyer must respond by selecting either:
Yes, correct and authentic
No, I want to dispute this item
If the Buyer selects “Yes,” funds are immediately released to the Seller.
If the Buyer selects “No,” the transaction enters the Dispute Resolution phase, and funds remain frozen in escrow.
The Buyer has an additional 48 hours to submit a valid dispute, including evidence such as:
Photographs or video clearly showing the issue
A written explanation of the issue (e.g., incorrect item, fake item, damaged item)
Failure to submit this evidence within the 48-hour window will result in the automatic release of funds to the Seller.

What Can Be Disputed
Buyers may only raise disputes under the following valid conditions:
The item is not as described (e.g., wrong product sent)
The item is suspected to be counterfeit
The item is significantly damaged or leaking
significantly not as described (SNAD), which means there’s a significant difference between the Item you received and its description or photo on the Catalogue, such as a different size, colour, or severe damage (like stains, smells or holes).
Disputes will not be accepted for:
Personal preferences or scent dislike
Minor external packaging flaws
Failure to inspect the product within the given dispute window

Dispute Resolution and Outcomes
Disputes will be investigated by BidScents' Customer Support team. We may request additional clarification from either party. The outcome depends on the evidence provided:
a. If the Buyer’s Dispute Is Proven Valid:
The funds will be refunded to the Buyer.
The Seller may be banned permanently if found to be engaging in fraud or misrepresentation.
In clear cases of counterfeit or fraud, return of the item is not required.
b. If the Buyer’s Dispute Is Not Valid or Inconclusive:
The Buyer will be required to return the item to the Seller within 5 working days at their own expense.
Once return is confirmed, the refund will be processed.
The Buyer’s account may be flagged for potential abuse, and repeated offenses may lead to suspension or limited account functionality.

Escrow and Automatic Fund Release
If the Buyer fails to act in a timely manner:
No response within 48 hours of the "Item Received" button → Funds auto-released
No dispute evidence within 48 hours of dispute initiation → Funds auto-released
No return made by Buyer within the return deadline → Dispute closed in Seller’s favor

Abuse of Dispute System
BidScents reserves the right to take appropriate action, including but not limited to:
Warning or suspending accounts
Limiting access to buying/selling features
Permanent bans for users repeatedly filing bad-faith disputes or failing to follow procedures

Liability Disclaimer
While BidScents will act in good faith to mediate disputes, the platform is not legally liable for damages, fraud, or delivery issues outside its reasonable control. Buyers and Sellers are expected to conduct transactions honestly and transparently. Dispute outcomes are final and at the sole discretion of BidScents.






Resolving SNAD Counterfeit Claims
When authenticity is questioned, BidScents Support will review evidence from both sides and decide:

Outcome
Action
Refund?
Return Required?
Authentic
Transaction completes
No
N/A
Inconclusive
Transaction cancelled
Yes
Yes*
Counterfeit
Transaction cancelled
Yes
No

*Return shipping is at the buyer’s cost unless otherwise agreed.
The seller gets 24 hours to provide proof of authenticity once we notify them of a counterfeit claim.

If We Step In
If you or the seller escalate, we may request extra photos, tracking numbers, receipts, or expert opinions. Both parties agree to respect our final decision.

Cases Where Refunds Are Not Granted
A refund will be denied if you:
Confirmed the order as satisfactory before opening a claim.
Missed the 2‑day reporting window.
Failed to supply evidence within the deadlines we give.
Used, washed, altered, or damaged the item after receipt.
Are being investigated for abusing Buyer Assurance.
Claimed SNAD but Support determines the item matches the listing.


14. Shipping Terms
General Shipping Responsibilities
At BidScents, we aim to make the buying, selling, and swapping of fragrances smooth and enjoyable. However, BidScents does not currently handle or coordinate shipping logistics directly. All items are shipped by individual Sellers (or Swappers), and it’s their responsibility to ensure the package is well-protected and shipped promptly.
We may integrate with shipping providers in the future to offer more seamless logistics—but for now, please review the following terms carefully.

Packaging Standards for Sellers
If you’re a Seller, it is your duty to:
Carefully package and protect the item to prevent leaks, spills, or breakage
Use appropriate materials (bubble wrap, secure tape, firm boxes)
Ship the item within a reasonable time once payment has been made
Buyers trust that their fragrance will arrive in good condition—so please handle your packaging with care. Failure to do so could result in a refund to the Buyer, with no compensation provided to the Seller.

Who Pays for Shipping?
Normal & Bidding Listings: The Seller is expected to bear shipping costs unless another arrangement is mutually agreed upon between the Buyer and Seller in chat.
Swap Market: Each user pays for their own shipping when sending items to the other party.

What Happens If the Item Arrives Damaged?
We know accidents happen. If the fragrance is damaged during delivery and the Buyer reports it under our Buyer Assurance policy, we will:
Refund the Buyer in full, including applicable fees.
Sellers will need to cover the cost themselves. Seller will need to contact the courier service themselves and resolve it with the courier company they are using.
Note: This applies only when the damage is clearly due to mishandling by the courier, not due to poor packaging by the Seller. In cases of unclear fault, BidScents reserves the right to assess evidence from both parties and issue a decision accordingly.

Shipping Disputes
BidScents Support may require tracking numbers, proof of postage, or photos of packaging when resolving shipping-related disputes. Please retain your shipping documentation until a transaction is fully completed.

Future Shipping Integration
We are actively exploring partnerships with logistics providers to offer integrated shipping options in the near future. When that happens, these Shipping Terms will be updated accordingly—and users will be notified in advance.
16. Wrapping Things Up — A Few Final Essentials
What You See on BidScents
We Own This Platform.
All the features you see on the BidScents site — from the layout and software to the branding, domain name, and marketplace infrastructure — belong exclusively to us and our licensors. You’re welcome to enjoy the platform, but its intellectual property remains our own.

Our Digital Services
We strive to deliver a smooth and consistent digital experience across all devices. While we don’t operate in the EU just yet, we always work to meet high international standards of reliability and uptime. If we ever expand to regions with specific legal guarantees for digital services, we’ll ensure our terms reflect that accordingly.

Site Uptime and Availability
We do our best to keep BidScents running smoothly 24/7, but:
Sometimes we need to pause for maintenance
Certain external issues (like internet outages, payment provider downtime, or natural disruptions) may briefly impact performance
We aim to schedule any planned maintenance during off-peak hours and notify users when possible
Our goal is to always minimize inconvenience and keep the community connected.

17. What You're Responsible For
While we provide a secure and trusted platform, each user is responsible for how they use it. That means:
You’re accountable for the content, messages, and listings you upload
You must make sure your items are described truthfully and shipped as promised
Any disputes that result from your actions or listings fall under your responsibility
If you publish a review, it must be fair, factual, and not defamatory
Taxes
If your activity on BidScents qualifies as a business or generates income in your country, it’s your responsibility to understand and comply with any tax laws or reporting obligations. BidScents is not responsible for filing taxes on your behalf.

Our Liability as a Host Platform
We provide hosting services to connect fragrance enthusiasts — but we do not monitor every transaction, message, or product listing before it appears. While we care deeply about trust and safety, our legal role is that of an intermediary, not a seller or reseller. That means:
We’re not liable for any item defects, listing inaccuracies, or seller behavior — unless the issue falls within Buyer Assurance, these Terms, or applicable law
We’ll always try to help, but we can’t be held responsible for every interaction or outcome between users

18. Dispute Resolution
If You Have an Issue with Us
We encourage you to reach out via our Dispute Form if you ever feel something went wrong on our end. We’ll do our best to resolve it quickly and fairly through our support team.
If we can’t come to an agreement, you’re free to escalate the matter:
To a national consumer mediation or dispute resolution body (where applicable)
Or through the courts in your country of residence

Governing Law
These Terms will be governed by the laws of the country or region where you primarily live. If you’re in Malaysia, Malaysian law will apply. If you’re somewhere else, your local laws will apply instead.

19. Final Bits You Should Know
Updates to These Terms
As BidScents grows and evolves, we may occasionally need to update our Terms of Service. When we do, we’ll always aim to communicate clearly and give you a fair heads-up, depending on the nature of the change:

What’s Changing
When We’ll Let You Know
Do You Need to Do Anything?
Minor edits (like grammar fixes or clarifications)
We’ll update them quietly — you’re welcome to review them anytime
No action required
Urgent updates for safety, fraud, or abuse prevention
Up to 15 days in advance, or immediately if necessary
No action required
New features, services, or improvements
15 days in advance
No action required
Other material changes that impact your rights
15 days in advance
You’ll need to click “Accept” to continue using the platform

If you’re not comfortable with any changes, you always have the option to:
Close your account free of charge
Reach out to Customer Support
Download your data
Complete any pending payouts
Just so you know, changes won’t apply retroactively and won’t affect any completed transactions.

If You Disagree With Updates
If the changes we introduce don’t sit right with you, that’s okay. You have the right to discontinue your use of BidScents after finishing any ongoing transactions. We’ll never charge you for choosing to walk away.

Assignment of Rights
BidScents reserves the right to transfer or assign our rights and responsibilities under these Terms to another trusted organization in the future — such as in the case of an acquisition or merger. If that happens, we’ll give you a 60-day notice. If you’d rather not continue, you may close your account immediately at no cost.
You, however, may not assign or transfer your account or rights under these Terms to anyone else.

No Legal Partnership
Just to clarify: using BidScents doesn’t create a legal partnership, joint venture, or agency relationship between us. Neither of us can make agreements or obligations on behalf of the other.

What If Part of This Becomes Invalid?
If any part of these Terms is ever found to be invalid or unlawful by a court, the rest of the Terms will still remain valid and enforceable. The agreement as a whole stays in effect — we just treat that one section as void.
Updated as of 12th of September 2025 (12/09/2025) 

`

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