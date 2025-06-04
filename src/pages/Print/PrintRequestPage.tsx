import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner } from '@/components/ui/spinner/Spinner';

interface Request {
  id: number;
  title: string;
  requester: string;
  date: string;
  status: string;
}

const PrintRequestPage = () => {
  const { requestId } = useParams<{ requestId: string }>();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/approvals/${requestId}`);
        const data = response.data;

        if (Array.isArray(data)) {
          setRequests(data);
        } else if (data && Array.isArray(data.requests)) {
          setRequests(data.requests);
        } else {
          console.error('Invalid data format:', data);
          setRequests([]);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        setError('Gagal memuat data permintaan.');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchRequests();
    }
  }, [requestId]);

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-lg shadow-md p-6 flex-1 flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Detail Permintaan Approval</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Menampilkan detail permintaan untuk approval dengan ID: <span className="font-medium text-blue-600">{requestId}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <Spinner />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 text-lg">{error}</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">Tidak ada permintaan untuk ditampilkan.</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full bg-white border rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm md:text-base">Judul</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm md:text-base">Pemohon</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm md:text-base">Tanggal</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm md:text-base">Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-800 text-sm md:text-base">{req.title}</td>
                    <td className="p-3 text-gray-800 text-sm md:text-base">{req.requester}</td>
                    <td className="p-3 text-gray-800 text-sm md:text-base">{new Date(req.date).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs md:text-sm rounded-full ${
                          req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintRequestPage;
