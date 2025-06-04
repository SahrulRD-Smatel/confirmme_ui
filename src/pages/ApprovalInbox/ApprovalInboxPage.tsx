import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import { Card, CardContent } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import { toast } from "sonner";
import Textarea from "@/components/form/input/TextArea";
import { QRCodeCanvas } from "qrcode.react";
import Cookies from "js-cookie";
import { Dialog } from "@headlessui/react";

interface ApprovalInboxItem {
  id: number;
  title: string;
  description: string;
  requestedBy: string;
  currentStepIndex: number;
  totalSteps: number;
  submittedAt: string;
}

export default function ApprovalInboxPage() {
  const [requests, setRequests] = useState<ApprovalInboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [activeNoteRequestId, setActiveNoteRequestId] = useState<number | null>(null);
  const [qrModal, setQrModal] = useState<{ open: boolean; requestId: number | null }>({
    open: false,
    requestId: null,
  });

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await api.get("/approvalrequests/inbox");
      setRequests(res.data);
    } catch {
      toast.error("Failed to load approval inbox");
    } finally {
      setLoading(false);
    }
  };

  const getUserIdFromCookie = () => {
    return Cookies.get("userId") || "";
  };

  const handleApprove = async (requestId: number) => {
    try {
      await api.post(`/approvalrequests/${requestId}/approve`, {
        approverId: getUserIdFromCookie(),
        remark: notes[requestId] || "",
      });
      toast.success("Request approved");
      fetchInbox();
      setActiveNoteRequestId(null);
    } catch {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      await api.post(`/approvalrequests/${requestId}/reject`, {
        approverId: getUserIdFromCookie(),
        remark: notes[requestId] || "",
      });
      toast.success("Request rejected");
      fetchInbox();
      setActiveNoteRequestId(null);
    } catch {
      toast.error("Failed to reject");
    }
  };

  const handleShowQRModal = (requestId: number) => {
    setQrModal({ open: true, requestId });
  };

  const handleCloseQRModal = () => {
    setQrModal({ open: false, requestId: null });
  };

  const generateQrUrl = (action: "approve" | "reject", id: number) => {
    return `${window.location.origin}/api/approvalrequests/qr-${action}/${id}`;
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Approval Inbox / To-Do</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : requests.length === 0 ? (
        <p className="text-center">No requests to approve.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="shadow-sm hover:shadow-md transition-shadow rounded-md">
              <CardContent className="space-y-3">
                <h3 className="text-lg font-semibold">{request.title}</h3>
                <p className="text-gray-600">{request.description}</p>
                <p className="text-sm text-gray-500">
                  Requested by: <strong>{request.requestedBy}</strong>
                </p>
                <p className="text-sm text-gray-500">
                  📍 Step {request.currentStepIndex} of {request.totalSteps}
                </p>
                <p className="text-sm text-gray-400">
                  Submitted at: {new Date(request.submittedAt).toLocaleString()}
                </p>

                {activeNoteRequestId === request.id && (
                  <Textarea
                    className="mt-2"
                    placeholder="Add a note (optional)"
                    value={notes[request.id] || ""}
                    onChange={(val) => setNotes((prev) => ({ ...prev, [request.id]: val }))}
                  />
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                  <Button
                    variant="success"
                    onClick={() => handleApprove(request.id)}
                    className="flex-1 min-w-[100px]"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(request.id)}
                    className="flex-1 min-w-[100px]"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setActiveNoteRequestId(activeNoteRequestId === request.id ? null : request.id)
                    }
                    className="flex-1 min-w-[100px]"
                  >
                    {activeNoteRequestId === request.id ? "Hide Note" : "Add Note"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShowQRModal(request.id)}
                    className="flex-1 min-w-[100px]"
                  >
                    Show QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Modal */}
      <Dialog open={qrModal.open} onClose={handleCloseQRModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg max-w-sm w-full space-y-4">
            <Dialog.Title className="text-lg font-semibold">QR Approval</Dialog.Title>
            {qrModal.requestId && (
              <div className="space-y-4 text-center">
                <div>
                  <p className="text-sm font-medium mb-1">Approve:</p>
                  <QRCodeCanvas value={generateQrUrl("approve", qrModal.requestId)} size={160} />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Reject:</p>
                  <QRCodeCanvas value={generateQrUrl("reject", qrModal.requestId)} size={160} />
                </div>
              </div>
            )}
            <div className="text-right">
              <Button variant="outline" onClick={handleCloseQRModal}>
                Close
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
