import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getDemandForecastData } from '../../services/aiEngine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Sparkles, Filter } from 'lucide-react';

export default function DemandForecastChart() {
  const [selectedCity, setSelectedCity] = useState('Hubballi');

  const data = getDemandForecastData(selectedCity);

  return (
    <div className="glass-card p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-md">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-slate-100">AI Blood Demand & Shortage Forecasting</h3>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded border border-indigo-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> PROPHET MODEL
              </span>
            </div>
            <p className="text-xs text-slate-400">Predictive 30-day requirement trends based on historical accident spikes & camp schedules</p>
          </div>
        </div>

        {/* City Filter */}
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-xs text-slate-200 font-semibold rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
        >
          <option value="Hubballi">City: Hubballi</option>
          <option value="Dharwad">City: Dharwad</option>
          <option value="Bengaluru">City: Bengaluru</option>
          <option value="Belagavi">City: Belagavi</option>
        </select>
      </div>

      {/* Recharts Forecast Graph */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e63946" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#e63946" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorAB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f1117', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
            />
            <Area type="monotone" dataKey="O- / O+ Demand" stroke="#e63946" fillOpacity={1} fill="url(#colorO)" />
            <Area type="monotone" dataKey="B+ / A+ Demand" stroke="#3b82f6" fillOpacity={1} fill="url(#colorB)" />
            <Area type="monotone" dataKey="AB- Rare Demand" stroke="#f59e0b" fillOpacity={1} fill="url(#colorAB)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-800">
        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 shrink-0"></span>
          <div>
            <span className="font-bold text-slate-200">O- / O+ Demand</span>
            <span className="text-[10px] text-slate-400 block">Peak expected Aug 12 (Highway Surge)</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0"></span>
          <div>
            <span className="font-bold text-slate-200">B+ / A+ Demand</span>
            <span className="text-[10px] text-slate-400 block">Steady baseline demand</span>
          </div>
        </div>

        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0"></span>
          <div>
            <span className="font-bold text-slate-200">AB- Rare Group Demand</span>
            <span className="text-[10px] text-slate-400 block">Low volume, critical shortage risk</span>
          </div>
        </div>
      </div>

    </div>
  );
}
