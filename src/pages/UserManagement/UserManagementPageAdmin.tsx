import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { Card, CardContent } from "@/components/ui/card/Card";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal/index";
import FullscreenSpinner from "@/components/ui/spinner/FullscreenSpinner";

interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  positionTitle: string;
  isActive: boolean;
}

interface CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role: string;
  positionId: number;
  isActive: boolean;
  phoneNumber?: string;
}

interface Position {
  id: number;
  title: string;
}

export default function UserManagementPageAdmin() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [positionMap, setPositionMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [form, setForm] = useState<CreateUserDto>({
    fullName: "",
    email: "",
    password: "",
    phoneNumber: "",
    role: "Staff",
    positionId: 1,
    isActive: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await api.get("/users/positions");
      
      const map: Record<string, number> = {};
      res.data.forEach((p: Position) => {
        map[p.title] = p.id;
      });
      setPositionMap(map);
    } catch {
      toast.error("Failed to load positions");
    }
  };

  const handleRoleChange = (selectedRole: string) => {
    const newPositionId = positionMap[selectedRole] || 1;
    setForm((prev) => ({
      ...prev,
      role: selectedRole,
      positionId: newPositionId,
    }));
  };

  const handleCreate = async () => {
    if (!form.phoneNumber) {
      toast.warning("Phone number is required");
      return;
    }

    setActionLoading(true);
    try {
      await api.post("/users", form);
      toast.success("User created successfully");
      setForm({
        fullName: "",
        email: "",
        password: "",
        phoneNumber: "",
        role: "Staff",
        positionId: positionMap["Staff"] || 1,
        isActive: true,
      });
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;

    setActionLoading(true);
    try {
      await api.delete(`/users/${selectedUserId}`);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsModalOpen(false);
      setSelectedUserId(null);
      setActionLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchUsers(), fetchPositions()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const pagedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(users.length / itemsPerPage) || 1;

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      {(loading || actionLoading) && <FullscreenSpinner />}

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4 mb-6">
        User Management (Admin)
      </h1>

      {/* Form Tambah User */}
      <Card className="p-6 space-y-6 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md">
        <h2 className="text-lg font-semibold">Add New User</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phoneNumber || ""}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              value={form.role}
              onChange={handleRoleChange}
              placeholder="Select Role"
              options={Object.keys(positionMap).map((role) => ({
                label: role,
                value: role,
              }))}
            />
          </div>
        </div>
        <Button onClick={handleCreate} className="mt-4 w-fit">
          Create
        </Button>
      </Card>

      {/* Tabel Users */}
      <Card className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 shadow-md">
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {pagedUsers.map((user, index) => (
                <tr key={user.id}>
                  <td className="px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-4 py-2">{user.fullName}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2">{user.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 dark:text-red-500 hover:bg-red-500 hover:text-white"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setIsModalOpen(true);
                      }}
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination */}
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

      {/* Modal Delete */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md p-6">
        <div className="space-y-4 text-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Confirm Delete
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedUserId(null);
              }}
            >
              Cancel
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
