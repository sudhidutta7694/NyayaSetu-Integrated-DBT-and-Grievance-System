export interface Announcement { id:string; title:string; body:string; act:'PCR'|'POA'|'INCENTIVE'; date:string; category:'GUIDELINE'|'UPDATE'|'REMINDER' }

export const announcements: Announcement[] = [
  { id:'a1', title:'Updated Compensation Disbursement Timeline', body:'Revised processing window for PCR Act compensation applications now 21 days from verification.', act:'PCR', date:new Date().toISOString(), category:'UPDATE' },
  { id:'a2', title:'PoA Act Legal Aid Expansion', body:'Additional panel advocates empanelled for remote districts. Applicants may select preferred advocate in step 3.', act:'POA', date:new Date(Date.now()-86400000).toISOString(), category:'GUIDELINE' },
  { id:'a3', title:'Required FIR Copy Clarification', body:'Ensure FIR copy clearly shows station seal; blurred images may delay verification.', act:'PCR', date:new Date(Date.now()-2*86400000).toISOString(), category:'REMINDER' },
  { id:'a4', title:'Medical Report Optional for Stage 1', body:'Initial submission under PoA Act can proceed without medical report; provide before disbursement stage.', act:'POA', date:new Date(Date.now()-3*86400000).toISOString(), category:'UPDATE' }
] 
