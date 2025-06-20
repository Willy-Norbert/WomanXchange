
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl">WomXchange Rwanda</span>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering women entrepreneurs across Rwanda with a smart marketplace platform.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Kigali, Rwanda</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">+250 784 720 984</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">info@womxchange.rw</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Home</a></li>
              <li><a href="/products" className="text-gray-400 hover:text-purple-400 transition-colors">Products</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">Categories</a></li>
              <li><a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">About Us</a></li>
              <li><a href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Help Center</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Shipping Info</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Returns</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-semibold mb-4">Location</h3>
            <p className="text-gray-400 text-sm mb-4">
              Visit our office in Kigali or shop online from anywhere in Rwanda.
            </p>
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm font-semibold">Store Hours</p>
              <p className="text-xs text-gray-400">Mon - Fri: 9:00 AM - 9:00 PM</p>
              <p className="text-xs text-gray-400">Sat - Sun: 10:00 AM - 9:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 WomXchange. All rights reserved. Made with ❤️ for women entrepreneurs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
