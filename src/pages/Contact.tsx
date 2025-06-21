
import { Send, Phone, Mail, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Contact = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section with Background Image */}
      <section className="relative flex items-center justify-center py-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('/Convention.jpg')`
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-0 max-w-4xl w-full flex overflow-hidden">
              {/* Contact Form */}
              <div className="flex-1 p-8">
                <h2 className="text-2xl font-bold mb-6">{t('contact.send-message')}</h2>
                
                <form className="space-y-4">
                  <Input 
                    type="text" 
                    placeholder={t('contact.full-name')}
                    className="w-full border-gray-200"
                  />
                  <Input 
                    type="email" 
                    placeholder={t('contact.enter-email')}
                    className="w-full border-gray-200"
                  />
                  <Textarea 
                    placeholder={t('contact.message')}
                    rows={4}
                    className="w-full resize-none border-gray-200"
                  />
                  <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg">
                    {t('contact.send')}
                  </Button>
                </form>
              </div>

              {/* Contact Information Card */}
              <div className="flex-1 bg-gray-900 text-white p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Phone className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">{t('contact.phone')}</p>
                      <p className="font-medium">{t('contact.phone-number')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">{t('contact.email')}</p>
                      <p className="font-medium">{t('contact.email-address')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">{t('contact.times')}</p>
                      <p className="font-medium">{t('contact.business-hours')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-5 h-5 text-white mt-1" />
                    <div>
                      <p className="text-sm text-gray-300 mb-1">{t('contact.location')}</p>
                      <p className="font-medium">{t('contact.address')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
