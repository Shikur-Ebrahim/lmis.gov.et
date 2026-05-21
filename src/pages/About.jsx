"use client"

import { useState, useEffect, useRef } from "react"
import {
  Users,
  Globe,
  Award,
  Shield,
  Target,
  Heart,
  TrendingUp,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  ArrowRight,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  MessageCircle,
  Building,
  Clock,
  BookOpen,
  Briefcase,
} from "lucide-react"

export default function About() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [expandedMilestone, setExpandedMilestone] = useState(null)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const [activeTab, setActiveTab] = useState("mission")
  const [counts, setCounts] = useState([0, 0, 0, 0])
  const [selectedLeader, setSelectedLeader] = useState(null)

  const sectionRefs = useRef({})

  const stats = [
    { icon: Users, label: "Workers Placed", value: 50000, color: "blue", suffix: "+" },
    { icon: Globe, label: "Partner Countries", value: 25, color: "green", suffix: "" },
    { icon: Award, label: "Success Rate", value: 98.5, color: "yellow", suffix: "%" },
    { icon: Shield, label: "Years of Service", value: 15, color: "purple", suffix: "" },
  ]

  const achievements = [
    { icon: Building, title: "Regional Offices", count: 12, description: "Across Ethiopia" },
    { icon: Clock, title: "Average Processing", count: 7, description: "Days for applications" },
    { icon: BookOpen, title: "Training Programs", count: 150, description: "Completed annually" },
    { icon: Briefcase, title: "Job Categories", count: 45, description: "Available positions" },
  ]

  const milestones = [
    {
      year: "2008",
      title: "LMIS Establishment",
      description:
        "Ethiopian Labor Market Information System was officially established to regulate and facilitate safe labor migration.",
      details:
        "Launched with initial focus on Gulf countries, establishing the foundation for systematic labor migration management.",
      impact: "Created the first structured approach to Ethiopian labor migration",
      image: "/grand-government-building.png",
    },
    {
      year: "2012",
      title: "International Partnerships",
      description: "Signed bilateral agreements with Gulf countries to ensure worker protection and legal employment.",
      details:
        "Established formal agreements with Saudi Arabia, UAE, Kuwait, and Qatar for worker protection protocols.",
      impact: "Reduced exploitation cases by 60% through formal agreements",
      image: "/international-handshake-partnership.png",
    },
    {
      year: "2016",
      title: "Digital Transformation",
      description: "Launched online platform for streamlined application processes and better service delivery.",
      details: "Introduced digital applications, online tracking, and automated workflow management systems.",
      impact: "Reduced processing time from 30 days to 10 days average",
      image: "/digital-transformation.png",
    },
    {
      year: "2020",
      title: "COVID-19 Response",
      description: "Implemented comprehensive support programs for Ethiopian workers affected by the pandemic.",
      details:
        "Emergency repatriation programs, financial support, and health monitoring systems for overseas workers.",
      impact: "Successfully repatriated 25,000+ workers safely",
      image: "/abstract-protection.png",
    },
    {
      year: "2024",
      title: "Modern LMIS Platform",
      description: "Launched this advanced digital platform with enhanced features and improved user experience.",
      details:
        "AI-powered matching, real-time tracking, mobile app integration, and comprehensive worker support systems.",
      impact: "98.5% user satisfaction rate with new platform",
      image: "/modern-digital-platform.png",
    },
  ]

  const leadership = [
    {
      name: "Dr. Muferihat Kamil",
      position: "Minister of Labor and Social Affairs",
      image: "/muferi.jpg",
      bio: "Leading Ethiopia's labor migration policies with over 20 years of experience in public service.",
      education: "PhD in Public Administration, Harvard Kennedy School",
      achievements: [
        "Reduced processing times by 70%",
        "Established 5 new bilateral agreements",
        "Launched digital transformation initiative",
      ],
      contact: "minister@molsa.gov.et",
    },
    {
      name: "Ato Kassahun Follo",
      position: "Director General, LMIS",
      image: "/kasahun.jpg",
      bio: "Overseeing LMIS operations and ensuring the safety and welfare of Ethiopian migrant workers.",
      education: "Masters in International Relations, Addis Ababa University",
      achievements: [
        "Implemented worker protection protocols",
        "Expanded to 25 partner countries",
        "Established emergency response system",
      ],
      contact: "dg@lmis.gov.et",
    },
    {
      name: "W/ro Sahlework Zewde",
      position: "Deputy Director, Worker Protection",
      image: "/sahlewerk.jpg",
      bio: "Dedicated to protecting Ethiopian workers' rights and ensuring fair employment practices abroad.",
      education: "LLM in Human Rights Law, University of London",
      achievements: [
        "Reduced worker complaints by 80%",
        "Established 24/7 support hotline",
        "Created worker rights training program",
      ],
      contact: "protection@lmis.gov.et",
    },
  ]

  const values = [
    {
      icon: Shield,
      title: "Worker Protection",
      description:
        "Ensuring the safety, dignity, and rights of every Ethiopian worker abroad through comprehensive protection mechanisms.",
      details:
        "24/7 support hotline, legal assistance, emergency repatriation services, and regular welfare monitoring.",
    },
    {
      icon: Heart,
      title: "Integrity & Transparency",
      description:
        "Maintaining the highest standards of ethical conduct and transparency in all our operations and services.",
      details: "Open data policies, regular audits, public reporting, and zero-tolerance for corruption.",
    },
    {
      icon: Target,
      title: "Excellence in Service",
      description:
        "Delivering exceptional services that exceed expectations and contribute to successful labor migration outcomes.",
      details: "Continuous improvement programs, user feedback integration, and performance monitoring systems.",
    },
    {
      icon: Users,
      title: "Inclusive Development",
      description:
        "Promoting inclusive economic development by creating opportunities for all segments of Ethiopian society.",
      details: "Special programs for women, youth, and rural communities with targeted support and training.",
    },
  ]

  const testimonials = [
    {
      name: "Meron Tadese",
      role: "Hotel Manager, Dubai",
      content:
        "LMIS helped me find a safe job with a caring family. The support throughout my journey has been incredible.",
      rating: 5,
      image: "/business-meeting-diversity.png",
    },
    {
      name: "Dawit Bekele",
      role: "Engineer in Qatar",
      content: "The training and preparation I received through LMIS made all the difference in my success abroad.",
      rating: 5,
      image: "/ethiopian-construction-worker.png",
    },
    {
      name: "Almaz Bekele",
      role: "Healthcare Worker, Saudi Arabia",
      content: "Professional support from application to employment. LMIS truly cares about worker welfare.",
      rating: 5,
      image: "/diverse-nurses.png",
    },
  ]

  const tabContent = {
    mission: {
      title: "Our Mission",
      content:
        "To facilitate safe, legal, and dignified labor migration opportunities for Ethiopian workers while ensuring their protection, welfare, and successful integration in destination countries.",
      icon: Target,
      highlights: [
        "Safe and legal migration pathways",
        "Comprehensive worker protection",
        "Skills development and training",
        "Continuous support and monitoring",
      ],
    },
    vision: {
      title: "Our Vision",
      content:
        "To be the leading labor migration management system in Africa, recognized for excellence in worker protection, innovative services, and sustainable development impact.",
      icon: Globe,
      highlights: [
        "Regional leadership in labor migration",
        "Innovation in digital services",
        "Sustainable development impact",
        "International best practices",
      ],
    },
    strategy: {
      title: "Our Strategy",
      content:
        "Leveraging technology, partnerships, and continuous improvement to create a comprehensive ecosystem that supports Ethiopian workers throughout their migration journey.",
      icon: TrendingUp,
      highlights: [
        "Digital-first approach",
        "Strategic partnerships",
        "Continuous innovation",
        "Data-driven decisions",
      ],
    },
  }

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 },
    )

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => observer.disconnect()
  }, [])

  // Animated counters
  useEffect(() => {
    if (visibleSections.has("stats")) {
      let animationFrame
      const duration = 2000
      const startTime = performance.now()

      const animate = (time) => {
        const elapsed = time - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4)

        setCounts(stats.map((stat) => stat.value * easeOutQuart))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [visibleSections])

  const formatStatValue = (value, index) => {
    const stat = stats[index]
    if (stat.suffix === "%") {
      return value.toFixed(1) + "%"
    } else if (stat.suffix === "+") {
      return Math.floor(value).toLocaleString() + "+"
    } else {
      return Math.floor(value).toLocaleString()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-7xl font-bold mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              About LMIS
            </h1>
            <p className="text-xl sm:text-2xl mb-12 leading-relaxed text-blue-100">
              The Ethiopian Labor Market Information System (LMIS) is the official government platform dedicated to
              facilitating safe, legal, and dignified labor migration for Ethiopian workers seeking employment
              opportunities abroad.
            </p>

            {/* Interactive video section */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center justify-center space-x-4">
                  <a href="/register">
                    <button
                      className="flex items-center space-x-3 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/30"
                    >
                      <span className="font-semibold">Register Now</span>
                    </button>
                  </a>

                  <a href="/contact">
                    <button className="flex items-center space-x-2 bg-blue-600/80 hover:bg-blue-600 px-6 py-3 rounded-full transition-all duration-300">
                      <span>Contact Us</span>
                    </button>
                  </a>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Section */}
      <div
        id="stats"
        ref={(el) => (sectionRefs.current.stats = el)}
        className="py-20 bg-white relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Our Impact in Numbers
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transforming lives through safe and legal labor migration
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 ${visibleSections.has("stats") ? "animate-fade-in-up" : "opacity-0"
                  }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <stat.icon className={`w-8 h-8 text-${stat.color}-600`} />
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                    {formatStatValue(counts[index], index)}
                  </h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Additional achievements */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100"
              >
                <achievement.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{achievement.count}</div>
                <div className="text-sm font-semibold text-gray-700 mb-1">{achievement.title}</div>
                <div className="text-xs text-gray-500">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission, Vision, Strategy Tabs */}
      <div className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Our Foundation</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The principles and aspirations that drive our work</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex border-b border-gray-200">
              {Object.entries(tabContent).map(([key, content]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 px-6 py-4 text-center font-semibold transition-all duration-300 ${activeTab === key ? "bg-blue-600 text-white" : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                >
                  <content.icon className="w-5 h-5 mx-auto mb-2" />
                  {content.title}
                </button>
              ))}
            </div>

            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{tabContent[activeTab].title}</h3>
                <p className="text-gray-700 text-lg mb-6 leading-relaxed">{tabContent[activeTab].content}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tabContent[activeTab].highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Core Values */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide our work and define our commitment to Ethiopian migrant workers
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-3 text-gray-900">{value.title}</h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">{value.description}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{value.details}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Timeline */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones in LMIS development and achievements</p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-blue-400 to-indigo-600 h-full rounded-full"></div>

            <div className="space-y-16">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-center ${index % 2 !== 0 ? "lg:flex-row-reverse" : ""}`}
                >
                  <div className="lg:w-1/2 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-6 h-6 text-blue-600" />
                          <span className="text-blue-600 font-bold text-2xl">{milestone.year}</span>
                        </div>
                        <button
                          onClick={() => setExpandedMilestone(expandedMilestone === index ? null : index)}
                          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          {expandedMilestone === index ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>

                      <h3 className="font-bold text-xl mb-3 text-gray-900">{milestone.title}</h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">{milestone.description}</p>

                      {expandedMilestone === index && (
                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                          <img
                            src={milestone.image || "/placeholder.svg"}
                            alt={milestone.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Details</h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{milestone.details}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Impact</h4>
                            <p className="text-green-700 text-sm font-medium">{milestone.impact}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>

                  <div className="lg:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Leadership Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Leadership Team</h2>
            <p className="text-xl text-gray-600">Meet the dedicated leaders driving LMIS forward</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
              >
                <div className="p-8 text-center">
                  <div className="relative mb-6">
                    <img
                      src={leader.image || "/placeholder.svg"}
                      alt={leader.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200 group-hover:border-blue-300 transition-colors duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  <h3 className="font-bold text-xl mb-2 text-gray-900">{leader.name}</h3>
                  <p className="text-blue-600 font-semibold mb-4">{leader.position}</p>
                  <p className="text-gray-700 text-sm mb-6 leading-relaxed">{leader.bio}</p>

                  <button
                    onClick={() => setSelectedLeader(selectedLeader === index ? null : index)}
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  {selectedLeader === index && (
                    <div className="mt-6 pt-6 border-t border-gray-200 text-left space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                        <p className="text-gray-700 text-sm">{leader.education}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                        <ul className="space-y-1">
                          {leader.achievements.map((achievement, i) => (
                            <li key={i} className="flex items-start space-x-2">
                              <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700 text-sm">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                        <a href={`mailto:${leader.contact}`} className="text-blue-600 text-sm hover:underline">
                          {leader.contact}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories / Testimonials */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Success Stories</h2>
            <p className="text-xl text-gray-600">Hear from Ethiopian workers who found success through LMIS</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center space-x-4 mb-6">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-blue-600 text-sm font-medium">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed italic">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 group">
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  )
}
