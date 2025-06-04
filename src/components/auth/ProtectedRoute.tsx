import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect } from "react";
import LoadingScreen from "@/components/ui/loading/LoadingScreen";
import loadingAnimation from "@/assets/loading.json";

const ProtectedRoute = () => {
  const { role, fetchUserData, isLoading } = useAuthStore();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (isLoading) {
    return <LoadingScreen animationData={loadingAnimation} />;
  }

  if (!role) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
