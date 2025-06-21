
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'rw')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    'nav.cart': 'Cart',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Register',
    
    // Common
    'common.welcome': 'Welcome',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.submit': 'Submit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.actions': 'Actions',
    'common.status': 'Status',
    'common.date': 'Date',
    'common.price': 'Price',
    'common.total': 'Total',
    'common.quantity': 'Quantity',
    'common.name': 'Name',
    'common.email': 'Email',
    'common.phone': 'Phone',
    'common.address': 'Address',
    'common.description': 'Description',
    'common.category': 'Category',
    'common.view': 'View',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    
    // Home Page
    'home.hero.title': 'Welcome to Rwanda Marketplace',
    'home.hero.subtitle': 'Discover amazing products from local vendors',
    'home.new_arrivals': 'NEW ARRIVALS',
    'home.top_selling': 'TOP SELLING',
    'home.browse_categories': 'BROWSE BY CATEGORY',
    'home.testimonials': 'TESTIMONIALS',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.forgot_password': 'Forgot Password?',
    'auth.remember_me': 'Remember me',
    'auth.dont_have_account': "Don't have an account?",
    'auth.already_have_account': 'Already have an account?',
    'auth.login_failed': 'Login failed',
    'auth.registration_failed': 'Registration failed',
    'auth.terms_conditions': 'Terms and Conditions',
    'auth.agree_terms': 'I have read the Terms and Conditions',
    'auth.join_as_seller': 'Join As Seller',
    'auth.business_name': 'Business Name',
    'auth.phone_number': 'Phone Number',
    'auth.gender': 'Gender',
    'auth.male': 'Male',
    'auth.female': 'Female',
    'auth.other': 'Other',
    'auth.prefer_not_say': 'Prefer not to say',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.analytics': 'Analytics',
    'dashboard.orders': 'Orders',
    'dashboard.customers': 'Customers',
    'dashboard.vendors': 'Vendors',
    'dashboard.products': 'Products',
    'dashboard.reports': 'Reports',
    'dashboard.settings': 'Settings',
    'dashboard.notifications': 'Notifications',
    'dashboard.profile': 'Profile',
    'dashboard.total_sales': 'Total Sales',
    'dashboard.daily_sales': 'Daily Sales',
    'dashboard.daily_users': 'Daily Users',
    'dashboard.recent_orders': 'Recent Orders',
    'dashboard.summary_sales': 'Summary Sales',
    'dashboard.upcoming_payments': 'Upcoming Payments',
    'dashboard.expense_status': 'Expense Status',
    
    // Products
    'products.title': 'Products',
    'products.search_placeholder': 'Search products...',
    'products.price_range': 'Price Range',
    'products.clear_filters': 'Clear Filters',
    'products.no_products': 'No products found',
    'products.showing_results': 'Showing {count} of {total} products',
    'products.add_product': 'Add Product',
    'products.product_name': 'Product Name',
    'products.product_description': 'Product Description',
    'products.product_price': 'Product Price',
    'products.product_category': 'Product Category',
    'products.product_image': 'Product Image',
    'products.in_stock': 'In Stock',
    'products.out_of_stock': 'Out of Stock',
    
    // Cart & Checkout
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continue_shopping': 'Continue Shopping',
    'cart.checkout': 'Checkout',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.tax': 'Tax',
    'cart.total': 'Total',
    'checkout.title': 'Checkout',
    'checkout.billing_address': 'Billing Address',
    'checkout.shipping_address': 'Shipping Address',
    'checkout.payment_method': 'Payment Method',
    'checkout.place_order': 'Place Order',
    'checkout.order_summary': 'Order Summary',
    
    // Orders
    'orders.title': 'Orders',
    'orders.order_id': 'Order ID',
    'orders.customer': 'Customer',
    'orders.order_date': 'Order Date',
    'orders.order_status': 'Order Status',
    'orders.order_total': 'Order Total',
    'orders.pending': 'Pending',
    'orders.processing': 'Processing',
    'orders.shipped': 'Shipped',
    'orders.delivered': 'Delivered',
    'orders.cancelled': 'Cancelled',
    'orders.order_complete': 'Order Complete',
    'orders.payment_code': 'Payment Code',
    'orders.generate_payment_code': 'Generate Payment Code',
    'orders.confirm_payment': 'I\'ve Made the Payment',
    'orders.awaiting_confirmation': 'Awaiting Admin Confirmation',
    
    // Profile
    'profile.title': 'Profile Settings',
    'profile.personal_info': 'Personal Information',
    'profile.full_name': 'Full Name',
    'profile.email_address': 'Email Address',
    'profile.phone_number': 'Phone Number',
    'profile.company': 'Company/Organization',
    'profile.bio': 'Bio',
    'profile.account_settings': 'Account Settings',
    'profile.email_notifications': 'Email Notifications',
    'profile.change_password': 'Change Password',
    'profile.delete_account': 'Delete Account',
    'profile.save_changes': 'Save Changes',
    'profile.edit_profile': 'Edit Profile',
    'profile.active_member': 'Active Member',
    'profile.joined': 'Joined',
    
    // Vendors
    'vendors.title': 'Vendors',
    'vendors.add_vendor': 'Add Vendor',
    'vendors.total_vendors': 'Total Vendors',
    'vendors.total_users': 'Total Users',
    'vendors.vendor_name': 'Vendor Name',
    'vendors.joined_date': 'Joined Date',
    'vendors.active': 'Active',
    'vendors.inactive': 'Inactive',
    'vendors.search_vendors': 'Search vendors...',
    
    // Categories
    'categories.title': 'Categories',
    'categories.no_categories': 'No categories available at the moment.',
    'categories.loading': 'Loading categories...',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.get_in_touch': 'Get in Touch',
    'contact.message': 'Message',
    'contact.send_message': 'Send Message',
    'contact.subject': 'Subject',
    
    // Footer
    'footer.about_us': 'About Us',
    'footer.privacy_policy': 'Privacy Policy',
    'footer.terms_service': 'Terms of Service',
    'footer.help_center': 'Help Center',
    'footer.contact_us': 'Contact Us',
    'footer.follow_us': 'Follow Us',
    'footer.newsletter': 'Newsletter',
    'footer.subscribe': 'Subscribe',
    'footer.all_rights_reserved': 'All rights reserved',
    
    // Error Pages
    'error.404.title': '404',
    'error.404.message': 'Oops! Page not found',
    'error.404.return_home': 'Return to Home',
    'error.failed_load_products': 'Failed to load products',
    'error.failed_load_categories': 'Failed to load categories',
    
    // Language
    'language.english': 'English',
    'language.kinyarwanda': 'Kinyarwanda',
    'language.select': 'Select Language',
  },
  rw: {
    // Navigation
    'nav.home': 'Ahabanza',
    'nav.products': 'Ibicuruzwa',
    'nav.categories': 'Ibyiciro',
    'nav.about': 'Ibyerekeye',
    'nav.contact': 'Twandikire',
    'nav.dashboard': 'Imbonerahamwe',
    'nav.cart': 'Ikibindi',
    'nav.profile': 'Umwirondoro',
    'nav.login': 'Injira',
    'nav.register': 'Iyandikishe',
    
    // Common
    'common.welcome': 'Murakaza neza',
    'common.loading': 'Biragutegereza...',
    'common.error': 'Ikosa',
    'common.success': 'Byagenze neza',
    'common.save': 'Bika',
    'common.cancel': 'Reka',
    'common.delete': 'Siba',
    'common.edit': 'Hindura',
    'common.add': 'Ongeraho',
    'common.search': 'Shakisha',
    'common.filter': 'Shyungura',
    'common.clear': 'Siba',
    'common.submit': 'Kohereza',
    'common.back': 'Subira',
    'common.next': 'Ikurikiyeho',
    'common.previous': 'Ibanjirije',
    'common.actions': 'Ibikorwa',
    'common.status': 'Uko bimeze',
    'common.date': 'Itariki',
    'common.price': 'Igiciro',
    'common.total': 'Igiteranyo',
    'common.quantity': 'Umubare',
    'common.name': 'Izina',
    'common.email': 'Imeri',
    'common.phone': 'Telefoni',
    'common.address': 'Aderesi',
    'common.description': 'Ibisobanuro',
    'common.category': 'Icyiciro',
    'common.view': 'Reba',
    'common.close': 'Funga',
    'common.confirm': 'Emeza',
    
    // Home Page
    'home.hero.title': 'Murakaza neza ku isoko rya Rwanda',
    'home.hero.subtitle': 'Menya ibicuruzwa byiza bituruka ku bacuruzi bo hafi yawe',
    'home.new_arrivals': 'BISHYA BIGEZE',
    'home.top_selling': 'BYINSHI BIGURISHA',
    'home.browse_categories': 'SHAKISHA MU BYICIRO',
    'home.testimonials': 'UBWIYEMEJE',
    
    // Auth
    'auth.login': 'Injira',
    'auth.register': 'Iyandikishe',
    'auth.logout': 'Sohoka',
    'auth.email': 'Imeri',
    'auth.password': 'Ijambo banga',
    'auth.confirm_password': 'Emeza ijambo banga',
    'auth.forgot_password': 'Wibagiwe ijambo banga?',
    'auth.remember_me': 'Nyibuke',
    'auth.dont_have_account': 'Ntufite konti?',
    'auth.already_have_account': 'Usanzwe ufite konti?',
    'auth.login_failed': 'Kwinjira byanze',
    'auth.registration_failed': 'Kwiyandikisha byanze',
    'auth.terms_conditions': 'Amabwiriza n\'amategeko',
    'auth.agree_terms': 'Nasomye amabwiriza n\'amategeko',
    'auth.join_as_seller': 'Injira nk\'umucuruzi',
    'auth.business_name': 'Izina ry\'ubucuruzi',
    'auth.phone_number': 'Nimero ya telefoni',
    'auth.gender': 'Igitsina',
    'auth.male': 'Gabo',
    'auth.female': 'Gore',
    'auth.other': 'Ikindi',
    'auth.prefer_not_say': 'Sinshaka kubivuga',
    
    // Dashboard
    'dashboard.title': 'Imbonerahamwe',
    'dashboard.analytics': 'Isesengura',
    'dashboard.orders': 'Ibicuruzwa byatumijwe',
    'dashboard.customers': 'Abakiriya',
    'dashboard.vendors': 'Abacuruzi',
    'dashboard.products': 'Ibicuruzwa',
    'dashboard.reports': 'Raporo',
    'dashboard.settings': 'Igenamiterere',
    'dashboard.notifications': 'Ubutumwa',
    'dashboard.profile': 'Umwirondoro',
    'dashboard.total_sales': 'Igurisha ryose',
    'dashboard.daily_sales': 'Igurisha rya buri munsi',
    'dashboard.daily_users': 'Abakoresha ba buri munsi',
    'dashboard.recent_orders': 'Ibisabwa vuba',
    'dashboard.summary_sales': 'Incamake y\'igurisha',
    'dashboard.upcoming_payments': 'Kwishyura bizaza',
    'dashboard.expense_status': 'Uko amafaranga ameze',
    
    // Products
    'products.title': 'Ibicuruzwa',
    'products.search_placeholder': 'Shakisha ibicuruzwa...',
    'products.price_range': 'Igiciro',
    'products.clear_filters': 'Siba byose',
    'products.no_products': 'Nta bicuruzwa byabonetse',
    'products.showing_results': 'Byerekana {count} muri {total} ibicuruzwa',
    'products.add_product': 'Ongeraho icyagurishwa',
    'products.product_name': 'Izina ry\'icyagurishwa',
    'products.product_description': 'Ibisobanuro by\'icyagurishwa',
    'products.product_price': 'Igiciro cy\'icyagurishwa',
    'products.product_category': 'Icyiciro cy\'icyagurishwa',
    'products.product_image': 'Ishusho y\'icyagurishwa',
    'products.in_stock': 'Irahari',
    'products.out_of_stock': 'Ntikyahari',
    
    // Cart & Checkout
    'cart.title': 'Ikibindi cyawe',
    'cart.empty': 'Ikibindi cyawe kirimo ubusa',
    'cart.continue_shopping': 'Komeza guhaha',
    'cart.checkout': 'Kwishyura',
    'cart.subtotal': 'Igiteranyo gito',
    'cart.shipping': 'Kohereza',
    'cart.tax': 'Imisoro',
    'cart.total': 'Igiteranyo',
    'checkout.title': 'Kwishyura',
    'checkout.billing_address': 'Aderesi yo kwishyura',
    'checkout.shipping_address': 'Aderesi yo kohereza',
    'checkout.payment_method': 'Uburyo bwo kwishyura',
    'checkout.place_order': 'Emeza gusaba',
    'checkout.order_summary': 'Incamake y\'icyasabwe',
    
    // Orders
    'orders.title': 'Ibisabwa',
    'orders.order_id': 'Nimero y\'icyasabwe',
    'orders.customer': 'Umukiriya',
    'orders.order_date': 'Itariki y\'icyasabwe',
    'orders.order_status': 'Uko icyasabwe kimeze',
    'orders.order_total': 'Igiteranyo cy\'icyasabwe',
    'orders.pending': 'Birategereza',
    'orders.processing': 'Biratunganywa',
    'orders.shipped': 'Byoherejwe',
    'orders.delivered': 'Byagarutse',
    'orders.cancelled': 'Byahagaritswe',
    'orders.order_complete': 'Icyasabwe cyarangiye',
    'orders.payment_code': 'Kode yo kwishyura',
    'orders.generate_payment_code': 'Kora kode yo kwishyura',
    'orders.confirm_payment': 'Nashyuye',
    'orders.awaiting_confirmation': 'Gutegereza kwemeza kwa munyangizi',
    
    // Profile
    'profile.title': 'Igenamiterere ry\'umwirondoro',
    'profile.personal_info': 'Amakuru y\'umuntu ku giti cye',
    'profile.full_name': 'Amazina yose',
    'profile.email_address': 'Aderesi ya imeri',
    'profile.phone_number': 'Nimero ya telefoni',
    'profile.company': 'Ikigo/Umuryango',
    'profile.bio': 'Incamake y\'ubuzima',
    'profile.account_settings': 'Igenamiterere ry\'konti',
    'profile.email_notifications': 'Ubutumwa bwa imeri',
    'profile.change_password': 'Hindura ijambo banga',
    'profile.delete_account': 'Siba konti',
    'profile.save_changes': 'Bika impinduka',
    'profile.edit_profile': 'Hindura umwirondoro',
    'profile.active_member': 'Umunyamuryango ukora',
    'profile.joined': 'Yinjiye',
    
    // Vendors
    'vendors.title': 'Abacuruzi',
    'vendors.add_vendor': 'Ongeraho umucuruzi',
    'vendors.total_vendors': 'Abacuruzi bose',
    'vendors.total_users': 'Abakoresha bose',
    'vendors.vendor_name': 'Izina ry\'umucuruzi',
    'vendors.joined_date': 'Itariki yinjiriyeho',
    'vendors.active': 'Ukora',
    'vendors.inactive': 'Ntakora',
    'vendors.search_vendors': 'Shakisha abacuruzi...',
    
    // Categories
    'categories.title': 'Ibyiciro',
    'categories.no_categories': 'Nta byiciro bihari ubu.',
    'categories.loading': 'Byongera ibyiciro...',
    
    // Contact
    'contact.title': 'Twandikire',
    'contact.get_in_touch': 'Duhuze',
    'contact.message': 'Ubutumwa',
    'contact.send_message': 'Kohereza ubutumwa',
    'contact.subject': 'Ingingo',
    
    // Footer
    'footer.about_us': 'Ibyerekeye twe',
    'footer.privacy_policy': 'Politiki y\'ibanga',
    'footer.terms_service': 'Amabwiriza y\'ubudahangarwa',
    'footer.help_center': 'Ikigo cy\'ubufasha',
    'footer.contact_us': 'Twandikire',
    'footer.follow_us': 'Dukurikire',
    'footer.newsletter': 'Inyandiko z\'amakuru',
    'footer.subscribe': 'Iyandikishe',
    'footer.all_rights_reserved': 'Uburenganzira bwose bwarabitswe',
    
    // Error Pages
    'error.404.title': '404',
    'error.404.message': 'Yihangane! Urupapuro ntirubonetse',
    'error.404.return_home': 'Subira ku rupapuro rw\'itangiriro',
    'error.failed_load_products': 'Byanze gushyira ibicuruzwa',
    'error.failed_load_categories': 'Byanze gushyira ibyiciro',
    
    // Language
    'language.english': 'Icyongereza',
    'language.kinyarwanda': 'Ikinyarwanda',
    'language.select': 'Hitamo Ururimi',
  }
};
