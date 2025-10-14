import axios from 'axios'
import { tokenStorage } from '@/lib/tokenStorage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

function getAuthHeaders() {
  const token = tokenStorage.getToken()
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

export const fiDashboardApi = {
  /**
   * Get all applications pending FI approval (SOCIAL_WELFARE_APPROVED status)
   */
  async getPendingApplications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/fi/pending`, {
        headers: getAuthHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch pending FI applications:', error)
      throw error
    }
  },

  /**
   * Get all processed applications (FUND_DISBURSED, COMPLETED, REJECTED)
   */
  async getProcessedApplications() {
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/fi/processed`, {
        headers: getAuthHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error('Failed to fetch processed FI applications:', error)
      throw error
    }
  },

  /**
   * Get full case details for FI review
   */
  async getCaseDetails(caseId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/cases/fi/case/${caseId}`, {
        headers: getAuthHeaders(),
      })
      return response.data
    } catch (error: any) {
      console.error(`Failed to fetch case details for ${caseId}:`, error)
      throw error
    }
  },

  /**
   * Approve application for disbursement
   */
  async approveApplication(caseId: string, comments?: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/fi/${caseId}/approve`,
        { comments },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      console.error(`Failed to approve application ${caseId}:`, error)
      throw error
    }
  },

  /**
   * Reject application
   */
  async rejectApplication(caseId: string, rejection_reason: string) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/fi/${caseId}/reject`,
        { rejection_reason },
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      console.error(`Failed to reject application ${caseId}:`, error)
      throw error
    }
  },

  /**
   * Disburse batch of approved applications (demo)
   */
  async disburseBatch() {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/cases/fi/disburse-batch`,
        {},
        { headers: getAuthHeaders() }
      )
      return response.data
    } catch (error: any) {
      console.error('Failed to disburse batch:', error)
      throw error
    }
  },
}
