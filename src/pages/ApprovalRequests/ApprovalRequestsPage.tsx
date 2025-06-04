
import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import { Card, CardContent } from "@/components/ui/card/Card";
import Input from "@/components/form/input/InputField";
import { Eye, Loader2, Plus, Search, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosClient";

// Types

type ApprovalFlow = {
  ApproverId: string;
  approverName: string;
  positionTitle: string;
  status: "Pending" | "Approved" | "Rejected";
};

type Request = {
  id: string;
  title: string;
  approvalType: {
    id: string;
    name: string;
    description: string;
  };
  currentStatus: "Pending" | "Approved" | "Rejected";
  approvalFlows?: ApprovalFlow[];
};

export default function ApprovalRequestsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"requests" | "approvers">("requests");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        const response = await api.get("/ApprovalRequests");
        setRequests(response.data);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to fetch requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((r) =>
    (r.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const allApprovers = requests.flatMap((r) =>
    (r.approvalFlows || []).map((a) => ({
      ...a,
      requestTitle: r.title,
    }))
  );

  const filteredApprovers = allApprovers.filter((a) =>
    a.approverName.toLowerCase().includes(search.toLowerCase()) ||
    a.requestTitle.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages =
    activeTab === "requests"
      ? Math.ceil(filteredRequests.length / itemsPerPage) || 1
      : Math.ceil(filteredApprovers.length / itemsPerPage) || 1;

  const pagedRequests =
    activeTab === "requests"
      ? filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : [];

  const pagedApprovers =
    activeTab === "approvers"
      ? filteredApprovers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User not authenticated");

        await api.delete(`/ApprovalRequests/${id}`);
        setRequests((prevRequests) => prevRequests.filter((r) => r.id !== id));
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to delete request");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Task List</h1>
        <Button
          onClick={() => navigate("/approval-requests/create")}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 py-2 shadow-md transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-gray-300 dark:border-gray-700 pb-2">
        <div className="flex gap-4">
          <button
            className={`py-2 px-4 font-semibold rounded-md transition-all ${
              activeTab === "requests"
                ? "bg-primary text-primary border-b-4 border-primary shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Requests
          </button>
          <button
            className={`py-2 px-4 font-semibold rounded-md transition-all ${
              activeTab === "approvers"
                ? "bg-primary text-primary border-b-4 border-primary shadow-sm"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("approvers")}
          >
            Approvers
          </button>
        </div>

        <div className="relative w-full max-w-md sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={
              activeTab === "requests" ? "Search requests title..." : "Search approvers..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </div>

      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md dark:shadow-none transition-all duration-300">
        <CardContent className="p-4 sm:p-6 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="animate-spin w-8 h-8 text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600 font-semibold">
              {error}
            </div>
          ) : activeTab === "requests" ? (
            pagedRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-sm sm:text-lg">
                No Approval Requests found.
              </div>
            ) : (
              <>
                <TableView
                  data={pagedRequests}
                  isRequest
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onView={navigate}
                  onDelete={handleDelete}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )
          ) : pagedApprovers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm sm:text-lg">
              No Approvers found.
            </div>
          ) : (
            <>
              <TableView
                data={pagedApprovers}
                isRequest={false}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const base = "inline-block px-3 py-1 rounded-full font-semibold text-xs sm:text-sm";
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-200 dark:text-yellow-900",
    Approved: "bg-green-100 text-green-800 dark:bg-green-200 dark:text-green-900",
    Rejected: "bg-red-100 text-red-800 dark:bg-red-200 dark:text-red-900",
  };
  return <span className={`${base} ${styles[status] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"}`}>{status}</span>;
}

function TableView({
  data,
  isRequest,
  currentPage,
  itemsPerPage,
  onView,
  onDelete,
}: {
  data: any[];
  isRequest: boolean;
  currentPage: number;
  itemsPerPage: number;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-gray-800 dark:text-gray-100 ">
        <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
          <tr>
            <th className="px-4 py-3 text-left">No</th>
            {isRequest ? (
              <>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Approval Type</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-middle">Action</th>
              </>
            ) : (
              <>
                <th className="px-4 py-3 text-left">Approver Name</th>
                <th className="px-4 py-3 text-left">Position</th>
                <th className="px-4 py-3 text-left">Request Title</th>
                <th className="px-4 py-3 text-left">Status</th>
              </>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, i) => (
            <tr key={item.id || `${item.ApproverId}-${i}`} className="hover:bg-gray-50 dark:hover:bg-gray-900">
              <td className="px-4 py-3">{(currentPage - 1) * itemsPerPage + i + 1}</td>
              {isRequest ? (
                <>
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{item.approvalType?.name}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.currentStatus} /></td>
                  <td className="px-4 py-3 flex justify-center items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-primary hover:bg-primary hover:text-white"
                      onClick={() => onView?.(item.id)}
                    >
                      <Eye className="w-4 h-4" /> Update
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 text-red-500 dark:text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => onDelete?.(item.id)}
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-4 py-3 font-semibold">{item.approverName}</td>
                  <td className="px-4 py-3">{item.positionTitle}</td>
                  <td className="px-4 py-3 italic">{item.requestTitle}</td>
                  <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const maxButtons = 5;

  const getPageNumbers = () => {
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex justify-center items-center space-x-2 mt-4 select-none" aria-label="Pagination Navigation">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        aria-label="Go to first page"
      >
        {"<<"}
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        aria-label="Go to previous page"
      >
        {"<"}
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary ${
            page === currentPage ? "bg-primary text-blue-600" : "bg-white dark:text-white dark:bg-gray-800"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        aria-label="Go to next page"
      >
        {">"}
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
        aria-label="Go to last page"
      >
        {">>"}
      </button>
    </nav>
  );
}
