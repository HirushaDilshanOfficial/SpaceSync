import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, CalendarPlus, ShieldCheck, Menu, X, ChevronDown, AlertTriangle, Wrench } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'My Bookings', icon: LayoutDashboard },
  { to: '/new-booking', label: 'Book Resource', icon: CalendarPlus },
  { to: '/report-incident', label: 'Report Issue', icon: AlertTriangle },
  { to: '/incidents', label: 'Incidents', icon: Wrench },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <NavLink to="/dashboard" className="flex items-center gap-2 shrink-0 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              <CalendarDays className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">SpaceSync</span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* User Avatar */}
          <div className="hidden md:flex relative group shrink-0">
            <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white text-[11px] font-bold">HD</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800 leading-tight">Hirusha D.</p>
                <p className="text-[11px] text-gray-400">Admin</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</button>
              <div className="border-t border-gray-100 my-1"></div>
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50">Logout</button>
            </div>
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-5 pt-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          <div className="pt-3 mt-2 border-t border-gray-100 flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-[11px] font-bold">HD</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Hirusha Dilshan</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
