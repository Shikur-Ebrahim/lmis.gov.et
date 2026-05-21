"use client"

import { Users } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function QuickStats() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
      <div className="container px-4 md:px-6">
        {/* Heading */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2 max-w-[700px] mx-auto">
            <div className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
              Latest Updates
            </div>
            <h2
              className="text-4xl sm:text-6xl font-bold tracking-tight leading-tight text-center"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Our Impact and
              <br />
              <span className="block mt-2">Responsibility</span>
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-[600px] mx-auto leading-relaxed">
              At E-LMIS, as a dedicated government service, we are committed to fostering a sustainable and equitable labor
              market. Our CSR initiatives focus on empowering communities, promoting fair employment practices, and
              contributing to national development.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="mx-auto grid max-w-6xl items-start gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Service Driven Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            className="relative bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col justify-between h-full"
          >
            <div>
              <div className="mb-4">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/16172/16172205.png"
                  alt="Service Icon"
                  className="w-14 h-14 object-contain"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(55%) sepia(92%) saturate(749%) hue-rotate(359deg) brightness(103%) contrast(101%)",
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Service Driven</h3>
              <p className="text-gray-600 text-sm text-center">
                Dedicated to providing user-centric services that meet the evolving needs of job seekers, employers, and policymakers, as a public resource.
              </p>
            </div>
          </motion.div>

          {/* Data Driven Insights Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="relative bg-blue-600 shadow-xl rounded-3xl p-10 hover:shadow-2xl transition duration-300 flex flex-col justify-between text-white w-full max-w-md"
          >
            <h3 className="text-2xl font-bold text-center mb-8">Data Driven Insights</h3>
            <div className="flex justify-center items-end gap-5 mb-8 h-40">
              <div className="bg-white w-8 h-24 rounded-full" />
              <div className="bg-white w-8 h-16 rounded-full" />
              <div className="bg-white w-8 h-32 rounded-full" />
              <div className="bg-white w-8 h-20 rounded-full" />
              <div className="bg-white w-8 h-28 rounded-full" />
              <div className="bg-white w-8 h-22 rounded-full" />
            </div>
            <p className="text-lg font-bold text-center leading-snug">
              Millions of Data Points<br />Processed
            </p>
          </motion.div>

          {/* Community Engagement Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            className="relative bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition duration-300 flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-center mb-4">
                <Users className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">Community Engagement</h3>
              <p className="text-gray-600 text-sm text-center">
                Supporting communities with training, skill-building, and employment initiatives to increase local job readiness and equity.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
