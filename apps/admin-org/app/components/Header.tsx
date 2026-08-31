'use client';

import { useState } from 'react';
import { Menu, Bell, ChevronDown, User as UserIcon, LogOut, Settings as SettingsIcon, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdminLogout } from '@/hooks/admin/useAdminAuth';
import { OrganizationSwitcher } from './OrganizationSwitcher';
import { useAdminContext } from './AdminContext';

interface HeaderProps {
  pageTitle: string;
  pageSubtitle?: string;
  onMenuToggle: () => void;
}

export function Header({ pageTitle, pageSubtitle, onMenuToggle }: HeaderProps) {
  const logoutMutation = useAdminLogout();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, scopes, selectedScopeId, switchOrganization, isLoading } = useAdminContext();

  const getInitials = () => {
    if (!user?.profile) return 'A';
    const firstName = user.profile.firstName || '';
    const lastName = user.profile.lastName || '';
    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'A';
  };

  const getDisplayName = () => {
    if (!user?.profile) return 'Admin';
    const firstName = user.profile.firstName || '';
    const lastName = user.profile.lastName || '';
    return `${firstName} ${lastName}`.trim() || user.username || 'Admin';
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <header
      className="sticky top-0 z-40 min-h-[64px] bg-white border-b flex items-center justify-between px-3 sm:px-6 py-2"
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Left Column: Menu Button & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
        <button
          className="lg:hidden p-1.5 rounded-lg border-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-base cursor-pointer flex-shrink-0"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight truncate leading-snug text-slate-900">
            {pageTitle}
          </h1>
          {pageSubtitle && (
            <p className="text-[11px] sm:text-xs md:text-[13px] truncate leading-none mt-0.5 text-slate-500">
              {pageSubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: Organization Switcher */}
      <div className="hidden lg:flex items-center">
        <OrganizationSwitcher
          scopes={scopes}
          selectedScopeId={selectedScopeId || undefined}
          onSelect={switchOrganization}
          isLoading={isLoading}
        />
      </div>

      {/* Right Column: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Organization Switcher (Mobile) */}
        <div className="lg:hidden">
          <OrganizationSwitcher
            scopes={scopes}
            selectedScopeId={selectedScopeId || undefined}
            onSelect={switchOrganization}
            isLoading={isLoading}
          />
        </div>

        {/* Notifications */}
        <button
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-none bg-transparent flex items-center justify-center text-sm sm:text-base cursor-pointer relative transition-all duration-200 hover:bg-slate-100 flex-shrink-0 text-slate-500"
          onClick={() => alert('Notifications panel would open here')}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white" style={{ background: 'var(--color-destructive)' }} />
        </button>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen((v) => !v)}
            className="flex items-center gap-2 py-1 pl-1 pr-2 rounded-lg border-none hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
              style={{ background: 'var(--color-primary)' }}
            >
              {getInitials()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {getDisplayName()}
              </div>
              <div className="text-[10px] text-slate-400">Administrator</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border p-1.5 z-20 animate-fade-in" style={{ borderColor: 'var(--color-border)' }}>
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <div className="text-sm font-bold text-slate-900">{getDisplayName()}</div>
                  <div className="text-xs text-slate-500">{user?.email || 'admin@heightt.com'}</div>
                </div>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    // Navigate to settings
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors border-none cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    // Show help
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors border-none cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help & Support</span>
                </button>

                <div className="border-t my-1" style={{ borderColor: 'var(--color-border)' }} />

                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors border-none cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{logoutMutation.isPending ? 'Logging out...' : 'Logout'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}