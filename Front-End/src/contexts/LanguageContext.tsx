
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Common
    'home': 'Home',
    'products': 'Products',
    'categories': 'Categories',
    'about': 'About',
    'contact': 'Contact',
    'dashboard': 'Dashboard',
    'login': 'Login',
    'register': 'Register',
    'logout': 'Log out',
    'profile': 'Profile',
    'cart': 'Cart',
    'search': 'Search',
    'loading': 'Loading...',
    'error': 'Error',
    'save': 'Save',
    'cancel': 'Cancel',
    'submit': 'Submit',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'welcome': 'Welcome',
    'name': 'Name',
    'email': 'Email',
    'password': 'Password',
    'phone': 'Phone Number',
    'address': 'Address',
    'price': 'Price',
    'quantity': 'Quantity',
    'total': 'Total',
    'subtotal': 'Subtotal',
    'discount': 'Discount',
    'delivery_fee': 'Delivery Fee',
    'status': 'Status',
    'actions': 'Actions',
    'date': 'Date',
    'description': 'Description',
    'active': 'Active',
    'inactive': 'Inactive',
    'all': 'All',
    'none_found': 'None found',
    'search_placeholder': 'Search...',
    'business_name': 'Business Name',
    'gender': 'Gender',
    'male': 'Male',
    'female': 'Female',
    'other': 'Other',
    'prefer_not_to_say': 'Prefer not to say',

    // Header & Navigation
    'search_products': 'Search products...',
    'return_home': 'Return to Home',

    // Index Page
    'new_arrivals': 'NEW ARRIVALS',
    'top_selling': 'TOP SELLING',
    'browse_by_category': 'BROWSE BY CATEGORY',
    'loading_products': 'Loading products...',
    'failed_load_products': 'Failed to load products',

    // Login & Register
    'remember_me': 'Remember me',
    'forgot_password': 'Forgot Password?',
    'dont_have_account': "Don't have an account?",
    'already_have_account': 'Already have an account?',
    'log_in': 'Log In',
    'join_as_seller': 'Join As Seller',
    'terms_conditions': 'Terms and Conditions',
    'read_terms': 'I have read the',
    'request': 'Request',
    'seller_account': 'Seller Account',

    // Dashboard & Admin
    'analytics': 'Analytics',
    'customers': 'Customers',
    'vendors': 'Vendors',
    'orders': 'Orders',
    'reports': 'Reports',
    'admin_products': 'Admin Products',
    'community_chat': 'Community Chat',
    'settings': 'Settings',
    'notifications': 'Notifications',
    'no_notifications': 'No notifications',
    'total_sales': 'Total Sales',
    'daily_sales': 'Daily Sales',
    'daily_user': 'Daily Users',
    'summary_sales': 'Summary sales',
    'upcoming_payments': 'Upcoming Payments',
    'recent_orders': 'Recent Orders',
    'expense_status': 'Expense status',
    'vendor_dashboard': 'Vendor Dashboard Page',
    'analytics_coming_soon': 'Analytics page coming soon...',

    // Products & Categories
    'shop_by_categories': 'Shop by Categories',
    'wide_range_categories': 'Discover our wide range of product categories and find exactly what you\'re looking for.',
    'no_categories': 'No Categories Found',
    'categories_appear': 'Categories will appear here once they are added to the system.',
    'no_categories_available': 'No categories available at the moment.',
    'loading_categories': 'Loading categories...',
    'failed_load_categories': 'Failed to load categories',
    'no_products_found': 'No products found matching your filters.',
    'clear_filters': 'Clear Filters',
    'filters': 'Filters',
    'category': 'Category',
    'price_range': 'Price Range',
    'showing_products': 'Showing',
    'of_products': 'of',
    'products_text': 'products',
    'import': 'Import',
    'export': 'Export',
    'product_name': 'Product Name',
    'customer_name': 'Customer Name',
    'picture': 'Picture',

    // Cart & Orders
    'your_cart': 'YOUR CART',
    'cart_empty': 'Your cart is empty',
    'continue_shopping': 'Continue Shopping',
    'order_summary': 'Order Summary',
    'go_to_checkout': 'Go to checkout',
    'remove_from_cart': 'Remove from cart',
    'item_removed': 'Item removed',
    'item_removed_desc': 'Item has been removed from your cart',
    'failed_update_quantity': 'Failed to update quantity',
    'failed_remove_item': 'Failed to remove item',
    'please_login': 'Please Login',
    'need_login_cart': 'You need to be logged in to view your cart.',
    'loading_cart': 'Loading cart...',
    'order_placed': 'Order Placed Successfully!',
    'order_received': 'Your order has been received and is being processed.',
    'order_id': 'Order ID',
    'payment_processing': 'Payment Processing',
    'generate_payment_code': 'Generate Payment Code',
    'generate_code_desc': 'Generate a payment code to proceed with MoMo payment',
    'payment_code': 'Your Payment Code:',
    'use_code_desc': 'Use this code to complete your MoMo payment, then confirm below',
    'made_payment': "I've Made the Payment",
    'awaiting_confirmation': 'Awaiting Admin Confirmation',
    'payment_verified': 'Your payment is being verified by our admin team',
    'view_orders': 'View My Orders',
    'return_home_page': 'Return to Home Page',
    'secured_purchases': 'Your purchases are secured by industry-standard encryption',

    // Contact
    'send_message': 'Send Us message',
    'full_name': 'Enter your full name',
    'enter_email': 'Enter your email',
    'enter_message': 'Enter your message here...',
    'send': 'Send',
    'phone_label': 'Phone:',
    'email_label': 'Email:',
    'times_label': 'Times:',
    'location_label': 'Location:',
    'times_value': 'Mon - Sun: 7 AM - 9 PM',
    'location_value': 'Downtown House Kigali',

    // Customers & Vendors
    'add_customer': 'Add Customer',
    'search_customers': 'Search customers...',
    'customer': 'CUSTOMER',
    'joined': 'JOINED',
    'no_customers': 'No customers found',
    'add_vendor': 'Add Vendor',
    'search_vendors': 'Search vendors...',
    'vendor': 'VENDOR',
    'role': 'ROLE',
    'no_vendors': 'No vendors found',
    'total_vendors': 'Total Vendors',
    'active_sellers': 'Active SELLERs',
    'total_users': 'Total Users',
    'all_registered': 'All registered users',
    'no_vendors_search': 'No vendors found matching',
    'retry': 'Retry',
    'failed_load_vendors': 'Failed to load vendors.',
    'failed_load_customers': 'Failed to load customers',
    'loading_vendors': 'Loading vendors...',
    'loading_customers': 'Loading customers...',

    // Community Chat
    'discussion_vendors': 'Discussion for Vendors & Admins',
    'messages': 'messages',
    'share_ideas': 'Share ideas, ask questions, and collaborate with other vendors and administrators.',
    'no_messages': 'No messages yet. Start the conversation!',
    'type_message': 'Type your message...',
    'characters': 'characters',
    'refresh': 'Refresh',
    'failed_load_chat': 'Failed to load chat messages',
    'loading_chat': 'Loading chat...',
    'message_sent': 'Message sent',
    'message_posted': 'Your message has been posted to the community chat.',
    'failed_send_message': 'Failed to send message',
    'admin': 'Admin',
    'vendor_role': 'Vendor',

    // Not Found
    'page_not_found': 'Oops! Page not found',

    // General Messages
    'success': 'Success',
    'failed': 'Failed',
    'try_again': 'Please try again',
    'something_wrong': 'Something went wrong',
  },
  rw: {
    // Common
    'home': 'Ahabanza',
    'products': 'Ibicuruzwa',
    'categories': 'Ibyiciro',
    'about': 'Ibyerekeye',
    'contact': 'Tubwire',
    'dashboard': 'Ibyugarwe',
    'login': 'Injira',
    'register': 'Iyandikishe',
    'logout': 'Gusohoka',
    'profile': 'Ibintu byawe',
    'cart': 'Igiterazo',
    'search': 'Gushakisha',
    'loading': 'Birimo gutegurwa...',
    'error': 'Ikosa',
    'save': 'Bika',
    'cancel': 'Hagarika',
    'submit': 'Ohereza',
    'delete': 'Gusiba',
    'edit': 'Guhindura',
    'add': 'Kongeramo',
    'welcome': 'Murakaza neza',
    'name': 'Izina',
    'email': 'Imeyili',
    'password': 'Ijambo ry\'ibanga',
    'phone': 'Telefoni',
    'address': 'Aderesi',
    'price': 'Igiciro',
    'quantity': 'Umubare',
    'total': 'Byose',
    'subtotal': 'Igice',
    'discount': 'Ibyaciwe',
    'delivery_fee': 'Amafaranga y\'iyerekezwa',
    'status': 'Uko bimeze',
    'actions': 'Ibikorwa',
    'date': 'Italiki',
    'description': 'Ibisobanuro',
    'active': 'Bikora',
    'inactive': 'Ntibikora',
    'all': 'Byose',
    'none_found': 'Nta kintu kibonetse',
    'search_placeholder': 'Shakisha...',
    'business_name': 'Izina ry\'ubucuruzi',
    'gender': 'Igitsina',
    'male': 'Gabo',
    'female': 'Gore',
    'other': 'Ikindi',
    'prefer_not_to_say': 'Nsabwa kutabivuga',

    // Header & Navigation
    'search_products': 'Shakisha ibicuruzwa...',
    'return_home': 'Garuka mu rugo',

    // Index Page
    'new_arrivals': 'IBICURUZWA BISHYA',
    'top_selling': 'IBICURURWA CYANE',
    'browse_by_category': 'SHAKISHA MU BYICIRO',
    'loading_products': 'Ibicuruzwa birimo gutegurwa...',
    'failed_load_products': 'Byanze gutegura ibicuruzwa',

    // Login & Register
    'remember_me': 'Nyibuke',
    'forgot_password': 'Wibagiwe ijambo ry\'ibanga?',
    'dont_have_account': 'Ntufite konti?',
    'already_have_account': 'Usanzwe ufite konti?',
    'log_in': 'Injira',
    'join_as_seller': 'Jya mu bucuruzi',
    'terms_conditions': 'Amabwiriza n\'amasezerano',
    'read_terms': 'Nasomye',
    'request': 'Saba',
    'seller_account': 'Konti y\'umucuruzi',

    // Dashboard & Admin
    'analytics': 'Isesengura',
    'customers': 'Abakiriya',
    'vendors': 'Abacuruzi',
    'orders': 'Ibisabwa',
    'reports': 'Raporo',
    'admin_products': 'Ibicuruzwa by\'ubutegetsi',
    'community_chat': 'Ikiganiro cy\'umuryango',
    'settings': 'Igenamiterere',
    'notifications': 'Ubutumire',
    'no_notifications': 'Nta butumire',
    'total_sales': 'Ibicuruzwa byose',
    'daily_sales': 'Ibicuruzwa by\'umunsi',
    'daily_user': 'Abakoresha b\'umunsi',
    'summary_sales': 'Incamake y\'ibicuruzwa',
    'upcoming_payments': 'Uburyo bw\'inyigiragiro',
    'recent_orders': 'Ibisabwa bishya',
    'expense_status': 'Uko amafaranga ameze',
    'vendor_dashboard': 'Ibyugarwe by\'umucuruzi',
    'analytics_coming_soon': 'Isesengura rizaza vuba...',

    // Products & Categories
    'shop_by_categories': 'Gura hakurikije ibyiciro',
    'wide_range_categories': 'Menya ibyiciro byinshi by\'ibicuruzwa kandi ubone icyo ushaka kenshi.',
    'no_categories': 'Nta byiciro bibonetse',
    'categories_appear': 'Ibyiciro bizagaragara hano iyo byongeye kwongerwamo.',
    'no_categories_available': 'Nta byiciro bihari ubu.',
    'loading_categories': 'Ibyiciro birimo gutegurwa...',
    'failed_load_categories': 'Byanze gutegura ibyiciro',
    'no_products_found': 'Nta bicuruzwa bibonetse bishushanye n\'amashyushyu yawe.',
    'clear_filters': 'Siba amashyushyu',
    'filters': 'Amashyushyu',
    'category': 'Icyiciro',
    'price_range': 'Urwego rw\'igiciro',
    'showing_products': 'Byerekanwa',
    'of_products': 'kuri',
    'products_text': 'ibicuruzwa',
    'import': 'Kinjiza',
    'export': 'Gusohora',
    'product_name': 'Izina ry\'igicuruzwa',
    'customer_name': 'Izina ry\'umukiriya',
    'picture': 'Ifoto',

    // Cart & Orders
    'your_cart': 'IGITERAZO CYAWE',
    'cart_empty': 'Igiterazo cyawe kirimo ubusa',
    'continue_shopping': 'Komeza gura',
    'order_summary': 'Incamake y\'ibisabwa',
    'go_to_checkout': 'Jya gukwirakwiza',
    'remove_from_cart': 'Vamo mu giterazo',
    'item_removed': 'Ikintu kirasibwe',
    'item_removed_desc': 'Ikintu cyavanwe mu giterazo cyawe',
    'failed_update_quantity': 'Byanze guhindura umubare',
    'failed_remove_item': 'Byanze gukuramo ikintu',
    'please_login': 'Nyabuna Winjire',
    'need_login_cart': 'Ugomba kuba winjiye kugira ngo urebe igiterazo cyawe.',
    'loading_cart': 'Igiterazo kirimo gutegurwa...',
    'order_placed': 'Icyifuzo cyatanzwe neza!',
    'order_received': 'Icyifuzo cyawe cyakiriwe kandi kirimo gutunganywa.',
    'order_id': 'Nomero y\'icyifuzo',
    'payment_processing': 'Gutunganya iyishyura',
    'generate_payment_code': 'Kora kode y\'iyishyura',
    'generate_code_desc': 'Kora kode y\'iyishyura kugira ngo ukomeze n\'iyishyura rya MoMo',
    'payment_code': 'Kode yawe y\'iyishyura:',
    'use_code_desc': 'Koresha iyi kode kumaliza iyishyura rya MoMo, hanyuma wemeze hepfo',
    'made_payment': 'Narishyuye',
    'awaiting_confirmation': 'Gutegereza kwemeza kw\'ubutegetsi',
    'payment_verified': 'Iyishyura ryawe riri muri serivisi z\'ubutegetsi',
    'view_orders': 'Reba ibisabwa byange',
    'return_home_page': 'Garuka ku rupapuro rw\'itangiriro',
    'secured_purchases': 'Ibyo waguze birengerwa n\'iby\'umutekano bw\'inganda',

    // Contact
    'send_message': 'Twoherereze ubutumwa',
    'full_name': 'Andika izina ryawe ryuzuye',
    'enter_email': 'Andika imeyili yawe',
    'enter_message': 'Andika ubutumwa bwawe hano...',
    'send': 'Ohereza',
    'phone_label': 'Telefoni:',
    'email_label': 'Imeyili:',
    'times_label': 'Igihe:',
    'location_label': 'Aho tubarizwa:',
    'times_value': 'Ku cyumweru - Ku cyumweru: 7 AM - 9 PM',
    'location_value': 'Inzu y\'umujyi wa Kigali',

    // Customers & Vendors
    'add_customer': 'Ongeramo umukiriya',
    'search_customers': 'Shakisha abakiriya...',
    'customer': 'UMUKIRIYA',
    'joined': 'YINJIYE',
    'no_customers': 'Nta bakiriya babonetse',
    'add_vendor': 'Ongeramo umucuruzi',
    'search_vendors': 'Shakisha abacuruzi...',
    'vendor': 'UMUCURUZI',
    'role': 'URUHARE',
    'no_vendors': 'Nta bacuruzi babonetse',
    'total_vendors': 'Abacuruzi bose',
    'active_sellers': 'ABACURUZI bakora',
    'total_users': 'Abakoresha bose',
    'all_registered': 'Abakoresha bose biyandikishije',
    'no_vendors_search': 'Nta bacuruzi babonetse bashushanye na',
    'retry': 'Ongera ugerageze',
    'failed_load_vendors': 'Byanze gutegura abacuruzi.',
    'failed_load_customers': 'Byanze gutegura abakiriya',
    'loading_vendors': 'Abacuruzi barimo gutegurwa...',
    'loading_customers': 'Abakiriya barimo gutegurwa...',

    // Community Chat
    'discussion_vendors': 'Ikiganiro cy\'abacuruzi n\'abayobozi',
    'messages': 'ubutumwa',
    'share_ideas': 'Sangira ibitekerezo, baza ibibazo, kandi ufatanye n\'abandi bacuruzi n\'abayobozi.',
    'no_messages': 'Nta butumwa. Tangira ikiganiro!',
    'type_message': 'Andika ubutumwa bwawe...',
    'characters': 'inyuguti',
    'refresh': 'Vugurura',
    'failed_load_chat': 'Byanze gutegura ubutumwa bw\'ikiganiro',
    'loading_chat': 'Ikiganiro kirimo gutegurwa...',
    'message_sent': 'Ubutumwa bwoherejwe',
    'message_posted': 'Ubutumwa bwawe bwashyizweho ku kiganiro cy\'umuryango.',
    'failed_send_message': 'Byanze kohereza ubutumwa',
    'admin': 'Umuyobozi',
    'vendor_role': 'Umucuruzi',

    // Not Found
    'page_not_found': 'Ihangane! Urupapuro ntiruboneka',

    // General Messages
    'success': 'Byagenze neza',
    'failed': 'Byanze',
    'try_again': 'Nyabuna ugerageze',
    'something_wrong': 'Hariho ikitagenze neza',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
