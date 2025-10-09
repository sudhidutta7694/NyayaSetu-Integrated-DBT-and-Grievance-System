'use client'
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronRight, ChevronLeft, Save, CheckCircle } from 'lucide-react'
import { DocumentUploader, UploadFileMeta } from '@/components/documents/DocumentUploader'
import { DocumentChecklistProvider, useDocumentChecklist } from '@/contexts/DocumentChecklistContext'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

interface DraftApplication { id:string; step:number; data:Record<string,any>; updatedAt:string }
interface MappedDoc { id:string; requirementType:string; meta:UploadFileMeta; verificationStatus:'PENDING'|'VERIFIED'|'REJECTED' }
const TOTAL_STEPS=5
const stepLabels=['Applicant Info','Incident Details','Relief Requested','Document Checklist','Review & Consent']

function WizardInner(){
  const { act,setAct,requirements }=useDocumentChecklist()
  const router = useRouter()
  const [draft,setDraft]=useState<DraftApplication>({ id:'temp-1', step:1, data:{}, updatedAt:new Date().toISOString() })
  const [isSaving,setIsSaving]=useState(false)
  const [autoSaveMessage,setAutoSaveMessage]=useState('')
  const [errors,setErrors]=useState<Record<string,string>>({})
  const [docs,setDocs]=useState<UploadFileMeta[]>([])
  const [mapped,setMapped]=useState<MappedDoc[]>([])
  const [declaration,setDeclaration]=useState(false)

  // Compute effective requirements based on act + requested benefits and scenario
  const effectiveRequirements = useMemo(()=>{
    const base = requirements.map(r=> ({...r}))
    const benefits: string[] = Array.isArray(draft.data.requestedBenefits)? draft.data.requestedBenefits: []
    // Rules to tighten requirements per scenario (heuristics based on acts)
    if(act==='PCR'){
      if(benefits.includes('LEGAL_AID')){
        const idx = base.findIndex(r=> r.type==='COURT_ORDER'); if(idx>=0) base[idx].required = true
      }
      if((draft.data.amountRequested||0) > 0){
        const idx = base.findIndex(r=> r.type==='MEDICAL_REPORT'); if(idx>=0) base[idx].required = true
      }
    } else if(act==='POA'){
      if(benefits.includes('LEGAL_AID')){
        const idx = base.findIndex(r=> r.type==='COURT_PROCEEDINGS'); if(idx>=0) base[idx].required = true
      }
      if(benefits.includes('REHABILITATION')){
        const idx = base.findIndex(r=> r.type==='REHAB_PROOF'); if(idx>=0) base[idx].required = true
      }
      if((draft.data.amountRequested||0) > 0){
        const idx = base.findIndex(r=> r.type==='MEDICAL_REPORT'); if(idx>=0) base[idx].required = true
      }
    } else if(act==='INCENTIVE'){
      // Keep marriage-related docs required, optionally tighten address proof
      if(benefits.includes('INCENTIVE')){
        const idx = base.findIndex(r=> r.type==='ADDRESS_PROOF_BOTH'); if(idx>=0) base[idx].required = true
      }
    }
    return base
  }, [requirements, act, draft.data.requestedBenefits, draft.data.amountRequested])

  // Debounced autosave when typing stops (600ms)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const autosave=useCallback(async(partial:Record<string,any>)=>{
    if(debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async()=> {
      setIsSaving(true)
      await new Promise(r=> setTimeout(r,300))
  setDraft(prev=> ({...prev, data:{...prev.data,...partial}, updatedAt:new Date().toISOString()}))
  // optimistic API draft save (mock endpoint)
  try { fetch('/api/drafts', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id:draft.id, data:{...draft.data, ...partial} }) }) } catch {}
      setIsSaving(false)
      setAutoSaveMessage('Draft saved')
    },600)
  },[])
  useEffect(()=>{ if(autoSaveMessage){ toast.success(autoSaveMessage,{duration:1500}); const t=setTimeout(()=> setAutoSaveMessage(''),1600); return ()=> clearTimeout(t) } },[autoSaveMessage])
  function next(){ setDraft(d=> ({...d, step:Math.min(TOTAL_STEPS,d.step+1)})) }
  function prev(){ setDraft(d=> ({...d, step:Math.max(1,d.step-1)})) }
  function handleFieldChange(name:string,value:any){ autosave({ [name]:value }) }
  // Dynamic documents schema enforcing required coverage
  const documentsSchema = z.array(z.object({
    requirementType: z.string(),
    id: z.string(),
    verificationStatus: z.enum(['PENDING','VERIFIED','REJECTED']).optional()
  })).superRefine((docs,ctx)=> {
    const requiredReqs = effectiveRequirements.filter(r=> r.required)
    requiredReqs.forEach(r=> {
      if(!docs.some(d=> d.requirementType===r.type)){
        ctx.addIssue({ code:'custom', message:`Missing required document: ${r.label}` })
      }
    })
  })
  // Zod schemas per step
  const stepSchemas: Record<number,z.ZodSchema<any>> = {
    1: z.object({ fullName: z.string().min(1,'Required'), phone: z.string().min(8,'Required') }),
    2: z.object({ incidentDate: z.string().min(1,'Required'), district: z.string().min(1,'Required') }),
    3: z.object({ amountRequested: z.number({ invalid_type_error:'Enter amount'}).positive('Enter amount'), requestedBenefits: z.array(z.string()).min(1,'Select at least one') }),
    4: z.object({ documents: documentsSchema })
  }
  function validate(step=draft.step){
    const e:Record<string,string>={}
    for(let s=1; s<=step; s++){
      const schema=stepSchemas[s]
      if(schema){
        const parse = schema.safeParse(draft.data)
        if(!parse.success){
          parse.error.issues.forEach(i=> { if(i.path[0]) e[i.path[0] as string]= i.message })
        }
      }
    }
    if(step>=4){
      const required = effectiveRequirements.filter(r=> r.required)
      const covered = required.every(r=> mapped.some(m=> m.requirementType===r.type))
      if(!covered) e.documents = `Upload all required documents (${required.length})`
    }
    if(step>=5 && !declaration) e.declaration='Accept declaration'
    setErrors(e)
    return Object.keys(e).length===0
  }
  // Determine max navigable step (must complete validations up to previous step)
  const maxNavigableStep = useMemo(()=>{
    // Validate incrementally without mutating errors shown (use safeParse directly)
    for(let s=1; s<=TOTAL_STEPS; s++){
      const schema = stepSchemas[s]
      if(s===5){ // allow entering Review without declaration
        return 5
      }
      if(schema){
        const parse = schema.safeParse(draft.data)
        if(!parse.success){
          return Math.max(1, s)
        }
      }
    }
    return TOTAL_STEPS
  }, [draft.data])

  function submit(){
    if(!validate(5)){ toast.error('Fix validation errors'); return }
    // Build application record and persist to localStorage
    const id = Math.random().toString(36).slice(2)
    const number = `APP-${new Date().getFullYear()}-${Math.floor(Math.random()*1000).toString().padStart(3,'0')}`
    const title = `${act} ${Array.isArray(draft.data.requestedBenefits)? draft.data.requestedBenefits.join(', '): ''} Application`.trim()
    const record = {
      id,
      applicationNumber: number,
      title: title || `${act} Application`,
      status: 'SUBMITTED',
      amountRequested: Number(draft.data.amountRequested)||0,
      amountApproved: undefined,
      updatedAt: new Date().toISOString()
    }
    try {
      const key = 'nyaya.apps'
      const prev = JSON.parse(localStorage.getItem(key)||'[]')
      localStorage.setItem(key, JSON.stringify([record, ...prev]))
    } catch {}
    toast.success('Application submitted')
    setTimeout(()=> router.push('/applications'), 600)
  }

  function renderStep(){
    switch(draft.step){
      case 1:
        return (
          <div className='space-y-4' aria-labelledby='step-1-title'>
            <h2 id='step-1-title' className='text-lg font-semibold'>Applicant Info</h2>
            <label className='block text-sm font-medium'>Act Type
              <select
                className='mt-1 w-full border rounded px-3 py-2 text-sm'
                value={act}
                onChange={e=> { setAct(e.target.value) }}
              >
                <option value='PCR'>PCR Act</option>
                <option value='POA'>PoA Act</option>
                <option value='INCENTIVE'>Incentive</option>
              </select>
            </label>
            <label className='block text-sm font-medium'>Full Name
              <input className='mt-1 w-full border rounded px-3 py-2 text-sm' defaultValue={draft.data.fullName||''} onChange={e=> handleFieldChange('fullName',e.target.value)} />
              {errors.fullName && <span className='text-red-600 text-xs mt-1'>{errors.fullName}</span>}
            </label>
            <label className='block text-sm font-medium'>Phone
              <input className='mt-1 w-full border rounded px-3 py-2 text-sm' defaultValue={draft.data.phone||''} onChange={e=> handleFieldChange('phone',e.target.value)} />
              {errors.phone && <span className='text-red-600 text-xs mt-1'>{errors.phone}</span>}
            </label>
          </div>
        )
      case 2:
        return (
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold'>Incident Details</h2>
            <div className='grid md:grid-cols-2 gap-4'>
              <label className='text-sm font-medium flex flex-col'>Incident Date
                <input type='date' className='mt-1 border rounded px-3 py-2 text-sm' value={draft.data.incidentDate||''} onChange={e=> handleFieldChange('incidentDate',e.target.value)} />
                {errors.incidentDate && <span className='text-red-600 text-xs mt-1'>{errors.incidentDate}</span>}
              </label>
              <label className='text-sm font-medium flex flex-col'>District
                <input className='mt-1 border rounded px-3 py-2 text-sm' value={draft.data.district||''} onChange={e=> handleFieldChange('district',e.target.value)} />
                {errors.district && <span className='text-red-600 text-xs mt-1'>{errors.district}</span>}
              </label>
              <label className='text-sm font-medium flex flex-col'>Police Station
                <input className='mt-1 border rounded px-3 py-2 text-sm' value={draft.data.policeStation||''} onChange={e=> handleFieldChange('policeStation',e.target.value)} />
              </label>
              <label className='text-sm font-medium flex flex-col'>FIR Number
                <input className='mt-1 border rounded px-3 py-2 text-sm' value={draft.data.firNumber||''} onChange={e=> handleFieldChange('firNumber',e.target.value)} />
              </label>
            </div>
          </div>
        )
      case 3:
        return (
          <div className='space-y-4'>
            {/* <h2 className='text-lg font-semibold'>Relief Requested</h2>
            <label className='text-sm font-medium flex flex-col'>Amount Requested (₹)
              <input type='number' min={0} className='mt-1 border rounded px-3 py-2 text-sm' value={draft.data.amountRequested??''} onChange={e=> handleFieldChange('amountRequested', Number(e.target.value||0))} />
              {errors.amountRequested && <span className='text-red-600 text-xs mt-1'>{errors.amountRequested}</span>}
            </label> */}
            <fieldset className='space-y-2'>
              <legend className='text-sm font-medium'>Benefits</legend>
              {['LEGAL_AID','REHABILITATION','INCENTIVE'].map(opt=> (
                <label key={opt} className='flex items-center gap-2 text-sm'>
                  <input
                    type='checkbox'
                    checked={(draft.data.requestedBenefits||[]).includes(opt)}
                    onChange={()=> {
                      const current=draft.data.requestedBenefits||[];
                      const next=current.includes(opt)? current.filter((x:string)=> x!==opt): [...current,opt];
                      handleFieldChange('requestedBenefits',next)
                    }}
                  />
                  {opt.replace('_',' ')}
                </label>
              ))}
              {errors.requestedBenefits && <span className='text-red-600 text-xs mt-1'>{errors.requestedBenefits}</span>}
            </fieldset>
          </div>
        )
      case 4:
        return (
          <div className='space-y-6'>
            <h2 className='text-lg font-semibold'>Document Checklist</h2>
            <p className='text-xs text-gray-500'>Upload documents then assign each required item using the dropdown. Verification statuses are mock and for demonstration.</p>
            <div className='space-y-3'>
              {effectiveRequirements.map(r=> {
                const mappedEntry = mapped.find(m=> m.requirementType===r.type)
                const statusColor = mappedEntry? (mappedEntry.verificationStatus==='VERIFIED'? 'text-green-600': mappedEntry.verificationStatus==='REJECTED'? 'text-red-600':'text-orange-600') : (r.required? 'text-red-600':'text-gray-400')
                return (
                  <div key={r.type} className='border rounded-md p-3 bg-gray-50 flex flex-col gap-2 text-xs'>
                    <div className='flex flex-wrap items-center justify-between gap-2'>
                      <div className='flex items-center gap-2 font-medium'>
                        <span>{r.label}</span>
                        {r.required && <span className='text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-700'>Required</span>}
                        {!r.required && <span className='text-[10px] px-1 py-0.5 rounded bg-gray-200 text-gray-600'>Optional</span>}
                        {r.sampleUrl && <a href={r.sampleUrl} target='_blank' rel='noopener noreferrer' className='text-[10px] underline text-orange-600'>Sample</a>}
                      </div>
                      <div className={`text-[11px] font-semibold ${statusColor}`} aria-live='polite'>
                        {mappedEntry? (mappedEntry.verificationStatus==='VERIFIED'? 'Verified': mappedEntry.verificationStatus==='REJECTED'? 'Rejected': 'Pending Review') : (r.required? 'Missing':'Unassigned')}
                      </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                      <label className='flex items-center gap-2 text-[11px]'>Assign:
                        <select
                          className='border rounded px-2 py-1 text-[11px]'
                          value={mappedEntry? mappedEntry.id: ''}
                          onChange={e=> {
                            const fileId = e.target.value
                            setMapped(prev => {
                              let next = prev.filter(m=> m.requirementType!==r.type)
                              if(fileId){
                                const fileMeta = docs.find(f=> f.id===fileId)
                                if(fileMeta) next = [...next, { id:fileMeta.id, requirementType:r.type, meta:fileMeta, verificationStatus:'PENDING' }]
                              }
                              handleFieldChange('documents', next.map(m=> ({ id:m.id, requirementType:m.requirementType, verificationStatus:m.verificationStatus })))
                              return next
                            })
                          }}
                        >
                          <option value=''>-- Select Uploaded File --</option>
                          {docs.map(f=> (
                            <option key={f.id} value={f.status==='COMPLETE'? f.id: ''} disabled={f.status!=='COMPLETE'}>
                              {f.file?.name} {f.status!=='COMPLETE'? `(${f.status.toLowerCase()})`: ''}
                            </option>
                          ))}
                        </select>
                      </label>
                      {mappedEntry && (
                        <div className='flex items-center gap-1'>
                          <button type='button' className='text-[10px] px-2 py-0.5 rounded border border-green-600 text-green-700 hover:bg-green-50' onClick={()=> {
                            setMapped(prev => prev.map(m=> m.requirementType===r.type? {...m, verificationStatus:'VERIFIED'}:m))
                            handleFieldChange('documents', mapped.map(m=> ({ id:m.id, requirementType:m.requirementType, verificationStatus: m.requirementType===r.type? 'VERIFIED': m.verificationStatus })))
                          }}>Mark Verified</button>
                          <button type='button' className='text-[10px] px-2 py-0.5 rounded border border-red-600 text-red-700 hover:bg-red-50' onClick={()=> {
                            setMapped(prev => prev.map(m=> m.requirementType===r.type? {...m, verificationStatus:'REJECTED'}:m))
                            handleFieldChange('documents', mapped.map(m=> ({ id:m.id, requirementType:m.requirementType, verificationStatus: m.requirementType===r.type? 'REJECTED': m.verificationStatus })))
                          }}>Reject</button>
                          <button type='button' className='text-[10px] px-2 py-0.5 rounded border border-orange-600 text-orange-700 hover:bg-orange-50' onClick={()=> {
                            setMapped(prev => prev.map(m=> m.requirementType===r.type? {...m, verificationStatus:'PENDING'}:m))
                            handleFieldChange('documents', mapped.map(m=> ({ id:m.id, requirementType:m.requirementType, verificationStatus: m.requirementType===r.type? 'PENDING': m.verificationStatus })))
                          }}>Reset</button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <DocumentUploader
              allowReusePicker
              existingDocs={[]}
              onFilesChange={(fs)=> {
                setDocs(fs)
                // attempt auto-map new complete files to first unassigned requirements
                setMapped(prev => {
                  const next=[...prev]
                  const unassignedReqs = effectiveRequirements.filter(r=> !next.some(m=> m.requirementType===r.type))
                  const newComplete = fs.filter(f=> f.status==='COMPLETE' && !next.some(m=> m.id===f.id))
                  for(const req of unassignedReqs){
                    const file = newComplete.shift()
                    if(!file) break
                    next.push({ id:file.id, requirementType:req.type, meta:file, verificationStatus:'PENDING' })
                  }
                  handleFieldChange('documents', next.map(m=> ({ id:m.id, requirementType:m.requirementType, verificationStatus:m.verificationStatus })))
                  return next
                })
              }}
            />
            {errors.documents && <div className='text-red-600 text-xs'>{errors.documents}</div>}
            <div aria-live='polite' className='sr-only'>Document mapping updated</div>
          </div>
        )
      case 5:
        return (
          <div className='space-y-4'>
            <h2 className='text-lg font-semibold'>Review & Consent</h2>
            <div className='border rounded-md p-4 bg-gray-50 text-sm space-y-2'>
              <p><strong>Applicant:</strong> {draft.data.fullName||'—'} • {draft.data.phone||'—'} • <strong>Act:</strong> {act}</p>
              <p><strong>Incident:</strong> {draft.data.incidentDate||'—'} / {draft.data.district||'—'}</p>
              <p><strong>Relief:</strong> ₹{draft.data.amountRequested||'—'} • {Array.isArray(draft.data.requestedBenefits)? draft.data.requestedBenefits.join(', '):'—'}</p>
              <p><strong>Documents Attached:</strong> {mapped.length}/{effectiveRequirements.filter(r=> r.required).length} required</p>
              <div className='pt-2'>
                <p className='font-medium'>Documents</p>
                <ul className='list-disc list-inside text-[13px] text-gray-700'>
                  {mapped.map(m=> (
                    <li key={m.id}>{m.meta.file?.name} — <span className='uppercase'>{m.requirementType.replace(/_/g,' ')}</span> ({m.verificationStatus?.toLowerCase()})</li>
                  ))}
                </ul>
              </div>
            </div>
            <label className='flex items-start gap-2 text-sm'>
              <input type='checkbox' checked={declaration} onChange={e=> setDeclaration(e.target.checked)} />
              <span>I declare information is true.</span>
            </label>
            {errors.declaration && <div className='text-red-600 text-xs'>{errors.declaration}</div>}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className='space-y-8' aria-label='New application wizard'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-semibold tracking-tight'>New Application</h1>
        <div className='text-xs text-gray-500 flex items-center gap-2'>{isSaving? <span className='animate-pulse'>Saving…</span>: <span>Last saved: {new Date(draft.updatedAt).toLocaleTimeString()}</span>}</div>
      </div>
      <nav aria-label='Progress steps'>
        <ol className='grid grid-cols-1 md:grid-cols-5 gap-3'>
          {stepLabels.map((label,idx)=> { const stepNum=idx+1; const active=stepNum===draft.step; const complete=stepNum<draft.step; const allowed=stepNum<=maxNavigableStep; return (
            <li key={label} className='flex items-center' aria-current={active? 'step':undefined}>
              <button disabled={!allowed} onClick={()=> allowed && setDraft(d=> ({...d, step: stepNum}))} className={`group flex-1 border rounded-md px-3 py-2 text-left text-xs md:text-sm focus:outline-none ${active?'ring-2 ring-orange-500':''} ${allowed? 'bg-white hover:bg-gray-50 focus:ring-2 focus:ring-orange-500':'bg-gray-100 text-gray-400 cursor-not-allowed'}`} title={!allowed? 'Complete previous steps to continue': undefined}>
                <span className='flex items-center gap-2'>
                  <span className={`h-5 w-5 inline-flex items-center justify-center rounded-full text-[11px] font-medium ${complete?'bg-green-600 text-white': active? 'bg-orange-600 text-white':'bg-gray-200 text-gray-600'}`}>{complete? <CheckCircle className='h-3 w-3' />: stepNum}</span>
                  <span>{label}</span>
                </span>
              </button>
            </li>) })}
        </ol>
      </nav>
      <Card className='border-gray-200'>
        <CardHeader><CardTitle className='text-lg'>{stepLabels[draft.step-1]}</CardTitle></CardHeader>
        <CardContent>
          {renderStep()}
          <div className='flex items-center justify-between mt-10'>
            <div className='flex gap-2'>
              <Button variant='outline' disabled={draft.step===1} onClick={prev}><ChevronLeft className='h-4 w-4 mr-1' />Prev</Button>
              {draft.step<TOTAL_STEPS && <Button onClick={()=> { if(validate(draft.step)) next() }}>Next<ChevronRight className='h-4 w-4 ml-1' /></Button>}
            </div>
            <div className='flex gap-2'>
              <Button type='button' variant='secondary' onClick={()=> autosave({})}><Save className='h-4 w-4 mr-1' />Save Draft</Button>
              {draft.step===TOTAL_STEPS && <Button className='bg-orange-600 hover:bg-orange-700' disabled={!validate(5)} onClick={submit}>Submit</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewApplicationWizard(){
  return <DocumentChecklistProvider><WizardInner /></DocumentChecklistProvider>
}
