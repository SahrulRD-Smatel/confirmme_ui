import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import axios from "axios";
import { toast } from "react-hot-toast";

type RequestItem = {
  id: number;
  title: string;
  approvalTypeName: string;
  createdAt: string;
  currentStatus: string;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRequests = async () => {
      const userId = localStorage.getItem("userId"); // sementara ambil dari localStorage

      if (!userId) {
        toast.error("User ID not found. Please login again.");
        return;
      }

      try {
        const res = await axios.get(`/api/approvalrequests/my-requests`, {
          params: { userId },
        });
        setRequests(res.data);
      } catch (error) {
        console.error("Failed to fetch requests", error);
        toast.error("Failed to fetch your requests.");
      }
    };

    fetchMyRequests();
  }, []);

  return (
    <div>
      <PageBreadcrumb pageTitle="My Requests" />
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-gray-500">No requests found.</p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                onClick={() => navigate(`/my-requests/${request.id}`)}
                className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold">{request.title}</h3>
                <p className="text-sm text-gray-500">
                  Type: {request.approvalTypeName} | Created:{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Status: {request.currentStatus}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
