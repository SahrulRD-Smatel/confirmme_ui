import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import Button from "@/components/ui/button/Button";

interface User {
  id: string;
  fullName: string;
  email: string;
  positionTitle: string;
  positionId?: number;
}

interface CreateUserPayload {
  fullName: string;
  email: string;
  password: string;
  positionId: number;
}

interface UpdateUserPayload {
  fullName: string;
  email: string;
  positionId: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [positions, setPositions] = useState<{ id: number; title: string }[]>(
    []
  );

  const [newUser, setNewUser] = useState<CreateUserPayload>({
    fullName: "",
    email: "",
    password: "",
    positionId: 0,
  });
  const [newUserErrors, setNewUserErrors] = useState<Record<string, string>>({});

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<UpdateUserPayload>({
    fullName: "",
    email: "",
    positionId: 0,
  });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
    fetchPositions();
  }, []);

  const fetchUsers = async () => {
    const res = await api.get("/Users");
    setUsers(res.data);
  };

  const fetchPositions = async () => {
    const res = await api.get("/Users/positions");
    setPositions(res.data);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Validasi tambah user
  const validateNewUser = () => {
    const errors: Record<string, string> = {};
    if (!newUser.fullName || newUser.fullName.trim().length < 3)
      errors.fullName = "Nama lengkap minimal 3 karakter";
    if (!newUser.email || !validateEmail(newUser.email))
      errors.email = "Email tidak valid";
    if (!newUser.password || newUser.password.length < 6)
      errors.password = "Password minimal 6 karakter";
    if (!newUser.positionId || newUser.positionId <= 0)
      errors.positionId = "Pilih posisi";
    setNewUserErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validasi edit user
  const validateEditUser = () => {
    const errors: Record<string, string> = {};
    if (!editingData.fullName || editingData.fullName.trim().length < 3)
      errors.fullName = "Nama lengkap minimal 3 karakter";
    if (!editingData.email || !validateEmail(editingData.email))
      errors.email = "Email tidak valid";
    if (!editingData.positionId || editingData.positionId <= 0)
      errors.positionId = "Pilih posisi";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateNewUser()) return;
    try {
      await api.post("/Users", newUser);
      setNewUser({ fullName: "", email: "", password: "", positionId: 0 });
      setNewUserErrors({});
      fetchUsers();
    } catch (err) {
      alert("Gagal menambahkan user.");
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/Users/${id}`);
    fetchUsers();
  };

  const startEdit = (user: User) => {
    setEditingUserId(user.id);
    setEditingData({
      fullName: user.fullName,
      email: user.email,
      positionId: positions.find((p) => p.title === user.positionTitle)?.id || 0,
    });
    setEditErrors({});
  };

  const handleEditSave = async () => {
    if (!editingUserId) return;
    if (!validateEditUser()) return;
    try {
      await api.put(`/Users/${editingUserId}`, editingData);
      setEditingUserId(null);
      setEditErrors({});
      fetchUsers();
    } catch {
      alert("Gagal update user.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-bold">Manajemen User</h1>

      {/* Form Tambah User */}
      <div className="space-y-2 border p-4 rounded-lg">
        <h2 className="font-semibold">Tambah User</h2>
        <input
          className={`w-full p-1 border rounded ${
            newUserErrors.fullName ? "border-red-500" : ""
          }`}
          placeholder="Nama lengkap"
          value={newUser.fullName}
          onChange={(e) =>
            setNewUser({ ...newUser, fullName: e.target.value })
          }
        />
        {newUserErrors.fullName && (
          <p className="text-red-600 text-sm">{newUserErrors.fullName}</p>
        )}

        <input
          className={`w-full p-1 border rounded ${
            newUserErrors.email ? "border-red-500" : ""
          }`}
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
        />
        {newUserErrors.email && (
          <p className="text-red-600 text-sm">{newUserErrors.email}</p>
        )}

        <input
          type="password"
          className={`w-full p-1 border rounded ${
            newUserErrors.password ? "border-red-500" : ""
          }`}
          placeholder="Password"
          value={newUser.password}
          onChange={(e) =>
            setNewUser({ ...newUser, password: e.target.value })
          }
        />
        {newUserErrors.password && (
          <p className="text-red-600 text-sm">{newUserErrors.password}</p>
        )}

        <select
          className={`w-full p-1 border rounded ${
            newUserErrors.positionId ? "border-red-500" : ""
          }`}
          value={newUser.positionId}
          onChange={(e) =>
            setNewUser({ ...newUser, positionId: Number(e.target.value) })
          }
        >
          <option value={0}>Pilih posisi</option>
          {positions.map((pos) => (
            <option key={pos.id} value={pos.id}>
              {pos.title}
            </option>
          ))}
        </select>
        {newUserErrors.positionId && (
          <p className="text-red-600 text-sm">{newUserErrors.positionId}</p>
        )}

        <Button onClick={handleCreate}>Tambah</Button>
      </div>

      {/* List dan Edit User */}
      <ul className="space-y-4">
        {users.map((user) =>
          editingUserId === user.id ? (
            <li key={user.id} className="border p-3 rounded space-y-2">
              <input
                className={`w-full p-1 border rounded ${
                  editErrors.fullName ? "border-red-500" : ""
                }`}
                value={editingData.fullName}
                onChange={(e) =>
                  setEditingData({ ...editingData, fullName: e.target.value })
                }
              />
              {editErrors.fullName && (
                <p className="text-red-600 text-sm">{editErrors.fullName}</p>
              )}

              <input
                className={`w-full p-1 border rounded ${
                  editErrors.email ? "border-red-500" : ""
                }`}
                value={editingData.email}
                onChange={(e) =>
                  setEditingData({ ...editingData, email: e.target.value })
                }
              />
              {editErrors.email && (
                <p className="text-red-600 text-sm">{editErrors.email}</p>
              )}

              <select
                className={`w-full p-1 border rounded ${
                  editErrors.positionId ? "border-red-500" : ""
                }`}
                value={editingData.positionId}
                onChange={(e) =>
                  setEditingData({
                    ...editingData,
                    positionId: Number(e.target.value),
                  })
                }
              >
                <option value={0}>Pilih posisi</option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title}
                  </option>
                ))}
              </select>
              {editErrors.positionId && (
                <p className="text-red-600 text-sm">{editErrors.positionId}</p>
              )}

              <div className="flex gap-2">
                <Button onClick={handleEditSave}>Simpan</Button>
                <Button variant="outline" onClick={() => setEditingUserId(null)}>
                  Batal
                </Button>
              </div>
            </li>
          ) : (
            <li
              key={user.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <div className="font-medium">{user.fullName}</div>
                <div className="text-sm text-gray-600">
                  {user.email} ({user.positionTitle})
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => startEdit(user)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDelete(user.id)}>
                  Hapus
                </Button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
