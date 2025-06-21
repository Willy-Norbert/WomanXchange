
import { Star } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useLanguage } from '@/contexts/LanguageContext';

const TestimonialSection = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      name: "Gentil Mugisha",
      rating: 5,
      text: t('testimonials.review_1'),
      avatar: "/Gentil.jpg"
    },
    {
      name: "Gentil Mugisha",
      rating: 5,
      text: t('testimonials.review_2'),
      avatar: "/Gentil.jpg"
    },
    {
      name: "Gentil Mugisha",
      rating: 5,
      text: t('testimonials.review_3'),
      avatar: "/Gentil.jpg"
    },
    {
      name: "Gentil Mugisha",
      rating: 5,
      text: t('testimonials.review_4'),
      avatar: "/Gentil.jpg"
    },
    {
      name: "Gentil Mugisha",
      rating: 5,
      text: t('testimonials.review_5'),
      avatar: "/Gentil.jpg"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {t('testimonials.title')}
        </h2>
        <div className="max-w-4xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 h-full">
                    <img 
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                    <div className="flex justify-center mb-3">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
