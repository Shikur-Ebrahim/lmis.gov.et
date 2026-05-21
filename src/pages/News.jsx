"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  Calendar,
  User,
  Tag,
  ArrowRight,
  Search,
  Eye,
  Share2,
  BookOpen,
  Globe,
  Users,
  Award,
  AlertCircle,
  Heart,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  Clock,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Sun,
  Moon,
  Settings,
  Bell,
  BellOff,
  Zap,
  BarChart3,
  Activity,
  RefreshCw,
  ChevronUp,
  Play,
  Pause,
  Maximize,
  Minimize,
  Shield,
  MapPin,
  Video,
  Headphones,
  Pin,
  Layers,
  FilterIcon,
  SlidersHorizontal,
  Sparkles,
  Target,
  WifiOff,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react"

export default function News() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState("grid") // grid, list, magazine
  const [sortBy, setSortBy] = useState("date") // date, views, popularity, title
  const [sortOrder, setSortOrder] = useState("desc") // asc, desc
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isReaderMode, setIsReaderMode] = useState(false)
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set())
  const [likedArticles, setLikedArticles] = useState(new Set())
  const [dislikedArticles, setDislikedArticles] = useState(new Set())
  const [followedAuthors, setFollowedAuthors] = useState(new Set())
  const [readingProgress, setReadingProgress] = useState({})
  const [comments, setComments] = useState({})
  const [newComment, setNewComment] = useState("")
  const [showComments, setShowComments] = useState({})
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(300000) // 5 minutes
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState("medium")
  const [readingSpeed, setReadingSpeed] = useState(200) // words per minute
  const [showReadingTime, setShowReadingTime] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [showTags, setShowTags] = useState(true)
  const [showAuthor, setShowAuthor] = useState(true)
  const [showViews, setShowViews] = useState(true)
  const [showDate, setShowDate] = useState(true)
  const [infiniteScroll, setInfiniteScroll] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [trendingTopics, setTrendingTopics] = useState([])
  const [popularAuthors, setPopularAuthors] = useState([])
  const [readingList, setReadingList] = useState([])
  const [archivedArticles, setArchivedArticles] = useState(new Set())
  const [pinnedArticles, setPinnedArticles] = useState(new Set())
  const [reportedArticles, setReportedArticles] = useState(new Set())
  const [userPreferences, setUserPreferences] = useState({})
  const [showStatistics, setShowStatistics] = useState(false)
  const [articleRatings, setArticleRatings] = useState({})
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareArticle, setShareArticle] = useState(null)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [deviceType, setDeviceType] = useState("desktop")
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchStartY, setTouchStartY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState("down")
  const [lastScrollY, setLastScrollY] = useState(0)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [isTextToSpeechActive, setIsTextToSpeechActive] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [speechVoice, setSpeechVoice] = useState(null)
  const [availableVoices, setAvailableVoices] = useState([])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [authorFilter, setAuthorFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [viewsFilter, setViewsFilter] = useState({ min: 0, max: 10000 })
  const [contentLength, setContentLength] = useState("all") // short, medium, long, all
  const [hasImages, setHasImages] = useState("all") // yes, no, all
  const [featuredOnly, setFeaturedOnly] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState("all") // all, bookmarks, reading-list, archived
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Refs for various functionalities
  const searchInputRef = useRef(null)
  const articleContentRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const refreshIntervalRef = useRef(null)
  const speechSynthesisRef = useRef(null)
  const touchStartTimeRef = useRef(0)
  const longPressTimerRef = useRef(null)

  const categories = [
    "All",
    "Announcements",
    "Success Stories",
    "Policy Updates",
    "Training Programs",
    "Partnerships",
    "Technology",
    "Healthcare",
    "Education",
    "Economy",
    "Culture",
    "Sports",
    "Environment",
    "Innovation",
    "Research",
  ]

  const newsArticles = [
    {
      id: 1,
      title: "New Bilateral Labor Agreement Signed with Saudi Arabia",
      excerpt:
        "Ethiopia and Saudi Arabia have signed a comprehensive bilateral labor agreement that will create 10,000 new job opportunities for Ethiopian workers in various sectors.",
      content: `The Ethiopian government has successfully negotiated a new bilateral labor agreement with Saudi Arabia that promises to create significant employment opportunities for Ethiopian workers. This landmark agreement, signed by Minister of Labor and Social Affairs Dr. Muferihat Kamil and her Saudi counterpart, will facilitate the placement of 10,000 Ethiopian workers across various sectors including healthcare, construction, hospitality, and domestic services.

The agreement includes enhanced worker protection mechanisms, standardized contracts, and improved dispute resolution procedures. Both countries have committed to ensuring fair wages, proper working conditions, and respect for workers' rights throughout the employment period.

"This agreement represents a new chapter in Ethiopia-Saudi Arabia relations and demonstrates our commitment to protecting our workers while providing them with meaningful employment opportunities," said Dr. Muferihat Kamil during the signing ceremony.

The implementation of this agreement will begin in the coming months, with the first batch of workers expected to depart by the end of the quarter. LMIS will coordinate the selection, training, and deployment process to ensure all workers are properly prepared for their assignments.

Key provisions of the agreement include:
- Standardized employment contracts with clear terms and conditions
- Mandatory pre-departure training programs covering cultural orientation, language skills, and job-specific training
- Establishment of worker support centers in major Saudi cities
- Regular monitoring and evaluation of working conditions
- Streamlined processes for contract renewals and job transfers
- Enhanced communication channels between workers and their families

The agreement also establishes a joint committee comprising representatives from both countries to oversee implementation and address any issues that may arise. This committee will meet quarterly to review progress and make necessary adjustments to ensure the success of the program.

Both governments have expressed confidence that this agreement will serve as a model for future bilateral labor agreements with other countries in the region. The success of this initiative could pave the way for similar agreements with other Gulf Cooperation Council (GCC) countries.

The signing ceremony was attended by high-level officials from both countries, including ambassadors, labor ministry representatives, and business leaders. The event highlighted the strong diplomatic ties between Ethiopia and Saudi Arabia and their shared commitment to promoting safe and orderly labor migration.

Training programs for the first batch of workers will commence next month, with specialized courses designed to meet the specific requirements of Saudi employers. The training will cover technical skills, Arabic language basics, cultural adaptation, and workers' rights and responsibilities.

This agreement is expected to generate significant foreign currency earnings for Ethiopia while providing valuable skills and experience to Ethiopian workers. The remittances from these workers will contribute to the country's economic development and help improve the livelihoods of their families back home.`,
      category: "Announcements",
      author: "LMIS Communications",
      date: "2024-01-15",
      image: "/ethiopia-saudi-agreement.png",
      featured: true,
      views: 2847,
      likes: 156,
      dislikes: 8,
      comments: 23,
      readingTime: 8,
      wordCount: 1200,
      tags: [
        "Saudi Arabia",
        "Bilateral Agreement",
        "Job Opportunities",
        "Worker Protection",
        "International Relations",
      ],
      location: "Addis Ababa, Ethiopia",
      priority: "high",
      hasVideo: false,
      hasAudio: false,
      language: "English",
      difficulty: "intermediate",
      credibility: 95,
      trending: true,
      breaking: false,
      verified: true,
    },
    {
      id: 2,
      title: "Success Story: From Village to Dubai - Almaz's Journey",
      excerpt:
        "Meet Almaz Tadesse, who transformed her life from a small village in Amhara to becoming a successful hotel manager in Dubai through LMIS programs.",
      content: `Almaz Tadesse's journey from a small village in the Amhara region to becoming a hotel manager at a five-star resort in Dubai is a testament to the transformative power of the LMIS program. Three years ago, Almaz was struggling to support her family through subsistence farming when she learned about LMIS opportunities.

"I never imagined I would be managing a team of 50 people in one of Dubai's most prestigious hotels," says Almaz, who now oversees housekeeping operations at the Burj Al Arab. Her journey began with LMIS's comprehensive training program, where she learned hospitality management, English language skills, and cultural adaptation techniques.

The training program, which lasted six months, covered everything from basic hospitality principles to advanced management techniques. Almaz excelled in her studies and was selected for a management track position in Dubai. Her employer was so impressed with her performance that she was promoted twice within two years.

Today, Almaz sends home $800 monthly to support her family and has started a small business in her village. She plans to return to Ethiopia in two years to establish a hospitality training center, giving back to her community and helping other young women follow in her footsteps.

"LMIS didn't just give me a job; they gave me a future and the tools to build something meaningful for my community," Almaz reflects. Her story has inspired hundreds of other women to join LMIS programs, and she regularly speaks at orientation sessions to share her experience.

The success of workers like Almaz demonstrates the effectiveness of LMIS's comprehensive approach to labor migration, which combines skills training, cultural preparation, and ongoing support to ensure sustainable success abroad.

Almaz's transformation began when she attended a community meeting where LMIS representatives explained the opportunities available for Ethiopian workers abroad. Despite initial skepticism from her family, who worried about the risks of working in a foreign country, Almaz was determined to pursue this opportunity.

The selection process was rigorous, involving multiple interviews, skills assessments, and background checks. Almaz's determination and positive attitude impressed the selection committee, and she was accepted into the hospitality management program.

During her training, Almaz faced numerous challenges, including learning English and adapting to new technologies. However, with the support of her instructors and fellow trainees, she persevered and graduated at the top of her class.

Her first position in Dubai was as a housekeeping supervisor at a four-star hotel. Despite the initial culture shock and homesickness, Almaz quickly adapted to her new environment and impressed her supervisors with her work ethic and leadership skills.

Within six months, she was promoted to assistant housekeeping manager, and a year later, she moved to the prestigious Burj Al Arab as housekeeping manager. Her success story has been featured in local media and has inspired many other young women to pursue similar opportunities.

Almaz's family, who initially opposed her decision to work abroad, are now proud of her achievements and grateful for the financial support she provides. Her younger sister has also joined the LMIS program and is currently training for a position in the healthcare sector.

The impact of Almaz's success extends beyond her immediate family. She has established a scholarship fund for young women in her village and regularly sends educational materials and supplies to the local school. Her story demonstrates how individual success can create positive ripple effects throughout entire communities.`,
      category: "Success Stories",
      author: "Sarah Mohammed",
      date: "2024-01-12",
      image: "/ethiopian-hotel-manager-dubai.png",
      featured: false,
      views: 1923,
      likes: 234,
      dislikes: 3,
      comments: 45,
      readingTime: 12,
      wordCount: 1800,
      tags: ["Success Story", "Dubai", "Hotel Management", "Women Empowerment", "Career Development"],
      location: "Dubai, UAE",
      priority: "medium",
      hasVideo: true,
      hasAudio: false,
      language: "English",
      difficulty: "beginner",
      credibility: 98,
      trending: true,
      breaking: false,
      verified: true,
    },
    {
      id: 3,
      title: "New Skills Training Center Opens in Bahir Dar",
      excerpt:
        "LMIS inaugurates a state-of-the-art training facility in Bahir Dar that will provide technical and language training for 500 students annually.",
      content: `The Ethiopian Labor Market Information System (LMIS) has officially opened a new comprehensive training center in Bahir Dar, marking a significant milestone in the organization's efforts to expand access to quality pre-departure training programs across the country.

The facility, built with support from international development partners, features modern classrooms, computer labs, language learning centers, and practical training workshops. The center is designed to accommodate 500 students annually and will offer courses in hospitality management, healthcare assistance, construction skills, and domestic services.

"This training center represents our commitment to ensuring that Ethiopian workers are well-prepared and competitive in international job markets," said Ato Kassahun Follo, Director General of LMIS, during the inauguration ceremony.

The center will also serve as a regional hub for LMIS operations in the Amhara region, providing services such as application processing, document verification, and pre-departure orientation. Local government officials and community leaders attended the opening ceremony, expressing their support for the initiative.

The curriculum has been developed in consultation with international employers and includes modules on cultural adaptation, workplace safety, financial literacy, and communication skills. All courses will be offered free of charge to selected candidates.

Registration for the first batch of courses will begin next month, with priority given to applicants from rural areas and women. The center is expected to significantly reduce the travel burden for applicants from the northern regions who previously had to travel to Addis Ababa for training.`,
      category: "Training Programs",
      author: "LMIS Northern Region",
      date: "2024-01-10",
      image: "/modern-training-center-bahir-dar.png",
      featured: false,
      views: 1456,
      likes: 89,
      dislikes: 2,
      comments: 18,
      readingTime: 6,
      wordCount: 900,
      tags: ["Training Center", "Bahir Dar", "Skills Development", "Infrastructure", "Education"],
      location: "Bahir Dar, Ethiopia",
      priority: "medium",
      hasVideo: false,
      hasAudio: true,
      language: "English",
      difficulty: "intermediate",
      credibility: 92,
      trending: false,
      breaking: false,
      verified: true,
    },
    {
      id: 4,
      title: "Policy Update: Enhanced Worker Protection Measures",
      excerpt:
        "New regulations strengthen protection mechanisms for Ethiopian workers abroad, including mandatory insurance and improved complaint procedures.",
      content: `The Ethiopian government has announced comprehensive policy updates that significantly strengthen protection mechanisms for Ethiopian migrant workers. The new regulations, which take effect immediately, introduce mandatory insurance coverage, enhanced complaint procedures, and stricter employer verification processes.

Under the new policy framework, all Ethiopian workers departing for international employment must be covered by comprehensive insurance that includes medical coverage, repatriation costs, and compensation for workplace injuries. The insurance will be jointly funded by employers and the Ethiopian government.

"These measures represent the most significant advancement in worker protection in our history," stated Dr. Muferihat Kamil, Minister of Labor and Social Affairs. "We are committed to ensuring that every Ethiopian worker abroad is protected and has access to support when needed."

The updated regulations also establish a 24/7 multilingual hotline for workers to report issues, access emergency assistance, or seek guidance. Regional labor attachés will be stationed in major destination countries to provide on-ground support and monitor working conditions.

Employers seeking to recruit Ethiopian workers must now undergo enhanced verification processes, including financial audits, workplace inspections, and character references. Companies with poor track records will be blacklisted from the recruitment system.

The policy also introduces mandatory pre-departure orientation sessions covering workers' rights, local laws, cultural norms, and available support services. These sessions will be conducted in local languages to ensure comprehensive understanding.

Implementation of these measures will be phased over the next six months, with full compliance required by July 2024. LMIS will work closely with destination country authorities to ensure smooth implementation and effective monitoring.`,
      category: "Policy Updates",
      author: "Policy Development Team",
      date: "2024-01-08",
      image: "/placeholder-hy6wd.png",
      featured: false,
      views: 2134,
      likes: 167,
      dislikes: 12,
      comments: 34,
      readingTime: 9,
      wordCount: 1350,
      tags: ["Policy Update", "Worker Protection", "Insurance", "Regulations", "Safety"],
      location: "Addis Ababa, Ethiopia",
      priority: "high",
      hasVideo: false,
      hasAudio: false,
      language: "English",
      difficulty: "advanced",
      credibility: 96,
      trending: false,
      breaking: true,
      verified: true,
    },
    {
      id: 5,
      title: "Partnership with ILO Strengthens Migration Governance",
      excerpt:
        "LMIS signs strategic partnership with International Labour Organization to enhance migration governance and worker protection standards.",
      content: `The Ethiopian Labor Market Information System (LMIS) has entered into a strategic partnership with the International Labour Organization (ILO) to strengthen migration governance frameworks and enhance protection standards for Ethiopian migrant workers.

The partnership agreement, signed at ILO headquarters in Geneva, establishes a comprehensive collaboration framework covering policy development, capacity building, research, and technical assistance. The three-year partnership will focus on implementing international labor standards and best practices in Ethiopia's migration management system.

"This partnership with the ILO represents a significant step forward in our efforts to align Ethiopian labor migration practices with international standards," said Ato Kassahun Follo, Director General of LMIS, who led the Ethiopian delegation to Geneva.

Under the agreement, the ILO will provide technical assistance in developing new policy frameworks, training programs for LMIS staff, and support for establishing monitoring and evaluation systems. The partnership will also facilitate knowledge exchange with other countries that have successful migration governance models.

Key areas of collaboration include:
- Development of gender-sensitive migration policies
- Strengthening pre-departure training curricula
- Establishing effective grievance mechanisms
- Improving data collection and analysis systems
- Enhancing bilateral cooperation frameworks

The partnership will also support research initiatives to better understand migration patterns, challenges, and opportunities. This research will inform evidence-based policy making and program development.

"The ILO is committed to supporting Ethiopia in building a migration system that protects workers while contributing to development," said Guy Ryder, ILO Director-General, during the signing ceremony.

The first phase of implementation will focus on conducting a comprehensive assessment of current systems and developing a roadmap for improvements. Training programs for LMIS staff will begin in the coming months, with the first cohort scheduled to participate in specialized courses at the ILO Training Centre in Turin, Italy.`,
      category: "Partnerships",
      author: "International Relations Office",
      date: "2024-01-05",
      image: "/ilo-ethiopia-signing.png",
      featured: false,
      views: 1789,
      likes: 123,
      dislikes: 5,
      comments: 28,
      readingTime: 10,
      wordCount: 1500,
      tags: ["ILO", "Partnership", "International Standards", "Capacity Building", "Geneva"],
      location: "Geneva, Switzerland",
      priority: "high",
      hasVideo: true,
      hasAudio: true,
      language: "English",
      difficulty: "advanced",
      credibility: 97,
      trending: false,
      breaking: false,
      verified: true,
    },
    {
      id: 6,
      title: "Digital Platform Upgrade Enhances User Experience",
      excerpt:
        "LMIS launches upgraded digital platform with improved features, mobile compatibility, and enhanced security measures.",
      content: `The Ethiopian Labor Market Information System (LMIS) has successfully launched a major upgrade to its digital platform, introducing enhanced features, improved mobile compatibility, and strengthened security measures to better serve Ethiopian workers and employers.

The upgraded platform, developed over 18 months with input from users and stakeholders, features a completely redesigned interface that is more intuitive and user-friendly. The new system supports multiple languages including Amharic, Oromo, Tigrinya, and English, making it accessible to users from all regions of Ethiopia.

"This platform upgrade represents our commitment to leveraging technology to improve service delivery and make our services more accessible to all Ethiopians," said the LMIS Digital Innovation Team Leader.

Key improvements include:
- Mobile-responsive design for smartphone and tablet access
- Simplified application processes with step-by-step guidance
- Real-time application status tracking
- Integrated document upload and verification system
- Enhanced search and filtering capabilities
- Improved security with two-factor authentication

The platform now includes a comprehensive job matching system that uses artificial intelligence to connect workers with suitable opportunities based on their skills, experience, and preferences. Employers can also access improved tools for posting job opportunities and managing applications.

A new feature allows users to access training materials, orientation videos, and preparation resources directly through the platform. The system also includes a feedback mechanism that enables continuous improvement based on user input.

The mobile application, available for both Android and iOS devices, provides full functionality for job searching, application submission, and status tracking. Push notifications keep users informed about important updates and opportunities.

Security enhancements include encrypted data transmission, secure document storage, and regular security audits. The platform complies with international data protection standards and Ethiopian privacy regulations.

Training sessions for users and stakeholders will be conducted over the coming weeks to ensure smooth transition to the new system. Support materials and video tutorials are available on the platform to assist users in navigating the new features.`,
      category: "Technology",
      author: "Digital Innovation Team",
      date: "2024-01-03",
      image: "/lmis-mobile-app-upgrade.png",
      featured: false,
      views: 3241,
      likes: 298,
      dislikes: 7,
      comments: 52,
      readingTime: 11,
      wordCount: 1650,
      tags: ["Digital Platform", "Technology", "User Experience", "Mobile App", "Security"],
      location: "Addis Ababa, Ethiopia",
      priority: "medium",
      hasVideo: true,
      hasAudio: false,
      language: "English",
      difficulty: "intermediate",
      credibility: 94,
      trending: true,
      breaking: false,
      verified: true,
    },
    {
      id: 7,
      title: "Healthcare Workers Program Expands to Germany",
      excerpt:
        "New partnership with German healthcare institutions opens opportunities for 2,000 Ethiopian nurses and medical technicians.",
      content: `A groundbreaking partnership between LMIS and German healthcare institutions has opened new opportunities for Ethiopian healthcare professionals. The program, designed to address Germany's healthcare worker shortage, will facilitate the placement of 2,000 Ethiopian nurses and medical technicians over the next three years.

The comprehensive program includes German language training, professional certification alignment, and cultural integration support. Participants will undergo 12 months of intensive preparation before deployment, ensuring they meet German healthcare standards and can effectively integrate into the German healthcare system.

"This partnership represents a win-win situation for both countries," said Dr. Angela Weber, Director of International Healthcare Cooperation at the German Ministry of Health. "Germany gains skilled healthcare professionals while Ethiopia's workers gain valuable international experience and competitive salaries."

The program covers various healthcare specializations including nursing, medical technology, physiotherapy, and elderly care. All positions offer permanent residency pathways and opportunities for family reunification after two years of successful employment.

Ethiopian participants will receive comprehensive support including housing assistance, mentorship programs, and ongoing professional development opportunities. The program also includes provisions for participants to return to Ethiopia after gaining experience to contribute to the country's healthcare system.

The first cohort of 200 healthcare workers is expected to depart for Germany by mid-2024, following completion of their training program. The initiative has already received overwhelming response from Ethiopian healthcare professionals, with over 5,000 applications received in the first month.

This partnership builds on Germany's successful integration of international healthcare workers and Ethiopia's reputation for producing skilled medical professionals. The program is expected to serve as a model for similar partnerships with other European countries facing healthcare worker shortages.`,
      category: "Healthcare",
      author: "Healthcare Division",
      date: "2024-01-20",
      image: "/placeholder-8d2p7.png",
      featured: false,
      views: 2156,
      likes: 189,
      dislikes: 4,
      comments: 37,
      readingTime: 8,
      wordCount: 1200,
      tags: ["Healthcare", "Germany", "Nursing", "Medical Technology", "Partnership"],
      location: "Berlin, Germany",
      priority: "high",
      hasVideo: false,
      hasAudio: true,
      language: "English",
      difficulty: "intermediate",
      credibility: 95,
      trending: true,
      breaking: false,
      verified: true,
    },
    {
      id: 8,
      title: "Innovation Hub Launches Tech Skills Program",
      excerpt:
        "New technology training initiative prepares Ethiopian youth for digital economy opportunities in international markets.",
      content: `LMIS has launched an innovative technology skills program designed to prepare Ethiopian youth for opportunities in the global digital economy. The program, developed in partnership with leading technology companies, focuses on high-demand skills including software development, data analysis, digital marketing, and cybersecurity.

The six-month intensive program combines theoretical learning with practical projects, ensuring participants gain hands-on experience with cutting-edge technologies. The curriculum covers programming languages such as Python, JavaScript, and Java, as well as emerging technologies like artificial intelligence and blockchain.

"The digital economy presents unprecedented opportunities for Ethiopian youth," said Ato Dawit Assefa, Director of the LMIS Innovation Hub. "This program equips them with the skills needed to compete in global markets and contribute to Ethiopia's digital transformation."

The program features a unique mentorship component, connecting participants with successful Ethiopian tech professionals working in international companies. This mentorship provides valuable insights into global work culture and career development strategies.

Participants also receive training in soft skills including communication, project management, and cross-cultural collaboration. The program emphasizes remote work capabilities, preparing graduates for the growing trend of distributed teams in the technology sector.

The first cohort includes 100 participants selected from over 2,000 applicants. Selection criteria emphasized academic performance, demonstrated interest in technology, and commitment to completing the program. Priority was given to applicants from underserved communities and women in technology.

Upon completion, graduates will have access to a job placement network that includes partnerships with international technology companies, startups, and remote work platforms. The program also provides ongoing support for graduates, including continued learning opportunities and career advancement guidance.

The initiative has received support from the Ethiopian government and international development organizations, recognizing its potential to contribute to youth employment and economic development. Plans are underway to expand the program to additional cities across Ethiopia.`,
      category: "Technology",
      author: "Innovation Hub Team",
      date: "2024-01-18",
      image: "/ethiopian-youth-coding-bootcamp.png",
      featured: false,
      views: 1834,
      likes: 156,
      dislikes: 3,
      comments: 29,
      readingTime: 9,
      wordCount: 1350,
      tags: ["Technology", "Innovation", "Youth", "Digital Skills", "Programming"],
      location: "Addis Ababa, Ethiopia",
      priority: "medium",
      hasVideo: true,
      hasAudio: false,
      language: "English",
      difficulty: "intermediate",
      credibility: 93,
      trending: true,
      breaking: false,
      verified: true,
    },
  ]

  const calculateReadingTime = useCallback(
    (wordCount, speed = readingSpeed) => {
      return Math.ceil(wordCount / speed)
    },
    [readingSpeed],
  )

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }, [])

  const getCategoryIcon = useCallback((category) => {
    const iconMap = {
      Announcements: AlertCircle,
      "Success Stories": Award,
      "Policy Updates": BookOpen,
      "Training Programs": Users,
      Partnerships: Globe,
      Technology: Zap,
      Healthcare: Activity,
      Education: BookOpen,
      Economy: TrendingUp,
      Culture: Users,
      Sports: Target,
      Environment: Globe,
      Innovation: Sparkles,
      Research: Search,
    }
    const IconComponent = iconMap[category] || BookOpen
    return <IconComponent className="w-4 h-4" />
  }, [])

  const getCategoryColor = useCallback((category) => {
    const colorMap = {
      Announcements: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200",
      "Success Stories": "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200",
      "Policy Updates": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200",
      "Training Programs": "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200",
      Partnerships: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200",
      Technology: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900 dark:text-indigo-200",
      Healthcare: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200",
      Education: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900 dark:text-teal-200",
      Economy: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200",
      Culture: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200",
      Sports: "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900 dark:text-lime-200",
      Environment: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900 dark:text-emerald-200",
      Innovation: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900 dark:text-violet-200",
      Research: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-200",
    }
    return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200"
  }, [])

  const filteredAndSortedArticles = useMemo(() => {
    const filtered = newsArticles.filter((article) => {
      // Basic search filter
      const matchesSearch =
        searchTerm === "" ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase())

      // Category filter
      const matchesCategory = categoryFilter === "All" || article.category === categoryFilter

      // Advanced filters
      const matchesAuthor = authorFilter === "" || article.author.toLowerCase().includes(authorFilter.toLowerCase())

      const matchesTag =
        tagFilter === "" || article.tags.some((tag) => tag.toLowerCase().includes(tagFilter.toLowerCase()))

      const matchesViews = article.views >= viewsFilter.min && article.views <= viewsFilter.max

      const matchesDateRange =
        (!dateRange.start || new Date(article.date) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(article.date) <= new Date(dateRange.end))

      const matchesContentLength =
        contentLength === "all" ||
        (contentLength === "short" && article.wordCount < 800) ||
        (contentLength === "medium" && article.wordCount >= 800 && article.wordCount < 1500) ||
        (contentLength === "long" && article.wordCount >= 1500)

      const matchesImages =
        hasImages === "all" || (hasImages === "yes" && article.image) || (hasImages === "no" && !article.image)

      const matchesFeatured = !featuredOnly || article.featured

      // Tab filters
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "bookmarks" && bookmarkedArticles.has(article.id)) ||
        (activeTab === "reading-list" && readingList.includes(article.id)) ||
        (activeTab === "archived" && archivedArticles.has(article.id))

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAuthor &&
        matchesTag &&
        matchesViews &&
        matchesDateRange &&
        matchesContentLength &&
        matchesImages &&
        matchesFeatured &&
        matchesTab
      )
    })

    // Sorting logic
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "date":
          comparison = new Date(b.date) - new Date(a.date)
          break
        case "views":
          comparison = b.views - a.views
          break
        case "popularity":
          comparison = b.likes - b.dislikes - (a.likes - a.dislikes)
          break
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "readingTime":
          comparison = a.readingTime - b.readingTime
          break
        case "comments":
          comparison = b.comments - a.comments
          break
        case "credibility":
          comparison = b.credibility - a.credibility
          break
        default:
          comparison = new Date(b.date) - new Date(a.date)
      }

      return sortOrder === "asc" ? -comparison : comparison
    })

    // Prioritize pinned articles
    const pinned = filtered.filter((article) => pinnedArticles.has(article.id))
    const unpinned = filtered.filter((article) => !pinnedArticles.has(article.id))

    return [...pinned, ...unpinned]
  }, [
    newsArticles,
    searchTerm,
    categoryFilter,
    authorFilter,
    tagFilter,
    viewsFilter,
    dateRange,
    contentLength,
    hasImages,
    featuredOnly,
    activeTab,
    bookmarkedArticles,
    readingList,
    archivedArticles,
    sortBy,
    sortOrder,
    pinnedArticles,
  ])

  const totalPages = Math.ceil(filteredAndSortedArticles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentArticles = infiniteScroll
    ? filteredAndSortedArticles.slice(0, currentPage * itemsPerPage)
    : filteredAndSortedArticles.slice(startIndex, startIndex + itemsPerPage)

  const featuredArticle = newsArticles.find((article) => article.featured)

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      if (width < 768) setDeviceType("mobile")
      else if (width < 1024) setDeviceType("tablet")
      else setDeviceType("desktop")
    }

    detectDevice()
    window.addEventListener("resize", detectDevice)
    return () => window.removeEventListener("resize", detectDevice)
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollDirection(currentScrollY > lastScrollY ? "down" : "up")
      setLastScrollY(currentScrollY)
      setShowScrollToTop(currentScrollY > 500)
      setIsScrolling(true)

      // Clear scrolling state after delay
      clearTimeout(window.scrollTimeout)
      window.scrollTimeout = setTimeout(() => setIsScrolling(false), 150)

      // Infinite scroll logic
      if (
        infiniteScroll &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000 &&
        currentPage * itemsPerPage < filteredAndSortedArticles.length
      ) {
        setCurrentPage((prev) => prev + 1)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(window.scrollTimeout)
    }
  }, [lastScrollY, infiniteScroll, currentPage, itemsPerPage, filteredAndSortedArticles.length])

  useEffect(() => {
    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(() => {
        setIsLoading(true)
        // Simulate data refresh
        setTimeout(() => setIsLoading(false), 1000)
      }, refreshInterval)
    } else {
      clearInterval(refreshIntervalRef.current)
    }

    return () => clearInterval(refreshIntervalRef.current)
  }, [autoRefresh, refreshInterval])

  useEffect(() => {
    if ("speechSynthesis" in window) {
      const updateVoices = () => {
        setAvailableVoices(speechSynthesis.getVoices())
      }

      updateVoices()
      speechSynthesis.addEventListener("voiceschanged", updateVoices)

      return () => speechSynthesis.removeEventListener("voiceschanged", updateVoices)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "k":
            e.preventDefault()
            searchInputRef.current?.focus()
            break
          case "f":
            e.preventDefault()
            setShowAdvancedFilters((prev) => !prev)
            break
          case "s":
            e.preventDefault()
            setShowSettings((prev) => !prev)
            break
          case "d":
            e.preventDefault()
            setIsDarkMode((prev) => !prev)
            break
          case "r":
            e.preventDefault()
            window.location.reload()
            break
        }
      }

      if (e.key === "Escape") {
        setSelectedArticle(null)
        setIsReaderMode(false)
        setShowSettings(false)
        setShowAdvancedFilters(false)
        setShowShareModal(false)
        setShowMobileMenu(false)
      }
    }

    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [])

  useEffect(() => {
    if (searchTerm.length > 2) {
      const suggestions = newsArticles
        .flatMap((article) => [article.title, ...article.tags])
        .filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5)
      setSearchSuggestions([...new Set(suggestions)])
      setShowSearchSuggestions(true)
    } else {
      setShowSearchSuggestions(false)
    }
  }, [searchTerm])

  useEffect(() => {
    const allTags = newsArticles.flatMap((article) => article.tags)
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {})

    const trending = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag)

    setTrendingTopics(trending)

    const authorStats = newsArticles.reduce((acc, article) => {
      if (!acc[article.author]) {
        acc[article.author] = { name: article.author, articles: 0, totalViews: 0 }
      }
      acc[article.author].articles++
      acc[article.author].totalViews += article.views
      return acc
    }, {})

    const popular = Object.values(authorStats)
      .sort((a, b) => b.totalViews - a.totalViews)
      .slice(0, 5)

    setPopularAuthors(popular)
  }, [])

  const handleTouchStart = useCallback((e) => {
    setTouchStartX(e.touches[0].clientX)
    setTouchStartY(e.touches[0].clientY)
    touchStartTimeRef.current = Date.now()
  }, [])

  const handleTouchEnd = useCallback(
    (e) => {
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      const touchDuration = Date.now() - touchStartTimeRef.current

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY

      // Swipe detection
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          // Swipe right
          if (selectedArticle && isReaderMode) {
            const currentIndex = newsArticles.findIndex((a) => a.id === selectedArticle.id)
            if (currentIndex > 0) {
              setSelectedArticle(newsArticles[currentIndex - 1])
            }
          }
        } else {
          // Swipe left
          if (selectedArticle && isReaderMode) {
            const currentIndex = newsArticles.findIndex((a) => a.id === selectedArticle.id)
            if (currentIndex < newsArticles.length - 1) {
              setSelectedArticle(newsArticles[currentIndex + 1])
            }
          }
        }
      }

      // Long press detection (for bookmarking)
      if (touchDuration > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // Long press detected - could trigger bookmark or context menu
      }
    },
    [touchStartX, touchStartY, selectedArticle, isReaderMode, newsArticles],
  )

  const handleLike = useCallback((articleId) => {
    setLikedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
        // Remove from dislikes if present
        setDislikedArticles((prevDislikes) => {
          const newDislikes = new Set(prevDislikes)
          newDislikes.delete(articleId)
          return newDislikes
        })
      }
      return newSet
    })
  }, [])

  const handleDislike = useCallback((articleId) => {
    setDislikedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
        // Remove from likes if present
        setLikedArticles((prevLikes) => {
          const newLikes = new Set(prevLikes)
          newLikes.delete(articleId)
          return newLikes
        })
      }
      return newSet
    })
  }, [])

  const handleBookmark = useCallback((articleId) => {
    setBookmarkedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }, [])

  const handleAddToReadingList = useCallback((articleId) => {
    setReadingList((prev) => {
      if (prev.includes(articleId)) {
        return prev.filter((id) => id !== articleId)
      } else {
        return [...prev, articleId]
      }
    })
  }, [])

  const handleArchive = useCallback((articleId) => {
    setArchivedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }, [])

  const handlePin = useCallback((articleId) => {
    setPinnedArticles((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(articleId)) {
        newSet.delete(articleId)
      } else {
        newSet.add(articleId)
      }
      return newSet
    })
  }, [])

  const handleFollowAuthor = useCallback((author) => {
    setFollowedAuthors((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(author)) {
        newSet.delete(author)
      } else {
        newSet.add(author)
      }
      return newSet
    })
  }, [])

  const handleShare = useCallback((article) => {
    setShareArticle(article)
    setShowShareModal(true)
  }, [])

  const handleCopyToClipboard = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (err) {
      console.error("Failed to copy to clipboard:", err)
    }
  }, [])

  const handleTextToSpeech = useCallback(
    (text) => {
      if ("speechSynthesis" in window) {
        if (isTextToSpeechActive) {
          speechSynthesis.cancel()
          setIsTextToSpeechActive(false)
        } else {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.rate = speechRate
          if (speechVoice) utterance.voice = speechVoice

          utterance.onstart = () => setIsTextToSpeechActive(true)
          utterance.onend = () => setIsTextToSpeechActive(false)
          utterance.onerror = () => setIsTextToSpeechActive(false)

          speechSynthesis.speak(utterance)
        }
      }
    },
    [isTextToSpeechActive, speechRate, speechVoice],
  )

  const handleRateArticle = useCallback((articleId, rating) => {
    setArticleRatings((prev) => ({
      ...prev,
      [articleId]: rating,
    }))
  }, [])

  const handleAddComment = useCallback(
    (articleId) => {
      if (newComment.trim()) {
        setComments((prev) => ({
          ...prev,
          [articleId]: [
            ...(prev[articleId] || []),
            {
              id: Date.now(),
              text: newComment,
              author: "Current User",
              date: new Date().toISOString(),
              likes: 0,
            },
          ],
        }))
        setNewComment("")
      }
    },
    [newComment],
  )

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  const handleSearch = useCallback(
    (term) => {
      setSearchTerm(term)
      setCurrentPage(1)

      if (term && !recentSearches.includes(term)) {
        setRecentSearches((prev) => [term, ...prev.slice(0, 4)])
      }
      setShowSearchSuggestions(false)
    },
    [recentSearches],
  )

  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setShowSearchSuggestions(false)
    setCurrentPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setCategoryFilter("All")
    setAuthorFilter("")
    setTagFilter("")
    setViewsFilter({ min: 0, max: 10000 })
    setDateRange({ start: "", end: "" })
    setContentLength("all")
    setHasImages("all")
    setFeaturedOnly(false)
    setCurrentPage(1)
  }, [])

  const statistics = useMemo(() => {
    const totalArticles = newsArticles.length
    const totalViews = newsArticles.reduce((sum, article) => sum + article.views, 0)
    const totalLikes = newsArticles.reduce((sum, article) => sum + article.likes, 0)
    const totalComments = newsArticles.reduce((sum, article) => sum + article.comments, 0)
    const avgCredibility = newsArticles.reduce((sum, article) => sum + article.credibility, 0) / totalArticles
    const trendingCount = newsArticles.filter((article) => article.trending).length
    const breakingCount = newsArticles.filter((article) => article.breaking).length

    return {
      totalArticles,
      totalViews,
      totalLikes,
      totalComments,
      avgCredibility: Math.round(avgCredibility),
      trendingCount,
      breakingCount,
    }
  }, [newsArticles])

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
    >




      {showStatistics && (
        <div className={`border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">News Statistics</h3>
              <button
                onClick={() => setShowStatistics(false)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.totalArticles}</div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Articles</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(statistics.totalViews / 1000).toFixed(1)}K
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Total Views</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statistics.totalLikes}</div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Total Likes</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {statistics.totalComments}
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Comments</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.avgCredibility}%</div>
                <div className="text-sm text-red-600 dark:text-red-400">Avg Credibility</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {statistics.trendingCount}
                </div>
                <div className="text-sm text-indigo-600 dark:text-indigo-400">Trending</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{statistics.breakingCount}</div>
                <div className="text-sm text-pink-600 dark:text-pink-400">Breaking</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {featuredArticle && activeTab === "all" && (
          <div className="mb-12 sm:mb-16">
            <div
              className={`overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative h-64 sm:h-80 lg:h-auto">
                  <img
                    src={featuredArticle.image || "/placeholder.svg"}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden"></div>
                  <div className="absolute top-4 left-4 flex items-center space-x-2">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">FEATURED</span>
                    {featuredArticle.breaking && (
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        BREAKING
                      </span>
                    )}
                    {featuredArticle.trending && (
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        TRENDING
                      </span>
                    )}
                  </div>

                  {/* Article actions overlay */}
                  <div className="absolute bottom-4 right-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleBookmark(featuredArticle.id)}
                      className={`p-2 rounded-full backdrop-blur-sm transition-colors ${bookmarkedArticles.has(featuredArticle.id)
                        ? "bg-yellow-500 text-white"
                        : "bg-black/30 text-white hover:bg-black/50"
                        }`}
                    >
                      {bookmarkedArticles.has(featuredArticle.id) ? (
                        <BookmarkCheck className="w-4 h-4" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShare(featuredArticle)}
                      className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(featuredArticle.category)}`}
                    >
                      {getCategoryIcon(featuredArticle.category)}
                      <span>{featuredArticle.category}</span>
                    </span>
                    <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(featuredArticle.date)}</span>
                    </div>
                    {showReadingTime && (
                      <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readingTime} min read</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">{featuredArticle.title}</h2>
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                    {featuredArticle.excerpt}
                  </p>

                  {/* Article metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{featuredArticle.author}</span>
                        <button
                          onClick={() => handleFollowAuthor(featuredArticle.author)}
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium transition-colors ${followedAuthors.has(featuredArticle.author)
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            }`}
                        >
                          {followedAuthors.has(featuredArticle.author) ? "Following" : "Follow"}
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{featuredArticle.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{featuredArticle.comments} comments</span>
                      </div>
                    </div>

                    {/* Credibility indicator */}
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {featuredArticle.credibility}% credible
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedArticle(featuredArticle)
                        setIsReaderMode(true)
                      }}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleLike(featuredArticle.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${likedArticles.has(featuredArticle.id)
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${likedArticles.has(featuredArticle.id) ? "fill-current" : ""}`} />
                      <span>{featuredArticle.likes + (likedArticles.has(featuredArticle.id) ? 1 : 0)}</span>
                    </button>

                    <button
                      onClick={() => handleAddToReadingList(featuredArticle.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${readingList.includes(featuredArticle.id)
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>{readingList.includes(featuredArticle.id) ? "In List" : "Add to List"}</span>
                    </button>

                    {featuredArticle.hasAudio && (
                      <button
                        onClick={() => handleTextToSpeech(featuredArticle.content)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${isTextToSpeechActive
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        {isTextToSpeechActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 sm:mb-12">
          <div className={`rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            {/* Main search bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search news articles, tags, authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors ${isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Search suggestions dropdown */}
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <div
                    className={`absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg border z-10 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                      }`}
                  >
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${index === 0 ? "rounded-t-lg" : ""
                          } ${index === searchSuggestions.length - 1 ? "rounded-b-lg" : ""}`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2">
                  <FilterIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${showAdvancedFilters
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Advanced</span>
                </button>
              </div>
            </div>

            {/* Recent searches and trending topics */}
            {!searchTerm && (recentSearches.length > 0 || trendingTopics.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Searches</h4>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(search)}
                            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {trendingTopics.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Trending Topics</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {trendingTopics.slice(0, 5).map((topic, index) => (
                          <button
                            key={index}
                            onClick={() => handleSearch(topic)}
                            className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                          >
                            #{topic}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced filters panel */}
            {showAdvancedFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Author</label>
                    <input
                      type="text"
                      placeholder="Filter by author"
                      value={authorFilter}
                      onChange={(e) => setAuthorFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</label>
                    <input
                      type="text"
                      placeholder="Filter by tags"
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content Length
                    </label>
                    <select
                      value={contentLength}
                      onChange={(e) => setContentLength(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border transition-colors ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      <option value="all">All Lengths</option>
                      <option value="short">Short (&lt;800 words)</option>
                      <option value="medium">Medium (800-1500 words)</option>
                      <option value="long">Long (&gt;1500 words)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date Range
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                        className={`flex-1 px-2 py-2 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                        className={`flex-1 px-2 py-2 rounded-lg border text-sm transition-colors ${isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={featuredOnly}
                      onChange={(e) => setFeaturedOnly(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured articles only</span>
                  </label>

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {filteredAndSortedArticles.length} articles found
            </span>
            {isLoading && (
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* View mode toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-colors ${viewMode === "grid"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-colors ${viewMode === "list"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("magazine")}
                className={`p-2 rounded-md transition-colors ${viewMode === "magazine"
                  ? "bg-white dark:bg-gray-600 shadow-sm"
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                title="Magazine view"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Sort controls */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value="date">Date</option>
                <option value="views">Views</option>
                <option value="popularity">Popularity</option>
                <option value="title">Title</option>
                <option value="readingTime">Reading Time</option>
                <option value="comments">Comments</option>
                <option value="credibility">Credibility</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            {/* Items per page */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className={`px-3 py-2 rounded-lg border text-sm transition-colors ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-white border-gray-300 text-gray-900"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
            </div>

            {/* Infinite scroll toggle */}
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={infiniteScroll}
                onChange={(e) => setInfiniteScroll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Infinite scroll</span>
            </label>
          </div>
        </div>

        {currentArticles.length > 0 ? (
          <div
            className={`mb-12 ${viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              : viewMode === "list"
                ? "space-y-6"
                : "grid grid-cols-1 lg:grid-cols-2 gap-8"
              }`}
          >
            {currentArticles.map((article, index) => (
              <article
                key={article.id}
                className={`group relative overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 ${isDarkMode ? "bg-gray-800" : "bg-white"
                  } ${pinnedArticles.has(article.id) ? "ring-2 ring-blue-500" : ""}`}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Pin indicator */}
                {pinnedArticles.has(article.id) && (
                  <div className="absolute top-2 left-2 z-10">
                    <Pin className="w-4 h-4 text-blue-500" />
                  </div>
                )}

                {viewMode === "list" ? (
                  // List view layout
                  <div className="flex flex-col sm:flex-row">
                    <div className="relative h-48 sm:h-auto sm:w-64 flex-shrink-0">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(article.category)}`}
                        >
                          {getCategoryIcon(article.category)}
                          <span>{article.category}</span>
                        </span>
                      </div>

                      {/* Article badges */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-1">
                        {article.trending && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            TRENDING
                          </span>
                        )}
                        {article.breaking && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                            BREAKING
                          </span>
                        )}
                        {article.verified && (
                          <div className="bg-blue-500 text-white p-1 rounded-full">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 p-6">
                      {/* Article metadata */}
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.date)}</span>
                        </div>
                        {showReadingTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readingTime} min read</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{article.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">{article.credibility}%</span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{article.excerpt}</p>

                      {/* Tags */}
                      {showTags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 3).map((tag, tagIndex) => (
                            <button
                              key={tagIndex}
                              onClick={() => handleSearch(tag)}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                            </button>
                          ))}
                          {article.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              +{article.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Author and actions */}
                      <div className="flex items-center justify-between">
                        {showAuthor && (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                              <User className="w-3 h-3" />
                              <span>{article.author}</span>
                            </div>
                            <button
                              onClick={() => handleFollowAuthor(article.author)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${followedAuthors.has(article.author)
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                              {followedAuthors.has(article.author) ? "Following" : "Follow"}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          {/* Article actions */}
                          <button
                            onClick={() => handleLike(article.id)}
                            className={`p-2 rounded-lg transition-colors ${likedArticles.has(article.id)
                              ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              }`}
                            title="Like article"
                          >
                            <Heart className={`w-4 h-4 ${likedArticles.has(article.id) ? "fill-current" : ""}`} />
                          </button>

                          <button
                            onClick={() => handleBookmark(article.id)}
                            className={`p-2 rounded-lg transition-colors ${bookmarkedArticles.has(article.id)
                              ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                              : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                              }`}
                            title="Bookmark article"
                          >
                            {bookmarkedArticles.has(article.id) ? (
                              <BookmarkCheck className="w-4 h-4" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleShare(article)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Share article"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedArticle(article)
                              setIsReaderMode(true)
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors flex items-center space-x-1"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Grid and magazine view layout
                  <>
                    <div className="relative h-48 sm:h-56">
                      <img
                        src={article.image || "/placeholder.svg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                      <div className="absolute top-3 left-3">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getCategoryColor(article.category)}`}
                        >
                          {getCategoryIcon(article.category)}
                          <span>{article.category}</span>
                        </span>
                      </div>

                      {/* Article badges */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-1">
                        {article.trending && (
                          <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                            TRENDING
                          </span>
                        )}
                        {article.breaking && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse backdrop-blur-sm">
                            BREAKING
                          </span>
                        )}
                      </div>

                      {/* Quick actions overlay */}
                      <div className="absolute bottom-3 right-3 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBookmark(article.id)
                          }}
                          className={`p-2 rounded-full backdrop-blur-sm transition-colors ${bookmarkedArticles.has(article.id)
                            ? "bg-yellow-500 text-white"
                            : "bg-black/30 text-white hover:bg-black/50"
                            }`}
                        >
                          {bookmarkedArticles.has(article.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleShare(article)
                          }}
                          className="p-2 rounded-full bg-black/30 text-white hover:bg-black/50 backdrop-blur-sm transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Media indicators */}
                      <div className="absolute bottom-3 left-3 flex items-center space-x-2">
                        {article.hasVideo && (
                          <div className="bg-black/50 text-white p-1 rounded-full backdrop-blur-sm">
                            <Video className="w-3 h-3" />
                          </div>
                        )}
                        {article.hasAudio && (
                          <div className="bg-black/50 text-white p-1 rounded-full backdrop-blur-sm">
                            <Headphones className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-6">
                      {/* Article metadata */}
                      <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(article.date)}</span>
                        </div>
                        {showReadingTime && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{article.readingTime} min read</span>
                          </div>
                        )}
                        {showViews && (
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{article.views.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Shield className="w-3 h-3 text-green-500" />
                          <span className="text-green-600 dark:text-green-400">{article.credibility}%</span>
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-tight">
                        {article.title}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm sm:text-base">
                        {article.excerpt}
                      </p>

                      {/* Tags */}
                      {showTags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.slice(0, 2).map((tag, tagIndex) => (
                            <button
                              key={tagIndex}
                              onClick={() => handleSearch(tag)}
                              className="inline-flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <Tag className="w-3 h-3" />
                              <span>{tag}</span>
                            </button>
                          ))}
                          {article.tags.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                              +{article.tags.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Author and actions */}
                      <div className="flex items-center justify-between">
                        {showAuthor && (
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                              <User className="w-3 h-3" />
                              <span className="truncate max-w-24">{article.author}</span>
                            </div>
                            <button
                              onClick={() => handleFollowAuthor(article.author)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${followedAuthors.has(article.author)
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                }`}
                            >
                              {followedAuthors.has(article.author) ? "Following" : "Follow"}
                            </button>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          {/* Interaction buttons */}
                          <button
                            onClick={() => handleLike(article.id)}
                            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm transition-colors ${likedArticles.has(article.id)
                              ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                              : "text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                              }`}
                          >
                            <Heart className={`w-4 h-4 ${likedArticles.has(article.id) ? "fill-current" : ""}`} />
                            <span>{article.likes + (likedArticles.has(article.id) ? 1 : 0)}</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedArticle(article)
                              setIsReaderMode(true)
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || categoryFilter !== "All" || activeTab !== "all"
                ? "Try adjusting your search terms, filters, or tab selection."
                : "No news articles are available at the moment."}
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {!infiniteScroll && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAndSortedArticles.length)} of{" "}
              {filteredAndSortedArticles.length} articles
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>

              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>



      {isReaderMode && selectedArticle && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsReaderMode(false)}></div>
          <div className={`absolute inset-0 ${isDarkMode ? "bg-gray-900" : "bg-white"} overflow-y-auto`}>
            {/* Reader header */}
            <div
              className={`sticky top-0 z-10 border-b ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setIsReaderMode(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold truncate max-w-md">{selectedArticle.title}</h1>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Reader controls */}
                    <button
                      onClick={() => handleTextToSpeech(selectedArticle.content)}
                      className={`p-2 rounded-lg transition-colors ${isTextToSpeechActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      title="Listen to article"
                    >
                      {isTextToSpeechActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleBookmark(selectedArticle.id)}
                      className={`p-2 rounded-lg transition-colors ${bookmarkedArticles.has(selectedArticle.id)
                        ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      title="Bookmark article"
                    >
                      {bookmarkedArticles.has(selectedArticle.id) ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleShare(selectedArticle)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Share article"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                      <button
                        onClick={() => setFontSize("small")}
                        className={`px-2 py-1 rounded text-sm transition-colors ${fontSize === "small"
                          ? "bg-white dark:bg-gray-600 shadow-sm"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize("medium")}
                        className={`px-2 py-1 rounded text-base transition-colors ${fontSize === "medium"
                          ? "bg-white dark:bg-gray-600 shadow-sm"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        A
                      </button>
                      <button
                        onClick={() => setFontSize("large")}
                        className={`px-2 py-1 rounded text-lg transition-colors ${fontSize === "large"
                          ? "bg-white dark:bg-gray-600 shadow-sm"
                          : "hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Article content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <article ref={articleContentRef}>
                {/* Article header */}
                <header className="mb-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(selectedArticle.category)}`}
                    >
                      {getCategoryIcon(selectedArticle.category)}
                      <span>{selectedArticle.category}</span>
                    </span>
                    {selectedArticle.trending && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        TRENDING
                      </span>
                    )}
                    {selectedArticle.breaking && (
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold animate-pulse">
                        BREAKING
                      </span>
                    )}
                    {selectedArticle.verified && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  <h1
                    className={`font-bold leading-tight mb-6 ${fontSize === "small"
                      ? "text-2xl sm:text-3xl"
                      : fontSize === "medium"
                        ? "text-3xl sm:text-4xl"
                        : "text-4xl sm:text-5xl"
                      }`}
                  >
                    {selectedArticle.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{selectedArticle.author}</span>
                      <button
                        onClick={() => handleFollowAuthor(selectedArticle.author)}
                        className={`ml-2 px-3 py-1 rounded-full text-xs font-medium transition-colors ${followedAuthors.has(selectedArticle.author)
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                      >
                        {followedAuthors.has(selectedArticle.author) ? "Following" : "Follow"}
                      </button>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(selectedArticle.date)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{selectedArticle.readingTime} min read</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{selectedArticle.views.toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        {selectedArticle.credibility}% credible
                      </span>
                    </div>
                    {selectedArticle.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedArticle.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Article image */}
                  {selectedArticle.image && (
                    <div className="mb-8">
                      <img
                        src={selectedArticle.image || "/placeholder.svg"}
                        alt={selectedArticle.title}
                        className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  {/* Article excerpt */}
                  <div
                    className={`text-gray-700 dark:text-gray-300 leading-relaxed mb-8 ${fontSize === "small" ? "text-lg" : fontSize === "medium" ? "text-xl" : "text-2xl"
                      }`}
                  >
                    {selectedArticle.excerpt}
                  </div>

                  {/* Article actions */}
                  <div className="flex flex-wrap items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleLike(selectedArticle.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${likedArticles.has(selectedArticle.id)
                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <Heart className={`w-4 h-4 ${likedArticles.has(selectedArticle.id) ? "fill-current" : ""}`} />
                      <span>{selectedArticle.likes + (likedArticles.has(selectedArticle.id) ? 1 : 0)}</span>
                    </button>

                    <button
                      onClick={() => handleDislike(selectedArticle.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${dislikedArticles.has(selectedArticle.id)
                        ? "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <ThumbsDown
                        className={`w-4 h-4 ${dislikedArticles.has(selectedArticle.id) ? "fill-current" : ""}`}
                      />
                      <span>{selectedArticle.dislikes + (dislikedArticles.has(selectedArticle.id) ? 1 : 0)}</span>
                    </button>

                    <button
                      onClick={() => handleAddToReadingList(selectedArticle.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${readingList.includes(selectedArticle.id)
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>
                        {readingList.includes(selectedArticle.id) ? "In Reading List" : "Add to Reading List"}
                      </span>
                    </button>

                    {/* Article rating */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rate:</span>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRateArticle(selectedArticle.id, rating)}
                          className={`p-1 transition-colors ${(articleRatings[selectedArticle.id] || 0) >= rating
                            ? "text-yellow-500"
                            : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"
                            }`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                </header>

                {/* Article content */}
                <div
                  className={`prose prose-lg max-w-none ${isDarkMode ? "prose-invert" : ""} ${fontSize === "small" ? "prose-sm" : fontSize === "medium" ? "prose-lg" : "prose-xl"
                    }`}
                >
                  {selectedArticle.content.split("\n\n").map((paragraph, index) => (
                    <p key={index} className="mb-6 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Article tags */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.tags.map((tag, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsReaderMode(false)
                          handleSearch(tag)
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      >
                        <Tag className="w-4 h-4" />
                        <span>{tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comments section */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Comments ({(comments[selectedArticle.id] || []).length})</h3>
                    <button
                      onClick={() =>
                        setShowComments((prev) => ({
                          ...prev,
                          [selectedArticle.id]: !prev[selectedArticle.id],
                        }))
                      }
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{showComments[selectedArticle.id] ? "Hide" : "Show"} Comments</span>
                    </button>
                  </div>

                  {showComments[selectedArticle.id] && (
                    <div className="space-y-6">
                      {/* Add comment form */}
                      <div className="flex space-x-4">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className={`w-full px-4 py-3 rounded-lg border resize-none transition-colors ${isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                              : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                              } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            rows={3}
                          />
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {newComment.length}/500 characters
                            </span>
                            <button
                              onClick={() => handleAddComment(selectedArticle.id)}
                              disabled={!newComment.trim()}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                            >
                              <Send className="w-4 h-4" />
                              <span>Post Comment</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Comments list */}
                      <div className="space-y-4">
                        {(comments[selectedArticle.id] || []).map((comment) => (
                          <div key={comment.id} className="flex space-x-4">
                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDate(comment.date)}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <button className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  <ThumbsUp className="w-3 h-3" />
                                  <span>{comment.likes}</span>
                                </button>
                                <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            </div>

            {/* Navigation between articles */}
            <div
              className={`sticky bottom-0 border-t ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                }`}
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      const currentIndex = newsArticles.findIndex((a) => a.id === selectedArticle.id)
                      if (currentIndex > 0) {
                        setSelectedArticle(newsArticles[currentIndex - 1])
                      }
                    }}
                    disabled={newsArticles.findIndex((a) => a.id === selectedArticle.id) === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Article</span>
                  </button>

                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {newsArticles.findIndex((a) => a.id === selectedArticle.id) + 1} of {newsArticles.length}
                  </div>

                  <button
                    onClick={() => {
                      const currentIndex = newsArticles.findIndex((a) => a.id === selectedArticle.id)
                      if (currentIndex < newsArticles.length - 1) {
                        setSelectedArticle(newsArticles[currentIndex + 1])
                      }
                    }}
                    disabled={newsArticles.findIndex((a) => a.id === selectedArticle.id) === newsArticles.length - 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next Article</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && shareArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
              onClick={() => setShowShareModal(false)}
            ></div>

            <div
              className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Share Article</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Social media sharing */}
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center space-x-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </button>
                  <button className="flex items-center space-x-3 p-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors">
                    <Twitter className="w-5 h-5" />
                    <span>Twitter</span>
                  </button>
                  <button className="flex items-center space-x-3 p-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors">
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleCopyToClipboard(window.location.href)}
                    className="flex items-center space-x-3 p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {copiedToClipboard ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    <span>{copiedToClipboard ? "Copied!" : "Copy Link"}</span>
                  </button>
                </div>

                {/* Direct link */}
                <div>
                  <label className="block text-sm font-medium mb-2">Direct Link</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/article/${shareArticle.id}`}
                      readOnly
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm ${isDarkMode
                        ? "bg-gray-700 border-gray-600 text-white"
                        : "bg-gray-50 border-gray-300 text-gray-900"
                        }`}
                    />
                    <button
                      onClick={() => handleCopyToClipboard(`${window.location.origin}/article/${shareArticle.id}`)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSettings(false)}
            ></div>

            <div
              className={`inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform rounded-xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Settings</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Display settings */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Display</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Dark Mode</span>
                      <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Compact Mode</span>
                      <button
                        onClick={() => setCompactMode(!compactMode)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${compactMode ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${compactMode ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Font Size</label>
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                          }`}
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content settings */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Content</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Show Reading Time</span>
                      <button
                        onClick={() => setShowReadingTime(!showReadingTime)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showReadingTime ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showReadingTime ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Show Tags</span>
                      <button
                        onClick={() => setShowTags(!showTags)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTags ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTags ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Show Author</span>
                      <button
                        onClick={() => setShowAuthor(!showAuthor)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showAuthor ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAuthor ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Show Views</span>
                      <button
                        onClick={() => setShowViews(!showViews)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showViews ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showViews ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Reading Speed (WPM)</label>
                      <input
                        type="range"
                        min="100"
                        max="400"
                        step="25"
                        value={readingSpeed}
                        onChange={(e) => setReadingSpeed(Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>100</span>
                        <span>{readingSpeed} WPM</span>
                        <span>400</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notifications */}
                <div>
                  <h4 className="text-lg font-medium mb-4">Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Enable Notifications</span>
                      <button
                        onClick={() => setNotifications(!notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Auto Refresh</span>
                      <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoRefresh ? "bg-blue-600" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoRefresh ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>

                    {autoRefresh && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Refresh Interval</label>
                        <select
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(Number(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                            }`}
                        >
                          <option value={60000}>1 minute</option>
                          <option value={300000}>5 minutes</option>
                          <option value={600000}>10 minutes</option>
                          <option value={1800000}>30 minutes</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Text-to-speech settings */}
                {availableVoices.length > 0 && (
                  <div>
                    <h4 className="text-lg font-medium mb-4">Text-to-Speech</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Voice</label>
                        <select
                          value={speechVoice?.name || ""}
                          onChange={(e) => {
                            const voice = availableVoices.find((v) => v.name === e.target.value)
                            setSpeechVoice(voice || null)
                          }}
                          className={`w-full px-3 py-2 rounded-lg border ${isDarkMode
                            ? "bg-gray-700 border-gray-600 text-white"
                            : "bg-white border-gray-300 text-gray-900"
                            }`}
                        >
                          <option value="">Default</option>
                          {availableVoices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                              {voice.name} ({voice.lang})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Speech Rate</label>
                        <input
                          type="range"
                          min="0.5"
                          max="2"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(Number(e.target.value))}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>0.5x</span>
                          <span>{speechRate}x</span>
                          <span>2x</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Keyboard shortcuts */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Keyboard Shortcuts</h4>
                    <button
                      onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      {showKeyboardShortcuts ? "Hide" : "Show"}
                    </button>
                  </div>

                  {showKeyboardShortcuts && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Search</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+K</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Advanced Filters</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+F</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Settings</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Toggle Dark Mode</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+D</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Refresh</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+R</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Close Modal</span>
                        <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Esc</kbd>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-40 p-3 rounded-full shadow-lg transition-all duration-300 ${isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-white hover:bg-gray-50 text-gray-900"
            } hover:scale-110`}
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className={`p-6 rounded-xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium">Loading...</span>
            </div>
          </div>
        </div>
      )}

      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-40 px-3 py-1 bg-black/70 text-white text-xs rounded-full backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            {deviceType === "mobile" && <Smartphone className="w-3 h-3" />}
            {deviceType === "tablet" && <Tablet className="w-3 h-3" />}
            {deviceType === "desktop" && <Monitor className="w-3 h-3" />}
            <span>{deviceType}</span>
            {!isOnline && <WifiOff className="w-3 h-3 text-red-400" />}
          </div>
        </div>
      )}
    </div>
  )
}
