
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-purple-50 to-purple-100 py-24 min-h-[600px] flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to A Smart Marketplace for Women Entrepreneurs in Rwanda
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Built for women entrepreneurs in Kigali, WomXchange Rwanda provides a seamless online platform for selling, managing, and expanding your business.
            </p>
            <Link to="/products">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg rounded-full">
                Shop Now
              </Button>
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <div className="w-96 h-96 bg-purple-200 rounded-2xl shadow-2xl flex items-center justify-center">
                <span className="text-6xl">👩‍💼</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
