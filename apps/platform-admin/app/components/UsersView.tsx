"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformUsers,
  useUpdateUserStatus,
  useDeleteUser,
} from "@/hooks/platform/usePlatformUsers";
import {
  Users,
  Search,
  Eye,
  Edit2,
  Trash2,
  Loader2,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function UsersView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { data, isLoading, refetch } = usePlatformUsers({
    page: currentPage,
    limit: 10,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();

  const users = data?.data || [];
  const meta = data?.meta;

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    if (
      confirm(
        `Are you sure you want to ${newStatus === "ACTIVE" ? "activate" : "suspend"} this user?`,
      )
    ) {
      try {
        await updateStatusMutation.mutateAsync({
          id,
          data: { status: newStatus },
        });
        refetch();
      } catch (error) {
        console.error("Failed to update user status:", error);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteUserMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleViewDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-600",
      INACTIVE: "bg-slate-100 text-slate-500",
      SUSPENDED: "bg-red-50 text-red-600",
      DELETED: "bg-red-100 text-red-700",
    };
    return colors[status] || colors.INACTIVE;
  };

  // Define columns with useMemo - MUST be called before any conditional returns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original;
          const initials =
            user.profile?.firstName && user.profile?.lastName
              ? `${user.profile.firstName[0]}${user.profile.lastName[0]}`.toUpperCase()
              : user.username?.substring(0, 2).toUpperCase() || "U";
          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div>
                <div className="font-semibold">
                  {user.profile?.firstName && user.profile?.lastName
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username}
                </div>
                {user.profile?.firstName && (
                  <div className="text-xs text-slate-400">@{user.username}</div>
                )}
              </div>
            </div>
          );
        },
      },
      { accessorKey: "email", header: "Email" },
      {
        accessorFn: (row) => `@${row.username}`,
        id: "username",
        header: "Username",
      },
      {
        accessorFn: (row) => row.studentProfile?.institutionId || "N/A",
        id: "institution",
        header: "Institution",
      },
      {
        accessorFn: (row) => new Date(row.createdAt).toLocaleDateString(),
        id: "joined",
        header: "Joined",
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(getValue() as string)}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${getValue() === "ACTIVE" ? "bg-emerald-500" : getValue() === "SUSPENDED" ? "bg-red-500" : "bg-slate-400"}`}
            />
            {getValue()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div style={{ textAlign: "right" }}>
            <div className="flex items-center justify-end gap-1.5">
              <button
                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                onClick={() => handleViewDetails(row.original)}
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                onClick={() =>
                  handleStatusUpdate(row.original.id, row.original.status)
                }
                title={
                  row.original.status === "ACTIVE"
                    ? "Suspend User"
                    : "Activate User"
                }
              >
                {row.original.status === "ACTIVE" ? (
                  <UserX className="w-4 h-4" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </button>
              <button
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                onClick={() =>
                  handleDelete(row.original.id, row.original.username)
                }
                title="Delete User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Loading state AFTER all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#1a5cff]" />
            Users Directory
          </h1>
          <p>
            Route: <code>/platform/users</code> • Manage all platform users
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="DELETED">Deleted</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {meta?.total || 0} Users
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {users.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No users found.
          </div>
        ) : (
          <DataTable columns={columns} data={users} />
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && isDetailModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Profile</h2>
              <button
                className="close-btn"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold">
                  {selectedUser.profile?.firstName &&
                  selectedUser.profile?.lastName
                    ? `${selectedUser.profile.firstName[0]}${selectedUser.profile.lastName[0]}`.toUpperCase()
                    : selectedUser.username?.substring(0, 2).toUpperCase() ||
                      "U"}
                </div>
                <div>
                  <div className="text-lg font-bold">
                    {selectedUser.profile?.firstName &&
                    selectedUser.profile?.lastName
                      ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                      : selectedUser.username}
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedUser.email}
                  </div>
                  <div className="text-sm text-slate-500">
                    @{selectedUser.username}
                  </div>
                </div>
                <div className="ml-auto">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${selectedUser.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-400"}`}
                    />
                    {selectedUser.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Email Verified</div>
                  <div className="font-semibold">
                    {selectedUser.emailVerified ? "Yes" : "No"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Last Login</div>
                  <div className="font-semibold">
                    {selectedUser.lastLoginAt
                      ? new Date(selectedUser.lastLoginAt).toLocaleString()
                      : "Never"}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Joined</div>
                  <div className="font-semibold">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Onboarding</div>
                  <div className="font-semibold">
                    {selectedUser.profile?.onboardingCompleted
                      ? "Completed"
                      : "In Progress"}
                  </div>
                </div>
              </div>

              {selectedUser.studentProfile && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Student Profile
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-600">Matric Number:</span>
                      <span className="ml-2 font-medium">
                        {selectedUser.studentProfile.matricNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Academic Status:</span>
                      <span className="ml-2 font-medium">
                        {selectedUser.studentProfile.academicStatus}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Institution:</span>
                      <span className="ml-2 font-medium">
                        {selectedUser.studentProfile.institutionId}
                      </span>
                    </div>
                    <div>
                      <span className="text-blue-600">Department:</span>
                      <span className="ml-2 font-medium">
                        {selectedUser.studentProfile.departmentId}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, meta.total)} of {meta.total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === meta.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
