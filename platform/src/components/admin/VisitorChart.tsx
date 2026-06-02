'use client'

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import type { VisitorsByDay } from '@/types'

interface Props {
  data: VisitorsByDay[]
}

export function VisitorAreaChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2B5FDB" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2B5FDB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}
          labelFormatter={v => `Dia ${v}`}
          formatter={(v: number) => [v, 'Visitantes']}
        />
        <Area type="monotone" dataKey="count" stroke="#2B5FDB" strokeWidth={2} fill="url(#grad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface DeviceProps {
  data: { name: string; value: number }[]
}

const COLORS = ['#2B5FDB', '#00D4FF', '#10b981', '#f59e0b', '#ef4444']

export function DevicePieChart({ data }: DeviceProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%" cy="50%"
          innerRadius={50} outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [v, 'Visitas']} />
      </PieChart>
    </ResponsiveContainer>
  )
}
