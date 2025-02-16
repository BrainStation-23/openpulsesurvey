
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
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
