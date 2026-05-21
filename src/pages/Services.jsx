"use client"

import { useState, useEffect, useRef } from "react"
import {
  Briefcase,
  Users,
  Shield,
  GraduationCap,
  Globe,
  FileText,
  Heart,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  Clock,
  DollarSign,
  Search,
  X,
  MapPin,
  TrendingUp,
  Zap,
  Target,
  Headphones,
  Smartphone,
  ChevronDown,
  ChevronUp,
} from "lucide-react"

const Services = () => {
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedService, setSelectedService] = useState(null)
  const [isVisible, setIsVisible] = useState({})
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [expandedServices, setExpandedServices] = useState({})
  const observerRef = useRef()

  // Enhanced services data with more details
  const mainServices = [
    {
      id: 1,
      icon: Briefcase,
      title: "Premium Job Placement",
      shortDesc: "Connect with verified employers worldwide",
      description:
        "Our premium job placement service connects you with verified employers across multiple countries, ensuring secure employment opportunities with competitive salaries and comprehensive benefits.",
      features: [
        "AI-powered job matching",
        "Salary negotiation support",
        "Contract verification",
        "Background checks",
        "Career counseling",
        "Interview preparation",
      ],
      color: "blue",
      category: "employment",
      price: "Free consultation",
      duration: "2-4 weeks",
      successRate: "94%",
      countries: ["UAE", "Saudi Arabia", "Qatar", "Kuwait"],
      testimonial: "Found my dream job in Dubai within 3 weeks! The support was incredible.",
      rating: 4.9,
    },
    {
      id: 2,
      icon: GraduationCap,
      title: "Advanced Skills Training",
      shortDesc: "Professional development programs",
      description:
        "Comprehensive training programs designed to enhance your professional skills and increase your marketability in international job markets.",
      features: [
        "Industry-specific training",
        "Digital literacy programs",
        "Language proficiency courses",
        "Soft skills development",
        "Technical certifications",
        "Cultural adaptation training",
      ],
      color: "green",
      category: "training",
      price: "Starting from $299",
      duration: "4-12 weeks",
      successRate: "98%",
      countries: ["Global"],
      testimonial: "The training program transformed my career prospects completely!",
      rating: 4.8,
    },
    {
      id: 3,
      icon: Shield,
      title: "Comprehensive Protection",
      shortDesc: "Complete worker safety and rights protection",
      description:
        "Advanced protection services ensuring your safety, legal rights, and welfare throughout your international employment journey.",
      features: [
        "24/7 legal support",
        "Emergency assistance",
        "Rights advocacy",
        "Insurance coverage",
        "Dispute resolution",
        "Welfare monitoring",
      ],
      color: "red",
      category: "protection",
      price: "Included in package",
      duration: "Ongoing",
      successRate: "100%",
      countries: ["All destinations"],
      testimonial: "Felt completely secure knowing I had full protection coverage.",
      rating: 5.0,
    },
    {
      id: 4,
      icon: FileText,
      title: "Express Documentation",
      shortDesc: "Fast-track visa and document processing",
      description:
        "Streamlined documentation and visa processing services with express options for urgent applications and comprehensive support.",
      features: [
        "Express processing",
        "Document authentication",
        "Visa application support",
        "Travel arrangements",
        "Medical clearance",
        "Embassy liaison",
      ],
      color: "purple",
      category: "documentation",
      price: "Starting from $199",
      duration: "1-3 weeks",
      successRate: "96%",
      countries: ["50+ countries"],
      testimonial: "Got my visa approved in record time with zero hassle!",
      rating: 4.7,
    },
  ]

  const additionalServices = [
    {
      id: "health",
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive medical screening and health support services",
      color: "pink",
      expandedContent: {
        fullDescription:
          "Our comprehensive health and wellness program ensures you're physically and mentally prepared for your international journey. We provide complete medical screenings, health certifications, and ongoing wellness support throughout your employment abroad.",
        features: [
          "Complete medical examinations",
          "Vaccination and immunization services",
          "Health certificate processing",
          "Mental health counseling",
          "Nutrition and fitness guidance",
          "Emergency medical support abroad",
          "Health insurance coordination",
          "Telemedicine consultations",
        ],
        benefits: [
          "WHO-approved medical facilities",
          "24/7 health hotline support",
          "Multilingual medical staff",
          "Fast-track medical processing",
        ],
        pricing: "Starting from $150",
        duration: "1-2 weeks for complete screening",
      },
    },
    {
      id: "mobile",
      icon: Smartphone,
      title: "Mobile App Support",
      description: "24/7 assistance through our dedicated mobile application",
      color: "indigo",
      expandedContent: {
        fullDescription:
          "Stay connected and supported throughout your journey with our comprehensive mobile application. Access services, track your progress, and get instant support wherever you are in the world.",
        features: [
          "Real-time application tracking",
          "Document upload and management",
          "Emergency contact system",
          "Job opportunity notifications",
          "Cultural integration guides",
          "Language learning modules",
          "Expense tracking tools",
          "Community forums and networking",
        ],
        benefits: [
          "Available in 5 languages",
          "Offline functionality",
          "Secure encrypted communications",
          "GPS-based emergency services",
        ],
        pricing: "Free with service package",
        duration: "Lifetime access",
      },
    },
    {
      id: "family",
      icon: Users,
      title: "Family Services",
      description: "Support programs for families of migrant workers",
      color: "orange",
      expandedContent: {
        fullDescription:
          "We understand that migration affects the entire family. Our comprehensive family support services ensure your loved ones are cared for while you work abroad, with programs designed to maintain family bonds and provide essential support.",
        features: [
          "Family counseling sessions",
          "Children's education support",
          "Spouse employment assistance",
          "Regular family communication programs",
          "Financial literacy training",
          "Emergency family support",
          "Reunion planning services",
          "Cultural exchange programs",
        ],
        benefits: [
          "Dedicated family liaison officers",
          "Monthly family check-ins",
          "Educational scholarships available",
          "Emergency financial assistance",
        ],
        pricing: "Included in premium packages",
        duration: "Throughout employment period",
      },
    },
    {
      id: "career",
      icon: TrendingUp,
      title: "Career Growth",
      description: "Long-term career development and advancement programs",
      color: "teal",
      expandedContent: {
        fullDescription:
          "Build a sustainable international career with our comprehensive career development programs. We provide ongoing training, mentorship, and advancement opportunities to help you climb the career ladder abroad.",
        features: [
          "Personalized career planning",
          "Skills assessment and development",
          "Leadership training programs",
          "Professional networking events",
          "Industry certification courses",
          "Mentorship matching",
          "Career transition support",
          "Entrepreneurship guidance",
        ],
        benefits: [
          "Access to exclusive job opportunities",
          "Professional development budget",
          "Industry expert mentors",
          "Career advancement tracking",
        ],
        pricing: "Starting from $199/month",
        duration: "Ongoing career support",
      },
    },
    {
      id: "reintegration",
      icon: Globe,
      title: "Reintegration",
      description: "Smooth transition support for returning workers",
      color: "cyan",
      expandedContent: {
        fullDescription:
          "Plan your successful return home with our comprehensive reintegration services. We help you transition back to Ethiopia with new skills, savings, and opportunities for continued success.",
        features: [
          "Pre-return planning sessions",
          "Skills transfer workshops",
          "Business startup support",
          "Investment guidance",
          "Local job placement assistance",
          "Community reintegration programs",
          "Savings and remittance optimization",
          "Continued professional networking",
        ],
        benefits: [
          "Guaranteed job placement assistance",
          "Microfinance partnerships",
          "Business incubation programs",
          "Alumni network access",
        ],
        pricing: "Included in comprehensive packages",
        duration: "6 months post-return support",
      },
    },
    {
      id: "hotline",
      icon: Headphones,
      title: "24/7 Hotline",
      description: "Round-the-clock multilingual support hotline",
      color: "yellow",
      expandedContent: {
        fullDescription:
          "Never feel alone abroad with our 24/7 multilingual support hotline. Our trained counselors and support staff are available around the clock to assist with any challenges or emergencies you may face.",
        features: [
          "24/7 emergency response",
          "Multilingual support (Amharic, English, Arabic)",
          "Crisis intervention services",
          "Legal advice and referrals",
          "Medical emergency coordination",
          "Workplace dispute resolution",
          "Emotional support counseling",
          "Information and guidance services",
        ],
        benefits: [
          "Average response time: 2 minutes",
          "Trained Ethiopian counselors",
          "Direct embassy connections",
          "Emergency fund access",
        ],
        pricing: "Free for all clients",
        duration: "Available throughout employment",
      },
    },
  ]

  const processSteps = [
    {
      step: 1,
      title: "Smart Registration",
      description: "AI-powered profile creation and skills assessment",
      icon: Users,
      time: "30 minutes",
    },
    {
      step: 2,
      title: "Personalized Training",
      description: "Customized training programs based on your goals",
      icon: GraduationCap,
      time: "2-8 weeks",
    },
    {
      step: 3,
      title: "Intelligent Matching",
      description: "Advanced algorithms match you with perfect opportunities",
      icon: Target,
      time: "1-2 weeks",
    },
    {
      step: 4,
      title: "Express Processing",
      description: "Fast-track documentation and visa processing",
      icon: Zap,
      time: "1-3 weeks",
    },
    {
      step: 5,
      title: "Ongoing Support",
      description: "Continuous support throughout your journey abroad",
      icon: Globe,
      time: "Lifetime",
    },
  ]

  const testimonials = [
    {
      name: "Almaz Tadesse",
      role: "Nurse in Dubai",
      image: "/ethiopian-professional-woman.png",
      text: "The entire process was seamless. From training to placement, everything exceeded my expectations.",
      rating: 5,
      country: "UAE",
    },
    {
      name: "Dawit Bekele",
      role: "Engineer in Qatar",
      image: "ethiopian-construction-worker.png",
      text: "Professional service with genuine care for workers. Highly recommend to anyone seeking opportunities abroad.",
      rating: 5,
      country: "Qatar",
    },
    {
      name: "Hanan Mohammed",
      role: "Teacher in Saudi Arabia",
      image: "/ethiopian-woman-teacher.png",
      text: "The support didn't end after placement. They continue to check on my welfare and career growth.",
      rating: 5,
      country: "Saudi Arabia",
    },
  ]

  const stats = [
    { label: "Successful Placements", value: "15,000+", icon: Users },
    { label: "Partner Countries", value: "25+", icon: Globe },
    { label: "Success Rate", value: "96%", icon: TrendingUp },
    { label: "Years of Experience", value: "12+", icon: Award },
  ]

  const filterCategories = [
    { id: "all", label: "All Services", icon: Globe },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "training", label: "Training", icon: GraduationCap },
    { id: "protection", label: "Protection", icon: Shield },
    { id: "documentation", label: "Documentation", icon: FileText },
  ]

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll("[data-animate]")
    elements.forEach((el) => observerRef.current.observe(el))

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  // Filter services
  const filteredServices = mainServices.filter((service) => {
    const matchesFilter = activeFilter === "all" || service.category === activeFilter
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const ServiceModal = ({ service, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 bg-${service.color}-100 rounded-xl flex items-center justify-center`}>
              <service.icon className={`w-8 h-8 text-${service.color}-600`} />
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{service.rating}</span>
                <span className="text-gray-500">({service.successRate} success rate)</span>
              </div>
              <p className="text-gray-600">
                {service.price} • {service.duration}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">{service.description}</p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold mb-3">Key Features</h4>
              <ul className="space-y-2">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Available Countries</h4>
              <div className="flex flex-wrap gap-2">
                {service.countries.map((country, idx) => (
                  <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {country}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 italic">"{service.testimonial}"</p>
          </div>

          <button
            className={`w-full bg-${service.color}-600 text-white py-3 rounded-lg font-semibold hover:bg-${service.color}-700 transition-colors`}
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  )

  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }))
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 animate-fade-in">
              Premium Migration Services
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in delay-200">
              Empowering Ethiopian workers with world-class services for safe, legal, and successful international
              employment opportunities.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 mb-8">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="text-center animate-fade-in"
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
                >
                  <div className="w-12 h-12 mx-auto mb-2 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
            <a href="/register">
            <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg animate-fade-in delay-500">
              Start Your Journey
            </button>
             </a>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {filterCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <category.icon className="w-4 h-4" />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Core Services */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" id="services-header" data-animate>
            <h2
              className={`text-3xl lg:text-4xl font-bold text-gray-900 mb-4 transition-all duration-1000 ${
                isVisible["services-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Our Premium Services
            </h2>
            <p
              className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${
                isVisible["services-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              Comprehensive solutions tailored to your international career aspirations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {filteredServices.map((service, idx) => (
              <div
                key={service.id}
                id={`service-${service.id}`}
                data-animate
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 ${
                  isVisible[`service-${service.id}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ animationDelay: `${idx * 200}ms` }}
                onClick={() => setSelectedService(service)}
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${service.color}-400 to-${service.color}-600`}
                ></div>

                <div className="p-6 lg:p-8">
                  <div className="flex items-start space-x-4 lg:space-x-6 mb-6">
                    <div
                      className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-${service.color}-100 to-${service.color}-200 rounded-xl flex items-center justify-center text-${service.color}-600 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
                    >
                      <service.icon className="w-8 h-8 lg:w-10 lg:h-10" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl lg:text-2xl font-bold text-gray-900">{service.title}</h3>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-semibold">{service.rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{service.shortDesc}</p>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{service.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{service.successRate} success</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>{service.price}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{service.countries.length} countries</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {service.features.slice(0, 4).map((feature, fidx) => (
                      <div key={fidx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="bg-gray-50 rounded-lg p-3 flex-1 mr-4">
                      <p className="text-xs text-gray-500 italic">"{service.testimonial.slice(0, 60)}..."</p>
                    </div>
                    <button
                      className={`flex items-center space-x-2 px-4 py-2 bg-${service.color}-600 text-white rounded-lg hover:bg-${service.color}-700 transition-colors font-medium`}
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-gray-100 to-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Additional Support Services</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, idx) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                {/* Service Header */}
                <div className="p-6">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br from-${service.color}-100 to-${service.color}-200 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <service.icon className={`w-8 h-8 text-${service.color}-600`} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">{service.title}</h3>
                  <p className="text-gray-600 text-sm text-center leading-relaxed mb-4">{service.description}</p>

                  <button
                    onClick={() => toggleServiceExpansion(service.id)}
                    className={`w-full py-2 border border-${service.color}-300 rounded-lg hover:bg-${service.color}-50 transition-colors text-sm font-medium flex items-center justify-center space-x-2 text-${service.color}-600`}
                  >
                    <span>Learn More</span>
                    {expandedServices[service.id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expandable Content */}
                {expandedServices[service.id] && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 animate-in slide-in-from-top duration-300">
                    <div className="space-y-4">
                      <p className="text-sm text-gray-700 leading-relaxed">{service.expandedContent.fullDescription}</p>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Features:</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {service.expandedContent.features.slice(0, 4).map((feature, fidx) => (
                            <div key={fidx} className="flex items-center space-x-2 text-xs text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                        {service.expandedContent.features.length > 4 && (
                          <p className="text-xs text-gray-500 mt-2">
                            +{service.expandedContent.features.length - 4} more features
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <DollarSign className="w-3 h-3" />
                            <span>{service.expandedContent.pricing}</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>{service.expandedContent.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          className={`w-full py-2 bg-${service.color}-600 text-white rounded-lg hover:bg-${service.color}-700 transition-colors text-sm font-medium`}
                        >
                          Get Started
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Process Steps */}
      <section className="py-16 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Our Streamlined Process</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A proven 5-step journey designed to get you from application to employment efficiently
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-indigo-200 transform -translate-y-1/2"></div>

            <div className="grid lg:grid-cols-5 gap-8">
              {processSteps.map((step, idx) => (
                <div
                  key={idx}
                  id={`step-${idx}`}
                  data-animate
                  className={`relative text-center group transition-all duration-1000 ${
                    isVisible[`step-${idx}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  {/* Step Number */}
                  <div className="relative z-10 w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-500">
                    <step.icon className="w-6 h-6" />
                  </div>

                  <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 leading-relaxed">{step.description}</p>
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Success Stories</h2>

          <div className="relative bg-white rounded-2xl shadow-xl p-8 lg:p-12">
            <div className="flex items-center justify-center space-x-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>

            <blockquote className="text-xl lg:text-2xl text-gray-700 mb-8 leading-relaxed">
              "{testimonials[activeTestimonial].text}"
            </blockquote>

            <div className="flex items-center justify-center space-x-4">
              <img
                src={testimonials[activeTestimonial].image || "/placeholder.svg"}
                alt={testimonials[activeTestimonial].name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-left">
                <div className="font-semibold text-gray-900">{testimonials[activeTestimonial].name}</div>
                <div className="text-gray-600">{testimonials[activeTestimonial].role}</div>
                <div className="text-sm text-blue-600">{testimonials[activeTestimonial].country}</div>
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === activeTestimonial ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful Ethiopian workers who have transformed their careers with our services.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
<a href="/register">
  <button className="bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-lg">
    Get Free Consultation
  </button>
</a>

<a href="/contact">
  <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
    Contact Us
  </button>
</a>

          </div>
        </div>
      </section>

      {/* Service Modal */}
      {selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />}
    </div>
  )
}

export default Services
