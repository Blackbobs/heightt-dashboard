"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function AnnouncementsView() {
  const {
    announcements,
    createAnnouncement,
    toggleAnnouncementPublish,
    deleteAnnouncement,
    hasPermission,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("All Organizations & Students");
  const [isDraft, setIsDraft] = useState(false);

  const canManage = hasPermission("ANNOUNCEMENT_MANAGE");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    createAnnouncement({
      title,
      content,
      author: "Platform Admin",
      audience,
      status: isDraft ? "Draft" : "Published",
    });

    setTitle("");
    setContent("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Platform Announcements</h1>
          <p>Route: <code>/platform/announcements</code> • Broadcast messages across all Heightt institutions & organizations</p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            disabled={!canManage}
            onClick={() => setIsModalOpen(true)}
            title={canManage ? "Create Announcement" : "Permission Required: ANNOUNCEMENT_MANAGE"}
          >
            <i className="fas fa-plus"></i> Create Announcement
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: "16px" }}>
        {announcements.length === 0 ? (
          <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            No platform announcements published yet.
          </div>
        ) : (
          announcements.map((anc) => (
            <div className="card" key={anc.id} style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{anc.title}</h3>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                    By {anc.author} • Target Audience: <span className="badge primary">{anc.audience}</span> • {anc.createdAt}
                  </div>
                </div>
                <span className={`status-badge ${anc.status.toLowerCase()}`}>{anc.status}</span>
              </div>

              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "16px" }}>
                {anc.content}
              </p>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  className={`btn btn-sm ${anc.status === "Published" ? "btn-secondary" : "btn-success"}`}
                  disabled={!canManage}
                  onClick={() => toggleAnnouncementPublish(anc.id)}
                >
                  <i className={`fas ${anc.status === "Published" ? "fa-eye-slash" : "fa-paper-plane"}`}></i>
                  {anc.status === "Published" ? "Unpublish to Draft" : "Publish Now"}
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={!canManage}
                  onClick={() => deleteAnnouncement(anc.id)}
                >
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE ANNOUNCEMENT MODAL */}
      <div
        className={`modal-overlay ${isModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Broadcast Platform Announcement</h2>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Announcement Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Dues Payment Gateway Scheduled Maintenance"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Audience Scope</label>
              <select className="form-select" value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="All Organizations & Students">All Organizations & Students</option>
                <option value="Platform Administrators">Platform Administrators Only</option>
                <option value="Institution Deans & HODs">Institution Deans & HODs Only</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Content Body</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Write announcement details..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="draftCheck"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
              />
              <label htmlFor="draftCheck" style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                Save as Draft (Do not publish immediately)
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-bullhorn"></i> Broadcast Announcement
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
