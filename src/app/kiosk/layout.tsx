import TopNav from "@/app/ui/components/topnav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col w-screen h-screen bg-white">
      {/* Top Navigation Bar */}
      <div className="flex-none">
        <TopNav />
      </div>

      {/* Main Content Area */}
      <div className="flex-grow overflow-auto p-6 md:p-12">
        {children}
      </div>
    </div>
  );
}