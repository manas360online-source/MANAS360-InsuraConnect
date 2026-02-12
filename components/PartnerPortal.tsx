
import React, { useState } from 'react';
import { SyncHistoryEntry } from '../types';

const MOCK_SYNC_HISTORY: SyncHistoryEntry[] = [
  { id: '1', date: 'Jan 19', type: 'Scheduled', records: 45230, changes: 1234, status: 'Success' },
  { id: '2', date: 'Jan 15', type: 'Manual', records: 45000, changes: 500, status: 'Success' },
  { id: '3', date: 'Jan 12', type: 'Scheduled', records: 44500, changes: 890, status: 'Success' },
  { id: '4', date: 'Jan 05', type: 'Scheduled', records: 43610, changes: 456, status: 'Partial' },
];

const PartnerPortal: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedReport, setSelectedReport] = useState<SyncHistoryEntry | null>(null);
  const [showConfig, setShowConfig] = useState(false);

  const handleDownloadTemplate = () => {
    const headers = [
      'policy_number',
      'member_id',
      'first_name',
      'last_name',
      'dob',
      'gender',
      'plan_code',
      'mental_health_coverage',
      'coverage_start',
      'coverage_end',
      'copay_amount',
      'sessions_limit',
      'sessions_used',
      'email',
      'phone'
    ].join(',');

    const sampleData = [
      'BA-2024-001234,MBR-78901,Priya,Sharma,1990-05-15,F,GOLD-PLUS,TRUE,2024-01-01,2024-12-31,500,20,3,priya.sharma@email.com,9876543210',
      'BA-2024-001235,MBR-78902,Rahul,Mehta,1985-11-22,M,SILVER,TRUE,2024-01-01,2024-12-31,800,12,5,rahul.m@email.com,9876543211'
    ].join('\n');

    const csvContent = `${headers}\n${sampleData}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mans360_member_sync_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setShowUploadConfirm(false);
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setSelectedFile(null);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="px-4 py-1.5 bg-blue-500 rounded-full text-[10px] font-black uppercase tracking-widest">Insurance Admin Node</div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Gateway: Bajaj Allianz External</div>
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Member Synchronization Portal</h2>
          <p className="text-slate-400 font-medium max-w-2xl text-lg">Centralized bulk upload and scheduled refresh management for the MANS360 local member cache.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16 relative z-10">
          {[
            { label: 'Active Members', value: '45,230', sub: '+1.2k this week' },
            { label: 'Sessions Used', value: '12,456', sub: '27.5% Utilized' },
            { label: 'Claims Pending', value: '234', sub: '₹12.4L in queue' },
            { label: 'Next Sync', value: 'Sun 5:00 AM', sub: 'SFTP Automated' }
          ].map((stat, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-bold text-blue-400 mt-2">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Sync Settings */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Sync Configuration
            </h3>
            <button 
              onClick={() => setShowConfig(true)}
              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              Configure
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { label: 'Default Schedule', value: 'Every Sunday @ 5:00 AM IST' },
              { label: 'Method', value: 'SFTP Pull (ba_sftp_key.pem)' },
              { label: 'Notification', value: 'Email (admin@mans360.com)' },
              { label: 'Retry Strategy', value: '3 attempts @ 30 min' }
            ].map((setting, idx) => (
              <div key={idx} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{setting.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-black text-slate-900">{setting.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Upload */}
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-8">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            Manual Bulk Upload
          </h3>
          
          <div 
            className={`border-4 border-dashed rounded-[2.5rem] p-10 text-center transition-all ${
              selectedFile ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50 hover:border-blue-200'
            }`}
          >
            {isUploading ? (
              <div className="space-y-6">
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest animate-pulse">Processing {uploadProgress}%...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-center gap-4">
                  <input 
                    type="file" 
                    id="member-upload" 
                    className="hidden" 
                    accept=".csv,.xlsx" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                  <label 
                    htmlFor="member-upload" 
                    className="px-8 py-4 bg-white border-2 border-slate-200 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-slate-50 transition-all"
                  >
                    {selectedFile ? selectedFile.name : 'Choose File'}
                  </label>
                  <button 
                    onClick={handleDownloadTemplate}
                    className="px-8 py-4 bg-slate-900 text-white rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95"
                  >
                    Download Template
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">CSV, XLSX, OR XLS (Max 50MB / 500k Records)</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-10 px-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="uploadType" className="w-5 h-5 accent-blue-600" defaultChecked />
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">Replace entire list</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="uploadType" className="w-5 h-5 accent-blue-600" />
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-slate-900">Merge with existing</span>
            </label>
          </div>

          <button 
            onClick={() => setShowUploadConfirm(true)}
            disabled={!selectedFile || isUploading}
            className={`w-full py-6 rounded-full text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl ${
              !selectedFile || isUploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white shadow-blue-200/50 hover:bg-blue-700 active:scale-95'
            }`}
          >
            {isUploading ? 'Adjudicating Records...' : 'Execute Manual Sync'}
          </button>
        </div>
      </div>

      {/* Sync Confirmation Modal */}
      {showUploadConfirm && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[4rem] p-12 md:p-16 max-w-xl w-full shadow-2xl animate-scaleIn border-[14px] border-white/50 text-center">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            </div>
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Confirm Bulk Sync</h3>
            <p className="text-slate-500 font-bold mt-4 leading-relaxed">
              You are about to synchronize <span className="text-blue-600 font-black">{selectedFile?.name}</span> with the institutional member database. This may overwrite existing eligibility records.
            </p>
            <div className="mt-12 flex gap-6">
              <button onClick={() => setShowUploadConfirm(false)} className="flex-1 py-6 font-black text-slate-400 hover:text-slate-900 bg-slate-100/50 hover:bg-slate-100 rounded-full transition-all uppercase tracking-widest text-sm">Abort</button>
              <button onClick={handleUpload} className="flex-1 py-6 font-black text-white bg-blue-600 rounded-full shadow-2xl shadow-blue-200 hover:opacity-90 transition-all active:scale-95 uppercase tracking-widest text-sm">Execute Sync</button>
            </div>
          </div>
        </div>
      )}

      {/* Sync History */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-12 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Audit History
          </h3>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Last 90 Days Retained</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Records</th>
              <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Changes</th>
              <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-12 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Report</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_SYNC_HISTORY.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-50 transition-all cursor-default group">
                <td className="px-12 py-8 text-sm font-black text-slate-900">{entry.date}</td>
                <td className="px-12 py-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    entry.type === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                  }`}>{entry.type}</span>
                </td>
                <td className="px-12 py-8 text-sm font-bold text-slate-600">{entry.records.toLocaleString()}</td>
                <td className="px-12 py-8 text-sm font-bold text-emerald-600">+{entry.changes.toLocaleString()}</td>
                <td className="px-12 py-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    entry.status === 'Success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{entry.status}</span>
                </td>
                <td className="px-12 py-8 text-right">
                  <button 
                    onClick={() => setSelectedReport(entry)}
                    className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-blue-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sync Report Modal (Page 10 Reference) */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scaleIn border-[12px] border-white/50 flex flex-col">
            <div className="p-12 border-b bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">MANS360 Sync Report</h3>
                <p className="text-[10px] text-slate-400 font-black mt-2 uppercase tracking-widest">{selectedReport.date}, 2025 - 5:32 AM IST</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="p-4 hover:bg-slate-200 rounded-full transition-colors">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="p-12 overflow-y-auto flex-1 space-y-10 custom-scroll">
              <div className="flex items-center gap-4 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Sync Status</p>
                  <p className="text-lg font-black text-emerald-600 uppercase">Completed Successfully</p>
                </div>
              </div>

              <section>
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
                  <span className="w-8 h-0.5 bg-slate-200"></span>
                  Statistical breakdown
                </h4>
                <div className="grid grid-cols-1 gap-3">
                   {[
                     { label: 'Total Records Processed', value: selectedReport.records.toLocaleString() },
                     { label: 'New Members Added', value: '1,234' },
                     { label: 'Members Updated', value: '3,456' },
                     { label: 'Members Terminated', value: '89' },
                     { label: 'Members Expired (Auto)', value: '156' },
                     { label: 'Validation Errors', value: '12', color: 'text-rose-600' },
                     { label: 'Processing Time', value: '4m 32s' }
                   ].map((stat, i) => (
                     <div key={i} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                       <p className="text-xs font-bold text-slate-600">{stat.label}</p>
                       <p className={`text-sm font-black ${stat.color || 'text-slate-900'}`}>{stat.value}</p>
                     </div>
                   ))}
                </div>
              </section>

              <section className="p-8 bg-blue-50/50 border-2 border-blue-100 rounded-[2.5rem] space-y-4">
                <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Coverage Changes Detected</h4>
                <ul className="space-y-3">
                  <li className="text-sm font-bold text-slate-700 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    234 members upgraded to higher coverage
                  </li>
                  <li className="text-sm font-bold text-slate-700 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    89 members approaching session limits (>80%)
                  </li>
                  <li className="text-sm font-bold text-slate-700 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    45 members had annual benefit reset
                  </li>
                </ul>
              </section>
            </div>
            
            <div className="p-8 bg-slate-50 border-t flex justify-end gap-4">
               <button className="px-10 py-4 bg-slate-900 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-xl hover:opacity-90">Download full CSV log</button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal (Page 7 Reference) */}
      {showConfig && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-2xl z-[200] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3.5rem] shadow-2xl max-w-xl w-full p-16 animate-scaleIn border-[12px] border-white/50">
            <div className="mb-12">
               <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Scheduler Config</h3>
               <p className="text-slate-500 font-bold mt-2">Fine-tune institutional synchronization parameters.</p>
            </div>
            
            <div className="space-y-8">
               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Refresh Day</label>
                    <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm uppercase">
                      <option>Sunday</option>
                      <option>Monday</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Refresh Time</label>
                    <input type="time" defaultValue="05:00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm" />
                  </div>
               </div>

               <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Notification Channel</label>
                 <div className="flex gap-4">
                   {['Email', 'SMS', 'Webhook'].map(method => (
                     <button key={method} className={`flex-1 py-4 border-2 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${method === 'Email' ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-200'}`}>
                       {method}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Retry count</label>
                    <input type="number" defaultValue="3" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Interval (min)</label>
                    <input type="number" defaultValue="30" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-sm" />
                  </div>
               </div>
            </div>

            <div className="mt-16 flex gap-4">
               <button onClick={() => setShowConfig(false)} className="flex-1 py-6 bg-slate-100 text-slate-400 rounded-full font-black text-xs uppercase tracking-widest">Cancel</button>
               <button onClick={() => setShowConfig(false)} className="flex-1 py-6 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200">Save Schema</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerPortal;
