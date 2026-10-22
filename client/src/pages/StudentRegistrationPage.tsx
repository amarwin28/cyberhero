import React, { useState } from 'react';
import { apiRequest } from '../services/api';
import {
  User,
  Building2,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Copy,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface StudentRegistrationPageProps {
  onNavigate: (view: string) => void;
}

export const StudentRegistrationPage: React.FC<StudentRegistrationPageProps> = ({ onNavigate }) => {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    schoolName: '',
    standard: 'CLASS_10' as 'CLASS_10' | 'CLASS_11' | 'CLASS_12',
    schoolLocation: '',
    city: '',
    email: '',
    phone: '',
    altPhone: '',
    password: '',
    confirmPassword: '',
    verificationChannel: 'EMAIL' as 'EMAIL' | 'SMS',
    otp: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ rollNumber: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Send OTP
  const handleRequestOtp = async () => {
    setError(null);
    const target = formData.verificationChannel === 'EMAIL' ? formData.email.trim() : formData.phone.trim();

    if (!target) {
      setError(`Please enter your ${formData.verificationChannel === 'EMAIL' ? 'email address' : 'phone number'} first.`);
      return;
    }

    if (formData.verificationChannel === 'EMAIL') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(target)) {
        setError('Please enter a valid email address.');
        return;
      }
    }

    if (formData.verificationChannel === 'SMS') {
      setError('SMS OTP is currently unconfigured. Please select "Verify by Email OTP".');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await apiRequest('/api/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({
          target,
          channel: formData.verificationChannel,
        }),
      });

      if (res.success) {
        setOtpSent(true);
        if (res.devOtp) {
          setDevOtpCode(res.devOtp);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    setError(null);
    const target = formData.verificationChannel === 'EMAIL' ? formData.email.trim() : formData.phone.trim();

    if (!formData.otp || formData.otp.length < 6) {
      setError('Please enter the 6-digit OTP received.');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await apiRequest('/api/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({
          target,
          channel: formData.verificationChannel,
          otp: formData.otp,
        }),
      });

      if (res.success) {
        setOtpVerified(true);
        setError(null);
      }
    } catch (err: any) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otpVerified) {
      setError('Please verify your OTP before submitting registration.');
      return;
    }

    if (!formData.fullName.trim() || !formData.schoolName.trim() || !formData.schoolLocation.trim() || !formData.city.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.altPhone.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone) || !phoneRegex.test(formData.altPhone)) {
      setError('Phone numbers must be exactly 10 digits.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiRequest('/api/auth/student/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          schoolName: formData.schoolName.trim(),
          standard: formData.standard,
          schoolLocation: formData.schoolLocation.trim(),
          city: formData.city.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          altPhone: formData.altPhone.trim(),
          password: formData.password,
          verificationChannel: formData.verificationChannel,
          otp: formData.otp.trim(),
        }),
      });

      if (res.success && res.data?.rollNumber) {
        setSuccessInfo({
          rollNumber: res.data.rollNumber,
          email: res.data.email,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (successInfo?.rollNumber) {
      navigator.clipboard.writeText(successInfo.rollNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] bg-cyber-950 bg-grid-pattern pt-8 sm:pt-12 pb-16 px-4 relative overflow-hidden flex flex-col items-center">
      <div className="max-w-2xl w-full z-10">
        {/* Header Branding (Mockup Screen 3) */}
        <div className="text-center mb-6 sm:mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-4 h-4" />
            Class 10, 11 &amp; 12 Registration
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide">
            Student Registration
          </h1>
          <p className="text-sm text-slate-300">Fill in your details to participate in CyberHero</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="cyber-glass p-6 sm:p-8 rounded-2xl border border-cyan-500/20 shadow-cyber-card">
          <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
            {/* Row 1: Student Name & School Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Student Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="studentFullName"
                    name="studentFullName"
                    autoComplete="off"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter your full name"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  School Name <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="schoolName"
                    name="schoolName"
                    autoComplete="off"
                    required
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="Enter your school name"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Standard & School Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Standard <span className="text-cyan-400">*</span>
                </label>
                <select
                  id="studentStandard"
                  name="studentStandard"
                  value={formData.standard}
                  onChange={(e) => setFormData({ ...formData, standard: e.target.value as any })}
                  className="cyber-input w-full text-sm appearance-none cursor-pointer"
                >
                  <option value="CLASS_10" className="bg-cyber-900 text-white">10th Standard</option>
                  <option value="CLASS_11" className="bg-cyber-900 text-white">11th Standard</option>
                  <option value="CLASS_12" className="bg-cyber-900 text-white">12th Standard</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  School Location <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="schoolLocation"
                    name="schoolLocation"
                    autoComplete="off"
                    required
                    value={formData.schoolLocation}
                    onChange={(e) => setFormData({ ...formData, schoolLocation: e.target.value })}
                    placeholder="Enter school location"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: City / Town & Email Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  City / Town <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    id="studentCity"
                    name="studentCity"
                    autoComplete="off"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Enter your city or town"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    id="studentEmail"
                    name="studentEmail"
                    autoComplete="off"
                    required
                    disabled={otpVerified}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email address"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm disabled:opacity-75"
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Phone Number & Alternative Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    id="studentPhone"
                    name="studentPhone"
                    autoComplete="off"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Alternative Phone Number <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    id="studentAltPhone"
                    name="studentAltPhone"
                    autoComplete="off"
                    required
                    maxLength={10}
                    value={formData.altPhone}
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value.replace(/\D/g, '') })}
                    placeholder="Alternative parent/guardian contact"
                    className="cyber-input cyber-input-with-icon w-full pl-11 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Row 5: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="studentPassword"
                    name="studentPassword"
                    autoComplete="new-password"
                    data-lpignore="true"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a secure password"
                    className="cyber-input cyber-input-with-icon cyber-input-with-action w-full pl-11 pr-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm Password <span className="text-cyan-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-cyan-400/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="studentConfirmPassword"
                    name="studentConfirmPassword"
                    autoComplete="new-password"
                    data-lpignore="true"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Repeat your password"
                    className="cyber-input cyber-input-with-icon cyber-input-with-action w-full pl-11 pr-11 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* OTP Verification Section (Mockup Screen 3) */}
            <div className="p-4 rounded-xl bg-cyber-900/90 border border-cyan-500/25 space-y-3">
              <label className="block text-xs font-bold text-white uppercase tracking-wider">
                Verify Your Contact <span className="text-cyan-400">*</span>
              </label>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="verificationChannel"
                    value="EMAIL"
                    checked={formData.verificationChannel === 'EMAIL'}
                    onChange={() => setFormData({ ...formData, verificationChannel: 'EMAIL' })}
                    className="accent-cyan-400"
                  />
                  <span>Verify by Email OTP</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="radio"
                    name="verificationChannel"
                    value="SMS"
                    checked={formData.verificationChannel === 'SMS'}
                    onChange={() => setFormData({ ...formData, verificationChannel: 'SMS' })}
                    className="accent-cyan-400"
                  />
                  <span>Verify by SMS OTP</span>
                </label>
              </div>

              {/* Dev OTP Notice if running local dev */}
              {devOtpCode && (
                <div className="p-2.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-xs text-cyan-300 flex items-center justify-between">
                  <span>Development OTP Code: <strong className="text-white tracking-widest">{devOtpCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, otp: devOtpCode })}
                    className="text-[11px] underline text-cyan-400 hover:text-white"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* OTP Input and Action */}
              <div className="flex gap-2">
                <input
                  type="text"
                  id="studentOtp"
                  name="studentOtp"
                  autoComplete="one-time-code"
                  maxLength={6}
                  disabled={otpVerified}
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })}
                  placeholder="Enter 6-digit OTP"
                  className="cyber-input flex-1 text-sm tracking-widest text-center disabled:opacity-70"
                />

                {!otpSent ? (
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={handleRequestOtp}
                    className="cyber-btn-secondary text-xs px-4 py-2 shrink-0 inline-flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{otpLoading ? 'Sending...' : 'Get OTP'}</span>
                  </button>
                ) : otpVerified ? (
                  <div className="px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-bold inline-flex items-center gap-1.5 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={otpLoading}
                    onClick={handleVerifyOtp}
                    className="cyber-btn-primary text-xs px-5 py-2 shrink-0 inline-flex items-center gap-1.5"
                  >
                    <span>{otpLoading ? 'Verifying...' : 'Verify OTP'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Information Banner (Mockup Screen 3) */}
            <div className="p-3 rounded-lg bg-cyber-850 border border-cyan-500/20 flex items-start gap-2.5 text-xs text-slate-300">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Your <strong>4-digit roll number</strong> will be sent to your verified email address after successful registration.
              </span>
            </div>

            {/* Privacy notice for school-age students */}
            <div className="flex items-start gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Notice:</strong> Details collected solely for school competition authentication and
                certificate verification by Dhaanish Ahmed College of Engineering.
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !otpVerified}
              className={`w-full cyber-btn-primary text-sm sm:text-base py-3.5 font-bold tracking-wide shadow-glow-cyan flex items-center justify-center gap-2 ${
                !otpVerified ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <span>{loading ? 'Generating 4-Digit Roll Number...' : 'Register & Get Roll Number'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Existing Student Link */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <button
              type="button"
              onClick={() => onNavigate('student-login')}
              className="text-cyan-400 hover:underline font-semibold"
            >
              Login with Roll Number
            </button>
          </div>
        </div>
      </div>

      {/* --- SUCCESS MODAL WITH ROLL NUMBER --- */}
      {successInfo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="cyber-glass p-8 rounded-3xl max-w-md w-full border border-cyan-400 text-center space-y-6 shadow-glow-cyan animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">Registration Successful!</h2>
              <p className="text-xs text-slate-300">
                You have been registered for the CyberHero challenge.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-cyber-900 border border-cyan-400/40 space-y-2">
              <span className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
                Your Assigned 4-Digit Roll Number
              </span>
              <div className="text-5xl font-black text-white tracking-widest font-mono">
                {successInfo.rollNumber}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                A confirmation copy was sent to <strong>{successInfo.email}</strong>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={copyToClipboard}
                className="cyber-btn-secondary text-xs py-2.5 w-full inline-flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Roll Number'}</span>
              </button>

              <button
                onClick={() => onNavigate('student-login')}
                className="cyber-btn-primary text-sm py-3 w-full font-bold inline-flex items-center justify-center gap-2"
              >
                <span>Proceed to Student Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
