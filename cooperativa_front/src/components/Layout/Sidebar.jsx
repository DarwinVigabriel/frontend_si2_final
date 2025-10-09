import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Users,
  FileText,
  Shield,
  X,
  LogOut,
  UserCog,
  BarChart3,
  Key,
  Sprout,
  FlaskConical
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('¿Está seguro de que desea cerrar sesión?')) {
      await logout();
    }
  };
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      always: true
    },
    {
      path: '/socios',
      label: 'Socios',
      icon: Users,
      always: true
    },
    {
      path: '/usuarios',
      label: 'Usuarios',
      icon: UserCog,
      always: true
    },
    {
      path: '/roles',
      label: 'Roles',
      icon: Key,
      always: true
    },
    {
      path: '/semillas',
      label: 'Semillas',
      icon: Sprout,
      always: true
    },
    {
      path: '/insumos',
      label: 'Insumos',
      icon: FlaskConical,
      always: true
    },
    {
      path: '/auditoria',
      label: 'Auditoría',
      icon: FileText,
      always: true
    },
    {
      path: '/reportes',
      label: 'Reportes',
      icon: BarChart3,
      always: true
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40
        w-64 bg-white/10 backdrop-blur-lg border-r border-white/20
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-sm">Cooperativa</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => `
                      flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200
                      ${isActive
                        ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/20">
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-white/60 text-xs">
                Sistema de Gestión
              </p>
              <p className="text-emerald-200 text-xs font-medium">
                Cooperativa Agrícola
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 rounded-lg transition-all duration-200 border border-red-400/30 hover:border-red-400/50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;