
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.contact': 'Contact',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orders',
    'nav.customers': 'Customers',
    'nav.vendors': 'Vendors',
    'nav.reports': 'Reports',
    'nav.analytics': 'Analytics',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.submit': 'Submit',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.password': 'Password',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.total': 'Total',
    'common.date': 'Date',
    'common.status': 'Status',
    'common.actions': 'Actions',
    
    // Hero Section
    'hero.title': 'FIND CLOTHES THAT MATCHES YOUR STYLE',
    'hero.subtitle': 'Browse through our diverse range of meticulously crafted garments, designed to bring out your individuality and cater to your sense of style.',
    'hero.shopNow': 'Shop Now',
    
    // Product Section
    'products.newArrivals': 'NEW ARRIVALS',
    'products.topSelling': 'TOP SELLING',
    'products.viewAll': 'View All',
    'products.addToCart': 'Add to Cart',
    'products.buyNow': 'Buy Now',
    'products.inStock': 'In Stock',
    'products.outOfStock': 'Out of Stock',
    'products.available': 'available',
    
    // Categories
    'categories.browseByCategory': 'BROWSE BY CATEGORY',
    'categories.noCategories': 'No categories available at the moment.',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember me',
    'auth.dontHaveAccount': 'Don\'t have an account?',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.termsAndConditions': 'Terms and Conditions',
    'auth.agreeTerms': 'I have read the Terms and Conditions',
    'auth.enterEmail': 'Enter your email',
    'auth.enterPassword': 'Enter your password',
    'auth.enterName': 'Enter your name',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalSales': 'Total Sales',
    'dashboard.dailySales': 'Daily Sales',
    'dashboard.dailyUser': 'Daily Users',
    'dashboard.products': 'Products',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.upcomingPayments': 'Upcoming Payments',
    'dashboard.expenseStatus': 'Expense Status',
    'dashboard.summarySales': 'Summary sales',
    
    // Orders
    'orders.title': 'Orders Management',
    'orders.orderId': 'Order ID',
    'orders.customer': 'Customer',
    'orders.customerName': 'Customer Name',
    'orders.productName': 'Product Name',
    'orders.totalPrice': 'Total Price',
    'orders.paymentStatus': 'Payment Status',
    'orders.deliveryStatus': 'Delivery Status',
    'orders.confirmPayment': 'Confirm Payment',
    'orders.markDelivered': 'Mark Delivered',
    'orders.refreshOrders': 'Refresh Orders',
    'orders.totalOrders': 'Total Orders',
    'orders.paidOrders': 'Paid Orders',
    'orders.pendingPayment': 'Pending Payment',
    'orders.totalRevenue': 'Total Revenue',
    'orders.noOrders': 'No orders found',
    'orders.confirmedByAdmin': 'Confirmed by Admin',
    'orders.awaitingConfirmation': 'Awaiting Admin Confirmation',
    'orders.codeGenerated': 'Payment Code Generated',
    'orders.pendingPaymentStatus': 'Pending Payment',
    'orders.delivered': 'Delivered',
    'orders.notDelivered': 'Not Delivered',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continueShopping': 'Continue Shopping',
    'cart.checkout': 'Checkout',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'cart.free': 'Free',
    'cart.remove': 'Remove',
    'cart.updateQuantity': 'Update Quantity',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.billingInfo': 'Billing Information',
    'checkout.shippingInfo': 'Shipping Information',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    'checkout.placeOrder': 'Place Order',
    'checkout.fullName': 'Full Name',
    'checkout.company': 'Company (Optional)',
    'checkout.streetAddress': 'Street Address',
    'checkout.city': 'City',
    'checkout.state': 'State',
    'checkout.zipCode': 'Zip Code',
    'checkout.country': 'Country',
    
    // Profile
    'profile.title': 'Profile Settings',
    'profile.editProfile': 'Edit Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.accountSettings': 'Account Settings',
    'profile.emailNotifications': 'Email Notifications',
    'profile.changePassword': 'Change Password',
    'profile.deleteAccount': 'Delete Account',
    'profile.saveChanges': 'Save Changes',
    'profile.bio': 'Bio',
    'profile.joinedDate': 'Joined January 2024',
    'profile.activeMember': 'Active Member',
    
    // Vendors
    'vendors.title': 'Vendors',
    'vendors.addVendor': 'Add Vendor',
    'vendors.totalVendors': 'Total Vendors',
    'vendors.activeSellers': 'Active SELLERs',
    'vendors.totalUsers': 'Total Users',
    'vendors.allUsers': 'All registered users',
    'vendors.vendor': 'VENDOR',
    'vendors.role': 'ROLE',
    'vendors.joined': 'JOINED',
    'vendors.active': 'ACTIVE',
    'vendors.import': 'Import',
    'vendors.export': 'Export',
    'vendors.noVendors': 'No vendors found',
    'vendors.searchVendors': 'Search vendors...',
    
    // Reports
    'reports.title': 'Reports & Analytics',
    'reports.exportAll': 'Export All',
    'reports.customerAnalytics': 'Customer Analytics',
    'reports.vendorPerformance': 'Vendor Performance',
    'reports.salesOverview': 'Sales Overview',
    'reports.monthlyRevenue': 'Monthly Revenue',
    'reports.orderAnalytics': 'Order Analytics',
    'reports.reportSummary': 'Report Summary',
    'reports.customerSatisfaction': 'Customer Satisfaction',
    'reports.activeUsers': 'Active Users',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.getInTouch': 'Get in Touch',
    'contact.message': 'Message',
    'contact.sendMessage': 'Send Message',
    'contact.yourMessage': 'Your message',
    
    // Not Found
    'notfound.title': '404',
    'notfound.subtitle': 'Oops! Page not found',
    'notfound.returnHome': 'Return to Home',
    
    // Order Complete
    'orderComplete.title': 'Order Placed Successfully!',
    'orderComplete.subtitle': 'Your order has been received and is being processed.',
    'orderComplete.orderId': 'Order ID',
    'orderComplete.paymentProcessing': 'Payment Processing',
    'orderComplete.generateCode': 'Generate Payment Code',
    'orderComplete.generateCodeDesc': 'Generate a payment code to proceed with MoMo payment',
    'orderComplete.paymentCode': 'Your Payment Code:',
    'orderComplete.useCode': 'Use this code to complete your MoMo payment, then confirm below',
    'orderComplete.madPayment': 'I\'ve Made the Payment',
    'orderComplete.awaitingAdmin': 'Awaiting Admin Confirmation',
    'orderComplete.paymentVerification': 'Your payment is being verified by our admin team',
    'orderComplete.viewOrders': 'View My Orders',
    'orderComplete.returnHome': 'Return to Home Page',
    'orderComplete.secured': 'Your purchases are secured by industry-standard encryption',
    
    // Language Switcher
    'language.english': 'English',
    'language.kinyarwanda': 'Kinyarwanda',
    
    // Single Product
    'singleProduct.productDetails': 'Product Details',
    'singleProduct.ratingReviews': 'Rating & Reviews',
    'singleProduct.faqs': 'FAQs',
    'singleProduct.color': 'Color',
    'singleProduct.size': 'Size',
    'singleProduct.careInstructions': 'How should I care for this item?',
    'singleProduct.careAnswer': 'Follow care instructions provided with the product',
    
    // Categories Page
    'categoriesPage.title': 'Categories',
    'categoriesPage.allCategories': 'All Categories',
    'categoriesPage.noCategories': 'No categories available',
    
    // Seller Request
    'sellerRequest.title': 'Seller Account',
    'sellerRequest.phoneNumber': 'Phone Number',
    'sellerRequest.emailAddress': 'Email Address',
    'sellerRequest.businessName': 'Business Name',
    'sellerRequest.gender': 'Gender',
    'sellerRequest.male': 'Male',
    'sellerRequest.female': 'Female',
    'sellerRequest.other': 'Other',
    'sellerRequest.preferNotToSay': 'Prefer not to say',
    'sellerRequest.request': 'Request',
    
    // Community Chat
    'communityChat.title': 'Community Chat',
    'communityChat.sendMessage': 'Send Message',
    'communityChat.typeMessage': 'Type your message...',
    
    // Admin Products
    'adminProducts.title': 'Products Management',
    'adminProducts.addProduct': 'Add Product',
    'adminProducts.totalProducts': 'Total Products',
    'adminProducts.activeProducts': 'Active Products',
    'adminProducts.lowStock': 'Low Stock',
    'adminProducts.outOfStock': 'Out of Stock',
    'adminProducts.productName': 'Product Name',
    'adminProducts.category': 'Category',
    'adminProducts.stock': 'Stock',
    'adminProducts.manage': 'Manage',
    'adminProducts.noProducts': 'No products found',
    'adminProducts.searchProducts': 'Search products...',
  },
  rw: {
    // Navigation
    'nav.home': 'Ahabanza',
    'nav.products': 'Ibicuruzwa',
    'nav.categories': 'Ibyiciro',
    'nav.contact': 'Twandikire',
    'nav.login': 'Injira',
    'nav.register': 'Iyandikishe',
    'nav.cart': 'Igikoni',
    'nav.profile': 'Umwirondoro',
    'nav.dashboard': 'Imbonerahamwe',
    'nav.orders': 'Amateme',
    'nav.customers': 'Abakiriya',
    'nav.vendors': 'Abacuruzi',
    'nav.reports': 'Raporo',
    'nav.analytics': 'Isesengura',
    
    // Common
    'common.loading': 'Gushungura...',
    'common.error': 'Ikosa',
    'common.success': 'Byagenze neza',
    'common.save': 'Bika',
    'common.cancel': 'Kuraguza',
    'common.delete': 'Gusiba',
    'common.edit': 'Guhindura',
    'common.view': 'Kureba',
    'common.add': 'Kongeramo',
    'common.search': 'Gushakisha',
    'common.filter': 'Gutoranya',
    'common.clear': 'Gusiba',
    'common.confirm': 'Kwemeza',
    'common.back': 'Gusubira',
    'common.next': 'Ikurikira',
    'common.previous': 'Ibanziriza',
    'common.submit': 'Kohereza',
    'common.name': 'Izina',
    'common.email': 'Imeyili',
    'common.password': 'Ijambo-banga',
    'common.phone': 'Telefoni',
    'common.address': 'Aderesi',
    'common.price': 'Igiciro',
    'common.quantity': 'Umubare',
    'common.total': 'Byose',
    'common.date': 'Itariki',
    'common.status': 'Uko bimeze',
    'common.actions': 'Ibikorwa',
    
    // Hero Section
    'hero.title': 'SHAKISHA IMYAMBARO IHUYE N\'IMITERERE YAWE',
    'hero.subtitle': 'Shakisha mu myambaro itandukanye twubatse neza, yagenewe kugaragaza ubunyangamugayo bwawe no kwuzuza uburyo ukunda kwambara.',
    'hero.shopNow': 'Gura Ubu',
    
    // Product Section
    'products.newArrivals': 'IBYA VUBA BIHAGEZE',
    'products.topSelling': 'BIKURAGUYE CYANE',
    'products.viewAll': 'Reba Byose',
    'products.addToCart': 'Shyira mu Gikoni',
    'products.buyNow': 'Gura Ubu',
    'products.inStock': 'Biraboneka',
    'products.outOfStock': 'Ntibiraboneka',
    'products.available': 'biraboneka',
    
    // Categories
    'categories.browseByCategory': 'SHAKISHA UKURIKIJE ICYICIRO',
    'categories.noCategories': 'Nta byiciro biraboneka ubu.',
    
    // Auth
    'auth.login': 'Injira',
    'auth.register': 'Iyandikishe',
    'auth.logout': 'Gusohoka',
    'auth.forgotPassword': 'Wibagiwe ijambo-banga?',
    'auth.rememberMe': 'Nyibuke',
    'auth.dontHaveAccount': 'Ntufite konti?',
    'auth.alreadyHaveAccount': 'Usanzwe ufite konti?',
    'auth.termsAndConditions': 'Amabwiriza n\'Amategeko',
    'auth.agreeTerms': 'Nasomye amabwiriza n\'amategeko',
    'auth.enterEmail': 'Shyiramo imeyili yawe',
    'auth.enterPassword': 'Shyiramo ijambo-banga ryawe',
    'auth.enterName': 'Shyiramo izina ryawe',
    
    // Dashboard
    'dashboard.title': 'Imbonerahamwe',
    'dashboard.totalSales': 'Kugurisha Kwose',
    'dashboard.dailySales': 'Kugurisha kwa Buri Munsi',
    'dashboard.dailyUser': 'Abakoresha ba Buri Munsi',
    'dashboard.products': 'Ibicuruzwa',
    'dashboard.recentOrders': 'Amateme ya Vuba',
    'dashboard.upcomingPayments': 'Kwishyura Bizaza',
    'dashboard.expenseStatus': 'Uko Amafaranga Ameze',
    'dashboard.summarySales': 'Incamake y\'ubucuruzi',
    
    // Orders
    'orders.title': 'Gucunga Amateme',
    'orders.orderId': 'Nomero y\'Itegeko',
    'orders.customer': 'Umukiriya',
    'orders.customerName': 'Izina ry\'Umukiriya',
    'orders.productName': 'Izina ry\'Igicuruzwa',
    'orders.totalPrice': 'Igiciro Cyose',
    'orders.paymentStatus': 'Uko Kwishyura Kumeze',
    'orders.deliveryStatus': 'Uko Gutanga Kumeze',
    'orders.confirmPayment': 'Kwemeza Kwishyura',
    'orders.markDelivered': 'Gushyira Nk\'Ahatangiwe',
    'orders.refreshOrders': 'Gushya Amateme',
    'orders.totalOrders': 'Amateme Yose',
    'orders.paidOrders': 'Amateme Yishyuwe',
    'orders.pendingPayment': 'Kwishyura Guhagarika',
    'orders.totalRevenue': 'Amafaranga Yose Yinjiye',
    'orders.noOrders': 'Nta mateme aboneka',
    'orders.confirmedByAdmin': 'Byemejwe n\'Umuyobozi',
    'orders.awaitingConfirmation': 'Gutegereza Kwemezwa na Mukuru',
    'orders.codeGenerated': 'Kode y\'Kwishyura Yarakozwe',
    'orders.pendingPaymentStatus': 'Kwishyura Guhagarika',
    'orders.delivered': 'Byatanzwe',
    'orders.notDelivered': 'Ntibyatanzwe',
    
    // Cart
    'cart.title': 'Igikoni cy\'Kugura',
    'cart.empty': 'Igikoni cyawe kirimo ubusa',
    'cart.continueShopping': 'Komeza Kugura',
    'cart.checkout': 'Kwishyura',
    'cart.subtotal': 'Igiteranyo',
    'cart.shipping': 'Kohereza',
    'cart.tax': 'Umusoro',
    'cart.free': 'Ubuntu',
    'cart.remove': 'Gukuraho',
    'cart.updateQuantity': 'Guhindura Umubare',
    
    // Checkout
    'checkout.title': 'Kwishyura',
    'checkout.billingInfo': 'Amakuru y\'Kwishyura',
    'checkout.shippingInfo': 'Amakuru y\'Kohereza',
    'checkout.paymentMethod': 'Uburyo bwo Kwishyura',
    'checkout.orderSummary': 'Incamake y\'Itegeko',
    'checkout.placeOrder': 'Shyira Itegeko',
    'checkout.fullName': 'Izina Ryuzuye',
    'checkout.company': 'Ikigo (Bitabangikanywe)',
    'checkout.streetAddress': 'Aderesi y\'Umuhanda',
    'checkout.city': 'Umujyi',
    'checkout.state': 'Leta',
    'checkout.zipCode': 'Kode ya Posita',
    'checkout.country': 'Igihugu',
    
    // Profile
    'profile.title': 'Amagenamiterere y\'Umwirondoro',
    'profile.editProfile': 'Guhindura Umwirondoro',
    'profile.personalInfo': 'Amakuru Bwite',
    'profile.accountSettings': 'Amagenamiterere y\'Konti',
    'profile.emailNotifications': 'Ubutumwa bwa Imeyili',
    'profile.changePassword': 'Guhindura Ijambo-banga',
    'profile.deleteAccount': 'Gusiba Konti',
    'profile.saveChanges': 'Bika Impinduka',
    'profile.bio': 'Umwirondoro Muto',
    'profile.joinedDate': 'Yinjiye muri Mutarama 2024',
    'profile.activeMember': 'Umunyamuryango Ukora',
    
    // Vendors
    'vendors.title': 'Abacuruzi',
    'vendors.addVendor': 'Kongeramo Umucuruzi',
    'vendors.totalVendors': 'Abacuruzi Bose',
    'vendors.activeSellers': 'Abaguzi Bakora',
    'vendors.totalUsers': 'Abakoresha Bose',
    'vendors.allUsers': 'Abakoresha bose biyandikishije',
    'vendors.vendor': 'UMUCURUZI',
    'vendors.role': 'URUHARE',
    'vendors.joined': 'YINJIYE',
    'vendors.active': 'UKORA',
    'vendors.import': 'Kuzana',
    'vendors.export': 'Kohereza',
    'vendors.noVendors': 'Nta bacuruzi baboneka',
    'vendors.searchVendors': 'Shakisha abacuruzi...',
    
    // Reports
    'reports.title': 'Raporo n\'Isesengura',
    'reports.exportAll': 'Kohereza Byose',
    'reports.customerAnalytics': 'Isesengura ry\'Abakiriya',
    'reports.vendorPerformance': 'Imikorere y\'Abacuruzi',
    'reports.salesOverview': 'Incamake y\'Ubucuruzi',
    'reports.monthlyRevenue': 'Amafaranga y\'Ukwezi',
    'reports.orderAnalytics': 'Isesengura ry\'Amateme',
    'reports.reportSummary': 'Incamake ya Raporo',
    'reports.customerSatisfaction': 'Kwishimira kw\'Abakiriya',
    'reports.activeUsers': 'Abakoresha Bakora',
    
    // Contact
    'contact.title': 'Dukurikire',
    'contact.getInTouch': 'Dukurikire',
    'contact.message': 'Ubutumwa',
    'contact.sendMessage': 'Kohereza Ubutumwa',
    'contact.yourMessage': 'Ubutumwa bwawe',
    
    // Not Found
    'notfound.title': '404',
    'notfound.subtitle': 'Yaramutse! Urupapuro ntirubonetse',
    'notfound.returnHome': 'Garuka ku Ntangiriro',
    
    // Order Complete
    'orderComplete.title': 'Itegeko Ryashyizweho Neza!',
    'orderComplete.subtitle': 'Itegeko ryawe ryakirwa kandi riratunganywa.',
    'orderComplete.orderId': 'Nomero y\'Itegeko',
    'orderComplete.paymentProcessing': 'Gutunganya Kwishyura',
    'orderComplete.generateCode': 'Kora Kode y\'Kwishyura',
    'orderComplete.generateCodeDesc': 'Kora kode y\'kwishyura kugira ngo ukomeze kwishyura na MoMo',
    'orderComplete.paymentCode': 'Kode Yawe y\'Kwishyura:',
    'orderComplete.useCode': 'Koresha iyi kode kugira ngo urangize kwishyura na MoMo, hanyuma wemeze hasi',
    'orderComplete.madPayment': 'Narishyuye',
    'orderComplete.awaitingAdmin': 'Gutegereza Kwemezwa na Mukuru',
    'orderComplete.paymentVerification': 'Kwishyura kwawe gisuzumwa n\'itsinda ryacu ry\'abacunga',
    'orderComplete.viewOrders': 'Reba Amateme Yanjye',
    'orderComplete.returnHome': 'Garuka ku Rupapuro rw\'Ahabanza',
    'orderComplete.secured': 'Ibyo ugura birinzwe n\'ubunyangamugayo bukomeye',
    
    // Language Switcher
    'language.english': 'Icyongereza',
    'language.kinyarwanda': 'Ikinyarwanda',
    
    // Single Product
    'singleProduct.productDetails': 'Ibisobanuro by\'Igicuruzwa',
    'singleProduct.ratingReviews': 'Amanota n\'Ibitekerezo',
    'singleProduct.faqs': 'Ibibazo Bikunze Kubazwa',
    'singleProduct.color': 'Ibara',
    'singleProduct.size': 'Ubunini',
    'singleProduct.careInstructions': 'Ngomwa nkite iki kintu?',
    'singleProduct.careAnswer': 'Kurikiza amabwiriza yo kwita bizana n\'igicuruzwa',
    
    // Categories Page
    'categoriesPage.title': 'Ibyiciro',
    'categoriesPage.allCategories': 'Ibyiciro Byose',
    'categoriesPage.noCategories': 'Nta byiciro biraboneka',
    
    // Seller Request
    'sellerRequest.title': 'Konti y\'Umucuruzi',
    'sellerRequest.phoneNumber': 'Nomero ya Telefoni',
    'sellerRequest.emailAddress': 'Aderesi ya Imeyili',
    'sellerRequest.businessName': 'Izina ry\'Ubucuruzi',
    'sellerRequest.gender': 'Igitsina',
    'sellerRequest.male': 'Gabo',
    'sellerRequest.female': 'Gore',
    'sellerRequest.other': 'Ikindi',
    'sellerRequest.preferNotToSay': 'Ndatoranya kutabivuga',
    'sellerRequest.request': 'Gusaba',
    
    // Community Chat
    'communityChat.title': 'Ikiganiro cy\'Umuryango',
    'communityChat.sendMessage': 'Kohereza Ubutumwa',
    'communityChat.typeMessage': 'Andika ubutumwa bwawe...',
    
    // Admin Products
    'adminProducts.title': 'Gucunga Ibicuruzwa',
    'adminProducts.addProduct': 'Kongeramo Igicuruzwa',
    'adminProducts.totalProducts': 'Ibicuruzwa Byose',
    'adminProducts.activeProducts': 'Ibicuruzwa Bikora',
    'adminProducts.lowStock': 'Stock Nke',
    'adminProducts.outOfStock': 'Nta Stock',
    'adminProducts.productName': 'Izina ry\'Igicuruzwa',
    'adminProducts.category': 'Icyiciro',
    'adminProducts.stock': 'Stock',
    'adminProducts.manage': 'Gucunga',
    'adminProducts.noProducts': 'Nta bicuruzwa biboneka',
    'adminProducts.searchProducts': 'Shakisha ibicuruzwa...',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
