"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/AuthProvider";
import { districtDashboardApi } from "@/lib/api/districtDashboard";
import { 
  Loader2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink,
  ChevronLeft,
  User2,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FolderOpen,
  AlertCircle,
  Download,
  Shield
} from "lucide-react";
import toast from 'react-hot-toast';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

/* ---------- tiny UI helpers ---------- */

function TableHeadRow({ cols }: { cols: string[] }) {
  return (
    <tr className="text-xs text-gray-600 border-b border-gray-200/50">
      {cols.map((c) => (
        <th key={c} className="px-4 py-4 font-medium text-left">
          {c}
        </th>
      ))}
    </tr>
  );
}

function TableSkeleton({ cols = 4, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r}>
          {Array.from({ length: cols }).map((__, c) => (
            <td key={c} className="px-4 py-5">
              <div className="h-3 w-full max-w-[180px] bg-gray-200 rounded-full animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-xl opacity-60">📋</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">{message}</p>
          <p className="text-xs text-gray-400">New applications will appear here when submitted.</p>
        </div>
      </td>
    </tr>
  );
}

/* Helper Components */
const Row = ({ label, value, icon }: { label: string; value?: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
    {icon && <div className="flex-shrink-0 mt-0.5 text-gray-400">{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
      <div className="text-sm text-gray-600 break-words">{value ?? "-"}</div>
    </div>
  </div>
);

/* ---------- page ---------- */

export default function DistrictDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"pending" | "processed">("pending");
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [processedApplications, setProcessedApplications] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [selectedAppDetails, setSelectedAppDetails] = useState<any | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [documentComments, setDocumentComments] = useState<Record<string, string>>({});
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);
  const [cctnsVerifying, setCctnsVerifying] = useState(false); // CCTNS verification loading state

  useEffect(() => {
    if (!loading && !user) router.replace("/district/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) fetchApplications();
  }, [loading, user]);

  const fetchApplications = async () => {
    setAppLoading(true);
    try {
      const [pendingResp, processedResp] = await Promise.all([
        districtDashboardApi.getPendingApplications(),
        districtDashboardApi.getApprovedApplications(),
      ]);
      const pending = Array.isArray(pendingResp) ? pendingResp : (pendingResp.applications || []);
      const processed = Array.isArray(processedResp) ? processedResp : (processedResp.applications || []);
      setPendingApplications(pending);
      setProcessedApplications(processed);
    } catch (e) {
      console.error("Failed to fetch applications", e);
      toast.error("Failed to load applications");
    } finally {
      setAppLoading(false);
    }
  };

  const fetchApplicationDetails = async (appId: string) => {
    try {
      const response = await districtDashboardApi.getApplicationDetails(appId);
      setSelectedAppDetails(response);
    } catch (error) {
      console.error("Failed to fetch application details:", error);
      toast.error("Failed to load application details");
    }
  };

  const handleSelectApplication = async (appId: string) => {
    setSelectedApplication(appId);
    await fetchApplicationDetails(appId);
  };

  const handleVerifyDocument = async (documentId: string, status: "VERIFIED" | "REJECTED") => {
    setActionLoading(documentId);
    try {
      const comments = documentComments[documentId] || "";
      const response = await districtDashboardApi.verifyDocument(documentId, status, comments);
      
      toast.success(`Document ${status.toLowerCase()} successfully`);
      
      // Check if application was auto-approved/rejected (moved to processed)
      const applicationData = response?.application;
      if (applicationData?.status === 'DOCUMENTS_APPROVED' || applicationData?.status === 'DOCUMENTS_REJECTED') {
        // Application moved to processed - show message and redirect
        toast.success(
          applicationData.status === 'DOCUMENTS_APPROVED' 
            ? 'All requirements met! Application forwarded to Social Welfare.'
            : 'Application rejected due to document issues.',
          { duration: 4000 }
        );
        
        // Close detail view and switch to processed tab
        setSelectedApplication(null);
        setSelectedAppDetails(null);
        setTab('processed');
        
        // Refresh both lists
        await fetchApplications();
      } else {
        // Still pending - just refresh details
        if (selectedApplication) {
          await fetchApplicationDetails(selectedApplication);
        }
        
        // Refresh the lists
        await fetchApplications();
      }
      
      setDocumentComments(prev => {
        const updated = { ...prev };
        delete updated[documentId];
        return updated;
      });
    } catch (error: any) {
      console.error(`Failed to ${status.toLowerCase()} document:`, error);
      toast.error(error.response?.data?.detail || `Failed to ${status.toLowerCase()} document`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyCCTNS = async () => {
    if (!selectedAppData?.application || !selectedAppData.application.fir_number) {
      toast.error('FIR number is required for CCTNS verification');
      return;
    }

    setCctnsVerifying(true);
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Verifying with CCTNS portal...');
      
      // Add 2-second delay to simulate external API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call backend API
      const response = await districtDashboardApi.cctnsVerifyApplication(
        selectedAppData.application.id,
        selectedAppData.application.fir_number
      );
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Check if application was auto-approved (moved to processed)
      const applicationData = response?.application;
      if (applicationData?.status === 'DOCUMENTS_APPROVED') {
        // Application moved to processed - show message and redirect
        toast.success('🎉 CCTNS verification completed! All requirements met - application forwarded to Social Welfare.', { duration: 4000 });
        
        // Close detail view and switch to processed tab
        setSelectedApplication(null);
        setSelectedAppDetails(null);
        setTab('processed');
        
        // Refresh both lists
        await fetchApplications();
      } else {
        // Still pending - show success and refresh details
        toast.success('CCTNS verification successful!');
        
        // Refresh application details to show updated status
        if (selectedApplication) {
          await fetchApplicationDetails(selectedApplication);
        }
        
        // Refresh the lists
        await fetchApplications();
      }
    } catch (error: any) {
      console.error('CCTNS verification failed:', error);
      toast.error(error.response?.data?.detail || 'CCTNS verification failed');
    } finally {
      setCctnsVerifying(false);
    }
  };

  const handleViewDocument = (doc: any) => {
    if (!doc.file_url) {
      toast.error('Document URL not available');
      return;
    }
    setViewingDocument(doc);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Get selected application data
  const selectedAppData = selectedAppDetails;

  // DETAIL VIEW - Show application details with accordion
  if (selectedApplication && selectedAppData) {
    const { application, user: applicant, documents } = selectedAppData;
    const verifiedCount = documents?.filter((d: any) => d.status === 'VERIFIED').length || 0;
    const totalCount = documents?.length || 0;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedApplication(null)} 
                  className="gap-2 hover:bg-orange-50 border-orange-200 text-orange-700 hover:text-orange-800 transition-all duration-200 shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
                <div className="h-6 w-px bg-gray-300 hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 font-medium">Application Details</span>
                    <div className="text-lg sm:text-xl font-bold text-gray-900">
                      #{application?.application_number || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick info bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Submitted: {application?.submitted_at ? new Date(application.submitted_at).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4" />
                <span>{applicant?.full_name ?? "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Badge className={`text-xs px-3 py-1 ${
                  verifiedCount === totalCount 
                    ? 'bg-green-600 hover:bg-green-600' 
                    : 'bg-orange-500 hover:bg-orange-500'
                }`}>
                  {verifiedCount}/{totalCount} Verified
                </Badge>
              </div>
            </div>
          </header>
        </div>

        <main className="max-w-7xl mx-auto w-full h-full">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
            {/* LEFT: Accordion Sections */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <Accordion type="multiple" defaultValue={["overview"]} className="w-full space-y-4">
                
                {/* APPLICATION OVERVIEW */}
                <AccordionItem value="overview" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-lg font-semibold py-4 px-6 hover:bg-gray-50 data-[state=open]:bg-orange-50 data-[state=open]:border-b border-gray-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Application Overview</div>
                        <div className="text-sm font-normal text-gray-500">Application details and information</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="space-y-0">
                      <Row 
                        label="Application Title" 
                        value={application?.title || "No title provided"} 
                        icon={<FileText className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Application Number" 
                        value={application?.application_number || "N/A"} 
                        icon={<FileText className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Application Type" 
                        value={application?.application_type?.replace(/_/g, ' ') || "N/A"} 
                        icon={<FolderOpen className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Current Status" 
                        value={<StatusBadge status={application?.status} label={application?.status?.replace(/_/g, ' ')} />} 
                        icon={<AlertCircle className="h-4 w-4" />} 
                      />
                      
                      {/* FIR Number & CCTNS Verification - Not shown for Inter-Caste Marriage */}
                      {application?.fir_number && application?.application_type !== 'INTER_CASTE_MARRIAGE' && (
                        <div className="flex items-start gap-4 py-3 border-b border-gray-100">
                          <Shield className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">FIR Number</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-gray-600 font-mono">{application.fir_number}</span>
                              
                              {/* CCTNS Verification Chip */}
                              {application?.cctns_verified ? (
                                <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-xs px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> 
                                  <span>Verified with CCTNS</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs px-2.5 py-1 bg-gray-50 rounded-md border border-gray-200">
                                  <XCircle className="h-3.5 w-3.5" /> 
                                  <span>Not Verified</span>
                                </span>
                              )}
                            </div>
                            
                            {/* Verify Button - Only show if not verified */}
                            {!application?.cctns_verified && (
                              <div className="mt-3">
                                <Button
                                  size="sm"
                                  onClick={handleVerifyCCTNS}
                                  disabled={cctnsVerifying}
                                  className="gap-2 bg-orange-600 hover:bg-orange-700 text-white"
                                >
                                  {cctnsVerifying ? (
                                    <>
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                      Verifying...
                                    </>
                                  ) : (
                                    <>
                                      <Shield className="h-4 w-4" />
                                      Verify with CCTNS
                                    </>
                                  )}
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* APPLICANT INFORMATION */}
                <AccordionItem value="applicant" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-lg font-semibold py-4 px-6 hover:bg-gray-50 data-[state=open]:bg-orange-50 data-[state=open]:border-b border-gray-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <User2 className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Applicant Information</div>
                        <div className="text-sm font-normal text-gray-500">Personal details of the applicant</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="space-y-0">
                      <Row 
                        label="Full Name" 
                        value={applicant?.full_name || "N/A"} 
                        icon={<User2 className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Email Address" 
                        value={applicant?.email || "N/A"} 
                        icon={<Mail className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Phone Number" 
                        value={applicant?.phone_number || "N/A"} 
                        icon={<Phone className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Address" 
                        value={applicant?.address || "N/A"} 
                        icon={<MapPin className="h-4 w-4" />} 
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* SUPPORTING DOCUMENTS */}
                <AccordionItem value="documents" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-lg font-semibold py-4 px-6 hover:bg-gray-50 data-[state=open]:bg-orange-50 data-[state=open]:border-b border-gray-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Supporting Documents</div>
                        <div className="text-sm font-normal text-gray-500">
                          {verifiedCount}/{totalCount} documents verified
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="space-y-3">
                      {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 text-sm truncate">
                                {doc.document_type?.replace(/_/g, ' ')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {doc.status === 'VERIFIED' ? '✓ Verified' : 'Pending verification'}
                              </div>
                            </div>
                          </div>
                          <StatusBadge status={doc.status} label={doc.status?.replace(/_/g, ' ')} />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

              </Accordion>
            </div>

            {/* RIGHT: Document Verification Area */}
            <div className="xl:col-span-1 order-1 xl:order-2">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 px-6 py-4">
                  <h3 className="text-lg font-bold text-white mb-1">Document Verification</h3>
                  <p className="text-sm text-white/90">Review and verify each document</p>
                </div>

                <div className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {documents.map((doc: any) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {doc.document_type?.replace(/_/g, ' ')}
                          </h4>
                          <StatusBadge status={doc.status} label={doc.status?.replace(/_/g, ' ')} />
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {/* Comments */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Comments / Remarks
                          </label>
                          <textarea
                            value={documentComments[doc.id] || ""}
                            onChange={(e) => setDocumentComments({ ...documentComments, [doc.id]: e.target.value })}
                            placeholder="Add your remarks here..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            rows={2}
                            disabled={doc.status === 'VERIFIED' || doc.status === 'REJECTED'}
                          />
                        </div>

                        {/* Existing Comments */}
                        {doc.comments && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-xs font-medium text-blue-900 mb-1">Previous Comments:</div>
                            <div className="text-xs text-blue-800">{doc.comments}</div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-2 text-blue-600 hover:bg-blue-50 border-blue-200"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="h-4 w-4" />
                            View Document
                          </Button>

                          {doc.status !== 'VERIFIED' && doc.status !== 'REJECTED' && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-2 border-2 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-600 transition-all"
                                onClick={() => handleVerifyDocument(doc.id, 'VERIFIED')}
                                disabled={actionLoading === doc.id}
                              >
                                {actionLoading === doc.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 gap-2 border-2 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-600 transition-all"
                                onClick={() => handleVerifyDocument(doc.id, 'REJECTED')}
                                disabled={actionLoading === doc.id}
                              >
                                {actionLoading === doc.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </main>

        {/* Document Viewer Modal */}
        {viewingDocument && viewingDocument.file_url && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
            onClick={() => setViewingDocument(null)}
          >
            <div 
              className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-white">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {viewingDocument.document_type?.replace(/_/g, ' ') || 'Document'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Application: {application?.application_number || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={viewingDocument.status} label={viewingDocument.status?.replace(/_/g, ' ')} />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingDocument(null)}
                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg h-9 w-9 p-0"
                  >
                    <span className="text-xl">×</span>
                  </Button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                {viewingDocument.file_url ? (
                  viewingDocument.document_name?.toLowerCase().endsWith('.pdf') || 
                  viewingDocument.file_path?.toLowerCase().endsWith('.pdf') ? (
                    // PDF Viewer using iframe
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]">
                      <iframe
                        src={viewingDocument.file_url}
                        className="w-full h-full"
                        title={viewingDocument.document_type}
                      />
                    </div>
                  ) : (
                    // Image Viewer
                    <div className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]">
                      <img
                        src={viewingDocument.file_url}
                        alt={viewingDocument.document_type}
                        className="max-w-full h-auto max-h-[calc(95vh-200px)] object-contain rounded-lg"
                      />
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm">
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No preview available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-center gap-3 px-6 py-4 border-t bg-white">
                {viewingDocument.file_url && (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      window.open(viewingDocument.file_url, '_blank')
                    }}
                    className="min-w-[160px] font-medium"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                )}
                <Button
                  variant="default"
                  size="default"
                  onClick={() => setViewingDocument(null)}
                  className="min-w-[120px] bg-orange-600 hover:bg-orange-700 font-medium"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW - Show tabbed interface
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              District Authority Dashboard
            </h1>
            <div className="h-px w-16 sm:w-24 bg-gray-300 mx-auto"></div>
          </div>
          <div className="text-center max-w-2xl mx-auto px-4">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Review and verify documents for applications. Click on any application to view comprehensive details and take necessary actions.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setTab("pending")}
                  className={`flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    tab === "pending"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="hidden sm:inline">📋 Pending for Review</span>
                  <span className="sm:hidden">📋 Pending</span>
                </button>
                <button
                  onClick={() => setTab("processed")}
                  className={`flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    tab === "processed"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="hidden sm:inline">📄 Processed</span>
                  <span className="sm:hidden">📄 Done</span>
                </button>
              </div>

              {/* ---------- Pending Tab ---------- */}
              <TabsContent value="pending" className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead>
                      <TableHeadRow cols={["Title", "Application #", "Applicant", "Status", "Submitted At", "Actions"]} />
                    </thead>

                    {appLoading ? (
                      <TableSkeleton cols={6} />
                    ) : (
                      <tbody>
                        {pendingApplications.length === 0 ? (
                          <EmptyRow colSpan={6} message="No pending applications found." />
                        ) : (
                          pendingApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                              <td className="px-3 sm:px-4 py-4 sm:py-5 font-semibold text-gray-900">
                                <div className="truncate max-w-[150px] sm:max-w-none" title={app.title}>
                                  {app.title}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 font-mono text-xs sm:text-sm">
                                <div className="truncate">{app.application_number}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="truncate">{app.applicant_name || app.user?.full_name || 'N/A'}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                {/* Show readiness status chip */}
                                {app.is_ready_for_approval ? (
                                  <Badge className="bg-green-100 text-green-700 border-green-200 text-xs whitespace-nowrap">
                                    ✓ Ready to Approve
                                  </Badge>
                                ) : app.all_documents_verified && app.cctns_required ? (
                                  <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs whitespace-nowrap">
                                    Awaiting CCTNS
                                  </Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs whitespace-nowrap">
                                    {app.pending_reason || 'Under Review'}
                                  </Badge>
                                )}
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="hidden sm:block">{new Date(app.submitted_at).toLocaleString()}</div>
                                <div className="sm:hidden">{new Date(app.submitted_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1 sm:gap-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-xs sm:text-sm px-2 sm:px-3"
                                  onClick={() => handleSelectApplication(app.id)}
                                >
                                  <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="hidden sm:inline">View Details</span>
                                  <span className="sm:hidden">View</span>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    )}
                  </table>
                </div>
              </TabsContent>

              {/* ---------- Processed Tab ---------- */}
              <TabsContent value="processed" className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                  <table className="min-w-[680px] w-full text-sm">
                    <thead>
                      <TableHeadRow cols={["Title", "Application #", "Applicant", "Status", "Reviewed At"]} />
                    </thead>

                    {appLoading ? (
                      <TableSkeleton cols={5} />
                    ) : (
                      <tbody>
                        {processedApplications.length === 0 ? (
                          <EmptyRow colSpan={5} message="No processed applications found." />
                        ) : (
                          processedApplications.map((app) => (
                            <tr key={app.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                              <td className="px-3 sm:px-4 py-4 sm:py-5 font-semibold text-gray-900">
                                <div className="truncate max-w-[150px] sm:max-w-none" title={app.title}>
                                  {app.title}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 font-mono text-xs sm:text-sm">
                                <div className="truncate">{app.application_number}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="truncate">{app.applicant_name || app.user?.full_name || 'N/A'}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <StatusBadge status={app.status} label={app.status?.replace(/_/g, ' ')} />
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="hidden sm:block">{app.district_reviewed_at ? new Date(app.district_reviewed_at).toLocaleString() : '-'}</div>
                                <div className="sm:hidden">{app.district_reviewed_at ? new Date(app.district_reviewed_at).toLocaleDateString() : '-'}</div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    )}
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
