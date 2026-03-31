import React from 'react';
import { NavLink } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, CalendarPlus } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <CalendarDays className="h-7 w-7 text-indigo-600 mr-2" />
              <span className="text-xl font-bold tracking-tight text-slate-900">
                SpaceSync
              </span>
            </div>

            <div className="hidden md:ml-10 md:flex space-x-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) => `
                  inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                My Bookings
              </NavLink>
              <NavLink
                to="/new-booking"
                className={({ isActive }) => `
                  inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-slate-100 text-slate-900' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }
                `}
              >
                <CalendarPlus className="w-4 h-4 mr-2" />
                Book Resource
              </NavLink>
            </div>
          </div>

          <div className="flex items-center">
            {/* Mock User Avatar */}
            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm">
              HD
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
