export default function Testimonials() {
  const testimonials = [
    {
      quote: "MyDentPlan saved me from a huge surprise bill. I knew exactly what to expect before my crown procedure.",
      author: "Sarah Johnson",
      role: "Patient",
      avatar: "SJ"
    },
    {
      quote: "As someone without dental insurance, this tool helped me budget and plan for necessary treatments.",
      author: "Michael Chen",
      role: "Self-Employed",
      avatar: "MC"
    },
    {
      quote: "The estimates were spot-on! I compared prices and saved over $400 by knowing what my insurance would cover.",
      author: "Emily Rodriguez",
      role: "Teacher",
      avatar: "ER"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Trusted by thousands of patients
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what people are saying about MyDentPlan
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-8 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <p className="text-[17px] text-gray-700 mb-6 leading-7">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
