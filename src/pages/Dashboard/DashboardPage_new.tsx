// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card/Card";

interface DashboardSummaryDto {
  totalRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  // Tambahkan properti lain jika ada dari backend
}

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummaryDto | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);
  const userName = localStorage.getItem("userName") || "User";

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        const headers = { Authorization: `Bearer ${token}` };

        // Panggil endpoint summary
        const summaryRes = await axios.get("/api/dashboard", { headers });

        // Panggil endpoint requests waiting approval (pending approvals)
        const waitingRes = await axios.get("/api/dashboard/waiting-approval", {
          headers,
        });

        setSummary(summaryRes.data);
        setPendingApprovals(waitingRes.data.count);
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome, {userName}!</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Total Requests</h2>
            <p className="text-3xl mt-2">{summary?.totalRequests ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Pending Approvals</h2>
            <p className="text-3xl mt-2">{pendingApprovals ?? "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Approved</h2>
            <p className="text-3xl mt-2 text-green-600">
              {summary?.approvedRequests ?? "-"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold">Rejected</h2>
            <p className="text-3xl mt-2 text-red-500">
              {summary?.rejectedRequests ?? "-"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
