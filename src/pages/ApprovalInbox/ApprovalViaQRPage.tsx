// src/pages/ApprovalPage.tsx
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/api/axiosClient";

export default function ApprovalViaQRPage() {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get("flowId");
  const qrToken = searchParams.get("qrToken");
  
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!flowId || !qrToken) {
    return <div>Invalid QR code data.</div>;
  }

  const handleSubmit = async (action: "Approve" | "Reject") => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/approvalrequests/approval-via-qr", {
        flowId: Number(flowId),
        qrToken,
        action,
        remark,
      });
      setSuccess(`Request successfully ${action.toLowerCase()}d.`);
    } catch (e) {
      setError("Failed to submit approval. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Approval Request</h2>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Add a remark (optional)"
        value={remark}
        onChange={e => setRemark(e.target.value)}
      />
      <button
        onClick={() => handleSubmit("Approve")}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded mr-2"
      >
        Approve
      </button>
      <button
        onClick={() => handleSubmit("Reject")}
        disabled={loading}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Reject
      </button>
    </div>
  );
}
