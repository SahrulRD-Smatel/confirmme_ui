import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axiosClient";
import { format } from "date-fns";
import Badge from "@/components/ui/badge/Badge";
import { Card, CardContent } from "@/components/ui/card/Card";
import FullscreenSpinner from "@/components/ui/spinner/FullscreenSpinner";
import { Modal } from "@/components/ui/modal/index";

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

interface Attachment {
  id: number;
  fileName: string;
  contentType: string;
  uploadedAt: string;
  fileUrl?: string;
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
  attachments?: Attachment[];
}

const TaskDetailPage = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState<ApprovalRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleDownloadAttachment = async (id: number, fileName: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:32771/api/letters/attachments/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal mengunduh file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Gagal mengunduh file");
    }
  };

  const handlePreviewAttachment = async (id: number, contentType: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token tidak ditemukan. Silakan login kembali.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:32771/api/letters/attachments/${id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Gagal memuat file untuk preview");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      setPreviewUrl(url);
      setPreviewType(contentType);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error("Preview error:", error);
      alert("Gagal memuat preview");
    }
  };

  if (loading) return <FullscreenSpinner />;
  if (!detail) return <p className="p-4 text-red-500">Request not found.</p>;

  return (
    <div className="p-4 space-y-6 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4 mb-6">
        Details
      </h1>

      {/* Info Utama */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md">
        <CardContent className="space-y-2">
          <div className="grid grid-cols-[140px_auto] text-sm">
            <span className="text-blue-500">Title</span>
            <span>: {detail.title}</span>
          </div>
          <div className="grid grid-cols-[140px_auto] text-sm">
            <span>Request No</span>
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
              : {detail.requestedByUser?.fullName} (
              {detail.requestedByUser?.role})
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
            <span>
              : {format(new Date(detail.createdAt), "dd MMM yyyy HH:mm")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Approval Flow */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
            <svg
              className="w-5 h-5 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 17v-2a4 4 0 014-4h4m0 0l-4-4m4 4l-4 4"
              />
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              Approval Flow
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-muted bg-gray-100 dark:bg-gray-700 text-left">
                <tr>
                  <th className="border px-3 py-2">No</th>
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
                    <td className="border px-3 py-2">
                      {flow.approver?.fullName}
                    </td>
                    <td className="border px-3 py-2">
                      {flow.position?.title || "-"}
                    </td>
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

      {/* Attachments */}
      {detail.attachments && detail.attachments.length > 0 && (
        <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a4 4 0 10-5.656-5.656l-6.586 6.586"
                />
              </svg>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Attachments
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm text-gray-800 dark:text-gray-200">
                <thead className="bg-gray-100 dark:bg-gray-700 text-left text-gray-700 dark:text-gray-200">
                  <tr>
                    <th className="border px-3 py-2">No</th>
                    <th className="border px-3 py-2">File Name</th>
                    <th className="border px-3 py-2">Uploaded At</th>
                    <th className="border px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.attachments.map((file, index) => (
                    <tr
                      key={file.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="border px-3 py-2">{index + 1}</td>
                      <td className="border px-3 py-2">{file.fileName}</td>
                      <td className="border px-3 py-2">
                        {format(new Date(file.uploadedAt), "dd MMM yyyy HH:mm")}
                      </td>
                      <td className="border px-3 py-2 space-x-2">
                        <button
                          onClick={() =>
                            handlePreviewAttachment(file.id, file.contentType)
                          }
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadAttachment(file.id, file.fileName)
                          }
                          className="text-green-600 dark:text-green-400 hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        isFullscreen
      >
        <div className="w-full h-full flex items-center justify-center bg-black">
          {previewUrl && previewType?.startsWith("image/") && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          )}
          {previewUrl && previewType === "application/pdf" && (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              className="w-full h-full"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TaskDetailPage;
