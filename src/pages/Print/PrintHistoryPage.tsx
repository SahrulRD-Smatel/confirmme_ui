import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  position: {
    id: number;
    title: string;
    approvalLevel: number;
  };
}

interface ApprovalType {
  id: number;
  name: string;
  description: string;
}

interface ApprovalFlow {
  id: number;
  requestId: number;
  approverId: string;
  status: string;
  notes: string;
  approvedAt: string;
}

interface Attachment {
  id: number;
  fileName: string;
  url: string;
}

interface PrintHistory {
  id: number;
  requestId: number;
  printedBy: number;
  printedAt: string;
  approvalRequest: {
    id: number;
    requestNumber: string;
    title: string;
    description: string;
    approvalTypeId: number;
    requestedById: number;
    currentStatus: string;
    barcode: string;
    createdAt: string;
    updatedAt: string;
    requestedByUser: User;
    approvalType: ApprovalType;
    approvalFlows: ApprovalFlow[];
    attachments: Attachment[];
    printHistories: PrintHistory[];
  };
}

const PrintHistoryPage: React.FC = () => {
  const [printHistory, setPrintHistory] = useState<PrintHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrintHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/PrintHistory');
        setPrintHistory(response.data);
      } catch (err) {
        setError('Failed to fetch print history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrintHistory();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Print History</h1>

      {printHistory.length === 0 ? (
        <p>No print history found.</p>
      ) : (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">Request Number</th>
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Printed By</th>
              <th className="px-4 py-2">Print Date</th>
              <th className="px-4 py-2">Barcode</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {printHistory.map((history) => (
              <tr key={history.id} className="border-t">
                <td className="px-4 py-2">{history.approvalRequest.requestNumber}</td>
                <td className="px-4 py-2">{history.approvalRequest.title}</td>
                <td className="px-4 py-2">{history.approvalRequest.requestedByUser.fullName}</td>
                <td className="px-4 py-2">{new Date(history.printedAt).toLocaleString()}</td>
                <td className="px-4 py-2">{history.approvalRequest.barcode}</td>
                <td className="px-4 py-2">
                  <button className="px-4 py-2 text-blue-500">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrintHistoryPage;
