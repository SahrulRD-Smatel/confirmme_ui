import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axiosClient";
import { format } from "date-fns";
import Badge from "@/components/ui/badge/Badge";
import { Card, CardContent } from "@/components/ui/card/Card";

interface ApprovalFlow {
  id: number;
  approverId: string;
  approverName: string;
  positionId: number;
  status: string;
  orderIndex: number;
  remark: string;
  approvedAt: string | null;
  qrToken: string;
  qrTokenGeneratedAt: string | null;
  isQrUsed: boolean;
  qrUsedAt: string | null;
  position?: {
    id: number;
    title: string;
    approvalLevel: number;
  } | null;
  approver?: {
    fullName: string;
  } | null;
}

interface ApprovalRequestDetail {
  id: number;
  requestNumber: string;
  title: string;
  description: string;
  approvalType?: {
    name: string;
  };
  currentStatus: string;
  createdAt: string;
  requestedByUser?: {
    fullName: string;
    role: string;
  };
  approvalFlows?: ApprovalFlow[];
}

const TaskDetailPage = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState<ApprovalRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/approvalrequests/${id}`);
        setDetail(response.data);
      } catch (error) {
        console.error("Error fetching task detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!detail) return <p className="p-4 text-red-500">Request not found.</p>;

  return (
    <div className="p-4 space-y-6">
      {/* <h1 className="text-2xl font-bold">Approval Request Detail</h1> */}

      {/* Info Utama */}
      <Card>
        <CardContent className="space-y-2 pt-6">
          <div className="text-lg font-semibold">{detail.title}</div>

          <div className="grid grid-cols-[140px_auto] text-sm">
            <span className="text-gray-500">Request No</span>
            <span>: {detail.requestNumber}</span>
          </div>

          <div className="grid grid-cols-[140px_auto] text-sm">
            <span>Description</span>
            <span>: {detail.description}</span>
          </div>

          <div className="grid grid-cols-[140px_auto] text-sm">
            <span>Approval Type</span>
            <span>: {detail.approvalType?.name || "-"}</span>
          </div>

          <div className="grid grid-cols-[140px_auto] text-sm">
            <span>Requested By</span>
            <span>
              : {detail.requestedByUser?.fullName} ({detail.requestedByUser?.role})
            </span>
          </div>

          <div className="grid grid-cols-[140px_auto] text-sm items-center">
            <span>Status</span>
            <span>
              : <Badge variant="light">{detail.currentStatus}</Badge>
            </span>
          </div>

          <div className="grid grid-cols-[140px_auto] text-sm text-gray-400">
            <span>Created At</span>
            <span>: {format(new Date(detail.createdAt), "dd MMM yyyy HH:mm")}</span>
          </div>
        </CardContent>
      </Card>       

      {/* Approval Flow */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-2">Approval Flow</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-muted text-left">
                <tr>
                  <th className="border px-3 py-2">#</th>
                  <th className="border px-3 py-2">Approver Name</th>
                  <th className="border px-3 py-2">Position</th>
                  <th className="border px-3 py-2">Status</th>
                  <th className="border px-3 py-2">Approved At</th>
                  <th className="border px-3 py-2">Remark</th>
                </tr>
              </thead>
              <tbody>
                {detail.approvalFlows?.map((flow, index) => (
                  <tr key={flow.id} className="hover:bg-muted/40">
                    <td className="border px-3 py-2">{index + 1}</td>
                    <td className="border px-3 py-2">{flow.approver?.fullName}</td>
                    <td className="border px-3 py-2">{flow.position?.title || "-"}</td>
                    <td className="border px-3 py-2">
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          flow.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : flow.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {flow.status}
                      </span>
                    </td>
                    <td className="border px-3 py-2">
                      {flow.approvedAt
                        ? format(new Date(flow.approvedAt), "dd MMM yyyy HH:mm")
                        : "-"}
                    </td>
                    <td className="border px-3 py-2">{flow.remark || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetailPage;
