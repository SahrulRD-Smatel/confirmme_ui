import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axiosClient";
import Button from "@/components/ui/button/Button";
import { toast } from "sonner";

interface LetterMetadata {
  title: string;
  pdfUrl: string;
  approved: boolean;
}

export default function LetterDetailPage() {
  const { approvalRequestId } = useParams<{ approvalRequestId: string }>();
  const [metadata, setMetadata] = useState<LetterMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMetadata = async () => {
    try {
      const res = await api.get(`/letters/metadata/${approvalRequestId}`);
      setMetadata(res.data);
    } catch {
      toast.error("Surat belum tersedia atau belum disetujui sepenuhnya.");
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/letters/${approvalRequestId}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `Surat_${approvalRequestId}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast.success("Surat berhasil diunduh.");
    } catch {
      toast.error("Gagal mengunduh surat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (approvalRequestId) {
      fetchMetadata();
    }
  }, [approvalRequestId]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow mt-10">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
        Detail Surat Persetujuan
      </h1>

      {!metadata ? (
        <p className="text-red-600 dark:text-red-400">
          Surat belum tersedia. Pastikan semua approver telah menyetujui.
        </p>
      ) : (
        <>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Judul:</strong> {metadata.title}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-2">
            <strong>Status:</strong>{" "}
            {metadata.approved ? (
              <span className="text-green-600 font-semibold">Disetujui</span>
            ) : (
              <span className="text-yellow-600 font-semibold">
                Belum Disetujui
              </span>
            )}
          </p>

          <div className="mt-6">
            <Button onClick={handleDownload} disabled={loading}>
              {loading ? "Mengunduh..." : "Unduh PDF"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
