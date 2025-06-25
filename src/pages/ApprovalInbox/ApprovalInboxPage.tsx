import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import axios from "axios";

import { format } from "date-fns";
import {
  Eye, QrCode, MessageCircle, Check, X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Badge from "@/components/ui/badge/Badge";
import FullscreenSpinner from "@/components/ui/spinner/FullscreenSpinner";
import { Modal } from "@/components/ui/modal/index";
import Textarea from "@/components/form/input/TextArea";
import { toast } from "sonner";

interface InboxItemDto {
  approvalRequestId: number;
  requestId: string;
  title: string;
  requestedById: string;
  status: string;
  createdAt: string;
  currentStep: number;
  totalSteps: number;
  flowId: number;
}

const ApprovalInboxPage = () => {
  const [items, setItems] = useState<InboxItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlowId, setSelectedFlowId] = useState<number | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InboxItemDto | null>(null);
  const [remark, setRemark] = useState("");

  const fetchInbox = async () => {
    try {
      const res = await api.get("/approvalrequests/inbox");
      setItems(res.data);
    } catch (error) {
      console.error("Failed to load inbox items", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  // Fetch QR Code as image blob
  useEffect(() => {
  const fetchQRImage = async () => {
    if (!selectedFlowId) return;

    try {
      const response = await api.get(`/Barcode/generate-qr?flowId=${selectedFlowId}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(blob);
      setQrImageUrl(imageUrl);
    } catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error("QR Axios Error:", {
      status: error.response?.status,
      data: error.response?.data,
    });

    toast.error(
      "Failed to load QR image: " +
        (error.response?.status
          ? `${error.response.status} ${error.response.statusText}`
          : error.message)
    );
  } else {
    console.error("Unexpected QR Error:", error);
    toast.error("Unexpected error occurred when loading QR.");
  }

  setQrImageUrl(null);
}

  };

  if (showQR && selectedFlowId) {
    fetchQRImage();
  }
}, [selectedFlowId, showQR]);


  const handleApproveReject = async (
    approvalRequestId: number,
    status: "Approved" | "Rejected",
    remark: string
  ) => {
    try {
      const approverId = localStorage.getItem("userId");
      if (!approverId) throw new Error("User not found");

      await api.put(`/approvalrequests/${approvalRequestId}/approve`, {
        approverId,
        status,
        remark,
      });

      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchInbox();
    } catch (err) {
      toast.error("Action failed");
      console.error(err);
    }
  };

  if (loading) return <FullscreenSpinner />;

  return (
    <div className="px-6 py-4 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold border-l-4 border-primary pl-4 mb-6">Approval Inbox</h1>

      {items.length === 0 ? (
        <div className="text-center text-gray-500">No pending approvals.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.approvalRequestId} className="border dark:border-gray-700">
              <CardContent className="space-y-2 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(item.createdAt), "dd MMM yyyy")}
                  </span>
                </div>
                <div className="text-sm">
                  Requested by: <span className="font-medium">{item.requestedById}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Badge variant="light">{item.status}</Badge>
                  <span>
                    Step {item.currentStep} of {item.totalSteps}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-green-600 hover:bg-green-600 hover:text-white"
                    onClick={() =>
                      handleApproveReject(item.approvalRequestId, "Approved", "")
                    }
                  >
                    <Check className="w-4 h-4" /> Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() =>
                      handleApproveReject(item.approvalRequestId, "Rejected", "")
                    }
                  >
                    <X className="w-4 h-4" /> Reject
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => {
                      setSelectedItem(item);
                      setShowNoteModal(true);
                      setRemark("");
                    }}
                  >
                    <MessageCircle className="w-4 h-4" /> Add Note
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-primary"
                    onClick={() => {
                      setSelectedFlowId(item.flowId);
                      setShowQR(true);
                    }}
                  >
                    <QrCode className="w-4 h-4" /> QR
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-blue-600 hover:bg-blue-600 hover:text-white"
                    onClick={() =>
                      window.open(`/approval-tasklist/${item.approvalRequestId}`, "_blank")
                    }
                  >
                    <Eye className="w-4 h-4" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal QR */}
      <Modal
  isOpen={showQR}
  onClose={() => {
    setShowQR(false);
    setQrImageUrl(null);
  }}
  className="p-6 max-w-sm"
>
  <h2 className="text-lg font-semibold mb-4">QR Code Approval</h2>

  {qrImageUrl === null ? (
    <p className="text-center text-red-500">QR code failed to load. Please try again.</p>
  ) : (
    <div className="flex justify-center items-center">
      <img
        src={qrImageUrl}
        alt="QR Code"
        className="w-48 h-48 object-contain border border-gray-300 rounded-lg"
      />
    </div>
  )}
</Modal>


      {/* Modal Add Note */}
      <Modal isOpen={showNoteModal} onClose={() => setShowNoteModal(false)} className="p-6 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Add Remark</h2>
        <Textarea
          placeholder="Write your remark..."
          value={remark}
          onChange={setRemark}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="primary" onClick={() => setShowNoteModal(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (selectedItem) {
                handleApproveReject(selectedItem.approvalRequestId, "Approved", remark);
                setShowNoteModal(false);
              }
            }}
          >
            Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ApprovalInboxPage;
