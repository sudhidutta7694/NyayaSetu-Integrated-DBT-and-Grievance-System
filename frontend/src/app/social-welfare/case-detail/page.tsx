"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { socialWelfareDashboardApi } from "@/lib/api/socialWelfareDashboard";
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
  Eye
} from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

/* Improved helper components */
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

function CaseDetailContent() {
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
  const [amountApproved, setAmountApproved] = useState("");
  
  // Document viewing state
  const [viewingDocument, setViewingDocument] = useState<any | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/social-welfare/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (caseId) fetchCaseDetails(caseId);
  }, [caseId]);

  const fetchCaseDetails = async (id: string) => {
    setCaseDetailsLoading(true);
    setCaseDetailsError(null);
    try {
      const res = await socialWelfareDashboardApi.getCaseDetails(id);
      setCaseDetails(res);
    } catch {
      setCaseDetailsError("Failed to fetch case details");
    } finally {
      setCaseDetailsLoading(false);
    }
  };

  const handleApproveCase = async () => {
    if (!caseId) return;
    
    // Validate amount
    const amount = parseFloat(amountApproved);
    if (!amountApproved || isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount greater than zero");
      return;
    }
    
    setApprovalLoading(true);
    try {
      await socialWelfareDashboardApi.approveCase(caseId, amount);
      toast.success(`Application approved with ₹${amount.toLocaleString()}`);
      setTimeout(() => {
        router.push("/social-welfare/dashboard");
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
    
    // Validate rejection reason
    if (!rejectionReason || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setRejectionLoading(true);
    try {
      await socialWelfareDashboardApi.rejectCase(caseId, rejectionReason.trim());
      toast.success("Application rejected");
      setTimeout(() => {
        router.push("/social-welfare/dashboard");
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
    // Document should have file_url or file_path from backend response
    const documentUrl = doc.file_url || doc.file_path;
    if (!documentUrl) {
      toast.error("Can't load document - File not available");
      return;
    }
    // Set document with the URL available
    setViewingDocument({ ...doc, file_url: documentUrl });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced header with better visual hierarchy */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push("/social-welfare/dashboard")} 
                className="gap-2 hover:bg-blue-50 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="h-6 w-px bg-gray-300 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-sm text-gray-500 font-medium">Application Details</span>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    #{caseDetails?.application_number ?? (caseDetailsLoading ? "Loading..." : "N/A")}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick info bar */}
          {caseDetails && (
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="truncate">Submitted: {caseDetails.submitted_at ? new Date(caseDetails.submitted_at).toLocaleDateString() : "-"}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <User2 className="h-4 w-4" />
                <span className="truncate">{caseDetails.applicant?.full_name ?? "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <StatusBadge status={caseDetails.status} label={caseDetails.status?.replace(/_/g, ' ')} />
              </div>
            </div>
          )}
        </header>
      </div>

      <main className="max-w-7xl mx-auto w-full h-full">
        {caseDetailsLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin opacity-40" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Case Details</h3>
              <p className="text-gray-600">Please wait while we fetch the application information...</p>
            </div>
          </div>
        ) : caseDetailsError ? (
          <div className="max-w-md mx-auto py-16 px-4">
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Case</h3>
              <p className="text-gray-600 mb-6">{caseDetailsError}</p>
              <Button 
                onClick={() => caseId && fetchCaseDetails(caseId)} 
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : caseDetails ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
            {/* LEFT: Enhanced accordion with better design */}
            <div className="xl:col-span-2 order-2 xl:order-1">
              <Accordion type="multiple" defaultValue={["overview"]} className="w-full space-y-4">
                
                {/* OVERVIEW SECTION */}
                <AccordionItem value="overview" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-lg font-semibold py-4 px-6 hover:bg-gray-50 data-[state=open]:bg-blue-50 data-[state=open]:border-b border-gray-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Case Overview</div>
                        <div className="text-sm font-normal text-gray-500">Application details and timeline</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="space-y-0">
                      <Row 
                        label="Application Title" 
                        value={caseDetails.title || "No title provided"} 
                        icon={<FileText className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Application Number" 
                        value={
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                            {caseDetails.application_number}
                          </span>
                        } 
                        icon={<CreditCard className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Incident Description" 
                        value={caseDetails.incident_description || "Not provided"} 
                        icon={<AlertCircle className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Incident District" 
                        value={caseDetails.incident_district || "Not provided"} 
                        icon={<MapPin className="h-4 w-4" />} 
                      />
                      <Row 
                        label="Police Station" 
                        value={caseDetails.police_station || "Not provided"} 
                        icon={<Shield className="h-4 w-4" />} 
                      />
                      {/* Only show FIR for non-inter-caste marriage applications */}
                      {caseDetails.application_type !== 'INTER_CASTE_MARRIAGE' && (
                        <Row 
                          label="FIR Number" 
                          value={
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                                {caseDetails.fir_number || "-"}
                              </span>
                              {caseDetails.cctns_verified && (
                                <span className="inline-flex items-center gap-1.5 text-green-600 font-medium text-xs px-2.5 py-1 bg-green-50 rounded-md border border-green-200">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>Verified with CCTNS</span>
                                </span>
                              )}
                            </div>
                          } 
                          icon={<Shield className="h-4 w-4" />} 
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* APPLICANT SECTION */}
                <AccordionItem value="applicant" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-lg font-semibold py-4 px-6 hover:bg-gray-50 data-[state=open]:bg-blue-50 data-[state=open]:border-b border-gray-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <User2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Applicant Information</div>
                        <div className="text-sm font-normal text-gray-500">Personal and contact details</div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-0">
                        <SectionHeader title="Personal Details" />
                        <Row label="Full Name" value={caseDetails.applicant?.full_name} icon={<User2 className="h-4 w-4" />} />
                        <Row label="Father's Name" value={caseDetails.applicant?.father_name} icon={<User2 className="h-4 w-4" />} />
                        <Row label="Mother's Name" value={caseDetails.applicant?.mother_name} icon={<User2 className="h-4 w-4" />} />
                        <Row 
                          label="Date of Birth" 
                          value={
                            caseDetails.applicant?.date_of_birth
                              ? new Date(caseDetails.applicant.date_of_birth).toLocaleDateString()
                              : "Not provided"
                          } 
                          icon={<Calendar className="h-4 w-4" />} 
                        />
                        <Row label="Gender" value={caseDetails.applicant?.gender} icon={<User2 className="h-4 w-4" />} />
                        <Row label="Category" value={caseDetails.applicant?.category} icon={<User2 className="h-4 w-4" />} />
                      </div>
                      
                      <div className="space-y-0">
                        <SectionHeader title="Contact & Address" />
                        <Row label="Email Address" value={caseDetails.applicant?.email} icon={<Mail className="h-4 w-4" />} />
                        <Row label="Phone Number" value={caseDetails.applicant?.phone_number} icon={<Phone className="h-4 w-4" />} />
                        <Row 
                          label="Aadhaar Number" 
                          value={
                            caseDetails.applicant?.aadhaar_number 
                              ? `****-****-${caseDetails.applicant.aadhaar_number.slice(-4)}`
                              : "Not provided"
                          } 
                          icon={<CreditCard className="h-4 w-4" />} 
                        />
                        <Row label="Address" value={caseDetails.applicant?.address} icon={<MapPin className="h-4 w-4" />} />
                        <Row label="District" value={caseDetails.applicant?.district} icon={<MapPin className="h-4 w-4" />} />
                        <Row label="State" value={caseDetails.applicant?.state} icon={<MapPin className="h-4 w-4" />} />
                        <Row label="Pincode" value={caseDetails.applicant?.pincode} icon={<MapPin className="h-4 w-4" />} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* DOCUMENTS SECTION */}
                <AccordionItem value="documents" className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <AccordionTrigger className="text-lg font-semibold py-4 px-6 hover:bg-gray-50 data-[state=open]:bg-blue-50 data-[state=open]:border-b border-gray-100 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">Supporting Documents</div>
                        <div className="text-sm font-normal text-gray-500">
                          {Array.isArray(caseDetails.documents) ? caseDetails.documents.length : 0} documents uploaded
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6">
                    {caseDetails.documents?.length ? (
                      <div className="space-y-0 pt-4">
                        {caseDetails.documents.map((doc: any, index: number) => (
                          <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors mb-3">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="p-2 bg-white rounded-lg border">
                                <FileText className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">{doc.document_name}</div>
                                <div className="text-sm text-gray-500">{doc.document_type}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" />
                                Verified
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDocument(doc)}
                                className="gap-2 hover:bg-blue-50 border-blue-200 text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FolderOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500">No documents have been uploaded yet.</p>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* RIGHT: Enhanced Sanction Panel */}
            <aside className="xl:col-span-1 order-1 xl:order-2">
              <div className="xl:sticky xl:top-28">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h2 className="text-xl font-bold text-white mb-1">Case Decision</h2>
                    {/* <p className="text-blue-100 text-sm">Review and approve or reject this application</p> */}
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    
                    {/* Amount Approval Section */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <IndianRupee className="h-4 w-4 text-emerald-600" />
                          Approved Amount
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount to approve"
                            value={amountApproved}
                            onChange={(e) => setAmountApproved(e.target.value)}
                            className="pl-8 h-12 text-lg font-semibold"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter the amount you approve for disbursement
                        </p>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-emerald-900 mb-1">Approval Action</h4>
                            <p className="text-sm text-emerald-700">
                              The application will be moved to the fund disbursement stage after approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 space-y-3">
                      <Button
                        onClick={handleApproveCase}
                        disabled={approvalLoading || rejectionLoading}
                        className="w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                      >
                        {approvalLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Approving Application...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Approve Application
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => setShowRejectModal(true)}
                        disabled={approvalLoading || rejectionLoading}
                        variant="outline"
                        className="w-full h-12 font-semibold border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Reject Application
                      </Button>
                    </div>

                    {/* Footer Note */}
                    <div className="bg-gray-50 rounded-xl p-4 border-t">
                      <p className="text-xs text-gray-600 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>
                          All decisions are final and will be recorded in the audit trail. Ensure all details are verified before approving or rejecting.
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : null}
      </main>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-red-600 px-6 py-4 rounded-t-2xl">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                Reject Application
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> Rejection is permanent and will be recorded in the system. 
                  Please provide a clear reason for rejection.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-reason" className="text-sm font-semibold text-gray-900">
                  Rejection Reason <span className="text-red-500">*</span>
                </Label>
                <textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter detailed reason for rejection..."
                  className="w-full min-h-[120px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  disabled={rejectionLoading}
                />
                <p className="text-xs text-gray-500">
                  Minimum 10 characters required
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason("");
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={rejectionLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRejectCase}
                  disabled={rejectionLoading || !rejectionReason.trim() || rejectionReason.trim().length < 10}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {rejectionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Confirm Rejection
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Document Viewer Modal */}
      {viewingDocument && viewingDocument.file_url && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] flex flex-col">
            {/* Header with gradient */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewingDocument.document_type?.replace(/_/g, ' ').toUpperCase() || 'Document'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Application: {caseDetails?.application_number || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={viewingDocument.status} label={viewingDocument.status?.replace(/_/g, ' ')} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDocument(null)}
                  className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {viewingDocument.document_name?.toLowerCase().endsWith('.pdf') ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden h-[calc(95vh-180px)]">
                  <iframe
                    src={viewingDocument.file_url}
                    className="w-full h-full"
                    title={viewingDocument.document_name}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center bg-white rounded-lg shadow-sm p-4 min-h-[calc(95vh-180px)]">
                  <img
                    src={viewingDocument.file_url}
                    alt={viewingDocument.document_name || 'Document'}
                    className="max-w-full max-h-full object-contain rounded"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{viewingDocument.document_name || 'Unknown'}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = viewingDocument.file_url;
                    link.download = viewingDocument.document_name || 'document';
                    link.click();
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingDocument(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaseDetailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-300 rounded-full animate-spin opacity-40" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Application</h3>
            <p className="text-gray-600">Please wait while we prepare the case details...</p>
          </div>
        </div>
      </div>
    }>
      <CaseDetailContent />
    </Suspense>
  );
}
