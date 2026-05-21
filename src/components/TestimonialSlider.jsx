"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"

export default function TestimonialSlider() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Meron Tadesse",
      position: "Hotel Manager",
      location: "Dubai, UAE",
      image: "/business-meeting-diversity.png",
      rating: 5,
      text: "LMIS changed my life completely. From a small village in Ethiopia to managing a 5-star hotel in Dubai. The training programs and support were exceptional.",
      salary: "$1,200/month",
      year: "2023",
    },
    {
      id: 2,
      name: "Yonas Amanual",
      position: "Construction Supervisor",
      location: "Doha, Qatar",
      image: "/diverse-team-training.png",
      rating: 5,
      text: "The professional development I received through LMIS helped me advance from a construction worker to a supervisor. I'm now supporting my family and building my future.",
      salary: "$1,500/month",
      year: "2022",
    },
    {
      id: 3,
      name: "Almaz Bekele",
      position: "Registered Nurse",
      location: "Riyadh, Saudi Arabia",
      image: "/diverse-nurses.png",
      rating: 5,
      text: "As a healthcare professional, LMIS provided me with the certification and placement support I needed. I'm now working in one of the best hospitals in Riyadh.",
      salary: "$900/month",
      year: "2023",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [testimonials.length])

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className="py-16 md:py-20 relative overflow-hidden bg-white text-gray-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-56 h-56 md:w-72 md:h-72 bg-primary-100 opacity-20 rounded-full animate-pulse-slow transform -translate-x-1/2"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 md:w-60 md:h-60 bg-purple-200 opacity-15 rounded-full animate-pulse-slow"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-pink-500 animate-fadeInUp">
            Success Stories
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto animate-fadeInUp delay-100 text-gray-700">
            Real stories from Ethiopian workers who have transformed their lives through LMIS
          </p>
        </div>

        <div className="relative">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className={`transition-all duration-1000 ease-in-out ${
                index === currentTestimonial
                  ? "opacity-100 translate-x-0 z-10"
                  : "opacity-0 absolute inset-0 -z-10"
              }`}
            >
              <div className="max-w-4xl mx-auto">
                <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-2xl transform transition-transform duration-500 hover:-translate-y-2 hover:scale-105 hover:rotate-1">
                  <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                    <div className="flex-shrink-0 relative group">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      />
                      <Quote className="w-10 sm:w-12 h-10 sm:h-12 absolute -top-3 -left-3 opacity-70 animate-bounce" />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <blockquote className="text-lg sm:text-xl md:text-2xl mb-4 md:mb-6 leading-relaxed italic transition-all duration-500 hover:text-yellow-200">
                        "{testimonial.text}"
                      </blockquote>

                      <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center justify-center md:justify-start space-x-1 mb-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-4 sm:w-5 h-4 sm:h-5 text-yellow-400 fill-current animate-pulse-slow"
                            />
                          ))}
                        </div>

                        <div>
                          <h4 className="text-lg sm:text-xl md:text-xl font-bold">{testimonial.name}</h4>
                          <p className="font-semibold">{testimonial.position}</p>
                          <p className="text-sm sm:text-base">{testimonial.location}</p>
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:justify-start space-y-1 md:space-y-0 md:space-x-4 text-sm">
                          <span className="bg-yellow-100 text-yellow-900 px-3 py-1 rounded-full font-semibold animate-pulse-slow">
                            {testimonial.salary}
                          </span>
                          <span>Placed in {testimonial.year}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-gray-900 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-40 text-gray-900 p-2 sm:p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center space-x-2 sm:space-x-3 mt-6 sm:mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentTestimonial
                  ? "bg-gray-900 scale-125"
                  : "bg-gray-400 hover:scale-110"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
