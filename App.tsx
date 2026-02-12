
import React, { useState, useMemo } from 'react';
import VerificationService from './components/VerificationService';
import CostCalculator from './components/CostCalculator';
import ClaimTracker from './components/ClaimTracker';
import PolicyManager from './components/PolicyManager';
import PartnerPortal from './components/PartnerPortal';
import AffiliateManager from './components/AffiliateManager';
import { INSURANCE_COMPANIES, MOCK_CLAIMS, MOCK_POLICIES } from './constants';
import { geminiService } from './services/geminiService';
import { InsuranceCompany, ClaimStatus, InsurancePolicy, InsuranceClaim, AuditEntry, PolicyHistoryEntry, VerificationStatus } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'verify' | 'costs' | 'claims' | 'audit' | 'partner-portal' | 'affiliate-partnership'>('overview');
  const [selectedPartnerResearch, setSelectedPartnerResearch] = useState<InsuranceCompany | null>(null);
  const [researchData, setResearchData] = useState<string | null>(null);
  const [isLoadingResearch, setIsLoadingResearch] = useState(false);
  const [partnerNotes, setPartnerNotes] = useState<Record<string, string>>({});
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [tempNote, setTempNote] = useState('');

  // Global State for Persistence
  const [policies, setPolicies] = useState<InsurancePolicy[]>(MOCK_POLICIES);
  const [claims, setClaims] = useState<InsuranceClaim[]>(MOCK_CLAIMS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    { id: 'a1', timestamp: new Date().toISOString(), action: 'System Initialized', category: 'system', details: 'All gateways connected and synchronized.', status: 'success' },
    { id: 'a2', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Policy Verified', category: 'policy', details: 'Policy BAJ-992211 verified by Bajaj Allianz.', status: 'success' }
  ]);

  const addAuditLog = (action: string, category: AuditEntry['category'], details: string, status: AuditEntry['status'] = 'info') => {
    const newEntry: AuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      details,
      status
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  const updatePolicyWithTrigger = (updatedPolicy: InsurancePolicy) => {
    setPolicies(prevPolicies => {
      return prevPolicies.map(oldPolicy => {
        if (oldPolicy.id !== updatedPolicy.id) return oldPolicy;

        const historyEntries: PolicyHistoryEntry[] = [...(updatedPolicy.history || [])];
        const fieldsToWatch: (keyof InsurancePolicy)[] = ['sessionsRemaining', 'copayAmount', 'verificationStatus'];

        fieldsToWatch.forEach(field => {
          if (oldPolicy[field] !== updatedPolicy[field]) {
            const entry: PolicyHistoryEntry = {
              id: `trig-${Date.now()}-${field}`,
              timestamp: new Date().toISOString(),
              event: `Auto-Trigger: ${field} modified`,
              field: field.toString(),
              oldValue: oldPolicy[field],
              newValue: updatedPolicy[field]
            };
            historyEntries.unshift(entry);
            addAuditLog('Policy Auto-Audit', 'policy', `System trigger recorded ${field} change for ${updatedPolicy.policyNumber}`, 'info');
          }
        });

        return { ...updatedPolicy, history: historyEntries };
      });
    });
  };

  const handlePartnerClick = async (partner: InsuranceCompany) => {
    setSelectedPartnerResearch(partner);
    setIsLoadingResearch(true);
    setResearchData(null);
    setIsEditingNote(false);
    setTempNote(partnerNotes[partner.id] || '');
    addAuditLog('Partner Research', 'system', `Requested API specs for ${partner.name}`);
    try {
      const data = await geminiService.researchProviderAPIs(partner.name);
      setResearchData(data);
    } catch (err) {
      setResearchData("API specification research failed. MANAS360 Sandbox is currently under maintenance.");
    } finally {
      setIsLoadingResearch(false);
    }
  };

  const savePartnerNote = () => {
    if (selectedPartnerResearch) {
      setPartnerNotes(prev => ({ ...prev, [selectedPartnerResearch.id]: tempNote }));
      setIsEditingNote(false);
      addAuditLog('Partner Statement Updated', 'system', `Custom statement added for ${selectedPartnerResearch.name}`, 'success');
    }
  };

  const dashboardStats = useMemo(() => {
    const totalPaid = claims.filter(c => c.status === ClaimStatus.PAID).reduce((acc, c) => acc + (c.insurancePayment || 0), 0);
    const totalPending = claims.filter(c => c.status === ClaimStatus.UNDER_REVIEW || c.status === ClaimStatus.APPROVED).reduce((acc, c) => acc + (c.billedAmount || 0), 0);
    const openClaims = claims.filter(c => c.status !== ClaimStatus.PAID && c.status !== ClaimStatus.DENIED).length;
    
    return {
      totalPaid,
      totalPending,
      openClaims,
      efficiency: '94%'
    };
  }, [claims]);

  const NavItem = ({ id, label, icon, badge }: { id: typeof activeTab, label: string, icon: React.ReactNode, badge?: number }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-4 px-6 py-4 w-full rounded-full transition-all duration-300 ease-in-out group relative ${
        activeTab === id 
          ? 'bg-[#1D6CF2] text-white shadow-lg shadow-blue-200/40 font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-[#1D6CF2] font-semibold'
      }`}
    >
      <span className={`transition-transform duration-300 ${activeTab === id ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </span>
      <span className="tracking-tight text-xs uppercase tracking-wider text-left">{label}</span>
      {badge && badge > 0 && (
        <span className="absolute right-6 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
          {badge}
        </span>
      )}
    </button>
  );

  const getStatusCount = (status: ClaimStatus) => claims.filter(c => c.status === status).length;

  return (
    <div className="min-h-screen bg-[#f0f7ff] flex flex-col lg:flex-row font-sans selection:bg-blue-100 selection:text-blue-900 antialiased">
      {/* Sidebar: Enterprise Hub */}
      <aside className="w-80 bg-white border-r border-slate-200/50 p-8 hidden lg:flex flex-col sticky top-0 h-screen z-50">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-11 h-11 bg-[#1D6CF2] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-100">
            M
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">MANAS360</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-[#1D6CF2] rounded-full"></span>
              InsuraSync
            </p>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1 overflow-y-auto pr-2 custom-scroll">
          <NavItem id="overview" label="Dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>} />
          <NavItem id="policies" label="Policies" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>} />
          <NavItem id="verify" label="Verify" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>} />
          <NavItem id="costs" label="Calculator" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>} />
          <NavItem id="claims" label="Claims" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>} />
          <NavItem id="affiliate-partnership" label="Affiliate Program" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>} />
          <NavItem id="partner-portal" label="Partner Sync" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>} />
          <NavItem id="audit" label="Audit Log" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} badge={auditLogs.length} />
        </nav>

        <div className="mt-auto border-t border-slate-100 pt-8">
          <div className="bg-[#f8fafc] rounded-3xl p-6 border border-slate-200/60 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Partners</span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {INSURANCE_COMPANIES.slice(0, 4).map(c => (
                <button 
                  key={c.id} 
                  onClick={() => handlePartnerClick(c)}
                  className="aspect-square rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[10px] font-extrabold text-slate-500 hover:border-[#1D6CF2] hover:text-[#1D6CF2] transition-all"
                >
                  {c.code.split('_')[0].slice(0, 2)}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center">v4.2 NDHM Compliant</p>
          </div>
        </div>
      </aside>

      {/* Main Experience Flow */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 px-10 py-6 sticky top-0 z-40 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Health Hub</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Session: Verified Gateway</p>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Network Authority</p>
              <p className="text-sm font-extrabold text-[#1D6CF2]">BAJAJ ALLIANZ</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-white flex items-center justify-center text-white font-extrabold text-lg shadow-xl shadow-slate-200 cursor-pointer" title="Admin Portal Control">
              JD
            </div>
          </div>
        </header>

        <div className="p-8 md:p-12 max-w-[1400px] mx-auto space-y-10 animate-fadeIn">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              {/* Primary Stats Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Carrier Paid', value: `₹${dashboardStats.totalPaid.toLocaleString()}`, color: 'text-emerald-600', trend: '↑ 12%' },
                  { label: 'Pending Reimbursement', value: `₹${dashboardStats.totalPending.toLocaleString()}`, color: 'text-amber-600', trend: 'In Queue' },
                  { label: 'Open Claims', value: dashboardStats.openClaims.toString().padStart(2, '0'), color: 'text-[#1D6CF2]', trend: 'Active' },
                  { label: 'Processing Index', value: dashboardStats.efficiency, color: 'text-emerald-600', trend: 'Optimal' }
                ].map((stat, i) => (
                  <div key={i} className="p-8 rounded-[2rem] border border-slate-200/60 bg-white shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className={`text-2xl font-extrabold ${stat.color} tracking-tight`}>{stat.value}</p>
                      <span className="text-[10px] font-bold text-slate-400">{stat.trend}</span>
                    </div>
                  </div>
                ))}
              </section>

              {/* Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Claim Distribution Summary */}
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-extrabold text-slate-900">Adjudication Pipeline</h3>
                      <button onClick={() => setActiveTab('claims')} className="text-[11px] font-extrabold text-[#1D6CF2] uppercase tracking-widest hover:underline">Manage Ledger</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { status: ClaimStatus.PAID, count: getStatusCount(ClaimStatus.PAID), color: 'bg-emerald-500' },
                        { status: ClaimStatus.DENIED, count: getStatusCount(ClaimStatus.DENIED), color: 'bg-rose-500' },
                        { status: ClaimStatus.UNDER_REVIEW, count: getStatusCount(ClaimStatus.UNDER_REVIEW), color: 'bg-amber-500' },
                        { status: ClaimStatus.APPROVED, count: getStatusCount(ClaimStatus.APPROVED), color: 'bg-blue-500' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                          <div className={`w-2.5 h-2.5 rounded-full ${item.color} mb-3`}></div>
                          <p className="text-2xl font-extrabold text-slate-900">{item.count}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{item.status}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Log Preview Component */}
                  <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-extrabold text-slate-900">System Activity Audit</h3>
                      <button onClick={() => setActiveTab('audit')} className="text-[11px] font-extrabold text-[#1D6CF2] uppercase tracking-widest hover:underline">Expand All</button>
                    </div>
                    <div className="space-y-4">
                      {auditLogs.slice(0, 4).map(log => (
                        <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                             log.status === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                           </div>
                           <div className="flex-1">
                             <div className="flex justify-between items-start">
                               <p className="text-sm font-bold text-slate-900">{log.action}</p>
                               <p className="text-[10px] font-bold text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</p>
                             </div>
                             <p className="text-xs text-slate-500 mt-1">{log.details}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Task Panel */}
                <div className="space-y-8">
                  <div className="bg-[#1D6CF2] p-10 rounded-[2.5rem] shadow-xl shadow-blue-200/50 text-white relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-125"></div>
                    <h3 className="text-xl font-extrabold mb-4">Benefit Discovery</h3>
                    <p className="text-sm text-blue-100 font-medium mb-8 leading-relaxed">Execute live FHIR-compliant verification for patient eligibility.</p>
                    <button 
                      onClick={() => setActiveTab('verify')}
                      className="w-full py-4 bg-white text-[#1D6CF2] rounded-full font-extrabold text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                    >
                      Init Discovery
                    </button>
                  </div>
                  
                  {/* Gateway Connectivity Status */}
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Gateway Status</h3>
                      <button onClick={() => setActiveTab('partner-portal')} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Sync Portal</button>
                    </div>
                    <div className="space-y-4">
                      {INSURANCE_COMPANIES.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-transparent hover:border-slate-200 transition-all cursor-pointer" onClick={() => handlePartnerClick(c)}>
                           <div className="flex items-center gap-3">
                              <span className={`w-2 h-2 rounded-full ${c.supportsRealtimeVerification ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              <span className="text-[11px] font-bold text-slate-700">{c.name.split(' ')[0]}</span>
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase">API: {c.supportsRealtimeVerification ? 'LIVE' : 'LEGACY'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <PolicyManager 
              policies={policies} 
              onAddPolicy={(p) => {
                setPolicies(prev => [p, ...prev]);
                addAuditLog('New Policy Linked', 'policy', `Linked policy ${p.policyNumber} for ${p.policyHolderName}`, 'success');
              }}
              onUpdatePolicy={updatePolicyWithTrigger}
            />
          )}
          {activeTab === 'verify' && (
            <VerificationService onVerify={(res) => {
              addAuditLog('Benefits Verified', 'verification', `Verified benefits for policy identifier: ${res.policyId}`, 'success');
              const policyToUpdate = policies.find(p => p.policyNumber === res.policyId || p.memberId === res.policyId);
              if (policyToUpdate) {
                updatePolicyWithTrigger({ ...policyToUpdate, verificationStatus: VerificationStatus.VERIFIED });
              }
            }} />
          )}
          {activeTab === 'costs' && <CostCalculator />}
          {activeTab === 'claims' && (
            <ClaimTracker 
              claims={claims} 
              onUpdateClaim={(updated) => {
                setClaims(prev => prev.map(c => c.id === updated.id ? updated : c));
                addAuditLog('Claim Updated', 'claim', `Adjudication update for claim ${updated.claimNumber}`, 'info');
              }}
              onAddClaim={(newClaim) => {
                setClaims(prev => [newClaim, ...prev]);
                addAuditLog('New Claim Filed', 'claim', `Electronic submission for ${newClaim.claimNumber}`, 'success');
              }}
              addAuditLog={addAuditLog}
            />
          )}
          {activeTab === 'partner-portal' && <PartnerPortal />}
          {activeTab === 'affiliate-partnership' && <AffiliateManager />}
          {activeTab === 'audit' && (
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-10">
               <div className="flex justify-between items-end">
                 <div>
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Audit Log</h2>
                   <p className="text-slate-500 font-bold mt-2">Historical immutable record of institutional interactions.</p>
                 </div>
                 <button onClick={() => setAuditLogs([])} className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">Purge Records</button>
               </div>
               <div className="space-y-6">
                 {auditLogs.map(log => (
                   <div key={log.id} className="flex gap-6 p-6 rounded-[2rem] bg-slate-50 border border-slate-100 hover:border-[#1D6CF2]/30 transition-all">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                        log.status === 'success' ? 'bg-emerald-500 text-white' : 'bg-[#1D6CF2] text-white'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mr-3 ${
                              log.category === 'policy' ? 'bg-blue-100 text-blue-700' : log.category === 'claim' ? 'bg-amber-100 text-amber-700' : log.category === 'sync' ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {log.category}
                            </span>
                            <p className="text-lg font-extrabold text-slate-900 mt-1">{log.action}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-400">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 font-medium">{log.details}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Spec Modal */}
      {selectedPartnerResearch && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn border-[12px] border-white/50">
            <div className="p-10 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">{selectedPartnerResearch.name}</h3>
                <p className="text-[10px] text-[#1D6CF2] font-extrabold uppercase tracking-widest mt-1">Integration Specification v1.4</p>
              </div>
              <button onClick={() => setSelectedPartnerResearch(null)} className="p-3 hover:bg-slate-200 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto flex-1 flex flex-col gap-8 bg-slate-900">
              {isLoadingResearch ? (
                <div className="py-24 text-center">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-[#1D6CF2] rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest">Compiling HL7/FHIR schemas...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-slate-300 font-mono text-xs leading-loose whitespace-pre-wrap">
                    {researchData}
                  </div>
                  
                  {(partnerNotes[selectedPartnerResearch.id] || isEditingNote) && (
                    <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-2xl animate-fadeIn">
                       <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                         Provider Supplemental Statement
                       </h4>
                       {isEditingNote ? (
                         <div className="space-y-4">
                            <textarea 
                              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-xs focus:border-blue-500 focus:outline-none h-32"
                              placeholder="Enter additional statements or terms for this provider..."
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                            />
                            <div className="flex gap-4">
                              <button 
                                onClick={savePartnerNote}
                                className="px-6 py-2 bg-blue-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all"
                              >
                                Commit Note
                              </button>
                              <button 
                                onClick={() => setIsEditingNote(false)}
                                className="px-6 py-2 bg-slate-700 text-slate-300 rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-600 transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                         </div>
                       ) : (
                         <div className="text-slate-200 text-sm font-medium leading-relaxed italic border-l-4 border-blue-500/50 pl-6 py-2">
                           {partnerNotes[selectedPartnerResearch.id]}
                         </div>
                       )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t flex flex-wrap justify-end gap-4">
               {!isEditingNote && (
                  <button 
                    onClick={() => setIsEditingNote(true)}
                    className="px-10 py-4 bg-white border-2 border-slate-200 text-slate-600 font-extrabold rounded-full hover:bg-slate-100 transition-all uppercase tracking-widest text-[11px] flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    Add Statement
                  </button>
               )}
               <button onClick={() => setSelectedPartnerResearch(null)} className="px-10 py-4 bg-[#1D6CF2] text-white font-extrabold rounded-full shadow-lg shadow-blue-200/50 hover:opacity-90 transition-all uppercase tracking-widest text-[11px]">
                 Acknowledge & Close
               </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; }
        ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default App;
