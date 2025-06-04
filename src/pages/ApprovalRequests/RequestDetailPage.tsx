import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axiosClient";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card/Card";
import { Loader2 } from "lucide-react";

interface ApprovalFlow {
  id: number;
  orderIndex: number;
  status: string;
  approvedAt: string | null;
  position: {
    id: number;
    title: string;
    approvalLevel: number;
  } | null;
}

interface ApprovalRequestDetail {
  id: number;
  requestNumber: string;
  title: string;
  description: string;
  currentStatus: string;
  createdAt: string;
  approvalType: {
    name: string;
    description: string;
  };
  requestedByUser: {
    fullName: string;
    role: string;
    email: string;
  };
  approvalFlows: ApprovalFlow[];
}

const RequestDetailPage: React.FC = () => {
  const { id } = useParams();
  const [request, setRequest] = useState<ApprovalRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/ApprovalRequests/${id}`);
        setRequest(response.data);
      } catch (error) {
        console.error("Error fetching request detail:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!request) return <div className="text-center text-red-500">Request not found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Detail Request</h1>

      {/* Informasi Umum */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p><strong>Request Number:</strong> {request.requestNumber}</p>
          <p><strong>Judul:</strong> {request.title}</p>
          <p><strong>Deskripsi:</strong> {request.description}</p>
          <p><strong>Tipe Approval:</strong> {request.approvalType.name}</p>
          <p><strong>Status Saat Ini:</strong> {request.currentStatus}</p>
          <p><strong>Tanggal Buat:</strong> {format(new Date(request.createdAt), "dd MMM yyyy HH:mm")}</p>
        </CardContent>
      </Card>

      {/* Info Pemohon */}
      <Card>
        <CardContent className="p-4 space-y-2">
          <p><strong>Pemohon:</strong> {request.requestedByUser.fullName}</p>
          <p><strong>Email:</strong> {request.requestedByUser.email}</p>
          <p><strong>Role:</strong> {request.requestedByUser.role}</p>
        </CardContent>
      </Card>

      {/* Timeline Approval */}
      <Card>
        <CardContent className="p-4">
          <h2 className="text-lg font-medium mb-2">Approval Timeline</h2>
          <div className="space-y-3">
            {request.approvalFlows
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((flow) => (
                <div
                  key={flow.id}
                  className={`border rounded-xl p-3 ${
                    flow.status === "Approved"
                      ? "border-green-500 bg-green-50"
                      : flow.status === "Rejected"
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <p><strong>Urutan:</strong> {flow.orderIndex}</p>
                  <p><strong>Jabatan:</strong> {flow.position?.title}</p>
                  <p><strong>Status:</strong> {flow.status}</p>
                  <p><strong>Approved At:</strong> {flow.approvedAt ? format(new Date(flow.approvedAt), "dd MMM yyyy HH:mm") : "-"}</p>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequestDetailPage;
