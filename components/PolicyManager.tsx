
import React, { useState } from 'react';
import { INSURANCE_COMPANIES } from '../constants';
import { InsurancePolicy, VerificationStatus, PolicyHistoryEntry } from '../types';

interface PolicyManagerProps {
  policies: InsurancePolicy[];
  onAddPolicy: (policy: InsurancePolicy) => void;
  onUpdatePolicy: (policy: InsurancePolicy) => void;
}

const PolicyManager: React.FC<PolicyManagerProps> = ({ policies, onAddPolicy, onUpdatePolicy }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedHistoryPolicy, setSelectedHistoryPolicy] = useState<InsurancePolicy | null>(null);
  const [newPolicy, setNewPolicy] = useState<Partial<InsurancePolicy>>({
    insuranceCompanyId: INSURANCE_COMPANIES[0].id,
    relationship: 'self',
    startDate: new Date().toISOString().split('T')[0]
  });

  const getCompanyName = (id: string) => INSURANCE_COMPANIES.find(c => c.id === id)?.name || 'Unknown';

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const policy: InsurancePolicy = {
      ...newPolicy as InsurancePolicy,
      id: `p-${Date.now()}`,
      patientId: 'u1',
      verificationStatus: VerificationStatus.PENDING,
      copayAmount: 500,
      coveragePercent: 80,
      deductibleAmount: 2000,
      deductibleRemaining: 2000,
      sessionsRemaining: 12,
      maxSessionsPerYear: 12,
      requiresPreAuth: true,
      preAuthObtained: false,
      history: [{ id: `h-${Date.now()}`, timestamp: new Date().toISOString(), event: 'Policy Provisioned: Initial History Saved' }]
    };
    onAddPolicy(policy);
    setShowAddForm(false);
  };

  const updateField = (policy: InsurancePolicy, field: keyof InsurancePolicy, newValue: any) => {
    onUpdatePolicy({ ...policy, [field]: newValue });
  };

  return (
    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-slate-200/40 border border-slate-200/60">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-10 mb-16">
        <div>
          <h2 className="text-4xl font-black text-slate-900 flex items-center gap-5 tracking-tighter">
            <div className="w-12 h-12 rounded-2xl bg-[#1D6CF2] text-white flex items-center justify-center shadow-lg shadow-blue-100">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            Policy Vault
          </h2>
          <p className="text-lg text-slate-500 font-bold mt-2 ml-1 ml-17">Audit-ready lifecycle tracking with automatic field triggers.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#1D6CF2] text-white px-10 py-5 rounded-full text-base font-black hover:opacity-90 transition-all shadow-2xl shadow-blue-200/50 flex items-center gap-4 active:scale-95 group uppercase tracking-widest"
        >
          <svg className="w-7 h-7 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          Add New Policy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {policies.map(policy => (
          <div key={policy.id} className="relative p-12 rounded-[3.5rem] border-2 border-slate-100/80 bg-white shadow-sm hover:border-[#1D6CF2] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-50/40 rounded-full group-hover:bg-blue-50 transition-colors duration-700"></div>
            
            <div className="flex justify-between items-start mb-12 relative z-10">
              <div>
                <p className="text-[11px] font-black text-[#1D6CF2] uppercase tracking-[0.4em] mb-2">{getCompanyName(policy.insuranceCompanyId)}</p>
                <p className="text-3xl font-black text-slate-900 tracking-tighter">{policy.policyNumber}</p>
                <div className="flex items-center gap-4 mt-3">
                  <button 
                    onClick={() => setSelectedHistoryPolicy(policy)}
                    className="flex items-center gap-1.5 text-[10px] font-black text-[#1D6CF2] uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-full hover:bg-[#1D6CF2] hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    History Audit Log
                  </button>
                </div>
              </div>
              <button 
                onClick={() => updateField(policy, 'verificationStatus', policy.verificationStatus === VerificationStatus.VERIFIED ? VerificationStatus.PENDING : VerificationStatus.VERIFIED)}
                className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all ${
                policy.verificationStatus === VerificationStatus.VERIFIED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
              }`}>
                {policy.verificationStatus}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-8 mb-12 relative z-10">
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100/50">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Patient Account</p>
                <p className="text-lg font-black text-slate-800 truncate tracking-tight">{policy.policyHolderName}</p>
              </div>
              <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-100/50 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Co-pay Amount</p>
                  <button onClick={() => updateField(policy, 'copayAmount', policy.copayAmount + 100)} className="text-[#1D6CF2] font-black text-[10px]">+</button>
                </div>
                <p className="text-lg font-black text-slate-800 tracking-tight">₹{policy.copayAmount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-end">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Session Counter (Trigger Field)</p>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => updateField(policy, 'sessionsRemaining', Math.max(0, (policy.sessionsRemaining || 0) - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-blue-100 transition-colors shadow-sm"
                   >
                     -
                   </button>
                   <p className="text-sm font-black text-[#1D6CF2] tracking-tighter">{policy.sessionsRemaining || 0} / {policy.maxSessionsPerYear || 12}</p>
                   <button 
                    onClick={() => updateField(policy, 'sessionsRemaining', Math.min((policy.maxSessionsPerYear || 12), (policy.sessionsRemaining || 0) + 1))}
                    className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900 hover:bg-blue-100 transition-colors shadow-sm"
                   >
                     +
                   </button>
                </div>
              </div>
              <div className="h-4 w-full bg-slate-100/80 rounded-full overflow-hidden shadow-inner border border-slate-200/30 p-1">
                <div 
                  className="h-full bg-[#1D6CF2] rounded-full shadow-[0_0_15px_rgba(29,108,242,0.5)] transition-all duration-1000 ease-out"
                  style={{ width: `${((policy.sessionsRemaining || 0) / (policy.maxSessionsPerYear || 12)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {selectedHistoryPolicy && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[130] flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] p-16 max-w-2xl w-full shadow-2xl animate-scaleIn border-[14px] border-white/50 flex flex-col max-h-[85vh]">
            <div className="mb-10 flex justify-between items-start">
               <div>
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Automatic History Log</h3>
                 <p className="text-slate-500 font-bold mt-2">Audit trail for policy {selectedHistoryPolicy.policyNumber}</p>
                 <p className="text-[10px] text-[#1D6CF2] font-black uppercase mt-1">Watching: Sessions, Copay, Status</p>
               </div>
               <button onClick={() => setSelectedHistoryPolicy(null)} className="p-3 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
                 <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scroll">
              {(selectedHistoryPolicy.history || []).length === 0 ? (
                <p className="text-center text-slate-400 py-10 font-bold italic">No triggers captured yet.</p>
              ) : (
                selectedHistoryPolicy.history.map((entry) => (
                  <div key={entry.id} className="relative flex gap-6 pb-8 border-l-2 border-slate-100 ml-3 pl-8 last:border-0 last:pb-0">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-[#1D6CF2] border-4 border-white shadow-sm"></div>
                    <div className="w-full">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(entry.timestamp).toLocaleString()}</p>
                      <p className="text-lg font-extrabold text-slate-900 mt-1">{entry.event}</p>
                      {entry.field && (
                        <div className="mt-3 text-sm font-bold text-slate-600 flex items-center justify-between bg-slate-50/80 p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">Old State</span>
                            <span className="text-slate-400 line-through decoration-rose-400/50">{String(entry.oldValue)}</span>
                          </div>
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                             <svg className="w-5 h-5 text-[#1D6CF2]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-[9px] text-slate-400 uppercase tracking-wider mb-1">New State</span>
                            <span className="text-[#1D6CF2] font-black">{String(entry.newValue)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secure Policy Entry Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[120] flex items-center justify-center p-6">
          <form onSubmit={handleAdd} className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl animate-scaleIn border-[14px] border-white/50">
            <div className="mb-12 text-center">
              <div className="w-20 h-20 bg-blue-50 text-[#1D6CF2] rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-100/20">
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Vault Encryption</h3>
              <p className="text-slate-500 font-bold mt-3">Link institutional credentials with automatic history persistence.</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-3">Insurance Carrier</label>
                <select 
                  className="w-full border-4 border-slate-50 p-6 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900 text-lg transition-all appearance-none cursor-pointer"
                  value={newPolicy.insuranceCompanyId}
                  onChange={(e) => setNewPolicy({...newPolicy, insuranceCompanyId: e.target.value})}
                >
                  {INSURANCE_COMPANIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-3">Policy Number</label>
                  <input 
                    required
                    className="w-full border-4 border-slate-50 p-6 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900 transition-all placeholder:text-slate-300"
                    placeholder="E.g. BAJ-8801"
                    onChange={(e) => setNewPolicy({...newPolicy, policyNumber: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-3">Member ID</label>
                  <input 
                    className="w-full border-4 border-slate-50 p-6 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900 transition-all placeholder:text-slate-300"
                    placeholder="REQUIRED"
                    onChange={(e) => setNewPolicy({...newPolicy, memberId: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-3">Legal Cardholder Name</label>
                <input 
                  required
                  className="w-full border-4 border-slate-50 p-6 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900 transition-all placeholder:text-slate-300 uppercase"
                  placeholder="EXACTLY AS ON CARD"
                  onChange={(e) => setNewPolicy({...newPolicy, policyHolderName: e.target.value})}
                />
              </div>
            </div>
            
            <div className="mt-16 flex gap-6">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                className="flex-1 py-6 font-black text-slate-400 hover:text-slate-900 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-all text-lg uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-6 font-black text-white bg-[#1D6CF2] rounded-full shadow-2xl shadow-blue-200/50 hover:opacity-90 transition-all active:scale-95 text-lg uppercase tracking-widest"
              >
                Secure Link
              </button>
            </div>
          </form>
        </div>
      )}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PolicyManager;
