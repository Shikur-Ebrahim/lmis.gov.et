export default function KeyFeaturesAndServices() {
  const features = [
    {
      logoSrc: "/images/image1.svg",
      title: "Intelligent Job Matching",
      description:
        "Connecting job seekers with relevant opportunities based on skills, experience, and aspirations, as a public service.",
      bgClass: "bg-gradient-to-br from-blue-700 to-blue-900",
    },
    {
      logoSrc: "/images/image2.svg",
      title: "Seamless Integration",
      description:
        "Ensuring smooth data exchange and connectivity with other government and private sector platforms for a unified experience, bolstered by your secure Labor ID.",
      bgClass: "bg-gradient-to-br from-red-400 to-red-600",
    },
    {
      logoSrc: "/images/image3.svg",
      title: "Comprehensive Services",
      description:
        "A wide array of services including career counseling, skill development programs, and labor market advisory, available to all citizens.",
      bgClass: "bg-gradient-to-br from-green-400 to-green-600",
    },
    {
      logoSrc: "/images/image4.svg",
      title: "Robust Data Security",
      description:
        "Protecting your personal and business information with state-of-the-art security measures and privacy protocols, especially through the secure biometric Labor ID system.",
      bgClass: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 lg:py-32 bg-gray-50">
      <div className="container px-4 md:px-6 text-center">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-12">
          <div className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 animate-pulse">
            Latest Updates
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl md:text-6xl animate-fadeInDown">
            Key Features And Services
          </h2>
          <p className="text-center text-sm md:text-base lg:text-base text-gray-600 max-w-xl mx-auto animate-fadeInDown delay-100">
            Discover the core functionalities that make E-LMIS your secure and trusted government platform for all labor market needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mx-auto grid max-w-5xl items-stretch gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                flex flex-col justify-between h-full p-6 text-left 
                rounded-xl shadow-lg transform transition-all duration-500 
                hover:shadow-2xl hover:scale-105 hover:-translate-y-2 
                ${feature.bgClass} 
                relative overflow-hidden
              `}
            >
              {/* Gradient overlay for subtle shine */}
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-500 rounded-xl"></div>

              {/* Title & Description */}
              <div className="relative z-10">
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white leading-relaxed">{feature.description}</p>
              </div>

              {/* Logo */}
              <div className="w-full mt-auto relative z-10">
                <img
                  src={feature.logoSrc}
                  alt={`${feature.title} logo`}
                  className="w-full object-contain transform transition-transform duration-500 hover:scale-110"
                  style={{ height: "120px" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
