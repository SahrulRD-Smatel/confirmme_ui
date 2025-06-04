import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Button from "@/components/ui/button/Button";
import api from "@/api/axiosClient";

interface LetterMetadata {
  requestId: number;
  requestedBy: string;
  approvalType: string;
  approved: boolean;
}

export default function LetterPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const [metadata, setMetadata] = useState<LetterMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/Letters/metadata/${requestId}`);
        const data = res.data;

        setMetadata({
          requestId: Number(requestId),
          requestedBy: data.requestedByUser?.fullName || "N/A",
          approvalType: data.approvalType?.name || "N/A",
          approved: data.approved ?? false, // Ambil nilai asli dari API
        });
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError("Surat belum tersedia atau belum disetujui sepenuhnya.");
        } else {
          setError("Gagal mengambil metadata surat.");
        }
        setMetadata(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [requestId]);

  const downloadPdf = async () => {
    if (!requestId) return;

    setDownloading(true);
    try {
      const res = await api.get(`/Letters/${requestId}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Surat_${requestId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("Approval belum selesai. Tidak dapat mengunduh surat.");
      } else if (err.response?.status === 404) {
        setError("Request tidak ditemukan.");
      } else {
        setError("Gagal mengunduh surat.");
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!metadata) return <div>Metadata surat tidak ditemukan.</div>;
  if (!metadata.approved)
    return <div>Surat belum disetujui sepenuhnya.</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">
        Surat Persetujuan Request #{metadata.requestId}
      </h1>
      <p>Pemohon: {metadata.requestedBy}</p>
      <p>Jenis Permohonan: {metadata.approvalType}</p>

      <Button onClick={downloadPdf} disabled={downloading}>
        {downloading ? "Mengunduh..." : "Download PDF"}
      </Button>
    </div>
  );
}
