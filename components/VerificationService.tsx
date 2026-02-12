
import React, { useState } from 'react';
import { INSURANCE_COMPANIES } from '../constants';

interface VerificationServiceProps {
  onVerify: (result: any) => void;
}

const VerificationService: React.FC<VerificationServiceProps> = ({ onVerify }) => {
  const [policyId, setPolicyId] = useState('');
  const [partnerId, setPartnerId] = useState(INSURANCE_COMPANIES[0].id);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleVerify = () => {
    if (!policyId) return;
    setIsVerifying(true);
    setResult(null);

    // Simulate Instant Local Lookup (<1s) as per Specification
    const isLocalMatch = Math.random() > 0.2; // 80% chance for mock local match
    const delay = isLocalMatch ? 600 : 2500;

    setTimeout(() => {
      const mockResult = {
        policyId,
        status: 'Active',
        coverage: '80% In-Network (Mental Health)',
        remainingDeductible: 320,
        requirements: ['Pre-authorization required for > 10 sessions', 'Claim must use ICD-10 F-codes'],
        timestamp: new Date().toLocaleTimeString(),
        source: isLocalMatch ? 'LOCAL_CACHE' : 'REAL_TIME_API',
        latency: isLocalMatch ? '< 1s' : '10-30s'
      };
      setIsVerifying(false);
      setResult(mockResult);
      onVerify(mockResult);
    }, delay);
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            Instant Eligibility Verification
          </h2>
          <p className="text-sm text-slate-500 font-medium">Bulk Member Sync enabled for &lt;1s response time</p>
        </div>
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Local Lookup Active</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Select Provider</label>
            <select 
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="w-full px-4 py-4 border-2 border-slate-50 rounded-2xl focus:ring-2 focus:ring-[#1D6CF2] focus:outline-none bg-slate-50 font-bold text-slate-900"
            >
              {INSURANCE_COMPANIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Member ID / Policy Number / Phone</label>
            <input 
              type="text" 
              placeholder="e.g. BAJ-12345678 or 9876543210"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              className="w-full px-4 py-4 border-2 border-slate-50 rounded-2xl focus:ring-2 focus:ring-[#1D6CF2] focus:outline-none bg-slate-50 font-bold text-slate-900"
            />
          </div>
        </div>

        <button 
          onClick={handleVerify}
          disabled={isVerifying || !policyId}
          className={`w-full py-4 rounded-full font-black text-white transition-all transform active:scale-95 shadow-xl ${
            isVerifying ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-[#1D6CF2] hover:opacity-90 shadow-blue-100'
          }`}
        >
          {isVerifying ? 'Checking local member database...' : 'Perform Eligibility Check'}
        </button>

        {result && (
          <div className="mt-8 p-6 bg-white border-2 border-emerald-100 rounded-[2rem] animate-fadeIn shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <div>
                  <p className="text-emerald-800 font-black text-sm uppercase">Verification Succeeded</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase tracking-tighter">Source: {result.source}</span>
                    <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tighter">Latency: {result.latency}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Coverage Status</p>
                <p className="font-black text-slate-800">{result.coverage}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mb-1">Ded. Remaining</p>
                <p className="font-black text-slate-800">₹{result.remainingDeductible}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50/30 rounded-2xl border border-blue-50">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Requirements</p>
               <ul className="space-y-1">
                 {result.requirements.map((r: string, i: number) => (
                   <li key={i} className="text-xs text-slate-600 font-medium flex items-center gap-2">
                     <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                     {r}
                   </li>
                 ))}
               </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationService;
