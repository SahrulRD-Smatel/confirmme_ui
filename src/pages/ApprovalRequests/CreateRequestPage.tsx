import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Textarea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { toast } from "react-hot-toast";
import api from "@/api/axiosClient";

type Approver = {
  approverId: string;
  positionId: string;
  approverName: string;
  approverEmail: string;
  positionName: string;
};

type ApproverOption = {
  approverId: string;
  approverName: string;
  approverEmail: string;
  positionId: number;
  positionName: string;
};

type ApprovalType = {
  id: number;
  name: string;
  description: string;
};

export default function CreateRequestPage() {
  const navigate = useNavigate();

  const [approvalTypes, setApprovalTypes] = useState<ApprovalType[]>([]);
  const [approverOptions, setApproverOptions] = useState<ApproverOption[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    approvalTypeId: "",
    attachments: [] as File[],
  });

  const [approvers, setApprovers] = useState<Approver[]>([
    { approverId: "", positionId: "", approverName: "", approverEmail: "", positionName: "" },
  ]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, approversRes] = await Promise.all([
          api.get("/ApprovalTypes"),
          api.get("/ApprovalRequests/approvers"),
        ]);
        setApprovalTypes(typesRes.data);
        setApproverOptions(approversRes.data);
      } catch {
        toast.error("Failed to load approval types or approvers");
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTextareaChange = (value: string) => {
    setForm({ ...form, description: value });
  };

  const handleApprovalTypeChange = (value: string) => {
    setForm({ ...form, approvalTypeId: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setForm({ ...form, attachments: Array.from(e.target.files) });
    }
  };

  const handleApproverSelect = (index: number, approverId: string) => {
    const selected = approverOptions.find((a) => a.approverId === approverId);
    if (!selected) return;

    const updated = [...approvers];
    updated[index] = {
      approverId: selected.approverId,
      positionId: selected.positionId.toString(),
      approverName: selected.approverName,
      approverEmail: selected.approverEmail,
      positionName: selected.positionName,
    };
    setApprovers(updated);
  };

  const addApprover = () => {
    setApprovers([
      ...approvers,
      { approverId: "", positionId: "", approverName: "", approverEmail: "", positionName: "" },
    ]);
  };

  const removeApprover = (index: number) => {
    setApprovers(approvers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const requestedById = localStorage.getItem("userId");
    if (!requestedById) {
      toast.error("User not logged in");
      setLoading(false);
      return;
    }

    // Validasi form
    const isFormInvalid =
      !form.title.trim() ||
      !form.description.trim() ||
      !form.approvalTypeId.trim() ||
      approvers.some(
        (a) =>
          !a.approverId.trim() ||
          !a.positionId ||
          !a.approverName.trim() ||
          !a.approverEmail.trim()
      );

    if (isFormInvalid) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    // Cek duplikasi approverId
    const uniqueApproverIds = new Set(approvers.map(a => a.approverId));
    if (uniqueApproverIds.size !== approvers.length) {
      toast.error("Duplicate approvers are not allowed.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("approvalTypeId", form.approvalTypeId);
      formData.append("requestedById", requestedById);

      // Kirim approvers sebagai JSON Blob agar backend bisa parse List<ApproverDto> dengan [FromForm]
      // formData.append(
      //   "Approvers",
      //   new Blob(
      //     [
      //       JSON.stringify(
      //         approvers.map((a) => ({
      //           approverId: a.approverId,
      //           positionId: parseInt(a.positionId),
      //         }))
      //       ),
      //     ],
      //     { type: "application/json" }
      //   )
      // );

formData.append(
  "Approvers",
  new Blob(
    [JSON.stringify(approvers.map(a => ({
      approverId: a.approverId,
      positionId: Number(a.positionId),
      approverName: a.approverName,
      approverEmail: a.approverEmail,
      positionName: a.positionName
    })))],
    { type: "application/json" }
  )
);


console.log("approvers:", approvers);



      if (form.attachments.length > 0) {
        form.attachments.forEach((file) => {
          formData.append("attachments", file);
        });
      }

      await api.post("/ApprovalRequests", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Request created successfully!");
      navigate("/approval-requests");
    } catch (error: any) {
      console.error("Error response:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to create request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Request" />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl border border-gray-300 bg-white shadow-sm p-8 dark:bg-gray-900 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleTextareaChange}
                rows={4}
                required
              />
            </div>

            <div>
              <Label htmlFor="approvalType">Approval Type</Label>
              <Select
                options={approvalTypes.map((type) => ({
                  label: type.name,
                  value: type.id.toString(),
                }))}
                placeholder="Select Approval Type"
                onChange={handleApprovalTypeChange}
                value={form.approvalTypeId}
              />
            </div>

            <div>
              <Label htmlFor="attachment">Attachments (Optional)</Label>
              <Input
                id="attachment"
                name="attachment"
                type="file"
                accept="application/pdf"
                multiple
                onChange={handleFileChange}
              />
            </div>

            <div>
              <Label>Approvers</Label>
              {approvers.map((approver, index) => (
                <div key={index} className="space-y-4 border p-4 rounded-xl mb-6">
                  <div>
                    <Label>Approver</Label>
                    <Select
                      options={approverOptions.map((a) => ({
                        label: `${a.approverName} - ${a.positionName}`,
                        value: a.approverId,
                      }))}
                      placeholder="Select Approver"
                      onChange={(val) => handleApproverSelect(index, val)}
                      value={approver.approverId}
                    />
                  </div>

                  {approvers.length > 1 && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => removeApprover(index)}
                        className="text-red-500 text-sm"
                      >
                        Remove Approver
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addApprover}
                className="text-blue-500 mt-2"
              >
                + Add Approver
              </button>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
