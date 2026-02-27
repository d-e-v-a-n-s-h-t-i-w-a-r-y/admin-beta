import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { FileText, Calendar, Map, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminLayout = () => {
  const { isLoggedIn, logout, snippets, roadmaps } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) navigate('/');
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { to: '/admin/snippets', label: 'Snippets', icon: FileText, count: snippets.length },
    { to: '/admin/daily', label: 'Daily Content', icon: Calendar, count: 0 },
    { to: '/admin/roadmaps', label: 'Roadmaps', icon: Map, count: roadmaps.length },
  ];

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border bg-sidebar-background flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground tracking-tight">SwiftEd Admin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Content Management</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`
              }
            >
              <link.icon className="w-4 h-4" />
              <span className="flex-1">{link.label}</span>
              {link.count > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 min-w-[20px] justify-center">
                  {link.count}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
