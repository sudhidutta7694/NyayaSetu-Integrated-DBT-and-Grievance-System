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
  return response.data
}
export async function uploadToS3(
  presignedUrl: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> {
  
  await axios.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    },
  })
  
}
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

export async function getDocumentDownloadUrl(documentId: number | string): Promise<string> {
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
  return downloadUrl
}

export async function deleteDocument(documentId: number | string): Promise<void> {
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
