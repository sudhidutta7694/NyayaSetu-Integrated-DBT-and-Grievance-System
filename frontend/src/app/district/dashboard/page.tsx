"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { districtDashboardApi } from '@/lib/api/districtDashboard';

export default function DistrictDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'documents' | 'cases'>('documents');
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const [pendingCases, setPendingCases] = useState<any[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [caseLoading, setCaseLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/district/login');
    }
  }, [user, loading, router]);


  // Fetch pending documents
  const fetchDocuments = async () => {
    setDocLoading(true);
    setError(null);
    try {
      const docs = await districtDashboardApi.getPendingDocuments();
      setPendingDocuments(docs);
    } catch (e: any) {
      console.error('Failed to fetch documents', e);
    } finally {
      setDocLoading(false);
    }
  };

  // Fetch pending cases
  const fetchCases = async () => {
    setCaseLoading(true);
    setError(null);
    try {
      const cases = await districtDashboardApi.getPendingCases();
      setPendingCases(cases);
    } catch (e: any) {
      console.error('Failed to fetch cases', e);
    } finally {
      setCaseLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchCases();
    }
    // eslint-disable-next-line
  }, [user]);

  // Document actions
  const handleVerifyDocument = async (id: string) => {
    setActionLoading(id);
    setError(null);
    try {
      await districtDashboardApi.verifyDocument(id);
      fetchDocuments();
    } catch (e: any) {
      setError('Failed to verify document');
    } finally {
      setActionLoading(null);
    }
  };

  // Case actions
  const handleCaseAction = async (id: string, action: string) => {
    setActionLoading(id + action);
    setError(null);
    try {
      await districtDashboardApi.caseAction(id, action);
      fetchCases();
    } catch (e: any) {
      setError('Failed to update case');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !user) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-6">District Authority Dashboard</h1>
        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold border ${tab === 'documents' ? 'bg-orange-600 text-white' : 'bg-white text-orange-700 border-orange-200'}`}
            onClick={() => setTab('documents')}
          >
            Pending Document Verification
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold border ${tab === 'cases' ? 'bg-orange-600 text-white' : 'bg-white text-orange-700 border-orange-200'}`}
            onClick={() => setTab('cases')}
          >
            Pending Cases
          </button>
        </div>
  {/* Error is now only logged to console, not shown in UI */}
        {tab === 'documents' && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Document Verification</h2>
            {docLoading ? (
              <div>Loading documents...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Document Name</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Created At</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingDocuments.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No pending documents</td></tr>
                  ) : pendingDocuments.map((doc) => (
                    <tr key={doc.id} className="border-b">
                      <td className="p-2">{doc.document_name}</td>
                      <td className="p-2">{doc.document_type}</td>
                      <td className="p-2">{doc.status}</td>
                      <td className="p-2">{new Date(doc.created_at).toLocaleString()}</td>
                      <td className="p-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                          disabled={actionLoading === doc.id}
                          onClick={() => handleVerifyDocument(doc.id)}
                        >
                          {actionLoading === doc.id ? 'Verifying...' : 'Verify'}
                        </button>
                        {/* Add more actions if needed */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
        {tab === 'cases' && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Pending Cases</h2>
            {caseLoading ? (
              <div>Loading cases...</div>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Title</th>
                    <th className="p-2 text-left">Application #</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Submitted At</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCases.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-4">No pending cases</td></tr>
                  ) : pendingCases.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="p-2">{c.title}</td>
                      <td className="p-2">{c.application_number}</td>
                      <td className="p-2">{c.status}</td>
                      <td className="p-2">{new Date(c.submitted_at).toLocaleString()}</td>
                      <td className="p-2">
                        <button
                          className="bg-blue-600 text-white px-3 py-1 rounded mr-2 disabled:opacity-50"
                          disabled={actionLoading === c.id + 'forward'}
                          onClick={() => handleCaseAction(c.id, 'forward')}
                        >
                          {actionLoading === c.id + 'forward' ? 'Forwarding...' : 'Forward'}
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                          disabled={actionLoading === c.id + 'cancel'}
                          onClick={() => handleCaseAction(c.id, 'cancel')}
                        >
                          {actionLoading === c.id + 'cancel' ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
