import { useState, useEffect, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Users,
  Video,
  Plus,
  Mail,
  Globe,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  X,
  Phone,
  FileText,
  AlertCircle,
  Calendar,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardLayout } from "../components/dashboard/DashboardLayout";

export const Route = createFileRoute("/contacts")({
  head: () => ({
    meta: [
      { title: "Contacts — LinguaLive AI" },
      { name: "description", content: "Manage contacts and their preferred listening languages." },
    ],
  }),
  component: ContactsPage,
});

const LANGUAGE_OPTIONS = [
  "English",
  "Telugu",
  "Hindi",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Bengali",
  "Marathi",
  "German",
  "French",
  "Spanish",
  "Japanese",
  "Arabic",
];

const API_BASE_URL = "http://localhost:5000/api";

function formatDate(isoStr) {
  if (!isoStr) return "Never";
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ContactsPage() {
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null); // null = Add, object = Edit

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingContact, setDeletingContact] = useState(null);

  const [activeMenuId, setActiveMenuId] = useState(null);

  // Add/Edit Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formLanguage, setFormLanguage] = useState("English");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formApiError, setFormApiError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  // Close active dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchContacts = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/contacts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setContacts(data.contacts || []);
      } else {
        setFetchError(data.message || "Failed to load contacts.");
      }
    } catch (err) {
      console.error("Fetch contacts error:", err);
      setFetchError("Unable to connect to server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.toLowerCase().trim();
    return contacts.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.preferredLanguage && c.preferredLanguage.toLowerCase().includes(q))
    );
  }, [contacts, searchQuery]);

  // Open Modal Helpers
  const openAddModal = () => {
    setEditingContact(null);
    setFormName("");
    setFormEmail("");
    setFormLanguage("English");
    setFormPhone("");
    setFormNotes("");
    setFormErrors({});
    setFormApiError(null);
    setIsAddEditOpen(true);
  };

  const openEditModal = (contact) => {
    setEditingContact(contact);
    setFormName(contact.name || "");
    setFormEmail(contact.email || "");
    setFormLanguage(contact.preferredLanguage || contact.preferredListeningLanguage || "English");
    setFormPhone(contact.phone || "");
    setFormNotes(contact.notes || "");
    setFormErrors({});
    setFormApiError(null);
    setIsAddEditOpen(true);
  };

  const openViewModal = (contact) => {
    setViewingContact(contact);
    setIsViewOpen(true);
  };

  const openDeleteModal = (contact) => {
    setDeletingContact(contact);
    setIsDeleteOpen(true);
  };

  // Validate Add/Edit Form
  const validateForm = () => {
    const errs = {};
    if (!formName.trim()) {
      errs.name = "Full name is required";
    }

    if (!formEmail.trim()) {
      errs.email = "Email address is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formEmail.trim())) {
      errs.email = "Please enter a valid email address";
    }

    if (!formLanguage) {
      errs.language = "Preferred language is required";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Add or Edit Contact Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormApiError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const isEditing = Boolean(editingContact);
      const url = isEditing
        ? `${API_BASE_URL}/contacts/${editingContact.id}`
        : `${API_BASE_URL}/contacts`;
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        name: formName.trim(),
        email: formEmail.toLowerCase().trim(),
        preferredLanguage: formLanguage,
        phone: formPhone.trim(),
        notes: formNotes.trim(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAddEditOpen(false);
        if (isEditing) {
          toast.success("Contact updated successfully.");
          setContacts((prev) =>
            prev.map((c) => (c.id === editingContact.id ? data.contact : c))
          );
        } else {
          toast.success("Contact added successfully.");
          setContacts((prev) => [data.contact, ...prev]);
        }
      } else {
        const msg = data.message || (isEditing ? "Unable to update contact." : "Unable to add contact.");
        setFormApiError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("Save contact error:", err);
      const msg = "Network error. Please try again.";
      setFormApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Contact
  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${deletingContact.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsDeleteOpen(false);
        setContacts((prev) => prev.filter((c) => c.id !== deletingContact.id));
        toast.success("Contact deleted successfully.");
      } else {
        toast.error(data.message || "Unable to delete contact.");
      }
    } catch (err) {
      console.error("Delete contact error:", err);
      toast.error("Unable to delete contact.");
    } finally {
      setIsSubmitting(false);
      setDeletingContact(null);
    }
  };

  // Start Real Meeting with Contact
  const handleStartMeeting = async (contact) => {
    try {
      const res = await fetch(`${API_BASE_URL}/meetings/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: `Meeting with ${contact.name}`,
          description: `Multilingual meeting with ${contact.name} (${contact.preferredLanguage})`,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.meeting) {
        const meetingId = data.meeting.meetingId;

        // Update contact lastMeetingAt date
        fetch(`${API_BASE_URL}/contacts/${contact.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lastMeetingAt: new Date().toISOString() }),
        }).catch(() => {});

        toast.success(`Meeting created for ${contact.name}`);
        navigate({ to: "/room", search: { id: meetingId } });
      } else {
        toast.error("Unable to start meeting. Please try again.");
      }
    } catch (err) {
      console.error("Start meeting error:", err);
      toast.error("Error creating meeting.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 md:p-10 space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Users className="text-blue-600" size={32} />
              Contacts
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your contacts and starting translated meetings in their preferred language.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search contacts by name, email, or language..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 shadow-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Error State */}
        {fetchError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span className="font-medium">{fetchError}</span>
            </div>
            <button
              onClick={fetchContacts}
              className="rounded-xl border border-red-300 bg-white px-3 py-1.5 font-bold text-red-700 hover:bg-red-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Contacts Table / Content */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          {isLoading ? (
            /* Loading Skeleton */
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-200" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 rounded-md bg-slate-200" />
                      <div className="h-3 w-44 rounded-md bg-slate-100" />
                    </div>
                  </div>
                  <div className="h-6 w-24 rounded-full bg-slate-200" />
                  <div className="h-8 w-28 rounded-xl bg-slate-200" />
                </div>
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 mb-4 shadow-inner">
                <Users size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? "No matching contacts found" : "No contacts yet"}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm">
                {searchQuery
                  ? `No contacts matched "${searchQuery}". Try a different search term.`
                  : "Add your first contact to quickly start multilingual meetings in their preferred language."}
              </p>
              {!searchQuery && (
                <button
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  Add Contact
                </button>
              )}
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Preferred Language</th>
                    <th className="px-6 py-4">Last Meeting</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs shrink-0 shadow-xs">
                            {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{c.name}</span>
                            {c.phone && <span className="text-[11px] text-slate-400 font-mono">{c.phone}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-slate-600">
                          <Mail size={13} className="text-slate-400" />
                          {c.email}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100">
                          <Globe size={13} className="text-blue-500" />
                          {c.preferredLanguage}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500">{formatDate(c.lastMeetingAt)}</td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStartMeeting(c)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-all cursor-pointer"
                            title="Start Meeting"
                          >
                            <Video size={13} />
                            Start Meeting
                          </button>

                          {/* Action Dropdown Menu */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === c.id ? null : c.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                              aria-label="Actions"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {activeMenuId === c.id && (
                              <div className="absolute right-0 top-9 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    openViewModal(c);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Eye size={14} className="text-slate-400" />
                                  View Contact
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    openEditModal(c);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                >
                                  <Pencil size={14} className="text-slate-400" />
                                  Edit Contact
                                </button>

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    handleStartMeeting(c);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Video size={14} className="text-blue-500" />
                                  Start Meeting
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    openDeleteModal(c);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={14} className="text-red-500" />
                                  Delete Contact
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================================================== */}
      {/* 1. ADD / EDIT CONTACT MODAL                        */}
      {/* ================================================== */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsAddEditOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100 my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {editingContact ? "Edit Contact" : "Add New Contact"}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                  Add someone you frequently meet with. Their preferred language will be used when starting translated meetings.
                </p>
              </div>

              <button
                onClick={() => setIsAddEditOpen(false)}
                disabled={isSubmitting}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {formApiError && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle size={16} className="text-red-500 shrink-0" />
                <span>{formApiError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: null }));
                  }}
                  className={`w-full rounded-xl border bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. ramesh@gmail.com"
                  value={formEmail}
                  onChange={(e) => {
                    setFormEmail(e.target.value);
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: null }));
                  }}
                  className={`w-full rounded-xl border bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 ${
                    formErrors.email
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-[11px] font-semibold text-red-500">{formErrors.email}</p>
                )}
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Preferred Language <span className="text-red-500">*</span>
                </label>
                <select
                  value={formLanguage}
                  onChange={(e) => setFormLanguage(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Add optional details e.g. Product Manager at TechCorp"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center gap-2"
                >
                  {isSubmitting && (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  )}
                  {editingContact ? "Save Changes" : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 2. VIEW CONTACT MODAL                              */}
      {/* ================================================== */}
      {isViewOpen && viewingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsViewOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold text-lg shadow-md shadow-blue-500/20">
                  {viewingContact.name ? viewingContact.name.charAt(0).toUpperCase() : "C"}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">{viewingContact.name}</h3>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-100 mt-0.5">
                    <Globe size={11} className="text-blue-500" />
                    {viewingContact.preferredLanguage}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsViewOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-5 space-y-3.5 text-xs">
              <div className="flex items-center gap-3 text-slate-700">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Email Address</span>
                  <span className="font-semibold text-slate-900">{viewingContact.email}</span>
                </div>
              </div>

              {viewingContact.phone && (
                <div className="flex items-center gap-3 text-slate-700">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone Number</span>
                    <span className="font-semibold text-slate-900">{viewingContact.phone}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 text-slate-700">
                <Calendar size={16} className="text-slate-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Meeting</span>
                  <span className="font-semibold text-slate-900">{formatDate(viewingContact.lastMeetingAt)}</span>
                </div>
              </div>

              {viewingContact.notes && (
                <div className="flex items-start gap-3 text-slate-700 pt-1">
                  <FileText size={16} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Notes</span>
                    <p className="font-medium text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-1">
                      {viewingContact.notes}
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 flex items-center gap-2 text-blue-700 text-[11px]">
                <Sparkles size={14} className="shrink-0" />
                <span>Calls with {viewingContact.name} will auto-translate into {viewingContact.preferredLanguage}.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsViewOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsViewOpen(false);
                  handleStartMeeting(viewingContact);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Video size={14} />
                Start Meeting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 3. DELETE CONFIRMATION MODAL                       */}
      {/* ================================================== */}
      {isDeleteOpen && deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => !isSubmitting && setIsDeleteOpen(false)}
          />

          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl z-10 border border-slate-100 my-auto text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-red-50 text-red-600 mx-auto mb-4">
              <Trash2 size={26} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900">Delete Contact?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{deletingContact.name}</strong> from your contacts? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
                className="w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="w-1/2 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/20 hover:bg-red-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  "Delete Contact"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

