import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { About } from "./pages/About";
import { Blog } from "./pages/Blog";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";
import { PostReader } from "./pages/PostReader";
import { PublicLayout } from "./pages/PublicLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminLogin } from "./pages/admin/AdminLogin";
import { PostEditor } from "./pages/admin/PostEditor";
import "./styles/themes.css";

function ProtectedAdmin() {
  const location = useLocation();
  if (!localStorage.getItem("admin_token")) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return <AdminLayout />;
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<PostReader />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedAdmin />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/posts/new" element={<PostEditor />} />
            <Route path="/admin/posts/:slug/edit" element={<PostEditor />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
