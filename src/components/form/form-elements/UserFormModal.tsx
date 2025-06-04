// src/components/form/form-elements/UserFormModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/Dialog";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";
import { useEffect, useState } from "react";
import { User } from "@/pages/UserManagement/UserManagementPage";

export interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSaved: () => void;
}

// Update type User supaya ada positionId (number)
export type UserWithPositionId = User & { positionId: number };

export default function UserFormModal({
  open,
  onOpenChange,
  user,
  onSaved,
}: UserFormModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    role: "",
    positionId: 0,
  });

  const [positions, setPositions] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loadingPositions, setLoadingPositions] = useState(false);

  // Fetch posisi saat modal dibuka
  useEffect(() => {
    if (!open) return;

    const fetchPositions = async () => {
      setLoadingPositions(true);
      try {
        const res = await fetch("/api/positions", { credentials: "include" });
        const data = await res.json();
        setPositions(data);
      } catch (err) {
        console.error("Failed to fetch positions", err);
      } finally {
        setLoadingPositions(false);
      }
    };

    fetchPositions();
  }, [open]);

  // Set form data jika edit user
  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        positionId: user.positionId || 0,
      });
    } else {
      setForm({
        fullName: "",
        email: "",
        role: "",
        positionId: 0,
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "positionId" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async () => {
    // Simple validation
    if (!form.fullName || !form.email || !form.role || !form.positionId) {
      alert("Please fill all fields!");
      return;
    }

    try {
      const method = user ? "PUT" : "POST";
      const endpoint = user ? `/api/users/${user.id}` : "/api/users";

      await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          role: form.role,
          positionId: form.positionId,
        }),
      });

      onSaved();
      onOpenChange(false);
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Failed to save user.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="space-y-4 w-[400px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <Input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          autoFocus
        />

        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
        />

        <Input
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Role (Staff, HRD, Manager, Direktur)"
        />

        <div>
          <label
            htmlFor="positionId"
            className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Position
          </label>
          {loadingPositions ? (
            <div>Loading positions...</div>
          ) : (
            <select
              id="positionId"
              name="positionId"
              value={form.positionId}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-sm"
            >
              <option value={0}>-- Select Position --</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit}>{user ? "Update" : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
