"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/AuthProvider";
import { socialWelfareDashboardApi } from "@/lib/api/socialWelfareDashboard";
import { Loader2, Eye } from "lucide-react";

/* ---------- tiny UI helpers ---------- */

function StatusPill({ status }: { status?: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-gray-100 text-gray-700",
    PENDING: "bg-gray-100 text-gray-700",
    REJECTED: "bg-gray-100 text-gray-700",
  };
  const cls = map[status || ""] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status === "APPROVED" && "✓ "}
      {status === "PENDING" && "• "}
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
          <p className="text-xs text-gray-400">New cases will appear here when submitted.</p>
        </div>
      </td>
    </tr>
  );
}

/* ---------- page ---------- */

export default function SocialWelfareDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"pending" | "processed">("pending");
  const [pendingCases, setPendingCases] = useState<any[]>([]);
  const [processedCases, setProcessedCases] = useState<any[]>([]);
  const [caseLoading, setCaseLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/social-welfare/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user) fetchCases();
  }, [loading, user]);

  const fetchCases = async () => {
    setCaseLoading(true);
    try {
      const [pending, processed] = await Promise.all([
        socialWelfareDashboardApi.getPendingCases(),
        socialWelfareDashboardApi.getApprovedCases(),
      ]);
      setPendingCases(pending);
      setProcessedCases(processed);
    } catch (e) {
      console.error("Failed to fetch cases", e);
    } finally {
      setCaseLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Social Welfare Dashboard
            </h1>
            <div className="h-px w-16 sm:w-24 bg-gray-300 mx-auto"></div>
          </div>
          <div className="text-center max-w-2xl mx-auto px-4">
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Review and manage applications with ease. Click on any case to view comprehensive details and take necessary actions.
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
                  <span className="hidden sm:inline">📋 Pending for Approval</span>
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
                <div className="bg-white rounded-lg border border-gray-200">
                  <table className="min-w-[720px] w-full text-sm">
                    <thead>
                      <TableHeadRow cols={["Title", "Application Id", "Submitted At", "Actions"]} />
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
                                <div className="truncate max-w-[150px] sm:max-w-none" title={c.title}>
                                  {c.title}
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 font-mono text-xs sm:text-sm">
                                <div className="truncate">{c.application_number}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5 text-gray-600 text-xs sm:text-sm">
                                <div className="hidden sm:block">{new Date(c.submitted_at).toLocaleString()}</div>
                                <div className="sm:hidden">{new Date(c.submitted_at).toLocaleDateString()}</div>
                              </td>
                              <td className="px-3 sm:px-4 py-4 sm:py-5">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1 sm:gap-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200 text-xs sm:text-sm px-2 sm:px-3"
                                  onClick={() => router.push(`/social-welfare/case-detail?id=${c.id}`)}
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
                <div className="bg-white rounded-lg border border-gray-200">
                  <table className="min-w-[680px] w-full text-sm">
                    <thead>
                      <TableHeadRow cols={["Title", "Application #", "Status", "Submitted At"]} />
                    </thead>

                    {caseLoading ? (
                      <TableSkeleton cols={4} />
                    ) : (
                      <tbody>
                        {processedCases.length === 0 ? (
                          <EmptyRow colSpan={4} message="No processed cases found." />
                        ) : (
                          processedCases.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors duration-200 group">
                              <td className="px-3 sm:px-4 py-4 sm:py-5 font-semibold text-gray-900">
                                <div className="truncate max-w-[150px] sm:max-w-none" title={c.title}>
                                  {c.title}
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
