
import React, { useState } from 'react';
import { SEGMENT_DISCOUNTS, INSURANCE_COMPANIES, PARTNER_IMAGES } from '../constants';
import { AffiliateSegment, AffiliateVerificationRecord } from '../types';

interface AffiliatePartnershipProps {
  customSegment?: AffiliateSegment;
  customPartnerId?: string;
  onVerificationSuccess?: (record: Omit<AffiliateVerificationRecord, 'id' | 'timestamp'>) => void;
}

const AffiliatePartnership: React.FC<AffiliatePartnershipProps> = ({ customSegment, customPartnerId, onVerificationSuccess }) => {
  const [selectedSegment, setSelectedSegment] = useState<AffiliateSegment>(customSegment || 'individual');
  const [activePartnerId, setActivePartnerId] = useState(customPartnerId || INSURANCE_COMPANIES[8].id); 
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isProviderDrawerOpen, setIsProviderDrawerOpen] = useState(false);

  const selectedPartner = INSURANCE_COMPANIES.find(p => p.id === activePartnerId) || INSURANCE_COMPANIES[8];

  const [formData, setFormData] = useState({
    policyNumber: '',
    dob: '',
    phone: '',
    email: ''
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [savingsMessage, setSavingsMessage] = useState<string | null>(null);

  const currentOffer = SEGMENT_DISCOUNTS[selectedSegment];
  const discountedPrice = Math.round(currentOffer.original_price * (1 - currentOffer.discount_percent / 100));

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationResult(null);
    setSavingsMessage(null);
    
    setTimeout(() => {
      setIsVerifying(false);
      
      // RELAXED VERIFICATION LOGIC: 
      // Only fails if policy number is empty or explicitly includes "invalid" or "fake" 
      // This ensures standard testing works smoothly for the user.
      const normalizedPolicy = formData.policyNumber.trim().toLowerCase();
      
      if (!normalizedPolicy || normalizedPolicy.includes('invalid') || normalizedPolicy.includes('fake')) {
        setVerificationResult(`Policy not found. Please contact ${selectedPartner.name} customer support for policy verification.`);
        return;
      }

      // SUCCESS CASE
      setVerificationResult(`Welcome, ${formData.email.split('@')[0]}! You qualify for ${currentOffer.discount_percent}% off + ${currentOffer.free_sessions} Free Session.`);
      
      // Savings Message calculation per PDF specs (Page 9 & 17)
      const sessionValue = 1500; // Mock session value
      const directDiscount = currentOffer.original_price - discountedPrice;
      const freeSessionBonus = currentOffer.free_sessions > 0 ? sessionValue : 0;
      const totalSavings = directDiscount + freeSessionBonus;
      
      setSavingsMessage(`You saved ₹${totalSavings.toLocaleString()} with your ${selectedPartner.name} benefit!`);
      
      if (onVerificationSuccess) {
        onVerificationSuccess({
          partnerId: selectedPartner.id,
          partnerName: selectedPartner.name,
          segment: selectedSegment,
          policyNumber: formData.policyNumber,
          patientEmail: formData.email,
          status: 'VERIFIED'
        });
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 animate-fadeIn relative overflow-x-hidden">
      {/* Top Header */}
      <header className="px-10 py-6 flex justify-between items-center border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-[60]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-slate-900">MANAS <span className="text-blue-600">360</span></span>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedPartner.name.toUpperCase()} PORTAL</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsProviderDrawerOpen(true)}
            className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-lg"
          >
            Change Provider
          </button>
          <button 
            onClick={() => setIsSupportOpen(true)}
            className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-50"
          >
            Support
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-10 py-16 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column: Hero & Offer */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="w-24 h-12 mb-4 overflow-hidden rounded-lg border border-slate-100 shadow-sm">
                <img src={PARTNER_IMAGES[selectedPartner.id]} className="w-full h-full object-cover" alt={selectedPartner.name} />
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Exclusive Mental <br />
              Health Benefit for <br />
              <span className="text-blue-600 leading-tight">
                {selectedPartner.name.split(' ').slice(0, 2).join(' ')} <br />
                <span className="text-slate-900">Policyholders</span>
              </span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-xl leading-relaxed">
              {currentOffer.description}
            </p>
          </div>

          {/* Offer Card */}
          <div className="bg-blue-600 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/10 transition-all"></div>
            
            <span className="inline-block px-4 py-1.5 bg-blue-500/50 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
              {selectedSegment.toUpperCase()} OFFER
            </span>

            <h2 className="text-5xl font-black mb-4 tracking-tight leading-tight">
              {currentOffer.discount_percent}% Off {currentOffer.free_sessions > 0 ? `+ ${currentOffer.free_sessions} Free Session` : ''}
            </h2>
            <p className="text-blue-100 font-bold mb-10 uppercase tracking-widest text-xs">{currentOffer.product}</p>

            <div className="flex items-baseline gap-4">
              <span className="text-6xl font-black">₹{discountedPrice.toLocaleString()}</span>
              {currentOffer.original_price > 100 && (
                <span className="text-2xl text-blue-300/60 font-bold line-through">₹{currentOffer.original_price.toLocaleString()}</span>
              )}
            </div>
            
            {currentOffer.free_service && (
               <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Exclusive Bonus Service</p>
                  <p className="text-sm font-bold">{currentOffer.free_service}</p>
               </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Form */}
        <div className="relative">
          <div className="bg-white rounded-[2rem] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-50">
            <h3 className="text-2xl font-black text-slate-900 mb-8">Verify Your Policy</h3>
            
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Policy Number</label>
                <input 
                  type="text" 
                  placeholder={`e.g. ${selectedPartner.code}-123456`}
                  className="w-full bg-[#333333] text-white p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-500 font-bold"
                  value={formData.policyNumber}
                  onChange={(e) => setFormData({...formData, policyNumber: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full bg-[#333333] text-white p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Phone</label>
                  <input 
                    type="tel" 
                    placeholder="+91-XXXXXXXXXX"
                    className="w-full bg-[#333333] text-white p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-500 font-bold"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">Email Address</label>
                <input 
                  type="email" 
                  placeholder="customer@example.com"
                  className="w-full bg-[#333333] text-white p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all placeholder:text-slate-500 font-bold"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                disabled={isVerifying}
                className={`w-full py-5 bg-blue-600 text-white rounded-xl font-black text-lg transition-all hover:bg-blue-700 active:scale-[0.98] shadow-xl shadow-blue-200 ${isVerifying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isVerifying ? 'Verifying...' : 'Claim Your Benefit Now'}
              </button>

              {verificationResult && (
                <div className={`p-6 border-2 rounded-2xl mt-4 animate-fadeIn ${savingsMessage ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                  <p className={`text-center text-sm font-black ${savingsMessage ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {verificationResult}
                  </p>
                  {savingsMessage && (
                    <div className="mt-4 pt-4 border-t border-emerald-200">
                      <p className="text-center text-lg font-black text-emerald-600">{savingsMessage}</p>
                      <button className="w-full mt-6 py-4 bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Proceed to Checkout</button>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Support Modal */}
      {isSupportOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full shadow-2xl animate-scaleIn border-[12px] border-white/50">
            <div className="text-center mb-8">
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Partner Support</h3>
               <p className="text-slate-500 font-bold mt-2">Need help with your {selectedPartner.name} benefit?</p>
            </div>
            <div className="space-y-4">
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Benefit Hotline</p>
                  <p className="text-lg font-black text-blue-600">1800-MANAS-HELP</p>
               </div>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Institutional Email</p>
                  <p className="text-lg font-black text-blue-600">support@manas360.com</p>
               </div>
            </div>
            <button 
              onClick={() => setIsSupportOpen(false)}
              className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Close Support
            </button>
          </div>
        </div>
      )}

      {/* Provider Selection Drawer */}
      {isProviderDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl animate-slideLeft flex flex-col">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-black uppercase tracking-tighter">Switch Partner Preview</h3>
                <button onClick={() => setIsProviderDrawerOpen(false)} className="text-slate-400 hover:text-slate-900 font-black p-2 rounded-full hover:bg-slate-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {INSURANCE_COMPANIES.map(partner => (
                  <button 
                    key={partner.id}
                    onClick={() => {
                      setActivePartnerId(partner.id);
                      setIsProviderDrawerOpen(false);
                      setVerificationResult(null);
                      setSavingsMessage(null);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group ${activePartnerId === partner.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-transparent hover:bg-slate-50'}`}
                  >
                     <img src={PARTNER_IMAGES[partner.id]} className="w-12 h-8 object-cover rounded shadow-sm group-hover:scale-105 transition-transform" alt="" />
                     <span className={`text-sm font-black transition-colors ${activePartnerId === partner.id ? 'text-blue-600' : 'text-slate-700'}`}>{partner.name}</span>
                  </button>
                ))}
             </div>
             <div className="p-8 bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">Simulation Mode: Previews Branding & Copy</p>
             </div>
          </div>
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-10 pb-20 flex justify-end items-end">
        <div className="flex gap-4">
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm min-w-[160px] text-center">
            <p className="text-3xl font-black text-slate-900">10k+</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Users</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm min-w-[160px] text-center">
            <p className="text-3xl font-black text-slate-900">24/7</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Support</p>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm min-w-[160px] text-center">
            <p className="text-3xl font-black text-slate-900">100%</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Private</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-slideLeft { animation: slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

export default AffiliatePartnership;
