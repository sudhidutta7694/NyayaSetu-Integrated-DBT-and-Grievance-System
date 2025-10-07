"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/AuthProvider";
import { districtDashboardApi } from "@/lib/api/districtDashboard";
import { Loader2, Eye, CheckCircle2, XCircle, FileText, Shield } from "lucide-react";
import toast from 'react-hot-toast';

/* ---------- tiny UI helpers ---------- */

function StatusPill({ status }: { status?: string }) {
  const map: Record<string, string> = {
    VERIFIED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    UNDER_REVIEW: "bg-purple-100 text-purple-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  const cls = map[status || ""] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status === "VERIFIED" && "✓ "}
      {status === "PENDING" && "• "}
      {status === "SUBMITTED" && "📄 "}
      {status === "UNDER_REVIEW" && "🔍 "}
      {status === "REJECTED" && "✗ "}
      {status || "UNKNOWN"}
    </span>
  );
}

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
          <p className="text-xs text-gray-400">New items will appear here when submitted.</p>
        </div>
      </td>
    </tr>
  );
}

/* ---------- page ---------- */

export default function DistrictDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"documents" | "cases">("documents");
  const [pendingDocuments, setPendingDocuments] = useState<any[]>([]);
  const [pendingCases, setPendingCases] = useState<any[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [caseLoading, setCaseLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/district/login");
    }
  }, [user, loading, router]);

  // Fetch pending documents
  const fetchDocuments = async () => {
    setDocLoading(true);
    try {
      const docs = await districtDashboardApi.getPendingDocuments();
      setPendingDocuments(docs);
    } catch (e: any) {
      console.error("Failed to fetch documents", e);
      toast.error("Failed to fetch pending documents");
    } finally {
      setDocLoading(false);
    }
  };

  // Fetch pending cases
  const fetchCases = async () => {
    setCaseLoading(true);
    try {
      const cases = await districtDashboardApi.getPendingCases();
      setPendingCases(cases);
    } catch (e: any) {
      console.error("Failed to fetch cases", e);
      toast.error("Failed to fetch pending cases");
    } finally {
      setCaseLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchDocuments();
      fetchCases();
    }
  }, [loading, user]);

  // Document actions
  const handleVerifyDocument = async (id: string) => {
    setActionLoading(id);
    try {
      await districtDashboardApi.verifyDocument(id);
      toast.success("Document verified successfully");
      fetchDocuments();
    } catch (e: any) {
      toast.error("Failed to verify document");
    } finally {
      setActionLoading(null);
    }
  };

  // Case actions
  const handleCaseAction = async (id: string, action: string) => {
    setActionLoading(id + action);
    try {
      await districtDashboardApi.caseAction(id, action);
      toast.success(`Case ${action}ed successfully`);
      fetchCases();
    } catch (e: any) {
      toast.error(`Failed to ${action} case`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-16 h-16">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
            <p className="text-gray-600">Please wait...</p>
          </div>
        </div>
      </div>
    );
  }

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
              Review and manage documents and cases efficiently. Take actions on pending items to maintain workflow.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
                <button
                  onClick={() => setTab("documents")}
                  className={`flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    tab === "documents"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="hidden sm:inline">📄 Document Verification</span>
                  <span className="sm:hidden">📄 Documents</span>
                </button>
                <button
                  onClick={() => setTab("cases")}
                  className={`flex-1 py-3 px-4 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                    tab === "cases"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="hidden sm:inline">⚖️ Pending Cases</span>
                  <span className="sm:hidden">⚖️ Cases</span>
                </button>
              </div>

              {/* ---------- Documents Tab ---------- */}
              <TabsContent value="documents" className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead>
                      <TableHeadRow cols={["Document Name", "Type", "Status", "Created At", "Actions"]} />
                    </thead>

                    {docLoading ? (
                      <TableSkeleton cols={5} />
                    ) : (
                      <tbody>
                        {pendingDocuments.length === 0 ? (
                          <EmptyRow colSpan={5} message="No pending documents found." />
                        ) : (
                          pendingDocuments.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                              <td className="px-3 sm:px-4 py-4 sm:py-5 font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <div className="truncate max-w-[150px] sm:max-w-none" title={doc.document_name}>
                                    {doc.document_name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                {doc.document_type}
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <StatusPill status={doc.status} />
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="hidden sm:block">{new Date(doc.created_at).toLocaleString()}</div>
                                <div className="sm:hidden">{new Date(doc.created_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1 sm:gap-2 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors duration-200 text-xs sm:text-sm px-2 sm:px-3"
                                  onClick={() => handleVerifyDocument(doc.id)}
                                  disabled={actionLoading === doc.id}
                                >
                                  {actionLoading === doc.id ? (
                                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {actionLoading === doc.id ? "Verifying..." : "Verify"}
                                  </span>
                                  <span className="sm:hidden">
                                    {actionLoading === doc.id ? "..." : "Verify"}
                                  </span>
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

              {/* ---------- Cases Tab ---------- */}
              <TabsContent value="cases" className="mt-6">
                <div className="bg-white rounded-lg border border-gray-200">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead>
                      <TableHeadRow cols={["Title", "Application #", "Status", "Submitted At", "Actions"]} />
                    </thead>

                    {caseLoading ? (
                      <TableSkeleton cols={5} />
                    ) : (
                      <tbody>
                        {pendingCases.length === 0 ? (
                          <EmptyRow colSpan={5} message="No pending cases found." />
                        ) : (
                          pendingCases.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                              <td className="px-3 sm:px-4 py-4 sm:py-5 font-semibold text-gray-900">
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-gray-400" />
                                  <div className="truncate max-w-[150px] sm:max-w-none" title={c.title}>
                                    {c.title}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 font-mono text-xs sm:text-sm">
                                <div className="truncate">{c.application_number}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <StatusPill status={c.status} />
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="hidden sm:block">{new Date(c.submitted_at).toLocaleString()}</div>
                                <div className="sm:hidden">{new Date(c.submitted_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <div className="flex gap-1 sm:gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 text-xs px-2"
                                    onClick={() => handleCaseAction(c.id, "forward")}
                                    disabled={actionLoading === c.id + "forward"}
                                  >
                                    {actionLoading === c.id + "forward" ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-3 w-3" />
                                    )}
                                    <span className="hidden sm:inline">
                                      {actionLoading === c.id + "forward" ? "Forwarding..." : "Forward"}
                                    </span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-xs px-2"
                                    onClick={() => handleCaseAction(c.id, "cancel")}
                                    disabled={actionLoading === c.id + "cancel"}
                                  >
                                    {actionLoading === c.id + "cancel" ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <XCircle className="h-3 w-3" />
                                    )}
                                    <span className="hidden sm:inline">
                                      {actionLoading === c.id + "cancel" ? "Cancelling..." : "Cancel"}
                                    </span>
                                  </Button>
                                </div>
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
