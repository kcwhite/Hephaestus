import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, FileText, Bot, Database, GitBranch, Layers, Monitor,
  Compass, ListChecks, Menu, ChevronLeft, Ticket, Workflow, Activity,
} from 'lucide-react';
import { useWebSocket } from '@/context/WebSocketContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Navigation groups give the 11 items a logical hierarchy.
// `description` is shown as a subtitle in the expanded sidebar and as a
// tooltip hint in the collapsed sidebar.
const NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: '/',          icon: Home,       label: 'Dashboard',    description: 'Live stats & activity feed' },
      { to: '/workflows', icon: Workflow,   label: 'Workflows',    description: 'Start & manage runs' },
    ],
  },
  {
    label: 'Work',
    items: [
      { to: '/tasks',   icon: FileText,   label: 'Tasks',    description: 'Tasks by phase & agent' },
      { to: '/tickets', icon: Ticket,     label: 'Tickets',  description: 'Issue tracking & Kanban board' },
      { to: '/results', icon: ListChecks, label: 'Results',  description: 'Agent results & validation' },
    ],
  },
  {
    label: 'Monitor',
    items: [
      { to: '/overview',      icon: Compass, label: 'System Health', description: 'Guardian, Conductor & steering' },
      { to: '/agents',        icon: Bot,     label: 'Agents',        description: 'Status, health & control' },
      { to: '/phases',        icon: Layers,  label: 'Phases',        description: 'Phase progression & activity' },
      { to: '/observability', icon: Monitor, label: 'Live Output',   description: 'Agent terminal feeds' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { to: '/memories', icon: Database,  label: 'Memories',   description: 'Agent knowledge base (RAG)' },
      { to: '/graph',    icon: GitBranch, label: 'Task Graph', description: 'Task dependency graph' },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const Layout: React.FC = () => {
  const { isConnected, lastUpdate } = useWebSocket();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed.toString());
  }, [sidebarCollapsed]);

  // Keyboard shortcut: Cmd+B / Ctrl+B
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Derive the current page title from the active nav item.
  const currentNavItem = ALL_NAV_ITEMS.find(item => {
    if (item.to === '/') return location.pathname === '/';
    return location.pathname === item.to || location.pathname.startsWith(item.to + '/');
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={false}
          animate={{ width: sidebarCollapsed ? 64 : 256 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="bg-white shadow-lg flex flex-col relative overflow-hidden"
        >
          {/* Toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute -right-3 top-8 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            title={`${sidebarCollapsed ? 'Expand' : 'Collapse'} sidebar (⌘B)`}
          >
            {sidebarCollapsed ? (
              <Menu className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* Brand */}
          <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'} transition-all`}>
            {sidebarCollapsed ? (
              <h1 className="text-xl font-bold text-gray-800 text-center">H</h1>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800">Hephaestus</h1>
                <p className="text-sm text-gray-500 mt-1">AI Agent Orchestration</p>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto mt-2">
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                {/* Section divider / label */}
                {group.label && (
                  sidebarCollapsed ? (
                    <hr className="my-2 mx-3 border-gray-100" />
                  ) : (
                    <p className="px-6 pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {group.label}
                    </p>
                  )
                )}

                {group.items.map(({ to, icon: Icon, label, description }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 ${sidebarCollapsed ? 'px-4 justify-center' : 'px-4'} py-2.5 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                        isActive ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-600' : ''
                      }`
                    }
                    title={sidebarCollapsed ? `${label} — ${description}` : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && (
                      <div className="min-w-0">
                        <div className="text-sm font-medium leading-tight truncate">{label}</div>
                        <div className="text-xs text-gray-400 leading-tight mt-0.5 truncate">{description}</div>
                      </div>
                    )}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* Connection status */}
          <div className={`${sidebarCollapsed ? 'p-3' : 'px-4 py-4'} border-t mt-auto`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
                title={sidebarCollapsed ? (isConnected ? 'Connected' : 'Disconnected') : undefined}
              />
              {!sidebarCollapsed && (
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                  {isConnected && (
                    <p className="text-xs text-gray-400">
                      Updated {format(lastUpdate, 'HH:mm:ss')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 overflow-auto min-w-0">
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-400" />
              <div>
                <span className="text-gray-800 font-semibold">
                  {currentNavItem?.label ?? 'Dashboard'}
                </span>
                {currentNavItem?.description && (
                  <span className="text-xs text-gray-400 ml-2 hidden sm:inline">
                    — {currentNavItem.description}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Live
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
