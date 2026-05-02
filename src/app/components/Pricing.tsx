export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for occasional estimates",
      features: [
        "Up to 5 estimates per month",
        "Basic insurance coverage info",
        "Mobile access",
        "Email support"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "For individuals and families",
      features: [
        "Unlimited estimates",
        "Detailed insurance breakdown",
        "Save estimate history",
        "Priority support",
        "Export to PDF",
        "Family account sharing"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Practice",
      price: "$49",
      period: "/month",
      description: "For dental practices",
      features: [
        "Everything in Pro",
        "Multi-user access",
        "Custom branding",
        "API access",
        "Dedicated support",
        "Analytics dashboard"
      ],
      cta: "Contact Sales",
      highlighted: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl ${
                plan.highlighted
                  ? 'bg-primary text-white shadow-2xl scale-105 border-2 border-primary'
                  : 'bg-white border border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-4">
                  Most Popular
                </div>
              )}
              <h3 className={`text-2xl font-semibold mb-2 ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                {plan.name}
              </h3>
              <div className="mb-4">
                <span className={`text-5xl font-semibold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={plan.highlighted ? 'text-white/80' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`mb-6 ${plan.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                {plan.description}
              </p>
              <button
                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all mb-8 ${
                  plan.highlighted
                    ? 'bg-white text-primary hover:bg-gray-100'
                    : 'bg-primary text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </button>
              <ul className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        plan.highlighted ? 'text-white' : 'text-green-500'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={plan.highlighted ? 'text-white/90' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
