import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axiosClient";
import { Card, CardContent } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";

interface ApprovalStep {
  approverName: string;
  status: "Pending" | "Approved" | "Rejected";
  remark?: string;
  actedAt?: string;
}

interface TaskDetail {
  id: number;
  title: string;
  description: string;
  requestedBy: string;
  submittedAt: string;
  currentStepIndex: number;
  totalSteps: number;
  steps: ApprovalStep[];
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchTaskDetail(+id);
  }, [id]);

  const fetchTaskDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await api.get(`/approvalrequests/${id}`);
      setTask(res.data);
    } catch (error) {
      alert("Failed to load task details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!task) return <p>No details found.</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Task Details</h1>
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">{task.title}</h2>
          <p className="mb-2">{task.description}</p>
          <p>
            Requested by: <strong>{task.requestedBy}</strong>
          </p>
          <p>
            Submitted at:{" "}
            {new Date(task.submittedAt).toLocaleString()}
          </p>
          <p>
            Step {task.currentStepIndex} of {task.totalSteps}
          </p>

          <hr className="my-4" />

          <h3 className="font-semibold mb-2">Approval Steps</h3>
          <ul className="list-disc pl-5 space-y-2">
            {task.steps.map((step, index) => (
              <li key={index}>
                <p>
                  <strong>{step.approverName}</strong> - Status:{" "}
                  <span
                    className={
                      step.status === "Approved"
                        ? "text-green-600"
                        : step.status === "Rejected"
                        ? "text-red-600"
                        : "text-gray-600"
                    }
                  >
                    {step.status}
                  </span>
                </p>
                {step.remark && (
                  <p className="text-sm italic text-gray-700">
                    Remark: {step.remark}
                  </p>
                )}
                {step.actedAt && (
                  <p className="text-xs text-gray-500">
                    Acted at: {new Date(step.actedAt).toLocaleString()}
                  </p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Button onClick={() => navigate(-1)}>Back to Task List</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
