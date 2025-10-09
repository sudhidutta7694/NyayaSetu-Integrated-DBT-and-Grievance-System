"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertTriangle, CheckCircle2, Clock, FileText, User, Landmark, Copy, IndianRupee, ShieldCheck, Banknote } from 'lucide-react'

interface DisbursementDetail {
  id: string
  beneficiary: { id: string; name: string; aadhaarMasked: string }
  category: string
  amount: number
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  bank: {
    name: string
    branch: string
    ifsc: string
    accountMasked: string
    accountType: 'SAVINGS' | 'CURRENT'
    beneficiaryNameOnBank: string
    npciLinked: boolean
    kycStatus: 'VERIFIED' | 'PENDING' | 'FAILED'
    lastValidatedAt: string
    upi?: string
    status: 'ACTIVE' | 'DORMANT' | 'FROZEN'
  }
  references: { pfms?: string; utr?: string; bankTxnId?: string; batchId?: string }
  audit: { field: string; value: string }[]
  failureReason?: string
  createdAt: string
  updatedAt: string
}

export default function DisbursementDetailPage(){
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [data, setData] = useState<DisbursementDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=> {
    // simulate fetch
    setTimeout(()=> {
      const completed = Math.random() < 0.6
      setData({
        id,
        beneficiary: { id: 'BEN123', name: 'Sita Devi', aadhaarMasked: 'XXXX-XXXX-1234' },
        category: ['PCR','PoA','INCENTIVE'][Math.floor(Math.random()*3)],
        amount: 15000 + Math.floor(Math.random()*5000),
        status: completed? 'COMPLETED': (['PENDING','PROCESSING','FAILED'] as const)[Math.floor(Math.random()*3)],
        bank: {
          name: 'HDFC Bank',
          branch: 'Connaught Place, New Delhi',
          ifsc:'HDFC0001234',
          accountMasked:'XXXXXX6789',
          accountType: 'SAVINGS',
          beneficiaryNameOnBank: 'SITA DEVI',
          npciLinked: true,
          kycStatus: 'VERIFIED',
          lastValidatedAt: new Date(Date.now()-2*3600_000).toISOString(),
          upi: 'sita@upi',
          status: 'ACTIVE'
        },
        references: {
          pfms: completed? 'PFMS-24-10-000123':'PFMS-PENDING',
          utr: completed? 'HDFCIN240987654321':'',
          bankTxnId: completed? 'BNKTXN-9087-4521':'' ,
          batchId: 'BATCH-2402'
        },
        audit: [
          { field:'Source File', value:'Relief_Batch_08Oct2025.csv' },
          { field:'Operator', value:'fi_user_01' },
          { field:'Channel', value:'Scheduled Run' },
          { field:'Retry Count', value: completed? '0':'1' }
        ],
        failureReason: completed? undefined : (Math.random()<0.5? 'Account name mismatch with beneficiary record':'NPCI not linked'),
        createdAt: new Date(Date.now()-3600_000).toISOString(),
        updatedAt: new Date().toISOString()
      })
      setLoading(false)
    }, 500)
  },[id])

  const statusChip = (s: DisbursementDetail['status']) => (
    <span className={'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ring-inset ' + (
      s==='COMPLETED'? 'bg-green-100 text-green-700 ring-green-200':
      s==='PENDING'? 'bg-amber-100 text-amber-700 ring-amber-200':
      s==='PROCESSING'? 'bg-blue-100 text-blue-700 ring-blue-200':'bg-red-100 text-red-700 ring-red-200'
    )}>
      {s==='COMPLETED'? <CheckCircle2 className='h-3.5 w-3.5'/>: s==='PENDING'||s==='PROCESSING'? <Clock className='h-3.5 w-3.5'/>: <AlertTriangle className='h-3.5 w-3.5'/>}
      {s}
    </span>
  )

  function copy(val?: string){ if(!val) return; navigator.clipboard.writeText(val).catch(()=>{}) }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='sm' onClick={()=> router.back()}><ArrowLeft className='h-4 w-4 mr-1' />Back</Button>
          <h1 className='text-xl font-semibold'>Disbursement Detail</h1>
          {data && <span className='text-xs text-gray-500 font-mono'>ID: {data.id}</span>}
        </div>
        {data && (
          <div className='hidden sm:flex items-center gap-2'>
            <span className='text-xs text-gray-500'>Status</span>
            {statusChip(data.status)}
          </div>
        )}
      </div>
      {loading && <div className='h-40 flex items-center justify-center text-sm text-gray-500'>Loading transaction...</div>}
      {!loading && data && (
        <>
          {/* At-a-glance banner */}
          <Card className='border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-green-50'>
            <CardContent className='py-4'>
              <div className='grid gap-4 sm:grid-cols-12 items-center'>
                <div className='sm:col-span-4 flex items-center gap-3'>
                  {statusChip(data.status)}
                  <span className='inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset bg-white text-gray-700 ring-gray-200'>{data.category}</span>
                </div>
                <div className='sm:col-span-4 text-center'>
                  <div className='text-xs text-gray-600'>Amount</div>
                  <div className='text-xl font-semibold inline-flex items-center gap-1'>
                    <IndianRupee className='h-4 w-4' />{Intl.NumberFormat('en-IN',{style:'currency', currency:'INR'}).format(data.amount)}
                  </div>
                </div>
                <div className='sm:col-span-4 flex flex-col items-end gap-1'>
                  <div className='text-[11px] text-gray-600'>Created: {new Date(data.createdAt).toLocaleString('en-IN')}</div>
                  <div className='text-[11px] text-gray-600'>Updated: {new Date(data.updatedAt).toLocaleString('en-IN')}</div>
                  <div className='flex gap-2 mt-1'>
                    {data.status==='COMPLETED' && (
                      <Button size='sm' variant='outline' className='h-8'>
                        <FileText className='h-3.5 w-3.5 mr-1'/>Download receipt
                      </Button>
                    )}
                    {data.references.utr && (
                      <Button size='sm' variant='outline' className='h-8' onClick={()=> copy(data.references.utr)}>
                        <Copy className='h-3.5 w-3.5 mr-1'/>Copy UTR
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className='grid gap-6 lg:grid-cols-12'>
            <Card className='lg:col-span-5'>
              <CardHeader>
                <CardTitle className='inline-flex items-center gap-2'>
                  <User className='h-4 w-4 text-orange-600'/> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='flex items-center justify-between'>
                  <span className='text-gray-600'>Beneficiary</span>
                  <span className='flex items-center gap-1 font-medium'>
                    <User className='h-4 w-4 text-orange-600' />
                    <Link href={`/fi/beneficiaries/${data.beneficiary.id}`} className='text-orange-600 hover:underline'>{data.beneficiary.name}</Link>
                  </span>
                </div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Aadhaar</span><span className='font-mono text-xs'>{data.beneficiary.aadhaarMasked}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Category</span><span className='font-medium'>{data.category}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Amount</span><span className='inline-flex items-center gap-1 font-semibold'><IndianRupee className='h-3.5 w-3.5' />{Intl.NumberFormat('en-IN',{style:'currency', currency:'INR'}).format(data.amount)}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Created</span><span className='text-[11px]'>{new Date(data.createdAt).toLocaleString('en-IN')}</span></div>
                <div className='flex items-center justify-between'><span className='text-gray-600'>Updated</span><span className='text-[11px]'>{new Date(data.updatedAt).toLocaleString('en-IN')}</span></div>
                {data.failureReason && <div className='text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2 py-1 flex items-center gap-1'><AlertTriangle className='h-4 w-4'/> {data.failureReason}</div>}
              </CardContent>
            </Card>
            <Card className='lg:col-span-7'>
              <CardHeader>
                <CardTitle className='inline-flex items-center gap-2'>
                  <Banknote className='h-4 w-4 text-green-600'/> Settlement & References
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 text-sm'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  <Field label='Batch ID' value={data.references.batchId} onCopy={copy} />
                  <Field label='PFMS Reference' value={data.references.pfms || '—'} onCopy={copy} />
                  <Field label='UTR Number' value={data.references.utr || '—'} onCopy={copy} />
                  <Field label='Bank Txn ID' value={data.references.bankTxnId || '—'} onCopy={copy} />
                </div>
                <div className='text-[11px] text-gray-500'>Identifiers are populated post-settlement. Use them to reconcile with PFMS/bank statements.</div>
              </CardContent>
            </Card>
          </div>
          <div className='grid gap-6 lg:grid-cols-12'>
            <Card className='lg:col-span-7'>
              <CardHeader>
                <CardTitle className='inline-flex items-center gap-2'>
                  <Landmark className='h-4 w-4 text-purple-600'/> Bank & Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className='text-sm'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3'>
                  <Field label='Bank' value={data.bank.name} />
                  <Field label='Branch' value={data.bank.branch} />
                  <Field label='IFSC' value={data.bank.ifsc} mono onCopy={copy} />
                  <Field label='Account Number' value={data.bank.accountMasked} mono />
                  <Field label='Account Type' value={data.bank.accountType} />
                  <Field label='Beneficiary (as per bank)' value={data.bank.beneficiaryNameOnBank} />
                  <Field label='UPI Handle' value={data.bank.upi || '—'} />
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>NPCI Linked</span>
                    <span className={'inline-flex items-center px-2 py-0.5 rounded-full ring-1 ring-inset text-[11px] ' + (data.bank.npciLinked? 'bg-green-100 text-green-700 ring-green-200':'bg-red-100 text-red-700 ring-red-200')}>
                      {data.bank.npciLinked? 'Linked':'Not Linked'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>KYC Status</span>
                    <span className={'inline-flex items-center px-2 py-0.5 rounded-full ring-1 ring-inset text-[11px] ' + (data.bank.kycStatus==='VERIFIED'? 'bg-green-100 text-green-700 ring-green-200': data.bank.kycStatus==='PENDING'? 'bg-amber-100 text-amber-700 ring-amber-200':'bg-red-100 text-red-700 ring-red-200')}>
                      {data.bank.kycStatus}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Account Status</span>
                    <span className='inline-flex items-center px-2 py-0.5 rounded-full ring-1 ring-inset text-[11px] bg-gray-100 text-gray-700 ring-gray-200'>{data.bank.status}</span>
                  </div>
                  <Field label='Last Validated' value={new Date(data.bank.lastValidatedAt).toLocaleString('en-IN')} />
                </div>
                {/* <div className='mt-3 text-[11px] text-gray-500'>Validation powered by NPCI & bank partner checks.</div> */}
              </CardContent>
            </Card>
            <Card className='lg:col-span-5'>
              <CardHeader>
                <CardTitle className='inline-flex items-center gap-2'>
                  <ShieldCheck className='h-4 w-4 text-sky-600'/> Audit Trail
                </CardTitle>
              </CardHeader>
              <CardContent className='text-xs'>
                <table className='w-full'>
                  <tbody>
                    {data.audit.map(a=> (
                      <tr key={a.field} className='border-t first:border-t-0'>
                        <td className='px-2 py-2 w-40 text-gray-600'>{a.field}</td>
                        <td className='px-2 py-2 font-medium'>{a.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

function Field({ label, value, mono=false, onCopy }: { label: string; value?: string; mono?: boolean; onCopy?: (v?: string)=> void }){
  return (
    <div className='flex items-center justify-between gap-3'>
      <span className='text-gray-600'>{label}</span>
      <span className={'flex items-center gap-2 max-w-[240px] sm:max-w-[280px] truncate ' + (mono? 'font-mono text-xs':'font-medium')} title={value || '—'}>
        {value || '—'}
        {onCopy && value && <button title='Copy' onClick={()=> onCopy(value)} className='p-1 rounded hover:bg-gray-100'><Copy className='h-3.5 w-3.5 text-gray-500'/></button>}
      </span>
    </div>
  )
}
