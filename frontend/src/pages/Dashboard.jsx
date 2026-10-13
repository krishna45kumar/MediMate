
import Sidebar from "../components/Sidebar";

function Dashboard() {
    return (
        <div className="flex min-h-screen bg-slate-50">

            <Sidebar />

            <main className="flex-1 p-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Welcome to MediMate 👋
                </h1>

                <p className="mt-2 text-slate-500">
                    Manage your daily medicine schedule.
                </p>
            </main>

        </div>
    );
}

export default Dashboard;
