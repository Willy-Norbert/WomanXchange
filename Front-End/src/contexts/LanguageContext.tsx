
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.dashboard': 'Dashboard',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.welcome': 'Welcome',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.submit': 'Submit',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.view': 'View',
    
    // Authentication
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.login_required': 'Login Required',
    'auth.login_to_add_cart': 'Please login to add items to cart',
    'auth.forgot_password': 'Forgot Password?',
    'auth.remember_me': 'Remember me',
    'auth.dont_have_account': "Don't have an account?",
    'auth.already_have_account': 'Already have an account?',
    'auth.sign_up': 'Sign up',
    'auth.sign_in': 'Sign in',
    
    // Products
    'products.search_placeholder': 'Search for products...',
    'products.no_products_available': 'No products available at the moment.',
    'products.view_more': 'View More',
    'products.loading_related': 'Loading related products...',
    'products.you_might_like': 'You might also like',
    'products.add_to_cart': 'Add to Cart',
    'products.out_of_stock': 'Out of Stock',
    'products.in_stock': 'In Stock',
    
    // Cart
    'cart.added_to_cart': 'Added to cart',
    'cart.item_added': '{{item}} has been added to your cart.',
    'cart.failed_to_add': 'Failed to add to cart',
    'cart.add_to_cart': 'Add to Cart',
    'cart.adding': 'Adding...',
    
    // Categories
    'categories.loading': 'Loading categories...',
    'categories.no_categories': 'No categories available.',
    
    // Home
    'home.new_arrivals': 'NEW ARRIVALS',
    'home.top_selling': 'TOP SELLING',
    'home.browse_categories': 'Browse by Category',
    
    // Hero Section
    'hero.title': 'Welcome to A Smart Marketplace for Women Entrepreneurs in Rwanda',
    'hero.description': 'Built for women entrepreneurs in Kigali, WomXchange Rwanda provides a seamless online platform for selling, managing, and expanding your business.',
    'hero.shop_now': 'Shop Now',
    'hero.image_alt': 'Successful woman entrepreneur',
    
    // Footer
    'footer.company_name': 'WomXchange Rwanda',
    'footer.company_description': 'Empowering women entrepreneurs across Rwanda with a smart marketplace platform.',
    'footer.location': 'Kigali, Rwanda',
    'footer.quick_links': 'Quick Links',
    'footer.support': 'Support',
    'footer.help_center': 'Help Center',
    'footer.shipping_info': 'Shipping Info',
    'footer.returns': 'Returns',
    'footer.privacy_policy': 'Privacy Policy',
    'footer.terms_of_service': 'Terms of Service',
    'footer.location_title': 'Location',
    'footer.location_description': 'Visit our office in Kigali or shop online from anywhere in Rwanda.',
    'footer.store_hours': 'Store Hours',
    'footer.weekdays': 'Mon - Fri: 9:00 AM - 9:00 PM',
    'footer.weekends': 'Sat - Sun: 10:00 AM - 9:00 PM',
    'footer.copyright': '© 2024 WomXchange. All rights reserved. Made with ❤ for women entrepreneurs.',
    
    // Testimonials
    'testimonials.title': 'OUR HAPPY CUSTOMERS',
    'testimonials.review_1': 'Amazing quality products and fast delivery. I love supporting local women entrepreneurs!',
    'testimonials.review_2': 'The cosmetics I bought are incredible. Great prices and authentic products from talented women.',
    'testimonials.review_3': 'This marketplace changed my shopping experience. So many unique items and great customer service!',
    'testimonials.review_4': 'Excellent customer service and high quality products. Will definitely shop here again!',
    'testimonials.review_5': 'Love the variety of products available. Supporting local businesses has never been easier!',
    
    // Banner
    'banner.sell_on_system': 'Sell on Our System',
    'banner.join_as_seller': 'Join as a Seller',
    
    // Dashboard
    'dashboard.notifications': 'No notifications',
    'dashboard.profile': 'Profile',
    'dashboard.settings': 'Settings',
    
    // Error Pages
    'error.404.title': '404 - Page Not Found',
    'error.404.message': 'The page you are looking for does not exist.',
    'error.404.return_home': 'Return to Home',
    'error.failed_load_products': 'Failed to load products',
    
    // Language
    'language.english': 'English',
    'language.kinyarwanda': 'Kinyarwanda',
  },
  rw: {
    // Navigation
    'nav.home': 'Ahabanza',
    'nav.products': 'Ibicuruzwa',
    'nav.categories': 'Amatsinda',
    'nav.about': 'Ibibacu',
    'nav.contact': 'Twandikire',
    'nav.dashboard': 'Ubuyobozi',
    
    // Common
    'common.loading': 'Birimo gutangura...',
    'common.error': 'Ikosa',
    'common.welcome': 'Murakaza neza',
    'common.save': 'Bika',
    'common.cancel': 'Kuraguza',
    'common.delete': 'Gusiba',
    'common.edit': 'Guhindura',
    'common.add': 'Kongeramo',
    'common.search': 'Gushaka',
    'common.filter': 'Gutoranya',
    'common.clear': 'Gusiba',
    'common.submit': 'Kohereza',
    'common.close': 'Gufunga',
    'common.open': 'Gufungura',
    'common.view': 'Kureba',
    
    // Authentication
    'auth.login': 'Kwinjira',
    'auth.register': 'Kwiyandikisha',
    'auth.logout': 'Gusohoka',
    'auth.email': 'Imeli',
    'auth.password': 'Ijambo ry\'ibanga',
    'auth.name': 'Izina',
    'auth.login_required': 'Ugomba Kwinjira',
    'auth.login_to_add_cart': 'Nyamuneka winjire kugira ngo wongeremo ibicuruzwa mu gitebo',
    'auth.forgot_password': 'Wibagiwe ijambo ry\'ibanga?',
    'auth.remember_me': 'Nyibuke',
    'auth.dont_have_account': 'Ntufite konti?',
    'auth.already_have_account': 'Usanzwe ufite konti?',
    'auth.sign_up': 'Iyandikishe',
    'auth.sign_in': 'Injira',
    
    // Products
    'products.search_placeholder': 'Shakisha ibicuruzwa...',
    'products.no_products_available': 'Nta bicuruzwa bihari ubu.',
    'products.view_more': 'Reba Byinshi',
    'products.loading_related': 'Birimo gutangura ibicuruzwa bifitaniye isano...',
    'products.you_might_like': 'Bishoboka ko ubishaka',
    'products.add_to_cart': 'Shyira mu Gitebo',
    'products.out_of_stock': 'Byarangiye',
    'products.in_stock': 'Birahari',
    
    // Cart
    'cart.added_to_cart': 'Byashyizwe mu gitebo',
    'cart.item_added': '{{item}} byashyizwe mu gitebo cyawe.',
    'cart.failed_to_add': 'Byanze gushyirwa mu gitebo',
    'cart.add_to_cart': 'Shyira mu Gitebo',
    'cart.adding': 'Birimo gushyirwa...',
    
    // Categories
    'categories.loading': 'Birimo gutangura amatsinda...',
    'categories.no_categories': 'Nta matsinda ahari.',
    
    // Home
    'home.new_arrivals': 'IBICURUZWA BISHYA',
    'home.top_selling': 'IBICURUZWA BICURUZA CYANE',
    'home.browse_categories': 'Shakisha hakurikijwe Itsinda',
    
    // Hero Section
    'hero.title': 'Murakaza neza ku Isoko Ryubwenge ry\'Abacuruzi b\'Abagore mu Rwanda',
    'hero.description': 'Ryubatswe kubacuruzi b\'abagore bo i Kigali, WomXchange Rwanda itanga urubuga rworoshye rwo gucuruza, gucunga, no kwagura ubucuruzi bwawe.',
    'hero.shop_now': 'Gura Ubu',
    'hero.image_alt': 'Umucuruzi w\'umugore watsindiye',
    
    // Footer
    'footer.company_name': 'WomXchange Rwanda',
    'footer.company_description': 'Gutera imbere abacuruzi b\'abagore bo mu Rwanda hakoreshejwe urubuga rw\'isoko ryubwenge.',
    'footer.location': 'Kigali, u Rwanda',
    'footer.quick_links': 'Ihuza Ryihuse',
    'footer.support': 'Ub ufasha',
    'footer.help_center': 'Ikigo cy\'Ubufasha',
    'footer.shipping_info': 'Amakuru y\'Iyohereza',
    'footer.returns': 'Iyasubizwa',
    'footer.privacy_policy': 'Politiki y\'Ibanga',
    'footer.terms_of_service': 'Amabwiriza y\'Inyago',
    'footer.location_title': 'Ahantu',
    'footer.location_description': 'Suranabire ibiro byacu i Kigali cyangwa ugure kumurongo uhereye ahantu hose mu Rwanda.',
    'footer.store_hours': 'Amasaha y\'Iduka',
    'footer.weekdays': 'Ku cyumweru - Kw\'igatanu: 9:00 AM - 9:00 PM',
    'footer.weekends': 'Ku cyomboro - Ku cyumweru: 10:00 AM - 9:00 PM',
    'footer.copyright': '© 2024 WomXchange. Uburenganzira bwose burarangiye. Byakozwe n\'urukundo kubacuruzi b\'abagore.',
    
    // Testimonials
    'testimonials.title': 'ABAKIRIYA BACU BISHIMIYE',
    'testimonials.review_1': 'Ibicuruzwa byiza cyane kandi biboherezwa vuba. Ndakunda gushyigikira abacuruzi b\'aho!',
    'testimonials.review_2': 'Ibintu byo kwisiga naguze biratangaje. Ibiciro byiza kandi ibicuruzwa nyabyo kuva kumugore ufite ubuhanga.',
    'testimonials.review_3': 'Iri soko ryahinduye ubunyangamugayo bwanjye bwo kugura. Ibintu byinshi bidasanzwe kandi serivisi nziza!',
    'testimonials.review_4': 'Serivisi nziza y\'abakiriya n\'ibicuruzwa byujuje ibisabwa. Nzongera kugura hano!',
    'testimonials.review_5': 'Ndakunda ibicuruzwa bitandukanye birahari. Gushyigikira ubucuruzi bw\'aho ntabwo byigeze byoroshye!',
    
    // Banner
    'banner.sell_on_system': 'Gucuruzira kuri sisiteme yacu',
    'banner.join_as_seller': 'Winjire nk\'Umucuruzi',
    
    // Dashboard
    'dashboard.notifications': 'Nta makuru',
    'dashboard.profile': 'Umwirondoro',
    'dashboard.settings': 'Igenamiterere',
    
    // Error Pages
    'error.404.title': '404 - Urupapuro Rutabonetse',
    'error.404.message': 'Urupapuro ushaka ntirubaho.',
    'error.404.return_home': 'Subira Ahabanza',
    'error.failed_load_products': 'Byanze gutangura ibicuruzwa',
    
    // Language
    'language.english': 'Icyongereza',
    'language.kinyarwanda': 'Ikinyarwanda',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language') as Language;
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, any>): string => {
    let translation = translations[language][key] || translations['en'][key] || key;
    
    if (params) {
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }
    
    return translation;
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
