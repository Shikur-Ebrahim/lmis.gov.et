// src/App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import ApplicantDetail from "./pages/ApplicantDetail";
import Contact from "./pages/Contact";
import Register from "./pages/register";
import About from "./pages/About";
import Services from "./pages/Services";
import News from "./pages/News";
import PersonalProfile from "./pages/personal";
import PaymentMethod from "./pages/paymentMethod";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ApplicantsList from "./pages/admin/ApplicantsList";
import MessagesList from "./pages/admin/MessagesList";
import RegisterDetail from "./pages/admin/RegisterDetail";
import AdminPayment from "./pages/admin/Payment";
import AdminNotifications from "./pages/admin/Notifications";
import AccountManagement from "./pages/admin/account";
import AdminBiometric from "./pages/admin/Biometric";
import RegistrationFees from "./pages/admin/RegistrationFees";
import AdminVideoUpload from "./pages/admin/AdminVideoUpload";
import Biometric from "./pages/Biometric";
import RegistrationPayment from "./pages/RegistrationPayment";
import PaymentMethods from "./pages/PaymentMethods";
import PaymentDetail from "./pages/PaymentDetail";
import PaymentPending from "./pages/PaymentPending";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin") ||
    location.pathname === "/login" ||
    location.pathname === "/registration-payment" ||
    location.pathname === "/payment-methods" ||
    location.pathname === "/payment-detail" ||
    location.pathname === "/payment-pending";

  return (
    <>
      <ScrollToTop />
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/applicant/:id" element={<ApplicantDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/personal" element={<PersonalProfile />} />
            <Route path="/biometric" element={<Biometric />} />
            <Route path="/payment-method" element={<PaymentMethod />} />
            <Route path="/registration-payment" element={<RegistrationPayment />} />
            <Route path="/payment-methods" element={<PaymentMethods />} />
            <Route path="/payment-detail" element={<PaymentDetail />} />
            <Route path="/payment-pending" element={<PaymentPending />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/news" element={<News />} />
            <Route path="/login" element={<AdminLogin />} />




            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/applicants"
              element={
                <ProtectedRoute>
                  <ApplicantsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute>
                  <MessagesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/Notifications"
              element={
                <ProtectedRoute>
                  <AdminNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/Payment"
              element={
                <ProtectedRoute>
                  <AdminPayment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/RegisterDetail"
              element={
                <ProtectedRoute>
                  <RegisterDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/account"
              element={
                <ProtectedRoute>
                  <AccountManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/Biometric"
              element={
                <ProtectedRoute>
                  <AdminBiometric />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/registration-fees"
              element={
                <ProtectedRoute>
                  <RegistrationFees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/videos"
              element={
                <ProtectedRoute>
                  <AdminVideoUpload />
                </ProtectedRoute>
              }
            />
          </Routes>

        </main>
        {!isAdminRoute && <Footer />}
      </div>
    </>
  );
}

export default App;
