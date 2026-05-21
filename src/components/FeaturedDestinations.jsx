import { MapPin, Users, Star, ArrowRight } from "lucide-react"

export default function FeaturedDestinations() {
  const destinations = [
    {
      country: "Canada",
      flag: "Ca",
      jobs: "15,000+",
      avgSalary: "$400-800",
      sectors: ["Domestic Work", "Construction", "Healthcare"],
      rating: 4.5,
      image: "/images/saudi.png",
    },
    {
      country: "United Arab Emirates",
      flag: "🇦🇪",
      jobs: "8,500+",
      avgSalary: "$500-1200",
      sectors: ["Hospitality", "Retail", "Construction"],
      rating: 4.7,
      image: "/images/united.png",
    },
    {
      country: "Qatar",
      flag: "🇶🇦",
      jobs: "5,200+",
      avgSalary: "$600-1500",
      sectors: ["Construction", "Services", "Manufacturing"],
      rating: 4.6,
      image: "/images/qatar.png",
    },
  ]

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Popular Destinations</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore high-demand employment opportunities in countries with strong Ethiopian worker communities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {destinations.map((dest, index) => (
            <div
              key={index}
              className="card overflow-hidden hover:shadow-lg transition-all duration-300 group border border-gray-200 shadow-sm"
            >
              <div className="relative h-48">
                <img
                  src={dest.image}
                  alt={dest.country}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white rounded-full px-3 py-1 flex items-center space-x-2">
                  <span className="text-2xl">{dest.flag}</span>
                  <span className="font-semibold text-gray-900">{dest.country}</span>
                </div>
                <div className="absolute top-4 right-4 bg-white rounded-full px-2 py-1 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-semibold">{dest.rating}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-lg font-bold text-green-600">{dest.jobs}</span>
                    <span className="text-gray-600">positions</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Avg. Salary</p>
                    <p className="text-lg font-bold text-gray-900">{dest.avgSalary}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Top Sectors:</p>
                  <div className="flex flex-wrap gap-2">
                    {dest.sectors.map((sector, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                </div >
               
               <button className="w-full transition-all duration-200 flex items-center justify-center">
        <a
         href="/contact"
             className="w-full relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-black font-semibold rounded-lg shadow-sm transition-all duration-300 hover:bg-lmis-blue-primary hover:border-lmis-blue-primary hover:text-white hover:shadow-lg group"
                 >
             <span className="transition-colors duration-300 group-hover:text-white">
                Visit Us
               </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />

               {/* Glow effect */}
               <span className="absolute inset-0 rounded-lg bg-lmis-blue-primary opacity-0 group-hover:opacity-20 transition duration-300 blur-md"></span>
           </a>
            </button>

              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
             <a
               href="/services"
                 className="group inline-flex items-center gap-3 px-8 py-4 bg-white border border-gray-300 text-black text-lg font-semibold rounded-full shadow-sm hover:shadow-lg hover:bg-gray-50 transition-all duration-300"
                 >
              <span className="transition-colors duration-300 group-hover:text-lmis-blue-primary">
                 View All Destinations
             </span>
          <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-lmis-blue-primary" />
           </a>
            </div>


      </div>
    </div>
  )
}
