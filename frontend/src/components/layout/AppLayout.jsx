import { useState } from 'react';

import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = ({ role, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell relative min-h-screen overflow-hidden bg-brand-gradient text-slate-100">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-accent-500/20 blur-[120px]" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-brand-500/20 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar role={role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuToggle={() => setSidebarOpen(true)} />
          <main className="page-stage flex-1 px-4 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
