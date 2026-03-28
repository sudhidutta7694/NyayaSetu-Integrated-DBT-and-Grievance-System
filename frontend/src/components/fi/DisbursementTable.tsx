"use client"
import React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface DisbursementRow {
  id: string
  beneficiary: string
  category: 'PCR' | 'PoA' | 'INCENTIVE'
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  createdAt: string
}

const statusColors: Record<DisbursementRow['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-700 ring-amber-200',
  PROCESSING: 'bg-blue-100 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 ring-green-200',
  FAILED: 'bg-red-100 text-red-700 ring-red-200'
}

export function DisbursementTable({ rows }: { rows: DisbursementRow[] }) {
  const router = useRouter()
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wide">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Txn Ref</th>
            <th className="text-left px-3 py-2 font-semibold">Beneficiary</th>
            <th className="text-left px-3 py-2 font-semibold">Category</th>
            <th className="text-left px-3 py-2 font-semibold">Amount</th>
            <th className="text-left px-3 py-2 font-semibold">Status</th>
            <th className="text-left px-3 py-2 font-semibold">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr
              key={r.id}
              tabIndex={0}
              onClick={() => router.push(`/fi/disbursements/${r.id}`)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/fi/disbursements/${r.id}`) } }}
              className="cursor-pointer border-t hover:bg-orange-50/50 focus:bg-orange-100 outline-none transition-colors"
            >
              <td className="px-3 py-2 font-mono text-xs">
                <Link href={`/fi/disbursements/${r.id}`} className="text-orange-600 hover:underline">
                  {r.id}
                </Link>
              </td>
              <td className="px-3 py-2">{r.beneficiary}</td>
              <td className="px-3 py-2"><span className="text-xs font-medium">{r.category}</span></td>
              <td className="px-3 py-2">{Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(r.amount)}</td>
              <td className="px-3 py-2">
                <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset', statusColors[r.status])}>{r.status}</span>
              </td>
              <td className="px-3 py-2 text-xs text-gray-600">{new Date(r.createdAt).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
