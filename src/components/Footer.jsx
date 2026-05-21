import { Link } from "react-router-dom"
import { ExternalLink } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Ethiopian Flag Divider */}
      <div className="section-divider"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src="/images/lmis.logo.svg"
                alt="LMIS Logo"
                className="w-40 h-auto object-contain"
              />
              <div>
                <br /><br />
                <p className="text-gray-400 text-sm font-medium">Labor Market Information System</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The Ethiopian Labor Market Information System (LMIS) is the official government platform providing
              comprehensive employment services, job market data, and career opportunities for Ethiopian citizens both
              domestically and internationally.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span>Our Services</span>
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span>News & Updates</span>
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span>About LMIS</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <span>Contact Us</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Government Links */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center">
              <ExternalLink className="w-3 h-3 mr-2" />
              Ministry of Labor
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center">
              <ExternalLink className="w-3 h-3 mr-2" />
              Ethiopian Government
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center">
              <ExternalLink className="w-3 h-3 mr-2" />
              National Bank of Ethiopia
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center">
              <ExternalLink className="w-3 h-3 mr-2" />
              Ethiopian Investment Commission
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © 2024 Labor Market Information System (LMIS). All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Federal Democratic Republic of Ethiopia | Ministry of Labor and Social Affairs
              </p>
            </div>
            <div className="flex items-center space-x-4">

            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
