
import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CostCalculator: React.FC = () => {
  const [totalCost, setTotalCost] = useState<number>(3000);
  const [coverage, setCoverage] = useState<number>(80);
  const [deductible, setDeductible] = useState<number>(5000);
  const [deductibleMet, setDeductibleMet] = useState<number>(2500);

  const breakdown = useMemo(() => {
    const remainingDeductible = Math.max(0, deductible - deductibleMet);
    const amountAppliedToDeductible = Math.min(totalCost, remainingDeductible);
    const amountAfterDeductible = totalCost - amountAppliedToDeductible;
    const insurancePays = amountAfterDeductible * (coverage / 100);
    const patientPays = totalCost - insurancePays;

    return [
      { name: 'Insurance Coverage', value: insurancePays, color: '#1D6CF2' },
      { name: 'Your Co-pay / Responsibility', value: patientPays, color: '#f43f5e' },
    ];
  }, [totalCost, coverage, deductible, deductibleMet]);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <svg className="w-7 h-7 text-[#1D6CF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
          Smart Cost Calculator
        </h2>
        <p className="text-sm text-slate-500 font-medium">Estimate your out-of-pocket therapy expenses</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Session Fee (₹)</label>
              <input 
                type="number" 
                value={totalCost} 
                onChange={(e) => setTotalCost(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-slate-50 rounded-2xl focus:ring-2 focus:ring-[#1D6CF2] focus:outline-none bg-slate-50 font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Coverage (%)</label>
              <input 
                type="number" 
                min="0" max="100" 
                value={coverage} 
                onChange={(e) => setCoverage(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-slate-50 rounded-2xl focus:ring-2 focus:ring-[#1D6CF2] focus:outline-none bg-slate-50 font-bold text-slate-900"
              />
            </div>
          </div>
          
          <div className="space-y-4">
             <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Annual Deductible (₹)</label>
              <input 
                type="number" 
                value={deductible} 
                onChange={(e) => setDeductible(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-slate-50 rounded-2xl bg-slate-50 font-bold text-slate-900"
              />
            </div>
            <div>
               <div className="flex justify-between mb-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductible Met (₹)</label>
                <span className="text-[10px] font-bold text-[#1D6CF2] tracking-tighter">₹{deductibleMet} of ₹{deductible}</span>
              </div>
              <input 
                type="range" 
                min="0" max={deductible} 
                value={deductibleMet} 
                onChange={(e) => setDeductibleMet(Number(e.target.value))}
                className="w-full accent-[#1D6CF2]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-6 border-t border-slate-100">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${Number(value).toFixed(2)}`}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Co-pay</span>
              <span className="text-2xl font-black text-slate-900">₹{breakdown[1].value.toFixed(0)}</span>
            </div>
          </div>
          <div className="mt-6 w-full grid grid-cols-2 gap-4">
             <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#1D6CF2]"></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Insurance</p>
                </div>
                <p className="text-lg font-black text-slate-900">₹{breakdown[0].value.toFixed(0)}</p>
             </div>
             <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Patient</p>
                </div>
                <p className="text-lg font-black text-rose-500">₹{breakdown[1].value.toFixed(0)}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
