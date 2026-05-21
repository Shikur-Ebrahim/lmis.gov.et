"use client"

import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { collection, getDocs, orderBy, query, onSnapshot, limit } from "firebase/firestore"
import { db } from "../config/firebase"
import { XCircle } from "lucide-react"
import ApplicantCard from "../components/ApplicantCard"
import QuickStats from "../components/QuickStats"
import FeaturedDestinations from "../components/FeaturedDestinations"
import TestimonialSlider from "../components/TestimonialSlider"
import KeyFeaturesAndServices from "../components/key-features-and-services"
import EmpoweringEthiopias from "../components/empowering-ethiopias"
import LatestNews from "../components/latest-news"
import {
  Search,
  Users,
  CheckCircle,
  TrendingUp,
  Globe,
  Award,
  Building,
  ArrowRight,
  MapPin,
  Briefcase,
  Phone,
  ExternalLink,
  Calendar,
  Shield,
  CreditCard,
} from "lucide-react"

export default function Home() {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    countries: 0,
  })

  // Video State
  const [latestVideo, setLatestVideo] = useState(null)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showNoVideoToast, setShowNoVideoToast] = useState(false)

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
  }

  // Added states for sorting & load more
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [visibleCount, setVisibleCount] = useState(9)
  const [registrationFee, setRegistrationFee] = useState(null)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 9)
  }

  // Fetch applicants from Firestore with real-time updates
  useEffect(() => {
    setLoading(true)

    // Fetch from users collection directly
    const q = collection(db, "users")

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const applicantsData = querySnapshot.docs
            .map((doc) => {
              const data = doc.data()
              return {
                id: doc.id,
                ...data,
                fullName: data.fullName || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Applicant",
                job: data.job || data.jobCategory || "Not Specified",
                country: data.country || "Ethiopia",
                createdAt: data.createdAt || new Date(),
              }
            })
            .filter((user) => {
              // Filter out admins
              if (user.role === 'admin') return false
              // Filter out Pending status (only show approved/rejected/under review)
              if (!user.status || user.status.toLowerCase() === 'pending') return false
              return true
            })

          // Sort manually by createdAt desc
          applicantsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt)
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt)
            return dateB - dateA
          })

          setApplicants(applicantsData)

          // Calculate stats based on filtered data
          const total = applicantsData.length
          const accepted = applicantsData.filter((a) => a.status === "Accepted").length
          // Pending will be 0 in the displayed list, but we can't count true pending from this filtered list
          // If we want total system stats, we'd need a separate query, but for "landing section data" 
          // the stats usually reflect what's shown or the public subset.
          // However, to keep "pending" stat accurate for the UI if it's displayed, 
          // we might want to calculate it from the raw snapshot before filtering, 
          // BUT the user said "make the data displayed in thsie section just other than admin and also status not pending".
          // The stats `stats.pending` is used in the `setStats`.
          // If I filter out pending, `stats.pending` will be 0. 
          // Let's assume stats should reflect the VISIBLE applicants or the pool of "public" applicants.
          // Actually, if pending is hidden, showing "Pending: 5" statistic might be confusing if they aren't in the list?
          // Or maybe the stats are general? 
          // `QuickStats` is static. These `stats` state variables (lines 35-40) are NOT USED in the rendered JSX above QuickStats!
          // Wait, let's check if `stats` state is used.
          // Scanning the file... `stats` is used in `setStats` but where is `stats` read?
          // It seems `stats` state is UNUSED in the render (lines 216+). 
          // `QuickStats` component is imported but it's self-contained.
          // `stats` state seems unused. 
          // Providing filtered list is the key requirement.

          const countries = new Set(applicantsData.map((a) => a.country).filter(Boolean)).size

          setStats({ total, accepted, pending: 0, countries })
          setLoading(false)
        } catch (error) {
          console.error("Error processing applicants data:", error)
          setLoading(false)
        }
      },
      (error) => {
        console.error("Error fetching applicants:", error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Fetch registration fee from account collection
  useEffect(() => {
    const fetchRegistrationFee = async () => {
      try {
        const accountsRef = collection(db, "account")
        const accountsSnapshot = await getDocs(accountsRef)

        if (!accountsSnapshot.empty) {
          // Get the first account's registration fee
          const firstAccount = accountsSnapshot.docs[0].data()
          setRegistrationFee(firstAccount.registrationFee || null)
        }
      } catch (error) {
        console.error("Error fetching registration fee:", error)
      }
    }

    fetchRegistrationFee()
  }, [])

  // Fetch latest video
  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"), limit(1))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setLatestVideo({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() })
      }
    })
    return () => unsubscribe()
  }, [])

  // Filter & sort applicants using useMemo
  const filteredApplicants = useMemo(() => {
    let data = applicants


    // Search filter: only by fullName and country
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      data = data.filter(
        (a) =>
          a.fullName?.toLowerCase().includes(lower) ||
          a.country?.toLowerCase().includes(lower)
      );
    }

    // Sorting
    if (sortBy === "az") {
      data = [...data].sort((a, b) => a.fullName.localeCompare(b.fullName))
    } else if (sortBy === "recent") {
      data = [...data].sort(
        (a, b) =>
          new Date(b.createdAt?.toDate?.() || b.createdAt) -
          new Date(a.createdAt?.toDate?.() || a.createdAt)
      )
    }

    return data
  }, [applicants, searchTerm, sortBy])

  const services = [
    {
      icon: Users,
      title: "Job Placement Services",
      description:
        "Connect with verified employers and secure employment opportunities both locally and internationally.",
      color: "blue",
    },
    {
      icon: Award,
      title: "Skills Development",
      description: "Professional training programs and certification courses to enhance your employability.",
      color: "green",
    },
    {
      icon: Globe,
      title: "International Opportunities",
      description: "Explore work opportunities in Gulf countries, Europe, and other international destinations.",
      color: "purple",
    },
    {
      icon: Shield,
      title: "Worker Protection",
      description: "Comprehensive support including legal aid, contract verification, and rights advocacy.",
      color: "orange",
    },
  ]

  const quickLinks = [
    { title: "Apply for Jobs", icon: Briefcase, link: "#", color: "blue" },
    { title: "Training Programs", icon: Award, link: "#", color: "green" },
    { title: "Check Status", icon: Search, link: "#", color: "purple" },
    { title: "Contact Support", icon: Phone, link: "/contact", color: "orange" },
  ]

  const latestNews = [
    {
      title: "New Bilateral Agreement with Saudi Arabia",
      date: "January 15, 2024",
      excerpt: "10,000 new job opportunities created through comprehensive labor agreement.",
      image: "/handshake-deal.png",
    },
    {
      title: "Skills Training Center Opens in Bahir Dar",
      date: "January 10, 2024",
      excerpt: "State-of-the-art facility will provide technical training for 500 students annually.",
      image: "/diverse-team-training.png",
    },
    {
      title: "500 Ethiopian Nurses Successfully Placed",
      date: "January 5, 2024",
      excerpt: "Major healthcare recruitment drive results in successful placement in Qatar.",
      image: "/diverse-nurses.png",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10 px-4">

          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-lmis-black dark:text-lmis-white mb-6">
              ETHIOPIAN <br /> LABOR <br /> MARKET
            </h1>

            <p className="text-sm text-blue-500 dark:text-blue-400 mb-6 max-w-lg">
              Empowering Ethiopia's Workforce through comprehensive labor market information and seamless, secure
              connections, provided as a dedicated public service. We strive to create opportunities, foster growth, and
              build a prosperous future for all. Agreement today to get your official Labor ID.
            </p>




            <div className="flex space-x-4">
              {/* Register Button */}
              <a
                href="/register"
                className="bg-gradient-to-r from-blue-400 to-blue-500 text-white font-semibold rounded-md px-6 py-2 inline-block 
             shadow-sm transition-all duration-300 hover:from-blue-500 hover:to-blue-600 hover:shadow-lg 
             hover:scale-105 border border-blue-300 hover:border-blue-400"
              >
                Agreement
              </a>



              {/* Login Button */}
              <a
                href="/login"
                className="bg-white text-black font-semibold rounded-md px-6 py-2 inline-block
             border border-gray-300 shadow-sm transition-all duration-300
             hover:bg-gray-50 hover:shadow-lg hover:scale-105 hover:border-gray-400"
              >
                See
              </a>

              {/* Video Play Button */}
              <button
                onClick={() => {
                  if (latestVideo) {
                    setShowVideoModal(true);
                  } else {
                    setShowNoVideoToast(true);
                    setTimeout(() => setShowNoVideoToast(false), 5000);
                  }
                }}
                className="flex items-center justify-center p-0 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-lg shadow-orange-500/20"
              >
                <img
                  src="/images/play-v.png"
                  alt="Play Video"
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white shadow-md shadow-orange-500/30 bg-orange-500"
                />
              </button>
            </div>
          </div>

          {/* Right Content & Image Section */}
          <div className="relative flex flex-col lg:flex-row justify-center items-center">
            {/* Main Image */}
            <img
              src="/images/ethiopian-labor.png"
              alt="Ethiopian Labor Market"
              className="w-full max-w-xl h-auto object-contain z-10"
            />

            {/* Info Box */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-xs w-full mt-6 lg:mt-0 lg:absolute lg:top-1/2 lg:right-0 lg:-translate-y-1/2">
              <div className="w-full px-4 md:px-0">
                {/* Green Dot + Headings */}
                <div className="flex flex-col gap-1.5 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <img
                        src="/images/green-dot.png"
                        alt="Green Dot"
                        className="h-6 w-6"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-lmis-green-success font-semibold text-base">
                        FASTER CONNECTIONS.
                      </span>
                      <span className="text-base font-semibold text-lmis-black dark:text-lmis-white">
                        BETTER OPPORTUNITIES.
                      </span>
                      <span className="text-base font-semibold text-lmis-black dark:text-lmis-white">
                        BRIGHTER FUTURES.
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  E-LMIS empowers businesses to find the right talent efficiently,
                  enhance productivity, and navigate the Ethiopian labor landscape with
                  ease, through this robust government platform.
                </p>

                {/* Serving Image */}
                <div className="flex justify-center">
                  <img
                    src="/images/sm.png"
                    alt="Serving 2M People & Country"
                    className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <QuickStats />


      {/* Key Features & Services Section */}
      <KeyFeaturesAndServices />
      {/* Featured Destinations */}
      {/* Empowering Ethiopia's Workforce Section */}
      <EmpoweringEthiopias />
      <FeaturedDestinations />
      {/* Latest News Section */}
      <LatestNews />
      {/* Latest News Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">International News</h2>
              <p className="text-xl text-gray-600">Stay informed with the latest developments</p>
            </div>
            <a href="/news" className="btn-outline flex items-center space-x-2">
              <span>View All News</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { image: "/images/can1.png", date: "Aug 10, 2025", title: "Canada Opens New Work Visa Program", excerpt: "Canada has announced new work visa opportunities for skilled workers worldwide." },
              { image: "/images/can2.png", date: "Aug 5, 2025", title: "Australia Expands Migration Quota", excerpt: "The Australian government has increased its skilled migration intake for 2025." },
              { image: "/images/can3.png", date: "Aug 1, 2025", title: "UK Introduces Fast-Track Visa", excerpt: "A new fast-track visa is available for tech professionals looking to work in the UK." }
            ].map((news, index) => (
              <div key={index} className="card overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{news.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{news.excerpt}</p>
                  <button className="text-primary-600 font-semibold hover:text-primary-700 flex items-center space-x-2">
                    <a href="/news">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Testimonials */}
      <TestimonialSlider />

      {/* Applicant Directory Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12 relative">
            {/* Decorative Background Accent */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <div className="w-40 h-40 bg-gradient-to-r from-primary-400 to-primary-600 opacity-20 rounded-full animate-pulse-slow"></div>
            </div>

            {/* Heading */}
            <h2 className="relative text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text 
                 bg-gradient-to-r from-primary-600 to-purple-500 mb-4 animate-fadeInDown 
                 transition-transform duration-700 hover:scale-105 cursor-default">
              Applicant Status Directory
            </h2>

            {/* Subtitle */}
            <p className="relative text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto animate-fadeInDown delay-150
                transition-all duration-700 hover:text-primary-600 hover:translate-y-1 cursor-default">
              Search and view the status of job applications. Track your application progress or find inspiration from
              successful placements.
            </p>
          </div>


          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto mb-12">
            <div className="card p-6 shadow-md hover:shadow-xl transition-shadow duration-500 rounded-xl transform hover:-translate-y-1 hover:scale-105">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search by name, country"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border-2 border-gray-200 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg transition-all duration-300 hover:border-primary-300"
                />
              </div>

            </div>
          </div>

          {/* Applicants Grid */}
          {loading ? (
            <div className="text-center py-16 animate-pulse">
              <div className="spinner h-16 w-16 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading applicant data...</p>
            </div>
          ) : filteredApplicants.length === 0 ? (
            <div className="text-center py-16 animate-fadeIn">
              <Users className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No applicants found</h3>
              <p className="text-gray-600 text-lg">
                {searchTerm ? "Try adjusting your search terms or filters." : "No agreements have been signed yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8 animate-fadeIn">
                <p className="text-gray-600">
                  Showing <span className="font-semibold">{Math.min(visibleCount, filteredApplicants.length)}</span> of{" "}
                  <span className="font-semibold">{filteredApplicants.length}</span> applicants
                </p>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl shadow-md text-sm font-semibold
               text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
               transition-all duration-300 hover:border-primary-400 cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="az">Name A-Z</option>
                  </select>
                </div>

              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredApplicants.slice(0, visibleCount).map((applicant, idx) => (
                  <div
                    key={applicant.id}
                    className="animate-fadeInUp delay-[calc(0.05s*var(--idx))] transition-transform transform hover:scale-105 hover:shadow-lg"
                    style={{ "--idx": idx }}
                  >
                    <ApplicantCard applicant={applicant} />
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredApplicants.length && (
                <div className="text-center mt-12 animate-fadeInUp">
                  <button
                    onClick={handleLoadMore}
                    className="relative px-8 py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 
                 overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105 group"
                  >
                    {/* Animated Background Overlay */}
                    <span className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></span>

                    {/* Button Text */}
                    <span className="relative flex items-center justify-center space-x-2">
                      <span>Load More Applicants</span>
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </span>

                    {/* Glow Effect */}
                    <span className="absolute -inset-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 rounded-2xl opacity-0 blur-xl group-hover:opacity-80 transition-all duration-500"></span>
                  </button>
                </div>
              )}

            </>
          )}
        </div>
      </div>



      <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
                Latest Updates
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Your Labor Market in Your Hand
              </h2>
              <p className="text-center text-sm md:text-base lg:text-base text-muted-foreground max-w-xl mx-auto">
                Access critical labor market information, discover job opportunities, and manage your Labor ID profile
                conveniently from anywhere. Our official mobile application extends the reach of E-LMIS directly to your
                smartphone, ensuring seamless engagement with public services on the go.
              </p>

              {/* PWA Install Button */}
              {deferredPrompt && (
                <button
                  onClick={handleInstallClick}
                  className="mt-6 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-lmis-primary hover:bg-opacity-90 transition-colors shadow-lg animate-bounce"
                  style={{ backgroundColor: '#0052cc' }}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download App
                </button>
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full px-4 py-12">
            <img
              src="/images/Mobile App Features.svg"
              alt="Mobile App Features"
              className="w-full rounded-xl object-cover"
              style={{
                boxShadow: "0 10px 15px -8px rgba(0, 0, 0, 0.15)" // Only bottom shadow
              }}
            />
          </div>

        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900">
        <div className="container px-4 md:px-6 grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
              Latest Updates
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              All <br /> services In <br /> one Place
            </h1>
            <p className="text-sm md:text-base lg:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed text-left">
              E-LMIS, a comprehensive government service, brings together a suite of tools designed to streamline your
              journey in the Ethiopian labor market. From secure Labor ID registration to job seeking, talent acquisition,
              and data insights, everything you need is here, as a public provision.
            </p>

            {/* Replaced <Button> with a normal <a> */}
            <a
              href="/register"
              className="inline-block shrink-0 rounded px-12 py-6 min-w-[180px] min-h-[56px] text-xl font-semibold text-white shadow-md
        bg-[rgba(99,149,235,0.74)] hover:bg-[rgba(66,111,185,0.9)] transition"
            >
              Agreement
            </a>
          </div>

          <div className="flex justify-center lg:justify-end">
            <img
              alt="Ethiopian Labor Market Information System"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              height={400}
              width={600}
              src="/images/net.svg"
              style={{ boxShadow: "0 0 8px 2px rgba(255, 255, 255, 0.3)" }}
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-white py-12 md:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Featured Blue Box */}
          <div className="w-full rounded-2xl shadow-xl bg-blue-600 text-white px-12 sm:px-16 md:px-20 pt-8 pb-6 md:pb-8 grid gap-10 lg:grid-cols-2 lg:gap-24 items-start">
            <div className="space-y-6 text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter mt-0 pt-4">
                Featured in the Media Our Story, Innovation
              </h2>
              <p className="text-sm md:text-base lg:text-base text-white max-w-3xl mx-auto leading-relaxed text-left">
                E-LMIS is making headlines for its innovative approach to labor market development as a key government
                initiative. Discover our journey and impact on empowering Ethiopia&apos;s workforce.
              </p>
              <a
                href="/login"
                className="bg-white text-black px-6 py-3 rounded shadow-md hover:shadow-lg transition-shadow duration-300 inline-flex items-center justify-center"
              >
                See
              </a>

            </div>
            <div className="flex justify-center items-end">
              <img
                src="/images/feature.png"
                alt="Featured Image"
                width={600}
                height={400}
                className="object-cover object-center sm:w-auto"
                style={{ transform: "scale(1.3)", transformOrigin: "bottom center" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <div className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of Ethiopians who have found meaningful employment through LMIS. Your dream job is waiting
            for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a href="/register" className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
              <span>Apply Now</span>
            </a>
            <div className="text-center mt-12">
              <a
                href="/contact"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center space-x-2"
              >
                <span>Contact Us Today</span>
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download App</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Video Modal Overlay */}
      {showVideoModal && latestVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowVideoModal(false)}
          />
          <div className="relative w-full max-w-5xl h-auto max-h-[90vh] bg-black rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 border border-white/10 flex items-center justify-center">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-50 p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all hover:rotate-90 active:scale-90 border border-white/10"
            >
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10" />
            </button>
            <video
              src={latestVideo.videoUrl}
              controls
              autoPlay
              className="w-full h-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* LMIS Premium Notification Toast */}
      {showNoVideoToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 px-8 py-5 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 max-w-md">
            <div className="bg-orange-500 p-2.5 rounded-2xl shadow-lg shadow-orange-500/40">
              <Phone className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">LMIS Notification</span>
              <p className="text-white text-sm font-bold leading-tight">
                Welcome! No introduction video has been uploaded by LMIS yet. Please check back later.
              </p>
            </div>
            <button 
              onClick={() => setShowNoVideoToast(false)}
              className="ml-2 p-1.5 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
