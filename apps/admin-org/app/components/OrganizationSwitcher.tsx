"use client";

import { useState, useRef, useEffect } from "react";
import {
  Building2,
  ChevronDown,
  Check,
  Crown,
  Users,
  School,
  Building,
  Layers,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminScope } from "@/lib/api/admin";

interface OrganizationSwitcherProps {
  scopes: AdminScope[];
  selectedScopeId?: string;
  onSelect: (scopeId: string) => void;
  isLoading?: boolean;
}

const ADMIN_TYPE_ICONS: Record<string, React.ReactNode> = {
  PLATFORM_ADMIN: <Crown className="w-4 h-4 text-purple-600" />,
  INSTITUTION_ADMIN: <School className="w-4 h-4 text-blue-600" />,
  FACULTY_ADMIN: <Building className="w-4 h-4 text-emerald-600" />,
  DEPARTMENT_ADMIN: <Layers className="w-4 h-4 text-amber-600" />,
  ORGANIZATION_ADMIN: <Users className="w-4 h-4 text-[#1a5cff]" />,
  CLUB_ADMIN: <Users className="w-4 h-4 text-pink-600" />,
};

const ADMIN_TYPE_LABELS: Record<string, string> = {
  PLATFORM_ADMIN: "Platform Admin",
  INSTITUTION_ADMIN: "Institution Admin",
  FACULTY_ADMIN: "Faculty Admin",
  DEPARTMENT_ADMIN: "Department Admin",
  ORGANIZATION_ADMIN: "Organization Admin",
  CLUB_ADMIN: "Club Admin",
};

export function OrganizationSwitcher({
  scopes,
  selectedScopeId,
  onSelect,
  isLoading = false,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedScope = scopes.find((s) => s.id === selectedScopeId);
  const selectedOrg = selectedScope?.organization;
  const selectedAdminType = selectedScope?.adminType || "ORGANIZATION_ADMIN";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Loader2 className="w-4 h-4 text-[#1a5cff] animate-spin" />
        <span className="text-xs text-slate-500">Loading...</span>
      </div>
    );
  }

  if (!scopes || scopes.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
        <Building2 className="w-4 h-4" />
        <span>No organizations</span>
      </div>
    );
  }

  // If only one scope, show it without dropdown
  if (scopes.length === 1) {
    const singleScope = scopes[0];
    const Icon =
      ADMIN_TYPE_ICONS[singleScope.adminType] ||
      ADMIN_TYPE_ICONS.ORGANIZATION_ADMIN;
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        {Icon}
        <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
          {singleScope.organization?.name || "Unknown Organization"}
        </span>
        <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {ADMIN_TYPE_LABELS[singleScope.adminType] || "Admin"}
        </span>
      </div>
    );
  }

  const getScopeDisplayName = (scope: AdminScope) => {
    if (scope.organization?.name) return scope.organization.name;
    if (scope.institution?.name) return scope.institution.name;
    if (scope.faculty?.name) return `${scope.faculty.name} (Faculty)`;
    if (scope.department?.name) return `${scope.department.name} (Dept)`;
    return "Unknown Organization";
  };

  const getScopeTypeLabel = (scope: AdminScope) => {
    return ADMIN_TYPE_LABELS[scope.adminType] || "Admin";
  };

  const getScopeIcon = (scope: AdminScope) => {
    return (
      ADMIN_TYPE_ICONS[scope.adminType] || ADMIN_TYPE_ICONS.ORGANIZATION_ADMIN
    );
  };

  const selectedDisplayName = selectedOrg?.name || "Select Organization";
  const selectedTypeLabel = ADMIN_TYPE_LABELS[selectedAdminType] || "Admin";
  const SelectedIcon = getScopeIcon(selectedScope || scopes[0]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1a5cff]/20"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="flex items-center gap-2 min-w-0">
          {SelectedIcon}
          <span className="text-sm font-medium text-slate-700 truncate max-w-[180px]">
            {selectedDisplayName}
          </span>
        </span>
        <span className="hidden sm:inline text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {selectedTypeLabel}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform flex-shrink-0",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-72 bg-white border rounded-xl shadow-xl z-50 py-1.5 overflow-hidden animate-fade-in"
          style={{ borderColor: "var(--color-border)" }}
          role="listbox"
        >
          <div
            className="px-4 py-2 border-b bg-slate-50/50"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Switch Organization
            </p>
          </div>

          {scopes.map((scope) => {
            const isSelected = scope.id === selectedScopeId;
            const displayName = getScopeDisplayName(scope);
            const typeLabel = getScopeTypeLabel(scope);
            const Icon = getScopeIcon(scope);

            return (
              <button
                key={scope.id}
                onClick={() => {
                  onSelect(scope.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors border-none cursor-pointer",
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-slate-50 text-slate-700",
                )}
                role="option"
                aria-selected={isSelected}
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 flex-shrink-0">
                  {Icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{displayName}</div>
                  <div className="text-[10px] text-slate-400">{typeLabel}</div>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
