import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import { Search, Eye } from "lucide-react";

import FullscreenSpinner  from "@/components/ui/spinner/FullscreenSpinner";


interface InboxItemDto {
  requestId: string;
  approvalRequestId: number;
  title: string;
  requestedById: string;
  status: string;
  createdAt: string;
  currentStep: number;
  totalSteps: number;
}

const statusColor = {
  Pending: "bg-yellow-100 text-yellow-800",
  Approved: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
};

const TaskListPage = () => {
  const [tasks, setTasks] = useState<InboxItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState("");
  // const [filterStatus, setFilterStatus] = useState<string>("Pending");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchTasks = async () => {
    try {
      const response = await api.get<InboxItemDto[]>("/approvalrequests/inbox");
      setTasks(response.data);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    // const matchesStatus = filterStatus === "All" ? true : task.status === filterStatus;
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    // return matchesStatus && matchesSearch;
    return matchesSearch;
  });

  const pagedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage) || 1;

  return (
    <div className="px-6 py-4 min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">

      {loading && <FullscreenSpinner />}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4 mb-6">
        My Approval Tasks
      </h1>
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          {/* <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border px-2 py-1 rounded text-sm dark:bg-gray-800 dark:text-white"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="All">All</option>
          </select> */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>
      </div>

      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md">
        <CardContent className="p-4 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-gray-500">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm sm:text-lg">
              No approval tasks assigned to you.
            </div>
          ) : (
            <table className="min-w-full text-sm text-gray-800 dark:text-gray-100">
              <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">No</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Permintaan Dari</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created At</th>
                  <th className="px-4 py-3 text-left">Step</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pagedTasks.map((task, index) => (
                  <tr key={task.requestId} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-2 font-medium">{task.title}</td>
                    <td className="px-4 py-2">{task.requestedById}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          statusColor[task.status as keyof typeof statusColor] || "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {format(new Date(task.createdAt), "dd MMM yyyy")}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      Step {task.currentStep} of {task.totalSteps}
                    </td>
                    <td className="px-4 py-3 flex justify-center items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 text-primary hover:bg-primary hover:text-yellow-600 dark:hover:text-yellow-400"
                        onClick={() =>
                          task.approvalRequestId
                            ? navigate(`/approval-tasklist/${task.approvalRequestId}`)
                            : console.error("task.id is invalid", task)
                        }
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {"<<"}
        </button>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {"<"}
        </button>
        <span className="px-2">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {">"}
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default TaskListPage;
