import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Shop } from '../../types';
import { Settings, Building2, Plus, Edit2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminMasterDataView: React.FC = () => {
  const { shops } = useData();
  const { role } = useAuth();

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-600" />
          Master Data & 15-Shop Configuration
        </h2>
        <p className="text-xs text-slate-500">
          Official shop structure and contract configuration for Mahindra & Mahindra Ltd. Chakan facility
        </p>
      </div>

      {/* 15 Shops List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">Configured Facility Shops ({shops.length})</h3>
          <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
            Chakan Plant Directory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Shop Code</th>
                <th className="py-2.5 px-3">Official Shop Name</th>
                <th className="py-2.5 px-3">Manufacturing Area</th>
                <th className="py-2.5 px-3">Responsible Supervisor</th>
                <th className="py-2.5 px-3">Target TAT</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shops.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-black text-slate-900">{s.code}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800">{s.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{s.area}</td>
                  <td className="py-2.5 px-3 text-slate-700">{s.supervisorName}</td>
                  <td className="py-2.5 px-3 font-bold text-teal-800">&lt; {s.targetTAT} Days</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
