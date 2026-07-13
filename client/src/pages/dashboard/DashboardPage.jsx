import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { PageLoader } from '../../components/ui/Loader';
import { getDashboard, updateProfile, updatePassword } from '../../services/users';

export default function DashboardPage() {
  const { user, loading: authLoading, reloadUser } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'overview' | 'membership' | 'profile'
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dashboard Data State
  const [dbData, setDbData] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState(null);

  // Form State: Profile Details
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Form State: Password Changes
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Guard routing
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch Dashboard Data
  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Sync Form States with current User context
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setDbLoading(true);
    setDbError(null);
    try {
      const data = await getDashboard();
      setDbData(data);
    } catch (err) {
      setDbError('Failed to load dashboard data. Please try again.');
      console.error(err);
    } finally {
      setDbLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSuccess(null);
    setProfileError(null);
    setIsUpdatingProfile(true);

    try {
      await updateProfile({ firstName, lastName, email });
      await reloadUser(); // sync layout header and state
      setProfileSuccess('Profile details updated successfully');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile details.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      await updatePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Failed to change password. Make sure current password is correct.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Helper: check if membership is expiring soon (<30 days)
  const isExpiringSoon = (endDateStr) => {
    if (!endDateStr) return false;
    const end = new Date(endDateStr);
    const diffTime = end - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  const isExpired = (endDateStr) => {
    if (!endDateStr) return true;
    return new Date(endDateStr) < new Date();
  };

  if (authLoading || (user && dbLoading && !dbData)) {
    return (
      <PageLoader message="Loading your dashboard..." className="min-h-[calc(100vh-140px)]" />
    );
  }

  if (!user) return null;

  const membership = dbData?.membership;
  const payments = dbData?.payments || [];
  const events = dbData?.events || [];
  const courses = dbData?.courses || [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">My Dashboard</h1>
        <p className="mt-1 text-slate-400">Welcome, {user.firstName} {user.lastName} ({user.email})</p>
      </div>

      {/* Expiry alerts */}
      {membership && isExpiringSoon(membership.endDate) && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-950/20 p-4 text-sm text-yellow-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Membership Expiring Soon!</p>
              <p className="mt-0.5 opacity-90">Your AGGE membership ends on {new Date(membership.endDate).toLocaleDateString()}. Renew now to retain access to events and forums.</p>
            </div>
            <Link
              to="/membership/renew"
              className="shrink-0 rounded-lg bg-yellow-600 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-yellow-500"
            >
              Renew Membership
            </Link>
          </div>
        </div>
      )}

      {membership && isExpired(membership.endDate) && (
        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-sm text-red-400">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Membership Expired</p>
              <p className="mt-0.5 opacity-90">Your AGGE membership expired on {new Date(membership.endDate).toLocaleDateString()}. Please renew to activate your benefits.</p>
            </div>
            <Link
              to="/membership/renew"
              className="shrink-0 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500"
            >
              Renew Membership
            </Link>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8 border-b border-slate-800">
        <div className="flex gap-2">
          {['overview', 'membership', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-semibold tracking-wide capitalize border-b-2 transition cursor-pointer ${
                activeTab === tab
                  ? 'border-emerald-500 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'profile' ? 'Profile Settings' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* DB Error Check */}
      {dbError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-950/20 p-4 text-sm text-red-400">
          <p>{dbError}</p>
          <button onClick={fetchDashboardData} className="mt-2 text-xs font-semibold text-emerald-400 hover:underline">
            Retry Load
          </button>
        </div>
      )}

      {/* Tab Contents */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8 animate-fadeIn">
          
          {activeTab === 'overview' && (
            <>
              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{events.length}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Events Registered</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{courses.length}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Courses Enrolled</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4 text-center">
                  <p className="text-2xl font-bold text-white">{payments.length}</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Transactions</p>
                </div>
              </div>

              {/* Registered Events */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">My Events</h3>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">You are not registered for any upcoming events.</p>
                    <Link to="/events" className="mt-2 inline-block text-xs font-semibold text-emerald-400 hover:underline">
                      Explore AGGE Events
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {events.map((evt) => (
                      <div key={evt.registrationId} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div>
                          <Link to={`/events/${evt.eventType.toLowerCase()}s/${evt.slug}`} className="font-semibold text-white hover:text-emerald-400 transition">
                            {evt.title}
                          </Link>
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(evt.startDate).toLocaleDateString()} {evt.location ? `• ${evt.location}` : '• Online'}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          evt.status === 'REGISTERED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrolled Courses */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">My Courses</h3>
                {courses.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">You are not enrolled in any training courses.</p>
                    <Link to="/education" className="mt-2 inline-block text-xs font-semibold text-emerald-400 hover:underline">
                      View Course Catalog
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {courses.map((crs) => (
                      <div key={crs.enrollmentId} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div>
                          <p className="font-semibold text-white">{crs.title}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Type: {crs.courseType.replace('_', ' ')} {crs.instructor ? `• Instructor: ${crs.instructor}` : ''}
                          </p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          crs.status === 'ENROLLED' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {crs.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'membership' && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Transaction History</h3>
              {payments.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No payments logged under your account.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Description</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/20">
                          <td className="py-3.5">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="py-3.5 font-medium text-white">{p.description}</td>
                          <td className="py-3.5">{p.amount.toFixed(2)} {p.currency}</td>
                          <td className="py-3.5 text-right">
                            <span className={`rounded px-2 py-0.5 text-xs font-semibold ${
                              p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Details Form */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Profile Settings</h3>
                {profileSuccess && (
                  <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-400">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400">
                    {profileError}
                  </div>
                )}
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password Form */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
                {passwordSuccess && (
                  <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3 text-sm text-emerald-400">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-sm text-red-400">
                    {passwordError}
                  </div>
                )}
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-slate-800 bg-slate-950/50 px-4 py-2 text-sm text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          {/* Membership Tier Card */}
          <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/30 p-6 shadow-xl">
            <div className="absolute -top-10 -right-10 -z-10 h-24 w-24 rounded-full bg-emerald-500/5 blur-xl" />
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">Membership Status</h3>

            {membership ? (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xl font-bold text-white">{membership.plan.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Tier Duration: {membership.plan.durationMonths} months</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                    isExpired(membership.endDate) ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                  <span className="text-sm font-semibold text-slate-200">
                    {isExpired(membership.endDate) ? 'Expired' : 'Active Account'}
                  </span>
                </div>
                <div className="border-t border-slate-800/80 pt-4 space-y-1.5 text-xs text-slate-400">
                  <p>Start Date: {new Date(membership.startDate).toLocaleDateString()}</p>
                  <p>Expiry Date: {new Date(membership.endDate).toLocaleDateString()}</p>
                </div>
                <Link
                  to="/membership/renew"
                  className="mt-2 block w-full rounded-lg border border-slate-800 bg-slate-900 text-center py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Manage Membership
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-slate-400">No active membership found.</p>
                <Link
                  to="/membership/join"
                  className="block w-full rounded-lg bg-emerald-600 text-center py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                >
                  Join AGGE
                </Link>
              </div>
            )}
          </div>

          {/* Quick links block */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/10 p-6">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/events/calendar" className="text-slate-400 hover:text-emerald-400 transition">View Events Calendar</Link>
              </li>
              <li>
                <Link to="/education/courses" className="text-slate-400 hover:text-emerald-400 transition">Browse Geoscience Courses</Link>
              </li>
              <li>
                <Link to="/communities" className="text-slate-400 hover:text-emerald-400 transition">Explore Communities & SIGs</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
