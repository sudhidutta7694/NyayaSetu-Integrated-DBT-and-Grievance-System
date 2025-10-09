import axios from 'axios'
import { tokenStorage } from '../tokenStorage'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export interface PresignedUploadResponse {
  success: boolean
  data: {
    url: string
    s3_key: string
    filename: string
  }
}

export interface DocumentUploadResponse {
  success: boolean
  message: string
  data: {
    document_id: number
    file_url: string
    s3_key: string
    document_type: string
    status: string
  }
}

/**
 * Step 1: Request a presigned URL from backend
 */
export async function getPresignedUploadUrl(
  filename: string,
  contentType: string,
  documentType: string
): Promise<PresignedUploadResponse> {
  const token = tokenStorage.getToken()
  
  const response = await axios.post(
    `${API_URL}/documents/generate-upload-url`,
    {
      filename,
      content_type: contentType,
      document_type: documentType,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  console.log('\n' + '='.repeat(80))
  console.log('🔗 PRESIGNED UPLOAD URL GENERATED')
  console.log('='.repeat(80))
  console.log('📁 File:', filename)
  console.log('📦 Document Type:', documentType)
  console.log('⏰ Valid for: 5 minutes')
  console.log('🔗 Presigned URL:')
  console.log(response.data.data.url)
  console.log('='.repeat(80))
  console.log('💡 TIP: Copy the URL above and paste in a new browser tab to test!')
  console.log('   (You\'ll get an error because it expects a PUT request, but URL is valid)')
  console.log('='.repeat(80) + '\n')

  return response.data
}

/**
 * Step 2: Upload file directly to S3 using presigned URL
 */
export async function uploadToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  console.log('⬆️  Uploading file to S3...')
  console.log('📁 File:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`)
  
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
        console.log(`📊 Upload progress: ${progress}%`)
      }
    },
  })
  
  console.log('✅ File uploaded to S3 successfully!')
}

/**
 * Step 3: Confirm upload to backend and save metadata
 */
export async function confirmUpload(
  s3Key: string,
  documentType: string,
  filename: string,
  fileSize: number,
  contentType: string,
  digilockerId?: string
): Promise<DocumentUploadResponse> {
  const token = tokenStorage.getToken()
  
  const response = await axios.post(
    `${API_URL}/documents/confirm-upload`,
    {
      s3_key: s3Key,
      document_type: documentType,
      filename,
      file_size: fileSize,
      content_type: contentType,
      digilocker_id: digilockerId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  return response.data
}

/**
 * Complete upload flow: Get presigned URL -> Upload to S3 -> Confirm
 */
export async function uploadDocument(
  file: File,
  documentType: string,
  digilockerId?: string,
  onProgress?: (progress: number) => void
): Promise<DocumentUploadResponse> {
  try {
    // Step 1: Get presigned URL from backend
    const presignedResponse = await getPresignedUploadUrl(
      file.name,
      file.type,
      documentType
    )

    const { url: presignedUrl, s3_key } = presignedResponse.data

    // Step 2: Upload file directly to S3
    await uploadToS3(presignedUrl, file, onProgress)

    // Step 3: Confirm upload with backend
    const confirmResponse = await confirmUpload(
      s3_key,
      documentType,
      file.name,
      file.size,
      file.type,
      digilockerId
    )

    return confirmResponse
  } catch (error: any) {
    console.error('Upload error:', error)
    throw new Error(
      error.response?.data?.detail || 
      error.message || 
      'Failed to upload document'
    )
  }
}

export async function getDocumentDownloadUrl(documentId: number): Promise<string> {
  const token = tokenStorage.getToken()
  
  const response = await axios.get(
    `${API_URL}/documents/${documentId}/download`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  const downloadUrl = response.data.data.download_url
  
  console.log('\n' + '='.repeat(80))
  console.log('📥 PRESIGNED DOWNLOAD URL GENERATED')
  console.log('='.repeat(80))
  console.log('📄 Document ID:', documentId)
  console.log('⏰ Valid for: 1 hour')
  console.log('🔗 Download URL:')
  console.log(downloadUrl)
  console.log('='.repeat(80))
  console.log('💡 TIP: Copy the URL above and paste in a new browser tab to download!')
  console.log('='.repeat(80) + '\n')

  return downloadUrl
}

export async function deleteDocument(documentId: number): Promise<void> {
  const token = tokenStorage.getToken()
  
  await axios.delete(`${API_URL}/documents/${documentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function listUserDocuments(): Promise<any[]> {
  const token = tokenStorage.getToken()
  
  const response = await axios.get(`${API_URL}/documents/list`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return response.data.data
}
