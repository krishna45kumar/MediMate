
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 flex-1 min-w-0 p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
