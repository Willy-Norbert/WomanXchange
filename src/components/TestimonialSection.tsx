
import { Star } from 'lucide-react';

const TestimonialSection = () => {
  const testimonials = [
    {
      name: "Marie Uwimana",
      rating: 5,
      text: "Amazing quality products and fast delivery. I love supporting local women entrepreneurs!",
      avatar: "/placeholder.svg"
    },
    {
      name: "Grace Mukamana",
      rating: 5,
      text: "The cosmetics I bought are incredible. Great prices and authentic products from talented women.",
      avatar: "/placeholder.svg"
    },
    {
      name: "Divine Ingabire",
      rating: 5,
      text: "This marketplace changed my shopping experience. So many unique items and great customer service!",
      avatar: "/placeholder.svg"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md">
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
