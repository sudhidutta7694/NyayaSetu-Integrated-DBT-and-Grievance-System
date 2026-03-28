import jsPDF from 'jspdf'

// Helper function to convert number to words (Indian numbering system)
function convertNumberToWords(num: number): string {
  if (num === 0) return 'Zero'
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return ''
    if (n < 10) return ones[n]
    if (n < 20) return teens[n - 10]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '')
  }
  
  if (num < 1000) return convertLessThanThousand(num)
  
  // Indian numbering system: Crore, Lakh, Thousand
  const crores = Math.floor(num / 10000000)
  const lakhs = Math.floor((num % 10000000) / 100000)
  const thousands = Math.floor((num % 100000) / 1000)
  const remainder = num % 1000
  
  let result = ''
  if (crores > 0) result += convertLessThanThousand(crores) + ' Crore '
  if (lakhs > 0) result += convertLessThanThousand(lakhs) + ' Lakh '
  if (thousands > 0) result += convertLessThanThousand(thousands) + ' Thousand '
  if (remainder > 0) result += convertLessThanThousand(remainder)
  
  return result.trim()
}

interface ApplicationData {
  application_number: string
  applicant_name: string
  application_type: string
  fir_number?: string
  incident_date?: string
  incident_description?: string
  amount_approved?: number
  status: string
  district?: string
  police_station?: string
  submitted_at?: string
  approved_at?: string
  email?: string
  phone?: string
  address?: string
  cctns_verified?: boolean
}

export async function generateOfficialPDF(data: ApplicationData) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = 20

  // Add yellow/cream paper background
  doc.setFillColor(255, 253, 240) // Light cream/yellow color
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Helper function to add centered text
  const addCenteredText = (text: string, y: number, fontSize: number, isBold: boolean = false) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    const textWidth = doc.getTextWidth(text)
    const x = (pageWidth - textWidth) / 2
    doc.text(text, x, y)
  }

  // Helper function to add text
  const addText = (text: string, x: number, y: number, fontSize: number = 11, isBold: boolean = false) => {
    doc.setFontSize(fontSize)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    doc.text(text, x, y)
  }

  // Add border
  doc.setDrawColor(150, 100, 50) // Brown border
  doc.setLineWidth(0.5)
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

  // Reset draw color to black for text
  doc.setDrawColor(0, 0, 0)

  // Add National Emblem Image FIRST (Navy Blue)
  try {
    const emblemImg = new Image()
    emblemImg.src = '/Emblem_of_India_(navy_blue).svg.png'
    
    await new Promise((resolve) => {
      emblemImg.onload = resolve
      emblemImg.onerror = resolve
      setTimeout(resolve, 100) // Timeout fallback
    })
    
    if (emblemImg.complete && emblemImg.naturalHeight !== 0) {
      const emblemSize = 18
      const emblemX = (pageWidth - emblemSize) / 2
      doc.addImage(emblemImg, 'PNG', emblemX, yPos, emblemSize, emblemSize)
      yPos += emblemSize + 2
    } else {
      yPos += 2
    }
  } catch (error) {
    yPos += 2
  }

  // Header Section - Government of India (AFTER emblem, no extra characters)
//   doc.setTextColor(0, 0, 0)
//   addCenteredText('भारत सरकार', yPos, 9, true)
  yPos += 5
  addCenteredText('GOVERNMENT OF INDIA', yPos, 10, true)
  yPos += 6

  // Ministry details (directly after, no middle section)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  addCenteredText('Ministry of Social Justice and Empowerment', yPos, 9)
  yPos += 4
  addCenteredText('Department of Social Justice', yPos, 8)
  yPos += 7

  // Document Title
  doc.setFillColor(255, 140, 0) // Dark orange color
  doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F')
  doc.setTextColor(255, 255, 255)
  addCenteredText('CASE SANCTION ORDER', yPos + 5.5, 11, true)
  doc.setTextColor(0, 0, 0)
  yPos += 11

  // Reference Number and Date
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  addText(`Ref: ${data.application_number}`, margin, yPos, 8)
  const dateText = `Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
  const dateWidth = doc.getTextWidth(dateText)
  addText(dateText, pageWidth - margin - dateWidth, yPos, 8)
  yPos += 5

  // Horizontal line
  doc.setLineWidth(0.2)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 4

  // Subject line - Condensed
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  addText('Subject:', margin, yPos, 8, true)
  doc.setFont('helvetica', 'normal')
  addText(`Sanction under ${data.application_type.replace(/_/g, ' ')}`, margin + 15, yPos, 8)
  yPos += 5

  // Addressee
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  addText('To,', margin, yPos, 9, true)
  yPos += 4
  doc.setFont('helvetica', 'normal')
  addText(data.applicant_name, margin, yPos, 9)
  yPos += 4
  if (data.district) {
    addText(`District: ${data.district}`, margin, yPos, 8)
    yPos += 4
  }
  if (data.address) {
    const addressLines = doc.splitTextToSize(data.address, 80)
    doc.setFontSize(7.5)
    doc.text(addressLines, margin, yPos)
    yPos += addressLines.length * 3 + 3
  }
  yPos += 3

  // Salutation
  doc.setFontSize(9)
  addText('Dear Applicant,', margin, yPos, 9)
  yPos += 6

  // Body paragraph 1 - Full content
  const para1 = `With reference to your application dated ${data.submitted_at ? new Date(data.submitted_at).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}, bearing Application Number ${data.application_number}, filed under the ${data.application_type.replace(/_/g, ' ')} Act, I am pleased to inform you that your case has been duly examined and processed by the competent authorities.`
  const para1Lines = doc.splitTextToSize(para1, pageWidth - 2 * margin - 10)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(para1Lines, margin, yPos)
  yPos += para1Lines.length * 3 + 5

  // Case Details Section - Full format
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  addText('CASE DETAILS:', margin, yPos, 8, true)
  yPos += 4
  
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  if (data.fir_number) {
    addText(`• FIR Number: ${data.fir_number}`, margin + 2, yPos, 7.5)
    yPos += 3.5
  }
  if (data.police_station) {
    addText(`• Police Station: ${data.police_station}`, margin + 2, yPos, 7.5)
    yPos += 3.5
  }
  if (data.incident_date) {
    addText(`• Incident Date: ${new Date(data.incident_date).toLocaleDateString('en-IN')}`, margin + 2, yPos, 7.5)
    yPos += 3.5
  }
  if (data.cctns_verified) {
    addText('• CCTNS Verification: ✓ Verified', margin + 2, yPos, 7.5)
    yPos += 3.5
  }
  yPos += 4

  // Body paragraph 2 - Full content
  const para2 = `After careful review of your case and verification of all submitted documents through the Crime and Criminal Tracking Network & Systems (CCTNS), the Government of India, through the Ministry of Social Justice and Empowerment, has decided to sanction the following relief under the ${data.application_type.replace(/_/g, ' ')} Act:`
  const para2Lines = doc.splitTextToSize(para2, pageWidth - 2 * margin - 10)
  doc.setFontSize(8)
  doc.text(para2Lines, margin, yPos)
  yPos += para2Lines.length * 3 + 5

  // Sanction Details Box - Compact
  const boxHeight = 24
  doc.setFillColor(255, 248, 230) // Light yellow background
  doc.rect(margin + 5, yPos, pageWidth - 2 * margin - 10, boxHeight, 'F')
  doc.setLineWidth(0.3)
  doc.setDrawColor(255, 140, 0) // Orange border
  doc.rect(margin + 5, yPos, pageWidth - 2 * margin - 10, boxHeight)
  doc.setDrawColor(0, 0, 0)
  
  yPos += 4
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  addCenteredText('GOVERNMENT SANCTION ORDER', yPos, 9, true)
  yPos += 5
  
  if (data.amount_approved && data.amount_approved > 0) {
    doc.setFontSize(10)
    addCenteredText(`Financial Compensation: ₹ ${data.amount_approved.toLocaleString('en-IN')}`, yPos, 10, true)
    yPos += 5
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    addCenteredText(`(Rupees ${convertNumberToWords(data.amount_approved)} Only)`, yPos, 7)
    yPos += 4
    addCenteredText('Payment Mode: Direct Benefit Transfer (DBT)', yPos, 7)
  } else {
    doc.setFontSize(9)
    addCenteredText('Compensation: As per applicable norms', yPos, 9, true)
    yPos += 4
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    addCenteredText('(Final amount will be communicated separately)', yPos, 7)
  }
  yPos += 4
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  addCenteredText('Status: APPROVED & SANCTIONED', yPos, 8, true)
  yPos += boxHeight - 21 + 4

  // Terms and Conditions - Full content
  yPos += 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  addText('Terms & Conditions:', margin, yPos, 8, true)
  yPos += 4
  
  const terms = [
    '1. The sanctioned amount will be directly transferred to your registered bank account through DBT.',
    '2. You must submit any additional documents if requested by the authorities within 15 days.',
    '3. The sanction is subject to verification of all particulars and documents submitted.',
    '4. Any false information may lead to cancellation of sanction and legal action.',
    '5. This order is valid for a period of 90 days from the date of issuance.'
  ]
  
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  terms.forEach(term => {
    const termLines = doc.splitTextToSize(term, pageWidth - 2 * margin - 12)
    doc.text(termLines, margin + 2, yPos)
    yPos += termLines.length * 3 + 1
  })
  yPos += 4

  // Legal Notice Box - Full content
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  addText('LEGAL NOTICE & PROSECUTION DETAILS:', margin, yPos, 8, true)
  yPos += 4
  
  doc.setFillColor(255, 250, 240)
  const noticeBoxHeight = 18
  doc.rect(margin + 3, yPos, pageWidth - 2 * margin - 6, noticeBoxHeight, 'F')
  doc.setLineWidth(0.2)
  doc.setDrawColor(100, 100, 100)
  doc.rect(margin + 3, yPos, pageWidth - 2 * margin - 6, noticeBoxHeight)
  doc.setDrawColor(0, 0, 0)
  
  yPos += 3
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  const legalText1 = '• The accused in this case have been prosecuted as per the provisions of law.'
  const legalText2 = '• Legal proceedings are being monitored by the concerned District Authority.'
  const legalText3 = '• Victim is entitled to free legal aid and rehabilitation support as per government schemes.'
  const legalText4 = '• Any intimidation or threat should be immediately reported to the authorities.'
  
  const legalLines1 = doc.splitTextToSize(legalText1, pageWidth - 2 * margin - 16)
  doc.text(legalLines1, margin + 5, yPos)
  yPos += legalLines1.length * 3.5
  
  const legalLines2 = doc.splitTextToSize(legalText2, pageWidth - 2 * margin - 16)
  doc.text(legalLines2, margin + 5, yPos)
  yPos += legalLines2.length * 3.5
  
  const legalLines3 = doc.splitTextToSize(legalText3, pageWidth - 2 * margin - 16)
  doc.text(legalLines3, margin + 5, yPos)
  yPos += legalLines3.length * 3.5
  
  const legalLines4 = doc.splitTextToSize(legalText4, pageWidth - 2 * margin - 16)
  doc.text(legalLines4, margin + 5, yPos)
  yPos += legalLines4.length * 3.5 + 2.5
  
  // Closing paragraph
 yPos += 5
  const closingText = 'We appreciate your patience throughout this process. For any queries or clarifications regarding this sanction order, please contact the nearest Social Welfare Office or visit the NyayaSetu portal.'
  const closingLines = doc.splitTextToSize(closingText, pageWidth - 2 * margin - 10)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.text(closingLines, margin, yPos)
  yPos += closingLines.length * 3 + 6

  // Signature section
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  addText('Yours faithfully,', margin, yPos, 8)
  yPos += 10
  
  // Signature line
  doc.setLineWidth(0.2)
  doc.line(margin, yPos, margin + 45, yPos)
  yPos += 3.5
  
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  addText('Authorized Signatory', margin, yPos, 8, true)
  yPos += 3.5
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  addText('Ministry of Social Justice and Empowerment', margin, yPos, 7.5)
  yPos += 3
  addText('Government of India', margin, yPos, 7.5)
  
  // Official Stamp (Circular representation)
  const stampX = pageWidth - margin - 40
  const stampY = yPos - 13
  doc.setLineWidth(0.3)
  doc.setDrawColor(200, 0, 0) // Red stamp
  doc.circle(stampX + 12, stampY, 12)
  doc.setLineWidth(0.15)
  doc.circle(stampX + 12, stampY, 10.5)
  doc.setFontSize(6)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(200, 0, 0)
  const stampText = 'GOVERNMENT'
  const stampText2 = 'OF INDIA'
  const stampText3 = 'OFFICIAL SEAL'
  const stampTextWidth = doc.getTextWidth(stampText)
  doc.text(stampText, stampX + 12 - stampTextWidth/2, stampY - 2.5)
  const stampText2Width = doc.getTextWidth(stampText2)
  doc.text(stampText2, stampX + 12 - stampText2Width/2, stampY + 1.5)
  doc.setFontSize(5)
  const stampText3Width = doc.getTextWidth(stampText3)
  doc.text(stampText3, stampX + 12 - stampText3Width/2, stampY + 5)
  doc.setTextColor(0, 0, 0) // Reset to black
  
  yPos += 5

  // Contact Information
  doc.setLineWidth(0.2)
  doc.setDrawColor(150, 150, 150)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  doc.setDrawColor(0, 0, 0)
  yPos += 2.5
  
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(50, 50, 50)
  addText('For Assistance:', margin, yPos, 6.5, true)
  yPos += 2.5
  doc.setFont('helvetica', 'normal')
  addText('National Helpline: 1800-XXX-XXXX (Toll Free) | Email: support@nyayasetu.gov.in', margin, yPos, 6)
  yPos += 2.5
  addText('Website: https://nyayasetu.gov.in | Operating Hours: 24x7', margin, yPos, 6)
  yPos += 3
  
  // Footer
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  addCenteredText('This is a computer-generated document and is valid without physical signature.', yPos, 6.5)
  yPos += 2.5
  doc.setFontSize(6)
  addCenteredText('Document ID: ' + data.application_number + ' | Generated on: ' + new Date().toLocaleDateString('en-IN'), yPos, 6)
  yPos += 2.5
  addCenteredText('For verification, visit: https://nyayasetu.gov.in/verify', yPos, 6)

  // Save the PDF
  doc.save(`NyayaSetu_${data.application_number}_SanctionOrder.pdf`)
}

// Function to generate PDF with mock data
export function generateMockPDF() {
  const mockData: ApplicationData = {
    application_number: 'NYAYA/2024/MH/12345',
    applicant_name: 'Rajesh Kumar Sharma',
    application_type: 'PCR_RELIEF',
    fir_number: 'FIR/MUM/2024/001234',
    incident_date: '2024-03-15',
    incident_description: 'Victim of atrocity case under SC/ST Prevention of Atrocities Act',
    amount_approved: 250000,
    status: 'APPROVED',
    district: 'Mumbai',
    police_station: 'Andheri Police Station',
    submitted_at: '2024-03-20T10:30:00Z',
    approved_at: '2024-10-10T15:45:00Z',
    email: 'rajesh.kumar@email.com',
    phone: '+91-9876543210',
    address: 'Flat 203, Building A, Andheri West, Mumbai - 400058',
    cctns_verified: true
  }

  generateOfficialPDF(mockData)
}
