// src/app/components/OrganizationDetailView.tsx

"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  usePlatformOrganization,
  usePlatformOrganizationMembers,
  useAddOrganizationMember,
  useUpdateOrganizationMember,
  useRemoveOrganizationMember,
  useActivateOrganization,
  useArchiveOrganization,
} from "@/hooks/platform/usePlatformOrganizations";
import { usePlatformUsers } from "@/hooks/platform/usePlatformUsers";
import { useAcademicSessions } from "@/hooks/platform/useAcademicSessions";
import {
  Building2,
  Users,
  UserPlus,
  UserMinus,
  Edit2,
  Trash2,
  Plus,
  Search,
  Loader2,
  ArrowLeft,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Flag,
  UserCheck,
  UserX,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/error";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const MEMBERSHIP_TYPES = ["STUDENT", "ADMIN", "STAFF", "ALUMNI", "HONORARY"];
const MEMBERSHIP_STATUSES = [
  "INVITED",
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "LEFT",
  "REMOVED",
];

export default function OrganizationDetailView() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;

  const [activeTab, setActiveTab] = useState<"members" | "admins" | "settings">(
    "members",
  );
  const [search, setSearch] = useState("");
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);

  const {
    data: organization,
    isLoading: orgLoading,
    refetch: refetchOrg,
  } = usePlatformOrganization(organizationId);

  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = usePlatformOrganizationMembers(organizationId, { limit: 100 });

  const { data: usersData } = usePlatformUsers({ limit: 100 });
  const { data: sessionsData } = useAcademicSessions(
    organization?.institutionId,
  );

  const addMemberMutation = useAddOrganizationMember();
  const updateMemberMutation = useUpdateOrganizationMember();
  const removeMemberMutation = useRemoveOrganizationMember();
  const activateMutation = useActivateOrganization();
  const archiveMutation = useArchiveOrganization();

  const [formData, setFormData] = useState({
    userId: "",
    membershipType: "STUDENT",
    status: "ACTIVE",
    isPrimary: false,
    sessionId: "",
  });

  const [adminFormData, setAdminFormData] = useState({
    userId: "",
    role: "ADMIN",
  });

  const members = membersData?.data || [];
  const users = usersData?.data || [];
  const sessions = sessionsData || [];

  const isLoading = orgLoading || membersLoading;

  const filteredMembers = useMemo(() => {
    if (!search) return members;
    const searchLower = search.toLowerCase();
    return members.filter(
      (m: any) =>
        m.user?.username?.toLowerCase().includes(searchLower) ||
        m.user?.email?.toLowerCase().includes(searchLower) ||
        m.user?.profile?.firstName?.toLowerCase().includes(searchLower) ||
        m.user?.profile?.lastName?.toLowerCase().includes(searchLower),
    );
  }, [members, search]);

  const adminMembers = useMemo(() => {
    return members.filter((m: any) => m.membershipType === "ADMIN");
  }, [members]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMemberMutation.mutateAsync({
        organizationId,
        data: formData,
      });
      setIsAddMemberModalOpen(false);
      setFormData({
        userId: "",
        membershipType: "STUDENT",
        status: "ACTIVE",
        isPrimary: false,
        sessionId: "",
      });
      refetchMembers();
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to add member"));
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMemberMutation.mutateAsync({
        organizationId,
        data: {
          userId: adminFormData.userId,
          membershipType: "ADMIN",
          status: "ACTIVE",
          isPrimary: true,
        },
      });
      setIsAddAdminModalOpen(false);
      setAdminFormData({ userId: "", role: "ADMIN" });
      refetchMembers();
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to add admin"));
    }
  };

  const handleRemoveMember = async (membershipId: string, userName: string) => {
    if (
      confirm(
        `Are you sure you want to remove ${userName} from this organization?`,
      )
    ) {
      try {
        await removeMemberMutation.mutateAsync(membershipId);
        refetchMembers();
      } catch (error) {
        alert(getApiErrorMessage(error, "Failed to remove member"));
      }
    }
  };

  const handleUpdateMemberStatus = async (
    membershipId: string,
    status: string,
  ) => {
    try {
      await updateMemberMutation.mutateAsync({
        membershipId,
        data: { status },
      });
      refetchMembers();
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to update member"));
    }
  };

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(organizationId);
      refetchOrg();
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to activate organization"));
    }
  };

  const handleArchive = async () => {
    if (confirm("Are you sure you want to archive this organization?")) {
      try {
        await archiveMutation.mutateAsync(organizationId);
        refetchOrg();
      } catch (error) {
        alert(getApiErrorMessage(error, "Failed to archive organization"));
      }
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const member = row.original;
          const user = member.user;
          const initials =
            user?.profile?.firstName && user?.profile?.lastName
              ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
              : user?.username?.substring(0, 2).toUpperCase() || "U";
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div>
                <div className="font-semibold">
                  {user?.profile?.firstName && user?.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user?.username || "Unknown"}
                </div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorFn: (r) => r.membershipType,
        id: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (r) => r.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const colors: Record<string, string> = {
            ACTIVE: "bg-emerald-50 text-emerald-600",
            PENDING: "bg-amber-50 text-amber-600",
            INVITED: "bg-blue-50 text-blue-600",
            SUSPENDED: "bg-red-50 text-red-600",
            LEFT: "bg-slate-100 text-slate-500",
            REMOVED: "bg-red-100 text-red-700",
          };
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.PENDING}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : "bg-amber-500"}`}
              />
              {status}
            </span>
          );
        },
      },
      {
        accessorFn: (r) => r.session?.name || "N/A",
        id: "session",
        header: "Session",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-600">{getValue()}</span>
        ),
      },
      {
        accessorFn: (r) => new Date(r.joinedAt).toLocaleDateString(),
        id: "joined",
        header: "Joined",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <div className="flex items-center gap-1.5 justify-end">
              {member.status === "ACTIVE" && (
                <button
                  className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                  onClick={() =>
                    handleUpdateMemberStatus(member.id, "SUSPENDED")
                  }
                  title="Suspend Member"
                >
                  <Clock className="w-4 h-4" />
                </button>
              )}
              {member.status === "SUSPENDED" && (
                <button
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                  onClick={() => handleUpdateMemberStatus(member.id, "ACTIVE")}
                  title="Activate Member"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
              )}
              <button
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                onClick={() =>
                  handleRemoveMember(
                    member.id,
                    member.user?.username || "Unknown",
                  )
                }
                title="Remove Member"
              >
                <UserMinus className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const adminColumns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "admin",
        header: "Administrator",
        cell: ({ row }) => {
          const member = row.original;
          const user = member.user;
          const initials =
            user?.profile?.firstName && user?.profile?.lastName
              ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
              : user?.username?.substring(0, 2).toUpperCase() || "A";
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div>
                <div className="font-semibold">
                  {user?.profile?.firstName && user?.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user?.username || "Unknown"}
                </div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
            </div>
          );
        },
      },
      {
        accessorFn: (r) => r.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`}
              />
              {status}
            </span>
          );
        },
      },
      {
        accessorFn: (r) => r.session?.name || "N/A",
        id: "session",
        header: "Session",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-600">{getValue()}</span>
        ),
      },
      {
        accessorFn: (r) => new Date(r.joinedAt).toLocaleDateString(),
        id: "joined",
        header: "Assigned",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const member = row.original;
          return (
            <button
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              onClick={() =>
                handleRemoveMember(
                  member.id,
                  member.user?.username || "Unknown",
                )
              }
              title="Remove Admin"
            >
              <UserMinus className="w-4 h-4" />
            </button>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">
          Organization not found
        </h2>
        <button
          onClick={() => router.back()}
          className="mt-4 btn btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {organization.name}
          </h1>
          <p className="text-sm text-slate-500">
            {organization.type} • {organization.status} • {organization.scope}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={`status-badge ${organization.status.toLowerCase()}`}>
            {organization.status}
          </span>
          {organization.status === "DRAFT" ||
            (organization.status === "PENDING_ACTIVATION" && (
              <button
                className="btn btn-success"
                onClick={handleActivate}
                disabled={activateMutation.isPending}
              >
                <CheckCircle className="w-4 h-4" />
                {activateMutation.isPending ? "Activating..." : "Activate"}
              </button>
            ))}
          {organization.status === "ACTIVE" && (
            <button
              className="btn btn-secondary"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
            >
              <Archive className="w-4 h-4" />
              {archiveMutation.isPending ? "Archiving..." : "Archive"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Total Members</div>
            <div className="text-2xl font-bold text-slate-900">
              {members.length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Active Members</div>
            <div className="text-2xl font-bold text-emerald-600">
              {members.filter((m: any) => m.status === "ACTIVE").length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Admins</div>
            <div className="text-2xl font-bold text-purple-600">
              {adminMembers.length}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Session</div>
            <div className="text-2xl font-bold text-blue-600">
              {organization.academicSession?.name || "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {["members", "admins", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "members" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              <UserPlus className="w-4 h-4" /> Add Member
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p>No members found</p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredMembers} />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "admins" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-slate-500">
                Administrators with full access to this organization
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setIsAddAdminModalOpen(true)}
            >
              <Shield className="w-4 h-4" /> Assign Admin
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {adminMembers.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Shield className="w-8 h-8 mx-auto mb-2" />
                  <p>No admins assigned</p>
                </div>
              ) : (
                <DataTable columns={adminColumns} data={adminMembers} />
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Organization Settings</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Organization ID</div>
                  <div className="font-mono text-sm">{organization.id}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Slug</div>
                  <div className="font-mono text-sm">{organization.slug}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Type</div>
                  <div>{organization.type}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Scope</div>
                  <div>{organization.scope}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Academic Session</div>
                  <div className="font-medium">
                    {organization.academicSession?.name ||
                      "No session assigned"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Created</div>
                  <div>
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Status</div>
                  <span
                    className={`status-badge ${organization.status.toLowerCase()}`}
                  >
                    {organization.status}
                  </span>
                </div>
              </div>
              {organization.description && (
                <div>
                  <div className="text-sm text-slate-500">Description</div>
                  <p className="mt-1 text-sm">{organization.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsAddMemberModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Member to Organization</h2>
              <button
                className="close-btn"
                onClick={() => setIsAddMemberModalOpen(false)}
              >
                <span className="sr-only">Close</span>
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label className="form-label">User *</label>
                <select
                  className="form-select"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.profile?.firstName && user.profile?.lastName
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user.username}{" "}
                      ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Membership Type *</label>
                <select
                  className="form-select"
                  value={formData.membershipType}
                  onChange={(e) =>
                    setFormData({ ...formData, membershipType: e.target.value })
                  }
                  required
                >
                  {MEMBERSHIP_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  {MEMBERSHIP_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Academic Session</label>
                <select
                  className="form-select"
                  value={formData.sessionId}
                  onChange={(e) =>
                    setFormData({ ...formData, sessionId: e.target.value })
                  }
                >
                  <option value="">Use Organization's Session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.name} {session.isCurrent ? "(Current)" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Leave empty to use the organization's default session
                </p>
              </div>

              <div className="form-group flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrimary: e.target.checked })
                  }
                />
                <label
                  htmlFor="isPrimary"
                  className="text-sm font-medium text-slate-700"
                >
                  Set as Primary Membership
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddMemberModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {isAddAdminModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsAddAdminModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Administrator</h2>
              <button
                className="close-btn"
                onClick={() => setIsAddAdminModalOpen(false)}
              >
                <span className="sr-only">Close</span>
              </button>
            </div>
            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label className="form-label">User *</label>
                <select
                  className="form-select"
                  value={adminFormData.userId}
                  onChange={(e) =>
                    setAdminFormData({
                      ...adminFormData,
                      userId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.profile?.firstName && user.profile?.lastName
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user.username}{" "}
                      ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={adminFormData.role}
                  onChange={(e) =>
                    setAdminFormData({ ...adminFormData, role: e.target.value })
                  }
                >
                  <option value="ADMIN">Organization Admin</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddAdminModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addMemberMutation.isPending}
                >
                  {addMemberMutation.isPending
                    ? "Assigning..."
                    : "Assign Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
