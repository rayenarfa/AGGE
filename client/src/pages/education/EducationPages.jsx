import { useState, useEffect } from 'react';
import SectionPage from '../../components/ui/SectionPage';
import CourseCard from '../../components/ui/CourseCard';
import { CardSkeleton, TableSkeleton } from '../../components/ui/Loader';
import { getCalendar } from '../../services/calendar';
import { courses as mockCourses, pageContent } from '../../data/mockContent';
import { educationSubNav } from '../../data/navigation';

export default function EducationPage() {
  return (
    <SectionPage
      content={pageContent.education}
      subNav={educationSubNav}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Education' }]}
    />
  );
}

function formatCourseType(subType) {
  if (!subType) return 'Self-paced Online';
  return subType.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ') + ' Course';
}

function formatCourseDates(startStr, endStr) {
  if (!startStr) return 'On demand';
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;
  const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
  const year = start.getFullYear();

  if (!end || start.toDateString() === end.toDateString()) {
    return `${start.getDate()} ${startMonth} ${year}`;
  }
  const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
  if (startMonth === endMonth) {
    return `${start.getDate()}–${end.getDate()} ${startMonth} ${year}`;
  }
  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth} ${year}`;
}

export function CoursesPage() {
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCalendar({ type: 'COURSE' });
        const mapped = data.items.map((item) => ({
          slug: item.slug,
          title: item.title,
          type: formatCourseType(item.subType),
          instructor: 'AGGE Faculty',
          category: item.category,
          dates: formatCourseDates(item.startDate, item.endDate),
        }));
        setCoursesList(mapped);
      } catch (err) {
        console.error('Failed to fetch DB courses, falling back to mock.', err);
        setCoursesList(mockCourses);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <SectionPage
      content={{
        title: 'Course Catalogue',
        subtitle: 'Self-paced, live, and interactive learning',
        sections: [{
          heading: 'Filter options',
          body: 'Filter by event type, category, month, instructor, or keywords — matching the Learning Geoscience calendar structure.',
        }],
      }}
      subNav={educationSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Education', to: '/education' },
        { label: 'Courses' },
      ]}
    >
      {loading ? (
        <CardSkeleton count={2} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {coursesList.map((course) => (
            <CourseCard key={course.slug} course={course} />
          ))}
        </div>
      )}
    </SectionPage>
  );
}

export function EducationCalendarPage() {
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCalendar({ type: 'COURSE' });
        const mapped = data.items.map((item) => ({
          slug: item.slug,
          title: item.title,
          type: formatCourseType(item.subType),
          instructor: 'AGGE Faculty',
          category: item.category,
          dates: formatCourseDates(item.startDate, item.endDate),
        }));
        setCoursesList(mapped);
      } catch (err) {
        console.error('Failed to fetch DB calendar, falling back to mock.', err);
        setCoursesList(mockCourses);
      } finally {
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  return (
    <SectionPage
      content={{
        title: 'Education Calendar',
        subtitle: 'Scheduled courses and on-demand offerings',
        sections: [],
      }}
      subNav={educationSubNav}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Education', to: '/education' },
        { label: 'Calendar' },
      ]}
    >
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {coursesList.map((course) => (
                <tr key={course.slug} className="border-t border-slate-800 text-slate-300">
                  <td className="px-4 py-3 whitespace-nowrap">{course.dates}</td>
                  <td className="px-4 py-3 font-semibold text-white">{course.title}</td>
                  <td className="px-4 py-3">{course.instructor}</td>
                  <td className="px-4 py-3">{course.category}</td>
                  <td className="px-4 py-3">{course.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionPage>
  );
}
