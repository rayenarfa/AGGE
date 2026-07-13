import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

import AboutPage from '../pages/about/AboutPage';
import TeamPage from '../pages/about/TeamPage';
import HistoryPage from '../pages/about/HistoryPage';
import GovernancePage from '../pages/about/GovernancePage';

import MembershipPage from '../pages/membership/MembershipPage';
import {
  JoinPage,
  RenewPage,
  BenefitsPage,
  TypesPage,
} from '../pages/membership/MembershipSubPages';

import EventsPage from '../pages/events/EventsPage';
import EventsCalendarPage from '../pages/events/EventsCalendarPage';
import {
  ConferencesPage,
  WorkshopsPage,
  WebinarsPage,
} from '../pages/events/EventListPages';
import EventDetailPage from '../pages/events/EventDetailPage';
import EnvironmentalPolicyPage from '../pages/events/EnvironmentalPolicyPage';

import EducationPage, {
  CoursesPage,
  EducationCalendarPage,
} from '../pages/education/EducationPages';

import CommunitiesPage, {
  LocalChaptersPage,
  CommunityDetailPage,
} from '../pages/communities/CommunitiesPages';

import StudentsPage from '../pages/students/StudentsPage';

import NewsPage, {
  NewsArchivePage,
  PressReleasesPage,
  NewsDetailPage,
} from '../pages/news/NewsPages';

import MediaPage, {
  JournalsPage,
  NewslettersPage,
  PublicationsPage,
} from '../pages/media/MediaPages';

import ServicesPage, {
  TrainingPage,
  ConsultingPage,
} from '../pages/services/ServicesPages';

import ContactPage, {
  MediaInquiriesPage,
  SupportPage,
} from '../pages/contact/ContactPages';

import { DisclaimerPage, CookiesPage } from '../pages/legal/LegalPages';
import CheckoutPage from '../pages/checkout/CheckoutPage';
import CheckoutGatewayPage from '../pages/checkout/CheckoutGatewayPage';
import CheckoutSuccessPage from '../pages/checkout/CheckoutSuccessPage';
import CheckoutCancelPage from '../pages/checkout/CheckoutCancelPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },

      // About
      { path: 'about', element: <AboutPage /> },
      { path: 'about/team', element: <TeamPage /> },
      { path: 'about/history', element: <HistoryPage /> },
      { path: 'about/governance', element: <GovernancePage /> },

      // Membership
      { path: 'membership', element: <MembershipPage /> },
      { path: 'membership/join', element: <JoinPage /> },
      { path: 'membership/renew', element: <RenewPage /> },
      { path: 'membership/benefits', element: <BenefitsPage /> },
      { path: 'membership/types', element: <TypesPage /> },

      // Events
      { path: 'events', element: <EventsPage /> },
      { path: 'events/calendar', element: <EventsCalendarPage /> },
      { path: 'events/conferences', element: <ConferencesPage /> },
      { path: 'events/workshops', element: <WorkshopsPage /> },
      { path: 'events/webinars', element: <WebinarsPage /> },
      { path: 'events/environmental-policy', element: <EnvironmentalPolicyPage /> },
      { path: 'events/:type/:slug', element: <EventDetailPage /> },

      // Education
      { path: 'education', element: <EducationPage /> },
      { path: 'education/courses', element: <CoursesPage /> },
      { path: 'education/calendar', element: <EducationCalendarPage /> },

      // Communities
      { path: 'communities', element: <CommunitiesPage /> },
      { path: 'communities/local-chapters', element: <LocalChaptersPage /> },
      { path: 'communities/:slug', element: <CommunityDetailPage /> },

      // Students
      { path: 'students', element: <StudentsPage /> },

      // News
      { path: 'news', element: <NewsPage /> },
      { path: 'news/archive', element: <NewsArchivePage /> },
      { path: 'news/press-releases', element: <PressReleasesPage /> },
      { path: 'news/:slug', element: <NewsDetailPage /> },

      // Media
      { path: 'media', element: <MediaPage /> },
      { path: 'media/journals', element: <JournalsPage /> },
      { path: 'media/newsletters', element: <NewslettersPage /> },
      { path: 'media/publications', element: <PublicationsPage /> },

      // Services
      { path: 'services', element: <ServicesPage /> },
      { path: 'services/training', element: <TrainingPage /> },
      { path: 'services/consulting', element: <ConsultingPage /> },

      // Contact
      { path: 'contact', element: <ContactPage /> },
      { path: 'contact/media', element: <MediaInquiriesPage /> },
      { path: 'contact/support', element: <SupportPage /> },

      // Checkout
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/gateway', element: <CheckoutGatewayPage /> },
      { path: 'checkout/success', element: <CheckoutSuccessPage /> },
      { path: 'checkout/cancel', element: <CheckoutCancelPage /> },

      // Legal
      { path: 'legal/disclaimer', element: <DisclaimerPage /> },
      { path: 'legal/cookies', element: <CookiesPage /> },

      // Catch-all
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
