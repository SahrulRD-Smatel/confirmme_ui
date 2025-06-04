import { Card, CardContent } from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import { Link } from "react-router-dom";

export default function DashboardAdminPage() {
  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-6">
      <Card>
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <CardContent>
          <nav className="flex flex-col gap-4">
            {/* Karena Button kamu bukan menerima prop asChild, kita bungkus Link di luar Button */}
            <Link to="/admin/users" className="w-full">
              <Button variant="primary" className="w-full text-center">
                Manajemen User
              </Button>
            </Link>
            {/* Tambahkan tombol menu lainnya jika diperlukan */}
          </nav>
        </CardContent>
      </Card>
    </div>
  );
}
