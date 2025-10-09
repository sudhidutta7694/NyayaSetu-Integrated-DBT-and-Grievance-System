'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export interface BeneficiaryRow {
  id: string
  name: string
  aadhaarMasked: string
  category: 'PCR' | 'PoA' | 'INCENTIVE'
  bankKYC: 'VERIFIED' | 'PENDING' | 'FAILED'
  status: 'ACTIVE' | 'ON_HOLD'
}

export function BeneficiaryTable({ rows }: { rows: BeneficiaryRow[] }) {
  const router = useRouter()
  return (
    <div className='overflow-hidden rounded-lg border bg-white'>
      <table className='w-full text-sm'>
        <thead className='bg-gray-50 text-gray-700 text-xs uppercase tracking-wide'>
          <tr>
            <th className='text-left px-3 py-2 font-semibold'>Name</th>
            <th className='text-left px-3 py-2 font-semibold'>Aadhaar</th>
            <th className='text-left px-3 py-2 font-semibold'>Category</th>
            <th className='text-left px-3 py-2 font-semibold'>Bank KYC</th>
            <th className='text-left px-3 py-2 font-semibold'>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}
                tabIndex={0}
                onClick={()=> router.push(`/fi/beneficiaries/${r.id}`)}
                onKeyDown={(e)=> { if(e.key==='Enter' || e.key===' ') { e.preventDefault(); router.push(`/fi/beneficiaries/${r.id}`)} }}
                className='cursor-pointer border-t hover:bg-orange-50/60 focus:bg-orange-100 outline-none transition-colors'>
              <td className='px-3 py-2'>
                <Link href={`/fi/beneficiaries/${r.id}`} className='text-orange-600 hover:underline font-medium'>
                  {r.name}
                </Link>
              </td>
              <td className='px-3 py-2 font-mono text-xs'>{r.aadhaarMasked}</td>
              <td className='px-3 py-2'><span className='text-xs font-medium'>{r.category}</span></td>
              <td className='px-3 py-2'>
                <span className='text-xs font-semibold'>
                  {r.bankKYC === 'VERIFIED' && <span className='text-green-600'>Verified</span>}
                  {r.bankKYC === 'PENDING' && <span className='text-amber-600'>Pending</span>}
                  {r.bankKYC === 'FAILED' && <span className='text-red-600'>Failed</span>}
                </span>
              </td>
              <td className='px-3 py-2 text-xs font-semibold'>{r.status === 'ACTIVE'? 'Active':'On Hold'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
