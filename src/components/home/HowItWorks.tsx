
const steps = [
  {
    step: "1",
    title: "Create Survey",
    description: "Design your survey with our intuitive builder"
  },
  {
    step: "2",
    title: "Distribute",
    description: "Send surveys to your team members"
  },
  {
    step: "3",
    title: "Collect Responses",
    description: "Gather feedback automatically"
  },
  {
    step: "4",
    title: "Analyze Results",
    description: "Get insights from powerful analytics"
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-gray-600 text-lg">Simple steps to transform your feedback process</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center group">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:scale-110 transition-transform duration-200">
                {step.step}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-primary/10" />
              )}
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
