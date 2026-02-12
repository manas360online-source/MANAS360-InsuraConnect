
import React, { useState, useMemo } from 'react';
import { ClaimStatus, InsuranceClaim } from '../types';
import { geminiService } from '../services/geminiService';

interface ClaimTrackerProps {
  claims: InsuranceClaim[];
  onUpdateClaim: (claim: InsuranceClaim) => void;
  onAddClaim: (claim: InsuranceClaim) => void;
  addAuditLog: (action: string, category: 'claim' | 'policy' | 'verification' | 'system', details: string, status?: 'success' | 'info' | 'warning') => void;
}

const ClaimTracker: React.FC<ClaimTrackerProps> = ({ claims, onUpdateClaim, onAddClaim, addAuditLog }) => {
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [showNewClaimForm, setShowNewClaimForm] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [appealLetter, setAppealLetter] = useState<string | null>(null);
  const [isGeneratingAppeal, setIsGeneratingAppeal] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [selectedClaimIds, setSelectedClaimIds] = useState<Set<string>>(new Set());

  // Form State
  const [newClaim, setNewClaim] = useState<Partial<InsuranceClaim>>({
    serviceDate: new Date().toISOString().split('T')[0],
    procedureCode: '90834',
    billedAmount: 3000,
    diagnosisCode: 'F41.1'
  });

  const selectedClaimsData = useMemo(() => {
    return claims.filter(c => selectedClaimIds.has(c.id));
  }, [claims, selectedClaimIds]);

  const totalSelectedAmount = useMemo(() => {
    return selectedClaimsData.reduce((sum, c) => sum + c.billedAmount, 0);
  }, [selectedClaimsData]);

  const getStatusColor = (status: ClaimStatus) => {
    switch(status) {
      case ClaimStatus.PAID: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case ClaimStatus.APPROVED: return 'bg-blue-50 text-blue-700 border-blue-100';
      case ClaimStatus.UNDER_REVIEW: return 'bg-amber-50 text-amber-700 border-amber-100';
      case ClaimStatus.DENIED: return 'bg-rose-50 text-rose-700 border-rose-100';
      case ClaimStatus.APPEALED: return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleExplain = async (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setIsExplaining(true);
    setExplanation(null);
    setAppealLetter(null);
    addAuditLog('AI Analysis', 'claim', `Deconstructing denial for claim ${claim.claimNumber}`);
    try {
      const result = await geminiService.explainDenial(claim.denialReason || 'Policy exclusion or mismatch', claim);
      setExplanation(result);
    } catch (e) { console.error(e); }
    finally { setIsExplaining(false); }
  };

  const handleAppealGen = async () => {
    if (!selectedClaim || !explanation) return;
    setIsGeneratingAppeal(true);
    try {
      const letter = await geminiService.generateAppealLetter(
        {...selectedClaim, patientName: 'John Doe'}, 
        explanation.explanation
      );
      setAppealLetter(letter);
      addAuditLog('Appeal Synthesized', 'claim', `Generated formal appeal document for ${selectedClaim.claimNumber}`, 'success');
    } catch (e) { console.error(e); }
    finally { setIsGeneratingAppeal(false); }
  };

  const handleVerifyStatement = async (claimId: string) => {
    const claim = claims.find(c => c.id === claimId);
    if (!claim) return;
    setIsProcessingAction(claimId + '-verify');
    await new Promise(r => setTimeout(r, 1500));
    
    onUpdateClaim({
      ...claim,
      updatedAt: new Date().toISOString().split('T')[0]
    });

    setIsProcessingAction(null);
    setFeedback({ message: 'Statement successfully verified against carrier records.', type: 'success' });
    addAuditLog('Statement Verified', 'claim', `Claim ${claim.claimNumber} verified manually.`, 'success');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSubmitAppeal = async () => {
    if (!selectedClaim) return;
    setIsProcessingAction('submit-appeal');
    await new Promise(r => setTimeout(r, 2000));
    
    const updatedClaim: InsuranceClaim = { 
      ...selectedClaim, 
      status: ClaimStatus.APPEALED, 
      updatedAt: new Date().toISOString().split('T')[0] 
    };
    onUpdateClaim(updatedClaim);
    addAuditLog('Appeal Submitted', 'claim', `Electronic submission of appeal for ${selectedClaim.claimNumber}`, 'success');

    setIsProcessingAction(null);
    setFeedback({ message: 'Appeal submitted electronically to carrier gateway.', type: 'success' });
    setTimeout(() => {
      setFeedback(null);
      setSelectedClaim(null);
    }, 2000);
  };

  const handleCreateNewClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingAction('create-claim');
    await new Promise(r => setTimeout(r, 1500));

    const claim: InsuranceClaim = {
      id: `clm-${Date.now()}`,
      sessionId: `s-${Date.now()}`,
      claimNumber: `MANAS360-CLM-2024-${Math.floor(Math.random() * 9000 + 1000)}`,
      serviceDate: newClaim.serviceDate!,
      serviceType: 'psychotherapy',
      diagnosisCode: newClaim.diagnosisCode!,
      procedureCode: newClaim.procedureCode!,
      billedAmount: newClaim.billedAmount!,
      status: ClaimStatus.UNDER_REVIEW,
      updatedAt: new Date().toISOString().split('T')[0],
      appealFiled: false
    };

    onAddClaim(claim);
    setShowNewClaimForm(false);
    setIsProcessingAction(null);
    setFeedback({ message: 'Claim submitted electronically to clearinghouse.', type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  const toggleClaimSelection = (id: string) => {
    const newSelected = new Set(selectedClaimIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedClaimIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedClaimIds.size === claims.length) {
      setSelectedClaimIds(new Set());
    } else {
      setSelectedClaimIds(new Set(claims.map(c => c.id)));
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedClaimIds.size === 0) return;
    setIsProcessingAction('bulk-submit');
    setShowBulkConfirm(false);
    await new Promise(r => setTimeout(r, 2500));

    const updatedClaimsCount = selectedClaimIds.size;
    selectedClaimIds.forEach(id => {
      const claim = claims.find(c => c.id === id);
      if (claim && claim.status !== ClaimStatus.PAID) {
        onUpdateClaim({
          ...claim,
          status: ClaimStatus.SUBMITTED,
          updatedAt: new Date().toISOString().split('T')[0]
        });
        addAuditLog('Bulk Submission', 'claim', `Claim ${claim.claimNumber} batch submitted.`, 'success');
      }
    });

    setIsProcessingAction(null);
    setSelectedClaimIds(new Set());
    setFeedback({ message: `Batch submission of ${updatedClaimsCount} claims completed.`, type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-200/60 overflow-hidden relative">
      {feedback && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[200] animate-fadeIn">
          <div className={`px-6 py-3 rounded-full shadow-2xl font-bold text-sm text-white flex items-center gap-3 ${feedback.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            {feedback.message}
          </div>
        </div>
      )}

      <div className="p-10 border-b border-slate-100 bg-gradient-to-br from-white to-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4 tracking-tighter">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            </div>
            Claims Ledger
          </h2>
          <p className="text-sm text-slate-500 font-bold mt-2 ml-14">End-to-end reimbursement tracking & submission</p>
        </div>
        <div className="flex gap-4">
          {selectedClaimIds.size > 0 && (
            <button 
              onClick={() => setShowBulkConfirm(true)}
              disabled={isProcessingAction === 'bulk-submit'}
              className="bg-emerald-500 text-white px-8 py-4 rounded-full font-black text-[11px] hover:opacity-90 transition-all uppercase tracking-widest shadow-xl shadow-emerald-200 flex items-center gap-2 animate-fadeIn"
            >
              {isProcessingAction === 'bulk-submit' ? (
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              )}
              {isProcessingAction === 'bulk-submit' ? 'Submitting Batch...' : `Bulk Submit (${selectedClaimIds.size})`}
            </button>
          )}
          <button 
            onClick={() => setShowNewClaimForm(true)}
            className="bg-[#1D6CF2] text-white px-8 py-4 rounded-full font-black text-[11px] hover:opacity-90 transition-all uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            File New Claim
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="pl-12 pr-4 py-6">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-[#1D6CF2] rounded cursor-pointer" 
                    checked={selectedClaimIds.size === claims.length && claims.length > 0}
                    onChange={toggleSelectAll}
                  />
                </div>
              </th>
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Therapy Detail</th>
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Reimbursement</th>
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Adjudication</th>
              <th className="px-12 py-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/50">
            {claims.map(claim => (
              <tr key={claim.id} className={`hover:bg-blue-50/30 transition-all duration-300 group cursor-default ${selectedClaimIds.has(claim.id) ? 'bg-blue-50/20' : ''}`}>
                <td className="pl-12 pr-4 py-10">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 accent-[#1D6CF2] rounded cursor-pointer" 
                      checked={selectedClaimIds.has(claim.id)}
                      onChange={() => toggleClaimSelection(claim.id)}
                    />
                  </div>
                </td>
                <td className="px-12 py-10">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 tracking-tight">{claim.serviceDate}</span>
                    <span className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-widest">{claim.claimNumber}</span>
                    <div className="flex items-center gap-2.5 mt-3">
                      <span className="text-[10px] font-black text-[#1D6CF2] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100/50 uppercase">CPT: {claim.procedureCode}</span>
                    </div>
                  </div>
                </td>
                <td className="px-12 py-10">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-slate-900 tracking-tighter">₹{claim.billedAmount.toLocaleString()}</span>
                    {claim.status === ClaimStatus.PAID ? (
                      <span className="text-[11px] font-bold text-emerald-600 mt-2 uppercase tracking-tight">Paid: ₹{claim.insurancePayment?.toLocaleString()}</span>
                    ) : claim.status === ClaimStatus.DENIED ? (
                      <span className="text-[11px] font-bold text-rose-500 mt-2 uppercase tracking-tight">Rejected</span>
                    ) : (
                      <span className="text-[11px] font-bold text-amber-500 mt-2 uppercase tracking-tight">Processing</span>
                    )}
                  </div>
                </td>
                <td className="px-12 py-10">
                  <div className="flex flex-col items-start gap-2.5">
                    <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusColor(claim.status)}`}>
                      {claim.status}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Update: {claim.updatedAt}</span>
                  </div>
                </td>
                <td className="px-12 py-10 text-right">
                  {claim.status === ClaimStatus.DENIED ? (
                    <button 
                      onClick={() => handleExplain(claim)} 
                      className="bg-[#1D6CF2] text-white px-8 py-4 rounded-full font-black text-[11px] hover:opacity-90 transition-all uppercase tracking-[0.15em] shadow-xl shadow-blue-200 active:scale-95 flex items-center gap-2 ml-auto"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Appeal Denial
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleVerifyStatement(claim.id)}
                      disabled={isProcessingAction === claim.id + '-verify'}
                      className={`px-8 py-4 rounded-full font-black text-[11px] uppercase tracking-[0.15em] transition-all border-2 active:scale-95 flex items-center gap-2 ml-auto ${
                        isProcessingAction === claim.id + '-verify' 
                        ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed' 
                        : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      {isProcessingAction === claim.id + '-verify' && (
                        <svg className="animate-spin h-3 w-3 text-slate-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      )}
                      {isProcessingAction === claim.id + '-verify' ? 'Checking...' : 'Verify Status'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Submit Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-2xl z-[150] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white rounded-[4rem] p-12 md:p-16 max-w-2xl w-full shadow-2xl animate-scaleIn border-[14px] border-white/50">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Confirm Batch Commit</h3>
              <p className="text-slate-500 font-bold mt-4 leading-relaxed">
                You are about to transmit <span className="text-[#1D6CF2] font-black">{selectedClaimIds.size}</span> therapy claims for institutional adjudication.
              </p>
            </div>

            <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 mb-10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Aggregate Total</span>
                <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalSelectedAmount.toLocaleString()}</span>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-4 custom-scroll border-t border-slate-200/50 pt-6">
                 {selectedClaimsData.map(c => (
                   <div key={c.id} className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-200/50 shadow-sm">
                      <span className="text-[10px] font-mono font-bold text-slate-500">{c.claimNumber}</span>
                      <span className="text-xs font-black text-slate-800">₹{c.billedAmount.toLocaleString()}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="p-6 bg-rose-50 border-2 border-rose-100 rounded-3xl mb-12 flex items-start gap-4">
               <svg className="w-6 h-6 text-rose-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
               <p className="text-xs font-bold text-rose-800 leading-relaxed">WARNING: Once committed to the carrier gateway, these claims will undergo immediate financial adjudication. This action cannot be undone.</p>
            </div>
            
            <div className="flex gap-6">
              <button 
                onClick={() => setShowBulkConfirm(false)} 
                className="flex-1 py-6 font-black text-slate-400 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-100 rounded-full transition-all uppercase tracking-widest text-sm"
              >
                Abort Action
              </button>
              <button 
                onClick={handleBulkSubmit}
                className="flex-1 py-6 font-black text-white bg-emerald-600 rounded-full shadow-2xl hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest text-sm shadow-emerald-200"
              >
                Commit Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Claim Modal */}
      {showNewClaimForm && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-6">
          <form onSubmit={handleCreateNewClaim} className="bg-white rounded-[4rem] p-16 max-w-xl w-full shadow-2xl animate-scaleIn border-[14px] border-white/50">
            <div className="mb-12 text-center">
              <div className="w-20 h-20 bg-blue-50 text-[#1D6CF2] rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter">New Claim Entry</h3>
              <p className="text-slate-500 font-bold mt-3 uppercase text-[10px] tracking-widest">Electronic Submission Gateway</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-3">Service Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full border-4 border-slate-50 p-5 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900"
                    value={newClaim.serviceDate}
                    onChange={(e) => setNewClaim({...newClaim, serviceDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-3">CPT Code</label>
                  <input 
                    required
                    className="w-full border-4 border-slate-50 p-5 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900 uppercase"
                    placeholder="90834"
                    value={newClaim.procedureCode}
                    onChange={(e) => setNewClaim({...newClaim, procedureCode: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-3">Billed Amount (₹)</label>
                <input 
                  type="number"
                  required
                  className="w-full border-4 border-slate-50 p-5 rounded-[2rem] bg-slate-50 focus:border-[#1D6CF2] focus:outline-none font-black text-slate-900"
                  value={newClaim.billedAmount}
                  onChange={(e) => setNewClaim({...newClaim, billedAmount: Number(e.target.value)})}
                />
              </div>
            </div>
            
            <div className="mt-12 flex gap-6">
              <button 
                type="button" 
                onClick={() => setShowNewClaimForm(false)} 
                className="flex-1 py-6 font-black text-slate-400 hover:text-slate-900 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flex-1 py-6 font-black text-white bg-[#1D6CF2] rounded-full shadow-2xl hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedClaim && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn border-[12px] border-white/50">
            <div className="p-12 border-b bg-slate-50 sticky top-0 flex justify-between items-center z-10">
              <div>
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Denial Intelligence</h3>
                <p className="text-xs text-slate-400 font-mono mt-4 tracking-[0.25em] uppercase">ADJUDICATION CASE ID: {selectedClaim.claimNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedClaim(null)} 
                className="p-4 hover:bg-slate-200 rounded-full transition-colors group"
              >
                <svg className="w-10 h-10 text-slate-300 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-12">
              {isExplaining ? (
                <div className="text-center py-24 space-y-12">
                  <div className="relative w-32 h-32 mx-auto">
                    <div className="w-32 h-32 border-[14px] border-slate-50 rounded-full"></div>
                    <div className="w-32 h-32 border-[14px] border-[#1D6CF2] border-t-transparent rounded-full animate-spin absolute top-0"></div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-3xl font-black text-slate-900 italic tracking-tighter uppercase">AI AGENT: MANAS360-X</p>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.3em]">Deconstructing denial logic...</p>
                  </div>
                </div>
              ) : explanation ? (
                <div className="space-y-14 animate-fadeIn">
                  <div className="p-12 bg-rose-50/50 border-2 border-rose-100/50 rounded-[3rem] shadow-inner relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                       <svg className="w-40 h-40 text-rose-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    </div>
                    <h4 className="text-rose-900 text-xl font-black flex items-center gap-4 mb-6 relative z-10">
                      Root Cause Analysis
                    </h4>
                    <p className="text-slate-800 leading-relaxed font-bold italic text-xl relative z-10 tracking-tight">"{explanation.explanation}"</p>
                  </div>

                  <div>
                    <h4 className="text-slate-900 font-black mb-10 uppercase text-[11px] tracking-[0.4em] flex items-center gap-6">
                      <span className="w-16 h-1 bg-[#1D6CF2]"></span>
                      Resolution Protocol
                    </h4>
                    <div className="space-y-6">
                      {explanation.steps.map((step: string, i: number) => (
                        <div key={i} className="flex gap-8 p-8 border-2 border-slate-50 rounded-[2rem] hover:bg-slate-50 transition-all hover:border-blue-200/50 group">
                          <span className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 text-[#1D6CF2] flex items-center justify-center font-black text-xl flex-shrink-0 group-hover:border-[#1D6CF2] transition-all shadow-lg">
                            {i+1}
                          </span>
                          <p className="text-lg text-slate-700 font-bold leading-relaxed tracking-tight">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-8 pt-8">
                    {appealLetter ? (
                      <div className="animate-fadeIn space-y-8">
                        <h4 className="text-slate-900 font-black uppercase text-[11px] tracking-[0.4em] flex items-center gap-6">
                          <span className="w-16 h-1 bg-emerald-500"></span>
                          Appeal Content Package
                        </h4>
                        <pre className="p-12 bg-slate-950 text-slate-300 text-xs font-mono rounded-[3rem] whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto border-4 border-slate-900 custom-scroll">
                          {appealLetter}
                        </pre>
                        <button 
                          onClick={handleSubmitAppeal}
                          disabled={isProcessingAction === 'submit-appeal'}
                          className={`w-full py-7 font-black rounded-full shadow-2xl transition-all flex items-center justify-center gap-5 active:scale-95 text-xl tracking-wide ${
                            isProcessingAction === 'submit-appeal' 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200/50'
                          }`}
                        >
                          {isProcessingAction === 'submit-appeal' ? 'Submitting...' : 'Electronically Submit Appeal'}
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={handleAppealGen}
                        disabled={isGeneratingAppeal}
                        className="w-full py-7 bg-slate-900 text-white font-black rounded-full shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-5 active:scale-95 disabled:opacity-50 text-xl tracking-wide group"
                      >
                        {isGeneratingAppeal ? 'Synthesizing...' : 'Synthesize AI Appeal Package'}
                      </button>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ClaimTracker;
