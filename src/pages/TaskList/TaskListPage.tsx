import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface InboxItemDto {
  id:number;
  requestId: number;
  title: string;
  requestedById: string;
  status: string;
  createdAt: string;
  step: number;
  totalSteps: number;
}

const TaskListPage = () => {
  const [tasks, setTasks] = useState<InboxItemDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-semibold mb-4">My Approval Tasks</h1>

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="text-gray-500">No approval tasks assigned to you.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">#</th>
                <th className="px-4 py-2 border">Title</th>
                <th className="px-4 py-2 border">Requested By</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Created At</th>
                <th className="px-4 py-2 border">Step</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, index) => (
                <tr key={task.requestId} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{index + 1}</td>
                  <td className="px-4 py-2 border">{task.title}</td>
                  <td className="px-4 py-2 border">{task.requestedById}</td>
                  <td className="px-4 py-2 border">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      {task.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border">
                    {format(new Date(task.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="px-4 py-2 border">{task.step}/{task.totalSteps}</td>
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => navigate(`/approval-tasklist/:id`)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TaskListPage;
