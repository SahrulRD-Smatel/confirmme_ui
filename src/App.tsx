import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";

import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

// import { Toaster } from "react-hot-toast";
import { Toaster } from "sonner";


import DashboardPage from "./pages/Dashboard/DashboardPage";

import ApprovalRequestsPage from "./pages/ApprovalRequests/ApprovalRequestsPage";
import CreateRequestPage from "./pages/ApprovalRequests/CreateRequestPage";
// import RequestDetailPage from "./pages/ApprovalRequests/RequestDetailPage";
import EditRequestPage from "./pages/ApprovalRequests/EditRequestPage";

import ApprovalInboxPage from "./pages/ApprovalInbox/ApprovalInboxPage";
import ApprovalInboxDetailPage from "./pages/ApprovalInbox/ApprovalInboxDetailPage";
import ApprovalViaQRPage from "./pages/ApprovalInbox/ApprovalViaQRPage";
import TaskListPage from "./pages/TaskList/TaskListPage";
import TaskDetailPage from "./pages/TaskList/TaskDetailPage";

// import LetterPage from "./pages/LetterPage/LetterPage";

import MyLettersPage from "./pages/LetterPage/MyLettersPage";
import LetterDetailPage from "./pages/LetterPage/LetterDetailPage";
import DashboardAdminPage from "@/pages/Dashboard/DashboardAdminPage";

import UserManagementPageAdmin from "@/pages/UserManagement/UserManagementPageAdmin";
import UserManagementPageHRD from "@/pages/UserManagement/UserManagementPageHRD";

import ProfilePage from "@/pages/Profile/ProfilePage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      {/* <Toaster position="top-center" reverseOrder={false} /> */}
      <Toaster position="top-center" closeButton theme="light" richColors />

      <Routes>
        <Route path="/" element={<ProtectedRoute />}>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<DashboardPage />} />
            <Route path="/blank" element={<Blank />} />
            <Route
              path="/approval-requests"
              element={<ApprovalRequestsPage />}
            />
            <Route
              path="/approval-requests/create"
              element={<CreateRequestPage />}
            />

            <Route
              path="/approval-requests/:id"
              element={<EditRequestPage />}
            />

            <Route path="/approval-inbox" element={<ApprovalInboxPage />} />
            <Route
              path="/approvalrequests/approval-via-qr"
              element={<ApprovalViaQRPage />}
            />
            <Route path="/approval-tasklist" element={<TaskListPage />} />
            <Route path="/approval-tasklist/:id" element={<TaskDetailPage />} />

            <Route path="/letters" element={<MyLettersPage />} />
            <Route
              path="/letters/metadata/:approvalRequestId"
              element={<LetterDetailPage />}
            />


            <Route path="/admin" element={<DashboardAdminPage />} />
            <Route path="/admin/users" element={<UserManagementPageAdmin />} />
            <Route path="/user-management" element={<UserManagementPageHRD />} />

            <Route path="/profile/:id" element={<ProfilePage />} />

            {/* tes page */}
            <Route
              path="/approval-inboxdetails"
              element={<ApprovalInboxDetailPage />}
            />
          </Route>
        </Route>

        {/* Auth Layout */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
