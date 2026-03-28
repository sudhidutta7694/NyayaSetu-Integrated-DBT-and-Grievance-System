'use client'
import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { User, Search, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react'
import { BeneficiaryTable, BeneficiaryRow } from '@/components/fi/BeneficiaryTable'

export default function FIBeneficiariesPage(){
  const [rows, setRows] = useState<BeneficiaryRow[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(()=> {
    setTimeout(()=> {
      setRows([
        { id:'1', name:'Sita Devi', aadhaarMasked:'XXXX-XXXX-1234', category:'PCR', bankKYC:'VERIFIED', status:'ACTIVE' },
        { id:'2', name:'Ramesh Kumar', aadhaarMasked:'XXXX-XXXX-2345', category:'PoA', bankKYC:'PENDING', status:'ACTIVE' },
        { id:'3', name:'Anita Rao', aadhaarMasked:'XXXX-XXXX-3456', category:'INCENTIVE', bankKYC:'VERIFIED', status:'ACTIVE' },
        { id:'4', name:'Mahesh Patil', aadhaarMasked:'XXXX-XXXX-4567', category:'PCR', bankKYC:'FAILED', status:'ON_HOLD' },
        { id:'5', name:'K. Joseph', aadhaarMasked:'XXXX-XXXX-5678', category:'PoA', bankKYC:'VERIFIED', status:'ACTIVE' },
        { id:'6', name:'P. Lakshmi', aadhaarMasked:'XXXX-XXXX-6789', category:'INCENTIVE', bankKYC:'PENDING', status:'ACTIVE' }
      ])
      setLoading(false)
    }, 350)
  },[])

  return (
    <div className='space-y-8'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Beneficiaries</h1>
          <p className='text-sm text-gray-600'>Verified victims & incentive recipients linked via Aadhaar / case data.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <Input placeholder='Search by name / Aadhaar / application no.' className='border-2' />
            </div>
            <div className='flex gap-2'>
              <Button variant='outline'>PCR</Button>
              <Button variant='outline'>PoA</Button>
              <Button variant='outline'>Incentive</Button>
            </div>
            <Button className='bg-orange-600 hover:bg-orange-700'><Search className='h-4 w-4 mr-2' />Go</Button>
          </div>
          <div className='text-xs text-gray-500'>Future: advanced filters (district, status, category).</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle>Beneficiary List</CardTitle>
          <Button size='sm' variant='outline'><RefreshCw className='h-3 w-3 mr-1' />Refresh</Button>
        </CardHeader>
        <CardContent>
          {loading? <div className='h-48 flex items-center justify-center text-xs text-gray-500'>Loading data...</div>: <BeneficiaryTable rows={rows} />}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Identity & Account Validation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs'>
            <div className='p-3 rounded border bg-white shadow-sm flex flex-col gap-1'>
              <span className='font-medium text-gray-600 flex items-center gap-1'><ShieldCheck className='h-4 w-4 text-green-600' />e-KYC Match</span>
              <span className='text-green-600 font-semibold'>96% Verified</span>
              <p className='text-[10px] text-gray-500 leading-snug'>Aadhaar demographic + biometric (simulated)</p>
            </div>
            <div className='p-3 rounded border bg-white shadow-sm flex flex-col gap-1'>
              <span className='font-medium text-gray-600 flex items-center gap-1'><ShieldCheck className='h-4 w-4 text-emerald-600' />NPCI Seeding</span>
              <span className='text-emerald-600 font-semibold'>91% Linked</span>
              <p className='text-[10px] text-gray-500 leading-snug'>Bank mapped to Aadhaar UID (mock)</p>
            </div>
            <div className='p-3 rounded border bg-white shadow-sm flex flex-col gap-1'>
              <span className='font-medium text-gray-600 flex items-center gap-1'><AlertTriangle className='h-4 w-4 text-amber-600' />Risk Flags</span>
              <span className='text-amber-600 font-semibold'>4 Pending</span>
              <p className='text-[10px] text-gray-500 leading-snug'>Account name mismatch / KYC expired</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
