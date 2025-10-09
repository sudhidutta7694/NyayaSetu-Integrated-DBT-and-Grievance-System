'use client'
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShieldCheck, ArrowLeft, Wallet, Clock, AlertTriangle } from 'lucide-react'

interface BeneficiaryDetail {
  id: string
  name: string
  aadhaarMasked: string
  category: string
  bank: { ifsc: string; accountMasked: string; kycStatus: 'VERIFIED' | 'PENDING' | 'FAILED' }
  documents: { type: string; status: 'VERIFIED' | 'PENDING' | 'REJECTED' }[]
  disbursements: { id: string; amount: number; status: string; ts: string }[]
  riskFlags: string[]
}

export default function BeneficiaryDetailPage(){
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<BeneficiaryDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    // simulate fetch
    setTimeout(()=> {
      setData({
        id,
        name: id === '4'? 'Mahesh Patil':'Sita Devi',
        aadhaarMasked: 'XXXX-XXXX-1234',
        category: 'PCR',
        bank: { ifsc:'HDFC0001234', accountMasked:'XXXXXX6789', kycStatus:'VERIFIED' },
        documents: [
          { type:'Aadhaar', status:'VERIFIED' },
          { type:'Caste Certificate', status:'VERIFIED' },
          { type:'Bank Passbook', status:'PENDING' }
        ],
        disbursements: [
          { id:'TXN34210', amount:15000, status:'COMPLETED', ts: new Date(Date.now()-86400000).toISOString() },
          { id:'TXN34255', amount:5000, status:'PENDING', ts: new Date().toISOString() }
        ],
        riskFlags: id==='4'? ['Name mismatch vs bank record','Previous failure - retry'] : []
      })
      setLoading(false)
    }, 500)
  },[id])

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <Button variant='outline' size='sm' onClick={()=> router.back()}><ArrowLeft className='h-4 w-4 mr-1' />Back</Button>
        <h1 className='text-xl font-semibold'>Beneficiary Detail</h1>
        {data && <span className='text-xs text-gray-500'>ID: {data.id}</span>}
      </div>
      {loading && <div className='h-40 flex items-center justify-center text-sm text-gray-500'>Loading beneficiary...</div>}
      {!loading && data && (
        <>
          <div className='grid gap-6 lg:grid-cols-12'>
            <Card className='lg:col-span-5'>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Name</span><span className='font-medium'>{data.name}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Aadhaar</span><span className='font-mono text-xs'>{data.aadhaarMasked}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Category</span><span className='font-medium'>{data.category}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Bank IFSC</span><span className='font-mono text-xs'>{data.bank.ifsc}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Account</span><span className='font-mono text-xs'>{data.bank.accountMasked}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>KYC Status</span><span className='text-green-600 font-semibold'>{data.bank.kycStatus}</span></div>
              </CardContent>
            </Card>
            <Card className='lg:col-span-7'>
              <CardHeader>
                <CardTitle>Disbursements</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='overflow-auto rounded border'>
                  <table className='w-full text-xs'>
                    <thead className='bg-gray-50 text-gray-600'>
                      <tr>
                        <th className='text-left px-3 py-2 font-semibold'>Txn</th>
                        <th className='text-left px-3 py-2 font-semibold'>Amount</th>
                        <th className='text-left px-3 py-2 font-semibold'>Status</th>
                        <th className='text-left px-3 py-2 font-semibold'>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.disbursements.map(d=> (
                        <tr key={d.id} className='border-t hover:bg-orange-50/40'>
                          <td className='px-3 py-2 font-mono'>{d.id}</td>
                          <td className='px-3 py-2'>{Intl.NumberFormat('en-IN',{ style:'currency', currency:'INR'}).format(d.amount)}</td>
                          <td className='px-3 py-2 text-xs font-semibold'>{d.status}</td>
                          <td className='px-3 py-2 text-[11px]'>{new Date(d.ts).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-6 lg:grid-cols-12'>
            <Card className='lg:col-span-6'>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2 text-sm'>
                  {data.documents.map(doc => (
                    <li key={doc.type} className='flex items-center justify-between'>
                      <span>{doc.type}</span>
                      <span className='text-xs font-semibold'>
                        {doc.status==='VERIFIED' && <span className='text-green-600'>Verified</span>}
                        {doc.status==='PENDING' && <span className='text-amber-600'>Pending</span>}
                        {doc.status==='REJECTED' && <span className='text-red-600'>Rejected</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className='lg:col-span-6'>
              <CardHeader>
                <CardTitle>Risk & Validation</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4 text-sm'>
                <div className='flex items-center gap-2 text-green-700'><ShieldCheck className='h-4 w-4' /> <span>e-KYC Passed (Demographic)</span></div>
                <div className='flex items-center gap-2 text-green-700'><Wallet className='h-4 w-4' /> <span>NPCI Seeded Account</span></div>
                <div className='flex items-center gap-2 text-green-700'><Clock className='h-4 w-4' /> <span>No pending compliance holds</span></div>
                {data.riskFlags.length>0 && (
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold text-red-600 flex items-center gap-1'><AlertTriangle className='h-4 w-4' /> Risk Flags</p>
                    <ul className='list-disc list-inside text-[11px] text-red-600 space-y-1'>
                      {data.riskFlags.map(r=> <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
