import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader, TableSkeleton } from '../../components/ui/Loader';
import { getStats, getUsers, updateUserRole, getAuditLogs, getAdminEvents } from '../../services/admin';
import { createEvent, updateEvent, deleteEvent } from '../../services/events';
import {
  getSubmissions,
  updateSubmissionStatus,
  getContactMessages,
  updateContactMessageStatus,
} from '../../services/forms';
import {
  getAdminPayments,
  updateMembershipPlan,
  getMembershipPlans,
} from '../../services/payments';
import {
  getArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getPageBySlug,
  updatePageBlock,
  uploadMedia,
  getMediaAssets,
  deleteMediaAsset,
} from '../../services/cms';

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'EDITOR', 'EVENT_MANAGER'];

function formatToDatetimeLocal(isoStr) {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active Tab State: 'overview' | 'users' | 'logs' | 'content' | 'events' | 'education' | 'memberships' | 'submissions' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Users State
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Logs State
  const [logsList, setLogsList] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Events State
  const [adminEventsList, setAdminEventsList] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null); // null = creating

  // Form Fields State
  const [eventTitle, setEventTitle] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState('CONFERENCE');
  const [eventStatus, setEventStatus] = useState('DRAFT');
  const [eventStartDate, setEventStartDate] = useState('');
  const [eventEndDate, setEventEndDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventOnline, setEventOnline] = useState(false);
  const [eventPriceMember, setEventPriceMember] = useState(0);
  const [eventPriceNonMember, setEventPriceNonMember] = useState(0);
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');

  // Form Submissions State
  const [submissionsList, setSubmissionsList] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsSubTab, setSubmissionsSubTab] = useState('applications'); // 'applications' | 'contacts'
  const [contactMessagesList, setContactMessagesList] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  // Memberships & Payments State
  const [paymentsList, setPaymentsList] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [plansList, setPlansList] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editPlanPrice, setEditPlanPrice] = useState('');
  const [editPlanDesc, setEditPlanDesc] = useState('');

  // CMS State
  const [articlesList, setArticlesList] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [cmsSubTab, setCmsSubTab] = useState('articles'); // 'articles' | 'pages' | 'media'
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleExcerpt, setArticleExcerpt] = useState('');
  const [articleBody, setArticleBody] = useState('');
  const [articleFeaturedImage, setArticleFeaturedImage] = useState('');
  const [articleStatus, setArticleStatus] = useState('DRAFT');
  const [articleMetaTitle, setArticleMetaTitle] = useState('');
  const [articleMetaDesc, setArticleMetaDesc] = useState('');

  const [editingPageSlug, setEditingPageSlug] = useState('legal-disclaimer');
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [editingPageBody, setEditingPageBody] = useState('');
  const [editingPageStatus, setEditingPageStatus] = useState('PUBLISHED');
  const [editingPageMetaTitle, setEditingPageMetaTitle] = useState('');
  const [editingPageMetaDesc, setEditingPageMetaDesc] = useState('');

  const [mediaList, setMediaList] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(false);

  // Global Action Messages
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const hasFullAccess = ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  // Authorization Guard
  useEffect(() => {
    if (!authLoading) {
      if (!user || !ADMIN_ROLES.includes(user.role)) {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  // Load Initial Tab Data
  useEffect(() => {
    if (user && ADMIN_ROLES.includes(user.role)) {
      if (activeTab === 'overview') {
        fetchStats();
      } else if (activeTab === 'users' && hasFullAccess) {
        fetchUsers();
      } else if (activeTab === 'logs' && hasFullAccess) {
        fetchLogs();
      } else if (activeTab === 'events') {
        fetchAdminEvents();
      } else if (activeTab === 'submissions') {
        if (submissionsSubTab === 'applications') {
          fetchSubmissions();
        } else {
          fetchContacts();
        }
      } else if (activeTab === 'memberships') {
        fetchPayments();
        fetchPlans();
      } else if (activeTab === 'content') {
        if (cmsSubTab === 'articles') {
          fetchArticles();
        } else if (cmsSubTab === 'pages') {
          fetchPageBlock(editingPageSlug);
        } else if (cmsSubTab === 'media') {
          fetchMedia();
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, activeTab, roleFilter, submissionsSubTab, cmsSubTab, editingPageSlug]);

  const fetchStats = async () => {
    if (!hasFullAccess) {
      setStatsLoading(false);
      return;
    }
    setStatsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getStats();
      setStats(data.stats);
    } catch (err) {
      setErrorMsg('Failed to load dashboard metrics.');
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setErrorMsg(null);
    try {
      const params = {
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
        ...(roleFilter && { role: roleFilter }),
      };
      const data = await getUsers(params);
      setUsersList(data.users);
    } catch (err) {
      setErrorMsg('Failed to fetch user list.');
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getAuditLogs();
      setLogsList(data.auditLogs);
    } catch (err) {
      setErrorMsg('Failed to retrieve system audit logs.');
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchAdminEvents = async () => {
    setEventsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getAdminEvents();
      setAdminEventsList(data.events);
    } catch (err) {
      setErrorMsg('Failed to load events.');
      console.error(err);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    setSubmissionsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getSubmissions();
      setSubmissionsList(data.submissions);
    } catch (err) {
      setErrorMsg('Failed to load form submissions.');
      console.error(err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const fetchContacts = async () => {
    setContactsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getContactMessages();
      setContactMessagesList(data.messages);
    } catch (err) {
      setErrorMsg('Failed to load support inquiries.');
      console.error(err);
    } finally {
      setContactsLoading(false);
    }
  };

  const handleSubmissionStatusChange = async (id, status) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateSubmissionStatus(id, status);
      setSuccessMsg('Form submission status updated successfully.');
      fetchSubmissions();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update submission status.');
    }
  };

  const handleContactStatusChange = async (id, status) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateContactMessageStatus(id, status);
      setSuccessMsg('Message status updated successfully.');
      fetchContacts();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update message status.');
    }
  };

  const fetchPayments = async () => {
    setPaymentsLoading(true);
    setErrorMsg(null);
    try {
      const data = await getAdminPayments();
      setPaymentsList(data.payments);
    } catch (err) {
      setErrorMsg('Failed to load transaction ledgers.');
      console.error(err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    setErrorMsg(null);
    try {
      const data = await getMembershipPlans();
      setPlansList(data.plans);
    } catch (err) {
      setErrorMsg('Failed to load membership plans.');
      console.error(err);
    } finally {
      setPlansLoading(false);
    }
  };

  const handleUpdatePlanSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateMembershipPlan(editingPlan.id, editPlanPrice, editPlanDesc);
      setSuccessMsg(`Membership plan ${editingPlan.name} updated successfully.`);
      setIsPlanModalOpen(false);
      fetchPlans();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update plan properties.');
    }
  };

  const openPlanEdit = (plan) => {
    setEditingPlan(plan);
    setEditPlanPrice(plan.price);
    setEditPlanDesc(plan.description);
    setIsPlanModalOpen(true);
  };

  // CMS Article Operations
  const fetchArticles = async () => {
    setArticlesLoading(true);
    setErrorMsg(null);
    try {
      const data = await getArticles();
      setArticlesList(data.articles);
    } catch (err) {
      setErrorMsg('Failed to load news articles catalog.');
      console.error(err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const openArticleCreate = () => {
    setEditingArticle(null);
    setArticleTitle('');
    setArticleExcerpt('');
    setArticleBody('');
    setArticleFeaturedImage('');
    setArticleStatus('DRAFT');
    setArticleMetaTitle('');
    setArticleMetaDesc('');
    setIsArticleModalOpen(true);
  };

  const openArticleEdit = (art) => {
    setEditingArticle(art);
    setArticleTitle(art.title);
    setArticleExcerpt(art.excerpt || '');
    setArticleBody(art.body);
    setArticleFeaturedImage(art.featuredImage || '');
    setArticleStatus(art.status);
    setArticleMetaTitle(art.metaTitle || '');
    setArticleMetaDesc(art.metaDescription || '');
    setIsArticleModalOpen(true);
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    if (!articleTitle || !articleBody) return;
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      title: articleTitle,
      excerpt: articleExcerpt,
      body: articleBody,
      featuredImage: articleFeaturedImage,
      status: articleStatus,
      metaTitle: articleMetaTitle,
      metaDescription: articleMetaDesc,
    };

    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
        setSuccessMsg(`Article "${articleTitle}" updated successfully.`);
      } else {
        await createArticle(payload);
        setSuccessMsg(`Article "${articleTitle}" created successfully.`);
      }
      setIsArticleModalOpen(false);
      fetchArticles();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save article.');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteArticle(id);
      setSuccessMsg('Article deleted successfully.');
      fetchArticles();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete article.');
    }
  };

  // CMS Page Block Operations
  const fetchPageBlock = async (slug) => {
    setErrorMsg(null);
    try {
      const data = await getPageBySlug(slug);
      setEditingPageTitle(data.page.title);
      setEditingPageBody(data.page.body);
      setEditingPageStatus(data.page.status);
      setEditingPageMetaTitle(data.page.metaTitle || '');
      setEditingPageMetaDesc(data.page.metaDescription || '');
    } catch (error) {
      console.error(error);
      setErrorMsg(`Failed to retrieve page content for block: ${slug}`);
    }
  };

  const handlePageUpdateSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updatePageBlock(editingPageSlug, {
        title: editingPageTitle,
        body: editingPageBody,
        status: editingPageStatus,
        metaTitle: editingPageMetaTitle,
        metaDescription: editingPageMetaDesc,
      });
      setSuccessMsg('Static page block text content updated successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update page block.');
    }
  };

  // CMS Media Asset Operations
  const fetchMedia = async () => {
    setMediaLoading(true);
    setErrorMsg(null);
    try {
      const data = await getMediaAssets();
      setMediaList(data.assets);
    } catch (err) {
      setErrorMsg('Failed to load media assets.');
      console.error(err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaUploadSubmit = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await uploadMedia(file);
      setSuccessMsg(`File "${file.name}" uploaded successfully.`);
      fetchMedia();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to upload file.');
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDeleteMedia = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this media file?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteMediaAsset(id);
      setSuccessMsg('Media asset deleted from disk and database.');
      fetchMedia();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to delete asset.');
    }
  };

  const exportCSV = () => {
    if (submissionsList.length === 0) return;
    const headers = ['ID', 'Form Title', 'Submitter Email', 'Status', 'Submitted Date', 'Submitted Data'];
    const rows = submissionsList.map((sub) => [
      sub.id,
      sub.formDefinition?.title || 'Unknown Form',
      sub.email || sub.user?.email || 'Guest',
      sub.status,
      new Date(sub.createdAt).toLocaleString(),
      JSON.stringify(sub.data).replace(/"/g, '""'),
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => `"${val}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agge_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await updateUserRole(targetUserId, newRole);
      setSuccessMsg('User role updated successfully.');
      fetchUsers(); // Refresh list
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update user role.');
    }
  };

  const openEventForm = (evt = null) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (evt) {
      setEditingEvent(evt);
      setEventTitle(evt.title || '');
      setEventSlug(evt.slug || '');
      setEventDescription(evt.description || '');
      setEventType(evt.eventType || 'CONFERENCE');
      setEventStatus(evt.status || 'DRAFT');
      setEventStartDate(formatToDatetimeLocal(evt.startDate));
      setEventEndDate(formatToDatetimeLocal(evt.endDate));
      setEventLocation(evt.location || '');
      setEventOnline(evt.online || false);
      setEventPriceMember(Number(evt.priceMember) || 0);
      setEventPriceNonMember(Number(evt.priceNonMember) || 0);
      setEventOrganizer(evt.organizer || '');
      setEventImageUrl(evt.imageUrl || '');
    } else {
      setEditingEvent(null);
      setEventTitle('');
      setEventSlug('');
      setEventDescription('');
      setEventType('CONFERENCE');
      setEventStatus('DRAFT');
      setEventStartDate('');
      setEventEndDate('');
      setEventLocation('');
      setEventOnline(false);
      setEventPriceMember(0);
      setEventPriceNonMember(0);
      setEventOrganizer('');
      setEventImageUrl('');
    }
    setIsEventFormOpen(true);
  };

  const handleEventFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const payload = {
      title: eventTitle,
      slug: eventSlug,
      description: eventDescription,
      eventType,
      status: eventStatus,
      startDate: new Date(eventStartDate).toISOString(),
      endDate: new Date(eventEndDate).toISOString(),
      location: eventOnline ? 'Online' : eventLocation,
      online: eventOnline,
      priceMember: Number(eventPriceMember),
      priceNonMember: Number(eventPriceNonMember),
      organizer: eventOrganizer,
      imageUrl: eventImageUrl,
    };

    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, payload);
        setSuccessMsg('Event updated successfully.');
      } else {
        await createEvent(payload);
        setSuccessMsg('Event created successfully.');
      }
      setIsEventFormOpen(false);
      fetchAdminEvents();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Form submission failed.');
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await deleteEvent(id);
      setSuccessMsg('Event deleted successfully.');
      fetchAdminEvents();
    } catch (err) {
      setErrorMsg('Failed to delete event.');
      console.error(err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  if (authLoading) {
    return (
      <PageLoader message="Verifying administrator credentials..." className="min-h-[calc(100vh-140px)]" />
    );
  }

  if (!user || !ADMIN_ROLES.includes(user.role)) return null;

  return (
    <div className="flex min-h-[calc(100vh-140px)] flex-col lg:flex-row bg-navy text-slate-100">
      
      {/* Sidebar Navigation */}
      <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-800 bg-navy-mid shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">AGGE Control Panel</h2>
          <p className="mt-1 text-sm font-bold text-white capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
        </div>
        <nav className="px-3 pb-6 space-y-1">
          {[
            { id: 'overview', label: 'Overview (Stats)', restricted: false },
            { id: 'users', label: 'User Administration', restricted: true },
            { id: 'logs', label: 'System Audit Logs', restricted: true },
            { id: 'content', label: 'Content (CMS)', restricted: false },
            { id: 'events', label: 'Events & Programs', restricted: false },
            { id: 'education', label: 'Education Settings', placeholder: true },
            { id: 'memberships', label: 'Memberships & Payments', restricted: false },
            { id: 'submissions', label: 'Form Submissions', restricted: false },
            { id: 'settings', label: 'Global Settings', placeholder: true },
          ].map((tab) => {
            // Hide logs and user administration for editors/managers who lack access
            if (tab.restricted && !hasFullAccess) return null;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`w-full flex items-center justify-between rounded-lg px-4 py-2.5 text-left text-sm font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-slate-400 hover:bg-slate-800/45 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.placeholder && (
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                    Future
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Board Area */}
      <main className="flex-1 p-8 lg:p-10">
        
        {/* Success/Error Banners */}
        {successMsg && (
          <div className="mb-6 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-4 text-sm text-emerald-400">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
            {errorMsg}
          </div>
        )}

        {/* Tab content screens */}
        <div className="animate-fadeIn">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-white">System Metrics Overview</h3>
                <p className="mt-1 text-sm text-slate-400">Quick status check of AGGE users, members, and transactions.</p>
              </div>

              {!hasFullAccess ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-8 text-center text-slate-400">
                  <p className="text-lg font-semibold text-white">Welcome, Site Editor / Manager</p>
                  <p className="mt-2 text-sm max-w-md mx-auto">You have access to write articles, events, and education pages. Navigate tabs to modify settings or prepare content drafts.</p>
                </div>
              ) : statsLoading ? (
                <PageLoader message="Loading metrics..." className="py-20" />
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Registered Users</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{stats?.totalUsers}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Active Subscriptions</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{stats?.activeMembers}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Pending Forms</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{stats?.pendingSubmissions}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-6">
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Payments</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{stats?.revenueTotal.toFixed(2)} EUR</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && hasFullAccess && (
            <div>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">User Administration</h3>
                  <p className="mt-1 text-sm text-slate-400">View registered users and manage authorization levels.</p>
                </div>

                {/* Filter Search Form */}
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name/email..."
                    className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="rounded-lg border border-slate-800 bg-slate-950/50 px-2 py-1.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">All Roles</option>
                    <option value="MEMBER">Member</option>
                    <option value="STUDENT_MEMBER">Student Member</option>
                    <option value="EDITOR">Editor</option>
                    <option value="EVENT_MANAGER">Event Manager</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 cursor-pointer"
                  >
                    Search
                  </button>
                </form>
              </div>

              {usersLoading ? (
                <TableSkeleton rows={6} cols={4} />
              ) : usersList.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/50 rounded-xl">No users found.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Registered Date</th>
                        <th className="p-4 text-right">Access Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-900/20">
                          <td className="p-4 font-semibold text-white">
                            {usr.firstName} {usr.lastName}
                          </td>
                          <td className="p-4">{usr.email}</td>
                          <td className="p-4">{new Date(usr.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <select
                              value={usr.role}
                              disabled={usr.id === user.id} // Disable self editing
                              onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                              className="rounded border border-slate-800 bg-slate-950 px-2 py-1 text-xs text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                            >
                              <option value="MEMBER">Member</option>
                              <option value="STUDENT_MEMBER">Student Member</option>
                              <option value="EDITOR">Editor</option>
                              <option value="EVENT_MANAGER">Event Manager</option>
                              <option value="ADMIN">Admin</option>
                              <option value="SUPER_ADMIN">Super Admin</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SYSTEM AUDIT LOGS */}
          {activeTab === 'logs' && hasFullAccess && (
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-bold tracking-tight text-white">System Audit Trail</h3>
                <p className="mt-1 text-sm text-slate-400">Recent administrative logs and updates made on the server.</p>
              </div>

              {logsLoading ? (
                <TableSkeleton rows={10} cols={4} />
              ) : logsList.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/50 rounded-xl">No logs recorded.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Actor</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {logsList.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/20">
                          <td className="p-4 whitespace-nowrap text-slate-400">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4 whitespace-nowrap text-white font-medium">
                            {log.user ? `${log.user.firstName} (${log.user.email})` : 'System'}
                          </td>
                          <td className="p-4 whitespace-nowrap font-bold text-emerald-400">
                            {log.action}
                          </td>
                          <td className="p-4 whitespace-nowrap text-slate-500">{log.ipAddress}</td>
                          <td className="p-4 text-slate-300 min-w-[200px]">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EVENTS & PROGRAMS */}
          {activeTab === 'events' && (
            <div>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">Events & Programs</h3>
                  <p className="mt-1 text-sm text-slate-400">Create, update, and manage global conferences, workshops, and webinars.</p>
                </div>
                <button
                  type="button"
                  onClick={() => openEventForm()}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition shadow cursor-pointer"
                >
                  + Create Event
                </button>
              </div>

              {eventsLoading ? (
                <TableSkeleton rows={6} cols={5} />
              ) : adminEventsList.length === 0 ? (
                <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/50 rounded-xl">No events registered.</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                        <th className="p-4">Event Details</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Pricing</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {adminEventsList.map((evt) => (
                        <tr key={evt.id} className="hover:bg-slate-900/20">
                          <td className="p-4">
                            <p className="font-semibold text-white">{evt.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{evt.slug} · {evt.online ? 'Online' : evt.location}</p>
                          </td>
                          <td className="p-4">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 capitalize">
                              {evt.eventType.toLowerCase()}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                              evt.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : evt.status === 'DRAFT'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {evt.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs">
                            <p>Mem: {Number(evt.priceMember) === 0 ? 'Free' : `${Number(evt.priceMember)} EUR`}</p>
                            <p className="text-slate-500">Non-Mem: {Number(evt.priceNonMember) === 0 ? 'Free' : `${Number(evt.priceNonMember)} EUR`}</p>
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <Link
                              to={`/events/${evt.eventType.toLowerCase() === 'conference' ? 'conferences' : evt.eventType.toLowerCase() === 'workshop' ? 'workshops' : 'webinars'}/${evt.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-400 hover:text-sky-300 font-semibold bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1.5 rounded cursor-pointer inline-block"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEventForm(evt)}
                              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(evt.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-semibold bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Event Creation/Edit Modal Form */}
              {isEventFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-lg font-bold text-white">
                        {editingEvent ? `Edit Event: ${editingEvent.title}` : 'Create New Event'}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEventFormOpen(false)}
                        className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleEventFormSubmit} className="space-y-4 text-left">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Title</label>
                          <input
                            type="text"
                            required
                            value={eventTitle}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEventTitle(val);
                              if (!editingEvent) {
                                setEventSlug(val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'));
                              }
                            }}
                            placeholder="e.g. Near Surface Conference 2026"
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Slug</label>
                          <input
                            type="text"
                            required
                            value={eventSlug}
                            onChange={(e) => setEventSlug(e.target.value)}
                            placeholder="e.g. near-surface-conference-2026"
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                        <textarea
                          required
                          rows={4}
                          value={eventDescription}
                          onChange={(e) => setEventDescription(e.target.value)}
                          placeholder="Event synopsis, schedules, tracks, etc."
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Event Type</label>
                          <select
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="CONFERENCE">Conference</option>
                            <option value="WORKSHOP">Workshop</option>
                            <option value="WEBINAR">Webinar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
                          <select
                            value={eventStatus}
                            onChange={(e) => setEventStatus(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="DRAFT">Draft</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="ARCHIVED">Archived</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Organizer</label>
                          <input
                            type="text"
                            value={eventOrganizer}
                            onChange={(e) => setEventOrganizer(e.target.value)}
                            placeholder="e.g. AGGE Secretariat"
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={eventStartDate}
                            onChange={(e) => setEventStartDate(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">End Date & Time</label>
                          <input
                            type="datetime-local"
                            required
                            value={eventEndDate}
                            onChange={(e) => setEventEndDate(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center pt-6">
                          <input
                            type="checkbox"
                            id="online-evt"
                            checked={eventOnline}
                            onChange={(e) => setEventOnline(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                          />
                          <label htmlFor="online-evt" className="ml-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Online Event</label>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Location / Venue</label>
                          <input
                            type="text"
                            disabled={eventOnline}
                            value={eventOnline ? 'Online' : eventLocation}
                            onChange={(e) => setEventLocation(e.target.value)}
                            placeholder="e.g. Thessaloniki, Greece"
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Member Pricing (EUR)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={eventPriceMember}
                            onChange={(e) => setEventPriceMember(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Non-Member Pricing (EUR)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={eventPriceNonMember}
                            onChange={(e) => setEventPriceNonMember(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Image URL</label>
                        <input
                          type="url"
                          value={eventImageUrl}
                          onChange={(e) => setEventImageUrl(e.target.value)}
                          placeholder="e.g. https://images.unsplash.com/photo-..."
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsEventFormOpen(false)}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition cursor-pointer"
                        >
                          {editingEvent ? 'Save Changes' : 'Create Event'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4.5: MEMBERSHIPS & TRANSACTIONS */}
          {activeTab === 'memberships' && (
            <div>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">Memberships & Payments</h3>
                  <p className="mt-1 text-sm text-slate-400">Review subscription plans, update annual prices, and view the global transactions ledger.</p>
                </div>
              </div>

              {/* SECTION 1: MEMBERSHIP PLANS */}
              <div className="mb-10">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Membership Plans</h4>
                {plansLoading ? (
                  <TableSkeleton rows={3} cols={3} />
                ) : plansList.length === 0 ? (
                  <p className="text-sm text-slate-500">No membership plans found.</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-3">
                    {plansList.map((plan) => (
                      <div key={plan.id} className="rounded-xl border border-slate-800 bg-slate-900/10 p-5 flex flex-col justify-between">
                        <div>
                          <h5 className="font-semibold text-white text-sm">{plan.name}</h5>
                          <p className="mt-2 text-base font-bold text-emerald-400">€{Number(plan.price).toFixed(2)} EUR</p>
                          <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[48px]">{plan.description}</p>
                          <p className="mt-2 text-[10px] text-slate-500">Duration: {plan.durationMonths} months</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openPlanEdit(plan)}
                          className="mt-4 w-full rounded bg-slate-800 hover:bg-slate-750 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer text-center"
                        >
                          Edit Price / Info
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: TRANSACTIONS LEDGER */}
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Transactions History</h4>
                {paymentsLoading ? (
                  <TableSkeleton rows={8} cols={6} />
                ) : paymentsList.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/50 rounded-xl">No payments registered in sandbox.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                          <th className="p-4">Transaction ID</th>
                          <th className="p-4">Paid By</th>
                          <th className="p-4">Item Details</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {paymentsList.map((pay) => {
                          const userObj = pay.membership?.user || pay.eventRegistration?.user || pay.courseEnrollment?.user;
                          const name = userObj ? `${userObj.firstName} ${userObj.lastName}` : 'Sandbox Member';
                          const email = userObj ? userObj.email : 'guest@example.com';
                          
                          let label = 'General Fee';
                          if (pay.membership) label = `Membership: ${pay.membership.plan?.name}`;
                          else if (pay.eventRegistration) label = `Event: ${pay.eventRegistration.event?.title}`;
                          else if (pay.courseEnrollment) label = `Course: ${pay.courseEnrollment.course?.title}`;

                          return (
                            <tr key={pay.id} className="hover:bg-slate-900/20">
                              <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{pay.id}</td>
                              <td className="p-4">
                                <p className="font-semibold text-white">{name}</p>
                                <p className="text-xs text-slate-500">{email}</p>
                              </td>
                              <td className="p-4 text-xs font-medium text-slate-200">{label}</td>
                              <td className="p-4 font-semibold text-white">€{Number(pay.amount).toFixed(2)}</td>
                              <td className="p-4">
                                <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                  pay.status === 'COMPLETED'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : pay.status === 'FAILED'
                                    ? 'bg-red-500/10 text-red-400'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {pay.status}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-slate-500">{new Date(pay.createdAt).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Plan Edit Modal */}
              {isPlanModalOpen && editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
                    <div className="mb-6 flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">Edit Plan Price: {editingPlan.name}</h4>
                      <button
                        type="button"
                        onClick={() => setIsPlanModalOpen(false)}
                        className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleUpdatePlanSubmit} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Annual Price (EUR)</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={editPlanPrice}
                          onChange={(e) => setEditPlanPrice(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
                        <textarea
                          required
                          rows={3}
                          value={editPlanDesc}
                          onChange={(e) => setEditPlanDesc(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsPlanModalOpen(false)}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition cursor-pointer"
                        >
                          Save Pricing Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4.8: CONTENT (CMS) MANAGEMENT */}
          {activeTab === 'content' && (
            <div>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5 gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">Content Management System</h3>
                  <p className="mt-1 text-sm text-slate-400">Publish geoscience news articles, customize legal disclaimer blocks, and upload images to local asset directories.</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: 'articles', label: 'News Articles' },
                    { id: 'pages', label: 'Static Page Blocks' },
                    { id: 'media', label: 'Media Library' },
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setCmsSubTab(sub.id)}
                      className={`rounded px-3 py-1.5 text-xs font-semibold tracking-wider transition cursor-pointer ${
                        cmsSubTab === sub.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-white'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CMS SUB TAB 1: ARTICLES */}
              {cmsSubTab === 'articles' && (
                <div>
                  <div className="mb-6 flex justify-between items-center">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">News Publications</h4>
                    <button
                      type="button"
                      onClick={openArticleCreate}
                      className="rounded bg-emerald-605 hover:bg-emerald-600 border border-emerald-500/25 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer"
                    >
                      + Create News Article
                    </button>
                  </div>

                  {articlesLoading ? (
                    <TableSkeleton rows={5} cols={5} />
                  ) : articlesList.length === 0 ? (
                    <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/40 rounded-xl">No articles published in database.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                      <table className="w-full text-left text-sm text-slate-350">
                        <thead>
                          <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                            <th className="p-4">Title</th>
                            <th className="p-4">Author</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Published Date</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {articlesList.map((art) => (
                            <tr key={art.id} className="hover:bg-slate-900/20">
                              <td className="p-4">
                                <p className="font-semibold text-white text-sm">{art.title}</p>
                                <p className="text-[10px] text-slate-500 font-mono">/{art.slug}</p>
                              </td>
                              <td className="p-4 text-xs">
                                {art.author ? `${art.author.firstName} ${art.author.lastName}` : 'System'}
                              </td>
                              <td className="p-4">
                                <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                  art.status === 'PUBLISHED'
                                    ? 'bg-emerald-500/10 text-emerald-400'
                                    : art.status === 'ARCHIVED'
                                    ? 'bg-slate-800 text-slate-500'
                                    : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                  {art.status}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-slate-500">
                                {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString() : 'Draft'}
                              </td>
                              <td className="p-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openArticleEdit(art)}
                                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer"
                                >
                                  Edit
                                </button>
                                <span className="text-slate-800">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="text-xs font-semibold text-red-400 hover:text-red-300 cursor-pointer"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* CMS SUB TAB 2: STATIC PAGES BLOCKS */}
              {cmsSubTab === 'pages' && (
                <div className="grid gap-6 lg:grid-cols-4">
                  {/* Slug Selector Sidebar */}
                  <div className="lg:col-span-1 rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-2 self-start">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-800/40 mb-3">Editable Slugs</h5>
                    {[
                      { slug: 'legal-disclaimer', label: 'Disclaimer Notice' },
                      { slug: 'legal-cookies', label: 'Cookies & Privacy' },
                    ].map((pg) => (
                      <button
                        key={pg.slug}
                        type="button"
                        onClick={() => setEditingPageSlug(pg.slug)}
                        className={`w-full text-left rounded px-3 py-2 text-xs font-medium transition cursor-pointer ${
                          editingPageSlug === pg.slug
                            ? 'bg-slate-800 text-white font-bold'
                            : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                        }`}
                      >
                        {pg.label}
                      </button>
                    ))}
                  </div>

                  {/* Edit Form */}
                  <form onSubmit={handlePageUpdateSubmit} className="lg:col-span-3 space-y-4 rounded-xl border border-slate-800 p-6 bg-slate-900/10 text-left">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-850">
                      Edit Block: {editingPageSlug}
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Page Header Title</label>
                        <input
                          type="text"
                          required
                          value={editingPageTitle}
                          onChange={(e) => setEditingPageTitle(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Metadata Title (SEO)</label>
                        <input
                          type="text"
                          required
                          value={editingPageMetaTitle}
                          onChange={(e) => setEditingPageMetaTitle(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Metadata Description (SEO)</label>
                      <input
                        type="text"
                        required
                        value={editingPageMetaDesc}
                        onChange={(e) => setEditingPageMetaDesc(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Markdown Content Body</label>
                      <textarea
                        required
                        rows={12}
                        value={editingPageBody}
                        onChange={(e) => setEditingPageBody(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono text-xs leading-relaxed"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="rounded-lg bg-emerald-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-emerald-505 transition cursor-pointer"
                      >
                        Save Static block Content
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* CMS SUB TAB 3: MEDIA LIBRARY */}
              {cmsSubTab === 'media' && (
                <div>
                  <div className="mb-6 flex justify-between items-center border-b border-slate-850 pb-4">
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Media Assets Library</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Upload images to link directly in your news publications.</p>
                    </div>
                    <div>
                      <input
                        id="adminMediaUploadPicker"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleMediaUploadSubmit}
                        disabled={mediaUploading}
                        className="hidden"
                      />
                      <label
                        htmlFor="adminMediaUploadPicker"
                        className="inline-block rounded bg-emerald-605 hover:bg-emerald-600 border border-emerald-500/25 px-4 py-2 text-xs font-semibold text-white transition cursor-pointer hover:border-emerald-400"
                      >
                        {mediaUploading ? 'Uploading asset file...' : '↑ Upload Media File'}
                      </label>
                    </div>
                  </div>

                  {mediaLoading ? (
                    <TableSkeleton rows={4} cols={4} />
                  ) : mediaList.length === 0 ? (
                    <p className="text-xs text-slate-500 py-12 text-center border border-slate-800 border-dashed rounded-xl">Media library is empty. Upload images above.</p>
                  ) : (
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 text-left">
                      {mediaList.map((asset) => (
                        <div key={asset.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-3 flex flex-col justify-between hover:border-slate-700 transition">
                          <div>
                            {asset.mimeType.startsWith('image/') ? (
                              <img
                                src={asset.publicUrl}
                                alt={asset.originalName}
                                className="h-32 w-full rounded-lg object-cover bg-slate-900 border border-slate-850"
                              />
                            ) : (
                              <div className="h-32 w-full rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 text-2xl font-bold border border-slate-850">
                                📄
                              </div>
                            )}
                            <p className="mt-2 text-xs font-bold text-white truncate" title={asset.originalName}>
                              {asset.originalName}
                            </p>
                            <p className="text-[9px] text-slate-500">
                              {(asset.sizeBytes / 1024).toFixed(1)} KB · {asset.mimeType.split('/')[1].toUpperCase()}
                            </p>
                          </div>
                          <div className="mt-4 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(asset.publicUrl);
                                alert('Public URL copied to clipboard!');
                              }}
                              className="flex-1 rounded bg-slate-800 hover:bg-slate-700 py-1.5 text-[10px] font-bold text-slate-300 hover:text-white text-center cursor-pointer"
                            >
                              Copy Link
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMedia(asset.id)}
                              className="rounded bg-red-950/20 border border-red-500/10 hover:bg-red-900/30 px-2.5 py-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Article Edit/Create Modal */}
              {isArticleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                    <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-3">
                      <h4 className="text-base font-bold text-white">{editingArticle ? 'Edit Article Details' : 'Publish New Article'}</h4>
                      <button
                        type="button"
                        onClick={() => setIsArticleModalOpen(false)}
                        className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleArticleSubmit} className="space-y-4 text-left">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Article Title</label>
                          <input
                            type="text"
                            required
                            value={articleTitle}
                            onChange={(e) => setArticleTitle(e.target.value)}
                            placeholder="e.g. Geophysics Research Breakthrough 2026"
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Publishing Status</label>
                          <select
                            value={articleStatus}
                            onChange={(e) => setArticleStatus(e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="DRAFT">DRAFT (Hidden)</option>
                            <option value="PUBLISHED">PUBLISHED (Visible)</option>
                            <option value="ARCHIVED">ARCHIVED (Closed)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Excerpt / Brief Summary</label>
                        <input
                          type="text"
                          value={articleExcerpt}
                          onChange={(e) => setArticleExcerpt(e.target.value)}
                          placeholder="Provide a single-line summary of the news story..."
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Featured Image URL</label>
                        <input
                          type="text"
                          value={articleFeaturedImage}
                          onChange={(e) => setArticleFeaturedImage(e.target.value)}
                          placeholder="e.g. http://localhost:3000/uploads/file.jpg"
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none font-mono text-xs"
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">SEO Meta Title</label>
                          <input
                            type="text"
                            value={articleMetaTitle}
                            onChange={(e) => setArticleMetaTitle(e.target.value)}
                            placeholder="SEO tag header title..."
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">SEO Meta Description</label>
                          <input
                            type="text"
                            value={articleMetaDesc}
                            onChange={(e) => setArticleMetaDesc(e.target.value)}
                            placeholder="SEO indexing description content..."
                            className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Article Content Body (Markdown Supported)</label>
                        <textarea
                          required
                          rows={8}
                          value={articleBody}
                          onChange={(e) => setArticleBody(e.target.value)}
                          placeholder="Write the full news report content here..."
                          className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none leading-relaxed"
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-2 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsArticleModalOpen(false)}
                          className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-750 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition cursor-pointer"
                        >
                          {editingArticle ? 'Save Publications' : 'Publish Article'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FORM SUBMISSIONS & CONTACT MESSAGES */}
          {activeTab === 'submissions' && (
            <div>
              <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-white">Form Submissions & Support</h3>
                  <p className="mt-1 text-sm text-slate-400">Review dynamic registration forms and process general contact messages.</p>
                </div>
                {submissionsSubTab === 'applications' && submissionsList.length > 0 && (
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-505 px-4 py-2 text-xs font-semibold text-white transition shadow cursor-pointer"
                  >
                    📥 Export CSV
                  </button>
                )}
              </div>

              {/* Sub tabs controls */}
              <div className="mb-6 flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setSubmissionsSubTab('applications')}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                    submissionsSubTab === 'applications'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Dynamic Applications ({submissionsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSubmissionsSubTab('contacts')}
                  className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition cursor-pointer ${
                    submissionsSubTab === 'contacts'
                      ? 'border-emerald-500 text-white'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Contact Messages ({contactMessagesList.length})
                </button>
              </div>

              {submissionsSubTab === 'applications' ? (
                submissionsLoading ? (
                  <TableSkeleton rows={6} cols={5} />
                ) : submissionsList.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/50 rounded-xl">No submissions registered.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                          <th className="p-4">Form</th>
                          <th className="p-4">Submitter</th>
                          <th className="p-4">Details</th>
                          <th className="p-4">Submitted At</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {submissionsList.map((sub) => (
                          <tr key={sub.id} className="hover:bg-slate-900/20">
                            <td className="p-4 font-semibold text-white">
                              {sub.formDefinition?.title || sub.formDefinition?.key}
                            </td>
                            <td className="p-4">
                              {sub.user ? (
                                <div>
                                  <p className="font-medium text-slate-200">{sub.user.firstName} {sub.user.lastName}</p>
                                  <p className="text-xs text-slate-500">{sub.user.email}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium text-slate-200">Guest</p>
                                  <p className="text-xs text-slate-500">{sub.email}</p>
                                </div>
                              )}
                            </td>
                            <td className="p-4 max-w-xs">
                              <div className="rounded border border-slate-800 bg-slate-950/40 p-2 text-xs space-y-1">
                                {Object.entries(sub.data || {}).map(([key, val]) => (
                                  <p key={key} className="break-all">
                                    <strong className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</strong>{' '}
                                    <span className="text-slate-300">{String(val)}</span>
                                  </p>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-xs text-slate-400">
                              {new Date(sub.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <select
                                value={sub.status}
                                onChange={(e) => handleSubmissionStatusChange(sub.id, e.target.value)}
                                className={`rounded px-2.5 py-1 text-xs font-semibold focus:outline-none bg-slate-950 border ${
                                  sub.status === 'APPROVED'
                                    ? 'text-emerald-400 border-emerald-500/30'
                                    : sub.status === 'REJECTED'
                                    ? 'text-red-400 border-red-500/30'
                                    : sub.status === 'REVIEWED'
                                    ? 'text-blue-400 border-blue-500/30'
                                    : 'text-amber-400 border-amber-500/30'
                                }`}
                              >
                                <option value="PENDING">Pending</option>
                                <option value="REVIEWED">Reviewed</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                contactsLoading ? (
                  <TableSkeleton rows={6} cols={6} />
                ) : contactMessagesList.length === 0 ? (
                  <p className="text-sm text-slate-500 py-8 text-center border border-slate-800/50 rounded-xl">No contact messages registered.</p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/10">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-900/25">
                          <th className="p-4">From</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4">Message</th>
                          <th className="p-4">Category</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {contactMessagesList.map((msg) => (
                          <tr key={msg.id} className="hover:bg-slate-900/20">
                            <td className="p-4">
                              <p className="font-semibold text-white">{msg.name}</p>
                              <p className="text-xs text-slate-500">{msg.email}</p>
                            </td>
                            <td className="p-4 text-slate-200 font-medium max-w-xs truncate">
                              {msg.subject}
                            </td>
                            <td className="p-4 text-slate-300 max-w-sm whitespace-pre-wrap text-xs">
                              {msg.message}
                            </td>
                            <td className="p-4">
                              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
                                {msg.type}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-slate-400">
                              {new Date(msg.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4">
                              <select
                                value={msg.status}
                                onChange={(e) => handleContactStatusChange(msg.id, e.target.value)}
                                className={`rounded px-2.5 py-1 text-xs font-semibold focus:outline-none bg-slate-950 border ${
                                  msg.status === 'REPLIED'
                                    ? 'text-emerald-400 border-emerald-500/30'
                                    : msg.status === 'READ'
                                    ? 'text-slate-400 border-slate-700/50'
                                    : 'text-amber-400 border-amber-500/30 font-bold'
                                }`}
                              >
                                <option value="UNREAD">Unread</option>
                                <option value="READ">Read</option>
                                <option value="REPLIED">Replied</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}

          {/* FUTURE PLACEHOLDERS */}
          {['education', 'settings'].includes(activeTab) && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-500 font-bold text-lg">
                ⚙
              </div>
              <h3 className="text-xl font-bold text-white capitalize">{activeTab.replace('_', ' ')} Management</h3>
              <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                This administrative panel will be fully wired up during the upcoming <strong>{activeTab.toUpperCase()}</strong> roadmap implementation phases.
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
