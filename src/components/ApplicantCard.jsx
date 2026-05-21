import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, DollarSign, Eye, Briefcase } from "lucide-react";
import { getOptimizedImageUrl } from "../utils/cloudinary";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ApplicantCard({ applicant }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [phoneInput, setPhoneInput] = useState("+251");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const profileImageSrc = applicant?.profileImageUrl || applicant?.profileImage || "/placeholder.svg";

  const profileImageUrl = getOptimizedImageUrl(
    typeof profileImageSrc === "string" ? profileImageSrc : profileImageSrc.url,
    { width: 80, height: 80 }
  );

  const handleViewClick = () => {
    setErrorMessage("");
    setPhoneInput("+251");
    setShowPrompt(true);
  };

  const handleSubmitPhoneNumber = () => {
    if (!phoneInput.trim() || phoneInput.trim() === "+251") {
      setErrorMessage("Please enter your Phone Number.");
      return;
    }

    const normalizedInput = phoneInput.trim().replace(/\s/g, "");
    const normalizedTarget = (applicant?.phoneNumber || "").trim().replace(/\s/g, "");

    if (normalizedInput !== normalizedTarget) {
      setErrorMessage("Phone Number is incorrect.");
      return;
    }

    // ✅ Correct phone number
    navigate(`/applicant/${applicant?.id}`);
  };

  return (
    <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 
                    shadow-md hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group">

      {/* Applicant Info */}
      <div className="flex items-start space-x-4">
        {/* Profile Image */}
        <div className="relative">
          <img
            src={profileImageUrl}
            alt={applicant?.fullName || "Applicant"}
            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md 
                       group-hover:rotate-3 group-hover:scale-105 transition-all duration-300"
          />

          {/* Status Badge */}
          <div
            className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white 
                        flex items-center justify-center text-xs font-bold shadow-md
                        ${applicant?.status === "Accepted"
                ? "bg-green-500 text-white animate-pulse"
                : applicant?.status === "Rejected"
                  ? "bg-red-500 text-white"
                  : "bg-yellow-400 text-white animate-bounce"
              }`}
          >
            {applicant?.status === "Accepted"
              ? "✓"
              : applicant?.status === "Rejected"
                ? "✗"
                : "⏳"}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {applicant?.fullName || "Unnamed Applicant"}
          </h3>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-gray-600 text-sm">
              <Briefcase className="w-4 h-4 mr-2 text-primary-500" />
              <span className="font-medium">{applicant?.job || "N/A"}</span>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-primary-500" />
              <span>{applicant?.country || "Unknown"}</span>
            </div>

            <div className="flex items-center text-gray-600 text-sm">
              <DollarSign className="w-4 h-4 mr-2 text-primary-500" />
              <span className="font-semibold">
                {applicant?.expectedSalary !== undefined &&
                  applicant?.expectedSalary !== null &&
                  applicant?.expectedSalary !== ""
                  ? `$${Number(applicant.expectedSalary).toLocaleString()}`
                  : "Not disclosed"}
              </span>
            </div>
          </div>

          {/* Status + View Button */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold
                ${applicant?.status === "Accepted"
                  ? "bg-green-100 text-green-700"
                  : applicant?.status === "Pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
            >
              {applicant?.status || "Pending"}
            </span>

            <button
              onClick={handleViewClick}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 
                         font-semibold text-sm px-3 py-1 rounded-lg hover:bg-primary-50"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Application Number Modal */}
      {showPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              Confirm Phone Number
            </h2>

            <input
              type="text"
              value={phoneInput}
              onChange={(e) => {
                setPhoneInput(e.target.value);
                setErrorMessage("");
              }}
              className={`border rounded-xl p-3 w-full mb-1 focus:outline-none focus:ring-2
                ${errorMessage
                  ? "border-red-400 focus:ring-red-300"
                  : "border-gray-300 focus:ring-primary-500"
                }`}
              placeholder="+2519..."
            />

            {/* Inline Error Message */}
            {errorMessage && (
              <p className="text-sm text-red-500 mt-1">
                {errorMessage}
              </p>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPhoneNumber}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white font-semibold 
                           hover:bg-primary-700 shadow-md"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
