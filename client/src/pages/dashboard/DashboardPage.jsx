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
      await reloadUser();
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
    <div className="mx-auto max-w-6xl px-6 py-12 font-sans bg-cream min-h-[85vh]">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-sand/40 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-copper">Member Portal</span>
          <h1 className="text-3xl font-display font-bold text-navy mt-0.5">My Account Dashboard</h1>
          <p className="mt-1 text-xs text-text-muted">Welcome back, <strong className="text-navy">{user.firstName} {user.lastName}</strong> ({user.email})</p>
        </div>

        {/* Action button */}
        <Link
          to="/membership/join"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-copper to-copper-light px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-105 transition self-start md:self-auto"
        >
          <i className="fas fa-id-card text-sand" /> Membership Overview
        </Link>
      </div>

      {/* Expiry alerts */}
      {membership && isExpiringSoon(membership.endDate) && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-amber-950">Membership Expiring Soon!</p>
              <p className="mt-0.5 text-amber-800">Your AGGE membership ends on {new Date(membership.endDate).toLocaleDateString()}. Renew now to retain full member rates and privileges.</p>
            </div>
            <Link
              to="/membership/renew"
              className="shrink-0 rounded-full bg-amber-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-amber-700 shadow"
            >
              Renew Membership
            </Link>
          </div>
        </div>
      )}

      {membership && isExpired(membership.endDate) && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-red-950">Membership Inactive / Expired</p>
              <p className="mt-0.5 text-red-800">Your AGGE membership expired on {new Date(membership.endDate).toLocaleDateString()}. Please subscribe or upload your renewal receipt.</p>
            </div>
            <Link
              to="/membership/renew"
              className="shrink-0 rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-700 shadow"
            >
              Renew Membership
            </Link>
          </div>
        </div>
      )}

      {/* Navigation Pills */}
      <div className="mb-8 flex gap-3 border-b border-sand/30 pb-4">
        {[
          { id: 'overview', label: 'Dashboard Overview', icon: 'fas fa-chart-line' },
          { id: 'membership', label: 'Transactions & Payments', icon: 'fas fa-receipt' },
          { id: 'profile', label: 'Profile & Security', icon: 'fas fa-user-cog' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-2.5 text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-navy text-white shadow-md'
                : 'bg-white text-navy border border-sand/50 hover:bg-cream'
            }`}
          >
            <i className={tab.icon} /> {tab.label}
          </button>
        ))}
      </div>

      {/* DB Error */}
      {dbError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <p>{dbError}</p>
          <button onClick={fetchDashboardData} className="mt-2 text-xs font-bold text-copper hover:underline">
            Retry Load
          </button>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid gap-8 lg:grid-cols-3 items-start">
        
        {/* Main Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-2xl border border-sand/40 bg-white p-5 text-center shadow-sm">
                  <p className="text-3xl font-display font-bold text-navy">{events.length}</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold">Events Registered</p>
                </div>
                <div className="rounded-2xl border border-sand/40 bg-white p-5 text-center shadow-sm">
                  <p className="text-3xl font-display font-bold text-navy">{courses.length}</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold">Courses Enrolled</p>
                </div>
                <div className="rounded-2xl border border-sand/40 bg-white p-5 text-center shadow-sm">
                  <p className="text-3xl font-display font-bold text-copper">{payments.length}</p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase tracking-wider font-bold">Transactions</p>
                </div>
              </div>

              {/* Registered Events */}
              <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-sand/30 pb-3">
                  <h3 className="text-base font-display font-bold text-navy">My Registered Events</h3>
                  <Link to="/events" className="text-xs font-bold text-copper hover:underline">Browse All →</Link>
                </div>

                {events.length === 0 ? (
                  <div className="text-center py-8 bg-cream/50 rounded-2xl border border-sand/30">
                    <p className="text-xs text-text-muted">You are not registered for any upcoming AGGE events.</p>
                    <Link to="/events" className="mt-2 inline-block text-xs font-bold text-copper hover:underline">
                      Explore Conferences &amp; Workshops
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-sand/30">
                    {events.map((evt) => (
                      <div key={evt.registrationId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                        <div>
                          <Link to={`/events/${evt.eventType.toLowerCase()}s/${evt.slug}`} className="font-bold text-navy hover:text-copper transition text-sm">
                            {evt.title}
                          </Link>
                          <p className="text-xs text-text-muted mt-0.5">
                            {new Date(evt.startDate).toLocaleDateString()} {evt.location ? `• ${evt.location}` : '• Online Access'}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                          evt.status === 'REGISTERED' ? 'bg-sage/20 text-sage border border-sage/30' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {evt.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Enrolled Courses */}
              <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-sand/30 pb-3">
                  <h3 className="text-base font-display font-bold text-navy">My Geoscience Courses</h3>
                  <Link to="/education" className="text-xs font-bold text-copper hover:underline">Course Catalog →</Link>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-8 bg-cream/50 rounded-2xl border border-sand/30">
                    <p className="text-xs text-text-muted">You are not enrolled in any training courses.</p>
                    <Link to="/education" className="mt-2 inline-block text-xs font-bold text-copper hover:underline">
                      View Short Courses &amp; Webinars
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-sand/30">
                    {courses.map((crs) => (
                      <div key={crs.enrollmentId} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                        <div>
                          <p className="font-bold text-navy text-sm">{crs.title}</p>
                          <p className="text-xs text-text-muted mt-0.5">
                            Type: {crs.courseType.replace('_', ' ')} {crs.instructor ? `• Instructor: ${crs.instructor}` : ''}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
                          crs.status === 'ENROLLED' ? 'bg-navy/10 text-navy border border-navy/20' : 'bg-slate-100 text-slate-600'
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
            <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
              <h3 className="text-base font-display font-bold text-navy mb-6 border-b border-sand/30 pb-3">Transaction History</h3>
              
              {payments.length === 0 ? (
                <div className="text-center py-10 bg-cream/50 rounded-2xl border border-sand/30">
                  <p className="text-xs text-text-muted">No payments or receipt submissions logged under your account.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-navy">
                    <thead>
                      <tr className="border-b border-sand/40 text-[10px] font-bold uppercase tracking-wider text-text-muted bg-cream/50">
                        <th className="p-3">Date</th>
                        <th className="p-3">Description</th>
                        <th className="p-3">Amount (DT)</th>
                        <th className="p-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sand/30">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-cream/40 transition">
                          <td className="p-3 text-text-muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-bold text-navy">{p.description}</td>
                          <td className="p-3 font-extrabold text-copper">{Number(p.amount).toFixed(0)} DT</td>
                          <td className="p-3 text-right">
                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                              p.status === 'COMPLETED' ? 'bg-sage/20 text-sage' : 'bg-amber-100 text-amber-800'
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
              <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
                <h3 className="text-base font-display font-bold text-navy mb-6 border-b border-sand/30 pb-3">Profile Information</h3>
                
                {profileSuccess && (
                  <div className="mb-4 rounded-xl border border-sage/40 bg-sage/10 p-3 text-xs font-semibold text-sage">
                    {profileSuccess}
                  </div>
                )}
                {profileError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">First Name</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy focus:border-copper focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Last Name</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy focus:border-copper focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy focus:border-copper focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="rounded-full bg-navy hover:bg-navy-mid px-6 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>

              {/* Password Form */}
              <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
                <h3 className="text-base font-display font-bold text-navy mb-6 border-b border-sand/30 pb-3">Change Security Password</h3>
                
                {passwordSuccess && (
                  <div className="mb-4 rounded-xl border border-sage/40 bg-sage/10 p-3 text-xs font-semibold text-sage">
                    {passwordSuccess}
                  </div>
                )}
                {passwordError && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                    {passwordError}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy focus:border-copper focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy focus:border-copper focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-sand/50 bg-cream px-4 py-2.5 text-xs text-navy focus:border-copper focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="rounded-full bg-copper hover:bg-copper-light px-6 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer shadow"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

        {/* Sidebar Info Area */}
        <div className="space-y-6">
          
          {/* Membership Status Card */}
          <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-copper">Subscription Details</span>

            {membership ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-display font-bold text-navy">{membership.plan.name}</h4>
                  <p className="text-xs text-text-muted mt-0.5 font-medium">Price: {Number(membership.plan.price).toFixed(0)} DT / year</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                    isExpired(membership.endDate) ? 'bg-red-500' : 'bg-sage'
                  }`} />
                  <span className="text-xs font-bold text-navy">
                    {isExpired(membership.endDate) ? 'Subscription Expired' : 'Active Member Account'}
                  </span>
                </div>

                <div className="border-t border-sand/30 pt-3 space-y-1 text-xs text-text-muted font-sans">
                  <p><strong className="text-navy">Start Date:</strong> {new Date(membership.startDate).toLocaleDateString()}</p>
                  <p><strong className="text-navy">Renewal Date:</strong> {new Date(membership.endDate).toLocaleDateString()}</p>
                </div>

                <Link
                  to="/membership/join"
                  className="block w-full rounded-full bg-navy text-center py-2.5 text-xs font-bold text-white hover:bg-navy-mid transition shadow-sm"
                >
                  Manage Membership Tier
                </Link>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-text-muted">No active membership subscription linked to this account.</p>
                <Link
                  to="/membership/join"
                  className="block w-full rounded-full bg-gradient-to-r from-copper to-copper-light text-center py-2.5 text-xs font-bold text-white hover:scale-105 transition shadow"
                >
                  Join AGGE (30 DT / 50 DT)
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links Card */}
          <div className="rounded-3xl border border-sand/40 bg-white p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 border-b border-sand/30 pb-2">Quick Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link to="/events" className="text-text-muted hover:text-copper transition flex items-center gap-2">
                  <i className="fas fa-calendar-alt text-copper" /> View Events Calendar
                </Link>
              </li>
              <li>
                <Link to="/education" className="text-text-muted hover:text-copper transition flex items-center gap-2">
                  <i className="fas fa-graduation-cap text-copper" /> Browse Courses &amp; Workshops
                </Link>
              </li>
              <li>
                <Link to="/sponsors" className="text-text-muted hover:text-copper transition flex items-center gap-2">
                  <i className="fas fa-handshake text-copper" /> Become a Sponsor / Partner
                </Link>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
