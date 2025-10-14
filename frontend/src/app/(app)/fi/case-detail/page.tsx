"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { fiDashboardApi } from "@/lib/api/fiDashboard";
import toast from 'react-hot-toast';
import { 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  FileText, 
  User2, 
  FolderOpen, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Shield,
  Clock,
  IndianRupee,
  AlertCircle,
  XCircle,
  Download,
  Eye,
  ExternalLink
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

/* Helper components */
const Row = ({ label, value, icon }: { label: string; value?: React.ReactNode; icon?: React.ReactNode }) => (
  <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-0">
    {icon && <div className="flex-shrink-0 mt-0.5 text-gray-400">{icon}</div>}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-900 mb-1">{label}</div>
      <div className="text-sm text-gray-600 break-words">{value ?? "-"}</div>
    </div>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="py-2 border-b-2 border-gray-200 mb-1">
    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">{title}</h4>
  </div>
);

function FICaseDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const caseId = searchParams.get("id");
  const { user, loading } = useAuth();

  const [caseDetails, setCaseDetails] = useState<any | null>(null);
  const [caseDetailsLoading, setCaseDetailsLoading] = useState(false);
  const [caseDetailsError, setCaseDetailsError] = useState<string | null>(null);

  // Decision state
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [rejectionLoading, setRejectionLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalComments, setApprovalComments] = useState("");
  
  // Document viewing state
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/fi/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (caseId) fetchCaseDetails(caseId);
  }, [caseId]);

  const fetchCaseDetails = async (id: string) => {
    setCaseDetailsLoading(true);
    setCaseDetailsError(null);
    try {
      const res = await fiDashboardApi.getCaseDetails(id);
      setCaseDetails(res);
    } catch {
      setCaseDetailsError("Failed to fetch case details");
    } finally {
      setCaseDetailsLoading(false);
    }
  };

  const handleApproveCase = async () => {
    if (!caseId) return;
    
    setApprovalLoading(true);
    try {
      await fiDashboardApi.approveApplication(caseId, approvalComments);
      toast.success("Application approved for disbursement");
      setTimeout(() => {
        router.push("/fi/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Approval error:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to approve application");
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleRejectCase = async () => {
    if (!caseId) return;
    
    const trimmedReason = rejectionReason.trim();
    
    if (!trimmedReason) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    if (trimmedReason.length < 10) {
      toast.error("Rejection reason must be at least 10 characters long");
      return;
    }
    
    setRejectionLoading(true);
    try {
      await fiDashboardApi.rejectApplication(caseId, trimmedReason);
      toast.success("Application rejected");
      setTimeout(() => {
        router.push("/fi/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Rejection error:", error);
      toast.error(error.response?.data?.detail || error.response?.data?.message || "Failed to reject application");
    } finally {
      setRejectionLoading(false);
      setShowRejectModal(false);
    }
  };

  const handleViewDocument = (doc: any) => {
    const documentUrl = doc.file_url || doc.file_path;
    if (!documentUrl) {
      toast.error('Document URL not available');
      return;
    }
    setViewingDocument({ ...doc, file_url: documentUrl });
  };

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
                onClick={() => router.push("/fi/dashboard")} 
                className="gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {caseDetailsLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading application details...</span>
            </div>
          ) : caseDetailsError ? (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{caseDetailsError}</span>
            </div>
          ) : caseDetails ? (
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {caseDetails.title || "Application Details"}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="font-mono text-xs px-2 py-1 bg-gray-100 rounded">
                  {caseDetails.application_number}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Submitted: {caseDetails.submitted_at ? new Date(caseDetails.submitted_at).toLocaleDateString() : 'N/A'}
                </span>
                {caseDetails.application_type && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {caseDetails.application_type}
                  </Badge>
                )}
              </div>
            </div>
          ) : null}
        </header>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {caseDetailsLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {caseDetailsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{caseDetailsError}</span>
          </div>
        )}

        {caseDetails && (
          <div className="space-y-6">
            {/* Application Details Accordion */}
            <Accordion type="single" collapsible className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
              <AccordionItem value="application-details" className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-lg">Application Details</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <SectionHeader title="Basic Information" />
                      <div className="space-y-1">
                        <Row label="Application Number" value={caseDetails.application_number} icon={<FileText className="h-4 w-4" />} />
                        <Row label="Title" value={caseDetails.title} />
                        <Row label="Description" value={caseDetails.description} />
                        
                        {/* Application Type */}
                        <div className="flex items-start gap-4 py-3 border-b border-gray-100">
                          <div className="flex-shrink-0 mt-0.5 text-gray-400"><FileText className="h-4 w-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">Application Type</div>
                            <div className="text-sm text-gray-600 break-words">{caseDetails.application_type ?? "-"}</div>
                          </div>
                        </div>

                        {/* FIR Number with CCTNS verification - Only for non-inter-caste marriage */}
                        {caseDetails.application_type !== 'INTER_CASTE_MARRIAGE' && (
                          <div className="flex items-start gap-4 py-3 border-b border-gray-100">
                            <Shield className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 mb-1">FIR Number</div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                                  {caseDetails.fir_number ?? "Not provided"}
                                </span>
                                {/* Show CCTNS verification chip if verified */}
                                {caseDetails.cctns_verified && (
                                  <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-xs px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
                                    <CheckCircle2 className="h-3.5 w-3.5" /> 
                                    <span>Verified with CCTNS</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Amount Approved */}
                        <div className="flex items-start gap-4 py-3 border-b border-gray-100">
                          <IndianRupee className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">Amount Approved</div>
                            <div className="text-sm text-gray-600 break-words font-semibold text-green-700">
                              {caseDetails.amount_approved ? `₹${parseFloat(caseDetails.amount_approved).toLocaleString('en-IN')}` : 'Not allocated yet'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Applicant Information */}
                    {caseDetails.applicant && (
                      <div>
                        <SectionHeader title="Applicant Information" />
                        <div className="space-y-1">
                          {/* Full Name - Full Width */}
                          <Row label="Full Name" value={caseDetails.applicant.full_name} icon={<User2 className="h-4 w-4" />} />
                          
                          {/* Father's and Mother's Name - Side by Side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><User2 className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Father's Name</div>
                                <div className="text-sm text-gray-600 break-words">{caseDetails.applicant.father_name ?? "-"}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><User2 className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Mother's Name</div>
                                <div className="text-sm text-gray-600 break-words">{caseDetails.applicant.mother_name ?? "-"}</div>
                              </div>
                            </div>
                          </div>

                          {/* Email and Phone - Side by Side */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><Mail className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Email</div>
                                <div className="text-sm text-gray-600 break-words">{caseDetails.applicant.email ?? "-"}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><Phone className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Phone</div>
                                <div className="text-sm text-gray-600 break-words">{caseDetails.applicant.phone_number ?? "-"}</div>
                              </div>
                            </div>
                          </div>

                          {/* Aadhaar - Full Width */}
                          <Row label="Aadhaar" value={caseDetails.applicant.aadhaar_number} icon={<CreditCard className="h-4 w-4" />} />

                          {/* DOB, Age, Gender, Category - 2x2 Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><Calendar className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Date of Birth</div>
                                <div className="text-sm text-gray-600 break-words">
                                  {caseDetails.applicant.date_of_birth ? new Date(caseDetails.applicant.date_of_birth).toLocaleDateString('en-IN') : '-'}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><User2 className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Age</div>
                                <div className="text-sm text-gray-600 break-words">{caseDetails.applicant.age ?? "-"}</div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 border-b border-gray-100">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><User2 className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Gender</div>
                                <div className="text-sm text-gray-600 break-words">{caseDetails.applicant.gender ?? "-"}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 mt-0.5 text-gray-400"><Shield className="h-4 w-4" /></div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 mb-1">Category</div>
                                <div className="text-sm text-gray-600 break-words">
                                  {caseDetails.applicant.category ? (
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                      {caseDetails.applicant.category}
                                    </Badge>
                                  ) : "-"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Address - Full Width */}
                          <Row 
                            label="Address" 
                            value={[
                              caseDetails.applicant.address,
                              caseDetails.applicant.district,
                              caseDetails.applicant.state,
                              caseDetails.applicant.pincode
                            ].filter(Boolean).join(', ')} 
                            icon={<MapPin className="h-4 w-4" />} 
                          />
                        </div>
                      </div>
                    )}

                    {/* Comments from Previous Stages */}
                    <div>
                      <SectionHeader title="Review Comments from Previous Stages" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* District Authority Comments */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <h5 className="font-semibold text-sm text-blue-900">District Authority</h5>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {caseDetails.district_comments || <span className="text-gray-400 italic">No comments provided</span>}
                          </p>
                        </div>

                        {/* Social Welfare Comments */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <h5 className="font-semibold text-sm text-green-900">Social Welfare</h5>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {caseDetails.social_welfare_comments || <span className="text-gray-400 italic">No comments provided</span>}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Documents Section - Accordion */}
            <Accordion type="single" collapsible className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
              <AccordionItem value="documents" className="border-0">
                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <FolderOpen className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-lg">Documents</span>
                    {caseDetails.documents && caseDetails.documents.length > 0 && (
                      <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 border-purple-200">
                        {caseDetails.documents.length} files
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  {caseDetails.documents && caseDetails.documents.length > 0 ? (
                    <div className="space-y-3">
                      {caseDetails.documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-gray-400 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 truncate">{doc.document_type}</div>
                              <div className="text-xs text-gray-500 truncate">{doc.file_name}</div>
                              {doc.is_digilocker && (
                                <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                                  <Shield className="h-3 w-3" />
                                  DigiLocker
                                </div>
                              )}
                            </div>
                            {doc.status && (
                              <Badge className={
                                doc.status === 'VERIFIED' ? 'bg-green-100 text-green-800 border-green-200' :
                                doc.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                                'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }>
                                {doc.status}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2 ml-3">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDocument(doc)}
                              className="gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            {doc.file_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = doc.file_url;
                                  link.download = doc.file_name;
                                  link.click();
                                }}
                                className="gap-2"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No documents available</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Decision Actions */}
            {caseDetails.status === 'SOCIAL_WELFARE_APPROVED' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Make Decision</h3>
                
                {/* Approval Section */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="approvalComments">Approval Comments (Optional)</Label>
                    <Input
                      id="approvalComments"
                      placeholder="Enter any comments about the approval"
                      value={approvalComments}
                      onChange={(e) => setApprovalComments(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button 
                    onClick={handleApproveCase}
                    disabled={approvalLoading}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    {approvalLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Approve for Disbursement
                      </>
                    )}
                  </Button>
                </div>

                {/* Rejection Section */}
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => setShowRejectModal(true)}
                    className="w-full sm:w-auto border-red-200 text-red-700 hover:bg-red-50 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject Application
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
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
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{viewingDocument.file_name}</h3>
                  <p className="text-sm text-gray-600">{viewingDocument.document_type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {viewingDocument.status && (
                  <Badge className={
                    viewingDocument.status === 'VERIFIED' ? 'bg-green-100 text-green-800 border-green-200' :
                    viewingDocument.status === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                  }>
                    {viewingDocument.status}
                  </Badge>
                )}
                {viewingDocument.is_digilocker && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 gap-1">
                    <Shield className="h-3 w-3" />
                    DigiLocker
                  </Badge>
                )}
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
                viewingDocument.file_name?.toLowerCase().endsWith('.pdf') ? (
                  // PDF Viewer using iframe
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]">
                    <iframe
                      src={viewingDocument.file_url}
                      className="w-full h-full"
                      title={viewingDocument.file_name}
                    />
                  </div>
                ) : (
                  // Image Viewer
                  <div className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]">
                    <img
                      src={viewingDocument.file_url}
                      alt={viewingDocument.file_name}
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
                className="min-w-[120px] bg-blue-600 hover:bg-blue-700 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Reject Application</h3>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="rejectionReason" className="mb-2 block font-medium">
                Reason for Rejection <span className="text-red-600">*</span>
              </Label>
              <textarea
                id="rejectionReason"
                className={`w-full border rounded-lg p-3 min-h-[140px] focus:outline-none focus:ring-2 transition-colors ${
                  rejectionReason.trim().length === 0 && rejectionReason.length > 0
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-red-500'
                }`}
                placeholder="Please provide a detailed reason for rejection (minimum 10 characters required)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {rejectionReason.trim().length < 10 ? (
                    <span className="text-red-600 font-medium">
                      Minimum 10 characters required
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">
                      ✓ Valid reason provided
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {rejectionReason.trim().length} characters
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="flex-1"
                disabled={rejectionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRejectCase}
                disabled={rejectionLoading || !rejectionReason.trim() || rejectionReason.trim().length < 10}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Rejection'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FICaseDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <FICaseDetailContent />
    </Suspense>
  );
}
