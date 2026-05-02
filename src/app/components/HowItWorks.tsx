export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Select Your Treatment",
      description: "Choose from common dental procedures like cleanings, fillings, crowns, or implants.",
      color: "bg-blue-500"
    },
    {
      number: "2",
      title: "Enter Insurance Details",
      description: "Select your insurance provider and indicate if you've met your deductible.",
      color: "bg-purple-500"
    },
    {
      number: "3",
      title: "Get Your Estimate",
      description: "See an instant breakdown of costs, insurance coverage, and your out-of-pocket expenses.",
      color: "bg-green-500"
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get accurate dental cost estimates in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-20" style={{ width: 'calc(100% - 12rem)', left: '6rem' }}></div>

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center text-white text-2xl font-semibold mb-6 shadow-lg relative z-10`}>
                  {step.number}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="#calculator"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Try It Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
