"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Cookies from "js-cookie";
import DialogContainer from "./components/DialogContainer";
import Header from "./components/Header/Header";
import Sidebar from "./components/SidebarComponents/Sidebar";
import SettingSidebar from "./setting/SettingSidebar";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isSettingsPage = pathname.startsWith("/setting");
  const isNotFound = pathname === "/not-found";
  // Define routes that should NOT show layout chrome
  const minimalLayoutRoutes = ["/forgot-password", "/login"];
  const isMinimalLayout = minimalLayoutRoutes.includes(pathname);
  // Redirect logic
  useEffect(() => {
    const token = Cookies.get("Reelboost_auth_token");
    const publicRoutes = ["/", "/not-found", "/forgot-password", "/login",,"/verify-email"];
    const isPublicRoute = publicRoutes.includes(pathname);
    if (!token && !isPublicRoute) {
      if (pathname !== "/") {
        router.replace("/");
      }
    }
  }, [pathname]);
  return (
    <>
      <DialogContainer />
      {/* Only show Header if NOT a minimal layout page */}
      {!isNotFound && !isMinimalLayout && <Header />}
      <div className="flex">
        {!isNotFound && !isMinimalLayout && (
          <div className={`${isSettingsPage ? "flex" : ""}`}>
            <Sidebar key="main" onNavigate={() => {}} />
            {isSettingsPage && (
              <div className="lg:pl-[270px] hidden sm:block">
                <SettingSidebar key="settings" onBack={() => history.back()} />
              </div>
            )}
          </div>
        )}
        <main
          className={`flex-1 ${
            !isNotFound && !isSettingsPage && !isMinimalLayout ? "lg:ml-[270px]" : ""
          }`}
        >
          {children}
        </main>
      </div>
      {/* Toasts still render even on minimal layout */}
      <Toaster position="bottom-right" reverseOrder={false} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        draggable
        pauseOnHover
        theme="dark"
        closeButton={true}
        limit={3}
        toastStyle={{ background: "#1e293b", color: "#fff" }}
      />
    </>
  );
}