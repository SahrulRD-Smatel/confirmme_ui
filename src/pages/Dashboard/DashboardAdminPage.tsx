import { useEffect, useState } from "react";
import api from "@/api/axiosClient";
import Chart from "react-apexcharts";
import { Card, CardContent } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import {  PlusCircle  } from "lucide-react";
import { useNavigate } from "react-router-dom";


interface UserData {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function DashboardAdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserData[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Gagal mengambil data user:", err);
      }
    };

    const recent = [...users]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
    setRecentUsers(recent);

    fetchUsers();
  }, [users]);

  const roles = ["Admin", "HRD", "Manager", "Direktur", "Staff"];
  const roleCounts = roles.map(
    (role) => users.filter((user) => user.role === role).length
  );

  const activeCount = users.filter((u) => u.isActive).length;
  const inactiveCount = users.length - activeCount;

  const roleData = {
    series: roleCounts,
    options: {
      chart: {
        type: "pie" as const
      },
      labels: roles,
      legend: {
        position: "bottom"
      }
    }
  };

  const statusData = {
    series: [
      {
        name: "User",
        data: [activeCount, inactiveCount]
      }
    ],
    options: {
      chart: {
        type: "bar" as const
      },
      plotOptions: {
        bar: {
          horizontal: false
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: ["Aktif", "Tidak Aktif"]
      }
    }
  };

  return (
    <div className="p-6 text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-bold mb-6">Dashboard Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Distribusi Role</h2>
            <Chart
              options={roleData.options}
              series={roleData.series}
              type="pie"
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Status User</h2>
            <Chart
              options={statusData.options}
              series={statusData.series}
              type="bar"
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      <div className=" p-4 flex justify-between items-center mt-8">
        <h2 className="text-xl font-semibold">Recent Created Users</h2>
        <Button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Tambah User
        </Button>
      </div>

      <Card className="p-4">
        <ul className="text-sm divide-y divide-gray-200 dark:divide-gray-700">
          {recentUsers.map((user) => (
            <li key={user.id} className="py-2 flex justify-between items-center">
              <div>
                <p className="font-medium">{user.fullName}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {user.role}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
