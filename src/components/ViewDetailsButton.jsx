import { useState } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ViewDetailsButton({ applicantId }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleViewClick = async () => {
    const enteredPhone = prompt("Please enter your phone number to view details:");
    if (!enteredPhone) return;

    setLoading(true);

    try {
      const applicantRef = doc(db, "applicants", applicantId);
      const applicantSnap = await getDoc(applicantRef);

      if (!applicantSnap.exists()) {
        alert("Applicant not found.");
        return;
      }

      const applicantData = applicantSnap.data();
      const savedPhone = applicantData?.personalInformation?.phoneNumber;

      if (enteredPhone.trim() === savedPhone) {
        navigate(`/applicant/${applicantId}`);
      } else {
        alert("The phone number does not match our records.");
      }
    } catch (error) {
      console.error("Error fetching applicant:", error);
      alert("An error occurred while verifying the phone number.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleViewClick}
      disabled={loading}
      className="
        relative flex items-center space-x-2 font-semibold text-sm
        text-white bg-gradient-to-r from-primary-500 to-primary-600
        hover:from-primary-600 hover:to-primary-700
        disabled:opacity-50 disabled:cursor-not-allowed
        px-4 py-2 rounded-xl shadow-lg
        overflow-hidden
        transition-all duration-300
        group
      "
    >
      {/* Background hover effect */}
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></span>
      
      {/* Eye icon with subtle animation */}
      <Eye className={`w-4 h-4 transform transition-transform duration-300 ${loading ? "animate-spin" : "group-hover:scale-110"}`} />
      
      {/* Text with loading animation */}
      <span className="relative z-10">
        {loading ? "Checking..." : "View Details"}
      </span>
    </button>
  );
}
