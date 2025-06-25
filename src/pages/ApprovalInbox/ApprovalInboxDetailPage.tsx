import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosClient";
import Button from "@/components/ui/button/Button";
import { Card, CardContent } from "@/components/ui/card/Card";
import Badge from "@/components/ui/badge/Badge";
import Textarea from "@/components/form/input/TextArea";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
}

interface ApprovalFlow {
  id: number;
  approverName: string;
  positionTitle: string;
  status: string;
  approvedAt?: string;
  remark?: string;
}

interface RequestDetail {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  requestedByUser: {
    fullName: string;
  };
  approvalType: {
    name: string;
  };
  attachments: Attachment[];
  approvalFlows: ApprovalFlow[];
}

export default function ApprovalInboxDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/ApprovalRequests/${id}`);
        setDetail(res.data);
      } catch (err) {
        toast.error("Failed to fetch request detail.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleAction = async (action: "Approved" | "Rejected") => {
    if (!id) return;

    try {
      const flowId = detail?.approvalFlows.find(
        (f) => f.status === "Pending"
      )?.id;
      if (!flowId) {
        toast.warning("No pending step found.");
        return;
      }

      await api.put(`/ApprovalRequests/${id}/${action.toLowerCase()}`, {
        flowId,
        remark,
      });

      toast.success(`Request successfully ${action.toLowerCase()}.`);
      navigate("/approval-inbox");
    } catch (err: any) {
      toast.error(err?.response?.data || "Action failed.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!detail) {
    return <div className="p-6 text-red-500">Request not found.</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Approval Detail</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-3">
          <div><strong>Title:</strong> {detail.title}</div>
          <div><strong>Description:</strong> {detail.description}</div>
          <div><strong>Type:</strong> {detail.approvalType?.name}</div>
          <div><strong>Requester:</strong> {detail.requestedByUser?.fullName}</div>
          <div><strong>Created At:</strong> {new Date(detail.createdAt).toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">Attachments</h2>
          {detail.attachments.length === 0 ? (
            <div className="text-gray-500">No attachments</div>
          ) : (
            <ul className="list-disc pl-5">
              {detail.attachments.map((file) => (
                <li key={file.id}>
                  <a
                    href={`${import.meta.env.VITE_API_URL}/Attachments/${file.id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {file.fileName}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="font-semibold">Approval Steps</h2>
          <ul className="space-y-2">
            {detail.approvalFlows.map((flow) => (
              <li key={flow.id} className="border p-3 rounded-lg">
                <div><strong>{flow.positionTitle}</strong> - {flow.approverName}</div>
                <div>Status: <Badge>{flow.status}</Badge></div>
                {flow.remark && <div>Note: {flow.remark}</div>}
                {flow.approvedAt && (
                  <div className="text-sm text-gray-500">
                    Approved At: {new Date(flow.approvedAt).toLocaleString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <Textarea
            value={remark}
            onChange={(val) => setRemark(val)}
            placeholder="Add a remark..."
          />
          <div className="flex gap-4">
            <Button variant="success" onClick={() => handleAction("Approved")}>
              Approve
            </Button>
            <Button variant="destructive" onClick={() => handleAction("Rejected")}>
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
