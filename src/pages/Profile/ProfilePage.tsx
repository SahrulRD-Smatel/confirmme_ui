import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import FullscreenSpinner from "@/components/ui/spinner/FullscreenSpinner";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserCircle } from "lucide-react";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: string;
  positionId: number;
  isActive: boolean;
  createdAt: string;
  phoneNumber: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");
      setProfile(res.data);
    } catch {
      toast.error("Gagal memuat data profil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <FullscreenSpinner />;

  if (!profile) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        Data profil tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-l-4 border-primary pl-4 mb-6">
        Profile Pengguna
      </h1>

      <div className="flex flex-col md:flex-row gap-6 bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
        {/* Sidebar Avatar */}
        <div className="flex flex-col items-center w-full md:w-1/3 text-center space-y-4">
          <UserCircle className="w-24 h-24 text-gray-400 dark:text-gray-600" />
          <div>
            <h2 className="text-xl font-semibold">{profile.fullName}</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{profile.role}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium 
            ${profile.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
            {profile.isActive ? "Aktif" : "Tidak Aktif"}
          </div>
        </div>

        {/* Info Grid */}
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Email</span>
            <p className="font-medium">{profile.email}</p>
          </div>

          <div>
            <span className="text-gray-500">Nomor Telepon</span>
            <p className="font-medium">{profile.phoneNumber || "-"}</p>
          </div>

          <div>
            <span className="text-gray-500">Role</span>
            <p className="font-medium">{profile.role}</p>
          </div>

          

          <div className="sm:col-span-2">
            <span className="text-gray-500">Today</span>
            <p className="font-medium">{format(new Date(), "dd MMMM yyyy, HH:mm")}</p>

          </div>
        </div>
      </div>
    </div>
  );
}
