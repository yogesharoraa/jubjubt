import { useLocation } from "react-router-dom";
import Sidebar from "../Componets/Sidebar/Sidebar";
import { useSelector } from "react-redux";
import { selectAnyModalOpen } from "../Appstore/Slice/ModalSlice";

interface MainLayoutProps {
  children: React.ReactNode;
}

const hideSidebarRoutes = ["/signin", "/privacy-policy", "/terms-and-conditions"];


const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  const isAnyModalOpen = useSelector(selectAnyModalOpen);

  return (
    <div className="min-h-screen xl:flex bg-primary">
      {!hideSidebar && (
        <div className="hidden xl:block" style={{ zIndex: isAnyModalOpen ? 10 : 100 }}>
          <Sidebar isOpen={true} onClose={() => { }} />
        </div>
      )}
      <div className="xl:flex-1">{children}</div>
    </div>
  );
};

export default MainLayout;
