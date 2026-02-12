
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { SEGMENT_DISCOUNTS, INSURANCE_COMPANIES, PARTNER_IMAGES } from '../constants';
import { AffiliateSegment, AffiliateVerificationRecord, AffiliateTransaction } from '../types';
import AffiliatePartnership from './AffiliatePartnership';

const MOCK_CHART_DATA = [
  { name: 'Individual', value: 450, color: '#3b82f6' },
  { name: 'Corporate', value: 320, color: '#10b981' },
  { name: 'Healthcare', value: 210, color: '#6366f1' },
  { name: 'Defense', value: 150, color: '#ef4444' },
  { name: 'HNI', value: 90, color: '#f59e0b' },
];

const AffiliateManager: React.FC = () => {
  const [activePartnerId, setActivePartnerId] = useState<string>(INSURANCE_COMPANIES[8].id);
  const [selectedSegment, setSelectedSegment] = useState<AffiliateSegment>('individual');
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'directory' | 'dashboard' | 'history' | 'transactions'>('directory');
  const [verificationHistory, setVerificationHistory] = useState<AffiliateVerificationRecord[]>([]);
  const [transactions, setTransactions] = useState<AffiliateTransaction[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Email Kit Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [clientEmail, setClientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailNote, setEmailNote] = useState('');

  const selectedPartner = INSURANCE_COMPANIES.find(p => p.id === activePartnerId)!;

  const commissionMap = { 1: 10, 2: 12, 3: 15, 4: 18 };
  const commissionPercent = commissionMap[selectedPartner.commissionTier];

  const generateLink = (partnerId: string, segment: string) => {
    const baseUrl = `manas360.com/partners/${partnerId.toLowerCase()}`;
    const utms = `?utm_source=${partnerId.toLowerCase()}&utm_campaign=health2026&utm_medium=email`;
    const params = `&segment=${segment}&code=${partnerId.toUpperCase()}20FREE`;
    return baseUrl + utms + params;
  };

  const currentLink = generateLink(selectedPartner.id, selectedSegment);
  const subdomainLink = `${selectedPartner.id.toLowerCase()}.manas360.com`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(currentLink)}`;

  const showFeedback = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    showFeedback('Link copied to clipboard');
  };

  const handleDownloadQR = async () => {
    try {
      showFeedback('Generating asset...', 'info');
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MANAS360_QR_${selectedPartner.code}_${selectedSegment}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showFeedback('QR Code downloaded successfully');
    } catch (error) {
      console.error('QR download failed:', error);
    }
  };

  const handleOpenEmailKit = () => {
    setIsEmailModalOpen(true);
    setEmailNote(`Hello, I'm sharing the exclusive mental health benefit portal for ${selectedPartner.name}. Use the link below to access your ${SEGMENT_DISCOUNTS[selectedSegment].discount_percent}% discount.`);
  };

  const handleSendEmailKit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail) return;
    
    setIsSendingEmail(true);
    // Simulate secure mail relay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSendingEmail(false);
    setIsEmailModalOpen(false);
    setClientEmail('');
    showFeedback(`Onboarding kit successfully transmitted to ${clientEmail}`);
  };

  const handleVerificationSuccess = (record: Omit<AffiliateVerificationRecord, 'id' | 'timestamp'>) => {
    const newRecord: AffiliateVerificationRecord = {
      ...record,
      id: `vr-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setVerificationHistory(prev => [newRecord, ...prev]);

    const offer = SEGMENT_DISCOUNTS[record.segment];
    const originalPrice = offer.original_price;
    const discount = Math.round(originalPrice * (offer.discount_percent / 100));
    const finalPrice = originalPrice - discount;
    const commAmt = Math.round(finalPrice * (commissionPercent / 100));

    const newTx: AffiliateTransaction = {
      id: `tx-${Date.now()}`,
      partnerId: record.partnerId,
      customerEmail: record.patientEmail,
      segment: record.segment,
      originalPrice,
      discountAmount: discount,
      finalPrice,
      commissionPercent,
      commissionAmount: commAmt,
      transactionDate: new Date().toISOString(),
      variant: Math.random() > 0.5 ? 'A' : 'B'
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const dashboardStats = useMemo(() => {
    const revenue = transactions.reduce((acc, tx) => acc + tx.finalPrice, 0);
    const commission = transactions.reduce((acc, tx) => acc + tx.commissionAmount, 0);
    return { revenue, commission };
  }, [transactions]);

  const PartnerCard: React.FC<{ partner: typeof INSURANCE_COMPANIES[0] }> = ({ partner }) => (
    <div 
      className={`bg-white rounded-2xl border transition-all duration-300 group flex flex-col overflow-hidden ${
        activePartnerId === partner.id ? 'border-blue-500 shadow-[0_20px_40px_-15px_rgba(29,108,242,0.1)] ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      <div className="relative aspect-[16/9] bg-slate-50 overflow-hidden">
        <img 
          src={PARTNER_IMAGES[partner.id]} 
          alt={partner.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" 
        />
        {activePartnerId === partner.id && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-scaleIn">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h4 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{partner.name}</h4>
        <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
          Code: <span className="text-slate-700 font-bold">{partner.code}</span> • {commissionPercent}% Commission Rate
        </p>
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={() => {
              setActivePartnerId(partner.id);
              setViewMode('dashboard');
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider"
          >
            Open Dashboard
          </button>
          <div className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-fadeIn pb-20 relative">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[2000] animate-fadeIn">
          <div className={`px-6 py-3 rounded-full shadow-2xl font-bold text-xs text-white flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {notification.type === 'success' ? (
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            ) : (
               <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* Email Kit Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[2100] flex items-center justify-center p-6">
           <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-scaleIn border border-slate-200 overflow-hidden">
              <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Onboarding Kit</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Deliver assets to client inbox</p>
                 </div>
                 <button onClick={() => setIsEmailModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                 </button>
              </div>
              <form onSubmit={handleSendEmailKit} className="p-10 space-y-6">
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Client Email Address</label>
                    <input 
                       required
                       type="email"
                       placeholder="client@institutional-domain.com"
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-bold text-slate-900"
                       value={clientEmail}
                       onChange={(e) => setClientEmail(e.target.value)}
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Personal Briefing Note</label>
                    <textarea 
                       className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all font-medium text-slate-700 h-32 text-sm leading-relaxed"
                       value={emailNote}
                       onChange={(e) => setEmailNote(e.target.value)}
                    />
                 </div>
                 <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest">Included in Kit</p>
                       <p className="text-[10px] text-slate-600 font-bold mt-1 tracking-tight">Personalized QR Code • Campaign URL • Support PDF</p>
                    </div>
                 </div>
                 <button 
                    type="submit"
                    disabled={isSendingEmail}
                    className={`w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3 ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                 >
                    {isSendingEmail ? (
                       <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Transmitting Kit...
                       </>
                    ) : (
                       <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                          Initiate Transmission
                       </>
                    )}
                 </button>
              </form>
           </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Affiliate Hub</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Institutional portal management and referral performance tracking.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-full lg:w-auto">
          {['directory', 'dashboard', 'history', 'transactions'].map((mode) => (
            <button 
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`flex-1 lg:flex-none px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === mode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'directory' && (
        <div className="space-y-8 animate-scaleIn">
          <div className="flex items-center justify-between">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
               Connected Carriers ({INSURANCE_COMPANIES.length})
             </h3>
             <div className="relative group">
               <input type="text" placeholder="Search partners..." className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 transition-all shadow-sm" />
               <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {INSURANCE_COMPANIES.map(partner => (
              <PartnerCard key={partner.id} partner={partner} />
            ))}
          </div>
        </div>
      )}

      {viewMode === 'dashboard' && (
        <div className="space-y-8 animate-scaleIn">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div className="flex items-center gap-5">
                 <div className="p-1 border border-slate-100 rounded-xl bg-white shadow-sm overflow-hidden">
                    <img src={PARTNER_IMAGES[selectedPartner.id]} className="w-16 h-10 object-cover" alt="" />
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-900">{selectedPartner.name}</h2>
                    <p className="text-slate-500 font-medium text-xs mt-0.5 uppercase tracking-wider">{commissionPercent}% Tier Level Performance</p>
                 </div>
              </div>
              <button onClick={() => setShowPreview(true)} className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">Live Preview</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'Total Clicks', value: '12.4k', trend: '↑ 8%', icon: '🖱️' },
                { label: 'Conversions', value: '5.8%', trend: '↑ 1.2%', icon: '📈' },
                { label: 'Gross Revenue', value: `₹${(dashboardStats.revenue + 2450000).toLocaleString()}`, trend: 'Live', icon: '💰' },
                { label: 'Commission', value: `₹${(dashboardStats.commission + (2450000 * commissionPercent / 100)).toLocaleString()}`, trend: 'Pending', icon: '💎' }
              ].map((stat, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 p-6 rounded-2xl group hover:border-blue-200 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    <span className="text-lg">{stat.icon}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
                  <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase">{stat.trend}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-slate-100 p-6 h-72">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Customer Acquisition by Segment</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_CHART_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                    <YAxis hide />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {MOCK_CHART_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-900 rounded-2xl p-8 text-white flex flex-col justify-between overflow-hidden relative">
                <div className="relative z-10">
                   <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Institutional Payout Status</h4>
                   <p className="text-lg font-bold leading-snug">Minimum threshold met. Next automated settlement scheduled for Feb 10, 2025.</p>
                </div>
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Volume Growth:</span>
                    <span className="font-bold text-white">Tier 4 (18%) Unlock: 65% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-[65%]"></div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-1/4 -translate-y-1/4">
                  <svg className="w-48 h-48 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* REDESIGNED AFFILIATE LINK SYSTEM */}
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
            {/* Sidebar Segment Navigation */}
            <div className="w-full lg:w-72 bg-slate-50 border-r border-slate-200 p-6">
               <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Target Segments</h3>
               <nav className="space-y-1.5">
                  {(Object.keys(SEGMENT_DISCOUNTS) as AffiliateSegment[]).map(seg => (
                    <button
                      key={seg}
                      onClick={() => setSelectedSegment(seg)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all group ${
                        selectedSegment === seg 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-slate-500 hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      <span className="capitalize">{seg}</span>
                      <svg className={`w-4 h-4 transition-transform ${selectedSegment === seg ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  ))}
               </nav>
               <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">Active Offer</p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Selected segment receives <span className="text-blue-700 font-bold">{SEGMENT_DISCOUNTS[selectedSegment].discount_percent}% off</span> therapy packages.
                  </p>
               </div>
            </div>

            {/* Central Content Panel */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col h-full">
               <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Affiliate Distribution Hub</h3>
                    <p className="text-slate-500 text-sm mt-1">Configure and deploy unique tracking URLs for {selectedSegment} referrals.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowPreview(true)} className="p-2.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors" title="Live Preview">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                    </button>
                    <button onClick={() => handleCopyLink(currentLink)} className="p-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Quick Copy URL">
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-7 4h7m-7 4h3"/></svg>
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
                  {/* URL Management Area */}
                  <div className="md:col-span-2 space-y-6">
                     <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Adjudication URL</label>
                          <button 
                            onClick={() => handleCopyLink(currentLink)}
                            className="text-[9px] font-bold text-blue-600 uppercase tracking-widest hover:underline"
                          >
                            Copy Link
                          </button>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 font-mono text-[11px] text-blue-600 break-all leading-relaxed shadow-sm ring-1 ring-slate-100 group relative">
                           {currentLink}
                           <button 
                             onClick={() => handleCopyLink(currentLink)}
                             className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-slate-100"
                             title="Copy to Clipboard"
                           >
                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-7 4h7m-7 4h3"/></svg>
                           </button>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                           <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> UTM Tagged</span>
                           <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> SSL Secured</span>
                           <span className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg> Conversion Tracked</span>
                        </div>
                     </div>

                     <div className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">UTM Metadata Breakdown</label>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Source</p>
                              <p className="text-xs font-bold text-slate-900">{selectedPartner.id.toLowerCase()}</p>
                           </div>
                           <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Campaign</p>
                              <p className="text-xs font-bold text-slate-900">health2026</p>
                           </div>
                           <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Promo Code</p>
                              <p className="text-xs font-bold text-blue-600">{selectedPartner.id.toUpperCase()}20FREE</p>
                           </div>
                           <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Alternative Host</p>
                              <p className="text-xs font-bold text-slate-900">{subdomainLink}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Distribution & QR Assets */}
                  <div className="space-y-6">
                     <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col items-center justify-between group min-h-[300px] border border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Print Material Asset</p>
                        <div className="p-4 bg-white rounded-2xl shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                           <img 
                              src={qrUrl} 
                              alt="Affiliate QR Code"
                              className="w-32 h-32"
                           />
                        </div>
                        <div className="mt-6 w-full space-y-2">
                           <button 
                             onClick={handleDownloadQR}
                             className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 border border-white/5 active:scale-95"
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                              Download SVG
                           </button>
                           <button 
                             onClick={handleOpenEmailKit}
                             className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
                           >
                              Email Kit to Client
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </section>
        </div>
      )}

      {viewMode === 'transactions' && (
        <div className="space-y-6 animate-scaleIn">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Affiliate Transaction Ledger</h3>
                    <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-wider">Historical performance & commission records</p>
                 </div>
              </div>

              {transactions.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                   </div>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No transaction data available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                       <tr>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segment</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Final Price</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Commission</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Split Test</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {transactions.map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50 transition-all text-sm group">
                            <td className="px-10 py-5 whitespace-nowrap">
                               <p className="font-bold text-slate-900">{new Date(tx.transactionDate).toLocaleDateString()}</p>
                               <p className="text-[10px] text-slate-400">{new Date(tx.transactionDate).toLocaleTimeString()}</p>
                            </td>
                            <td className="px-10 py-5">
                               <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                                  {tx.segment}
                               </span>
                            </td>
                            <td className="px-10 py-5 text-right font-bold text-slate-900">₹{tx.finalPrice.toLocaleString()}</td>
                            <td className="px-10 py-5 text-right font-extrabold text-emerald-600">₹{tx.commissionAmount.toLocaleString()}</td>
                            <td className="px-10 py-5 text-center">
                               <span className="text-[10px] font-bold text-slate-400 uppercase">Control {tx.variant}</span>
                            </td>
                            <td className="px-10 py-5 text-right">
                               <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Settled</span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      )}

      {viewMode === 'history' && (
        <div className="space-y-6 animate-scaleIn">
           <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Verified Policy Ledger</h3>
                    <p className="text-slate-500 font-medium text-xs mt-1 uppercase tracking-wider">Real-time audit of eligibility checks via affiliate channels</p>
                 </div>
              </div>

              {verificationHistory.length === 0 ? (
                <div className="p-20 text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 21l1.9-8.128a1 1 0 00-1.727-1.013L7 16l2.1-8.128a1 1 0 00-1.727-1.013L5 11l1.9-8.128a1 1 0 011.727 1.013L7 12l2.1 8.128a1 1 0 01-1.727 1.013L12 13l2.1 8.128a1 1 0 01-1.727 1.013L15 16l2.1-8.128a1 1 0 00-1.727-1.013L12 11l1.9-8.128a1 1 0 001.727 1.013L15 12l2.1 8.128a1 1 0 001.727 1.013L21 9"/></svg>
                   </div>
                   <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No verification history available</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                       <tr>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified At</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Insurance Partner</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Segment</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Policy Identifier</th>
                          <th className="px-10 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                       {verificationHistory.map(record => (
                         <tr key={record.id} className="hover:bg-slate-50 transition-all group">
                            <td className="px-10 py-5 whitespace-nowrap font-bold text-slate-900">
                               {new Date(record.timestamp).toLocaleString()}
                            </td>
                            <td className="px-10 py-5">
                               <div className="flex items-center gap-3">
                                  <div className="w-8 h-5 rounded border border-slate-100 overflow-hidden shadow-sm bg-white">
                                    <img src={PARTNER_IMAGES[record.partnerId]} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <span className="font-bold text-slate-700">{record.partnerName}</span>
                               </div>
                            </td>
                            <td className="px-10 py-5">
                               <span className="text-[10px] font-bold uppercase text-slate-500">{record.segment}</span>
                            </td>
                            <td className="px-10 py-5 font-mono text-xs font-bold text-blue-600">{record.policyNumber}</td>
                            <td className="px-10 py-5 text-right">
                               <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Authorized</span>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-slate-950 z-[1000] overflow-y-auto">
          <div className="min-h-screen bg-white">
            <div className="sticky top-0 right-0 p-6 flex justify-end bg-transparent z-[1001] pointer-events-none">
              <button 
                onClick={() => setShowPreview(false)}
                className="pointer-events-auto bg-slate-900/10 hover:bg-slate-900/20 backdrop-blur-md px-6 py-3 rounded-full text-slate-900 font-bold uppercase text-[10px] tracking-widest border border-slate-900/10 transition-colors"
              >
                Close Preview
              </button>
            </div>
            <AffiliatePartnership 
              customSegment={selectedSegment} 
              customPartnerId={activePartnerId} 
              onVerificationSuccess={handleVerificationSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateManager;
