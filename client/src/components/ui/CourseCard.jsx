export default function CourseCard({ course }) {
  return (
    <article className="rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5 transition-all duration-300 hover:shadow-lg hover:border-copper/45 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <span className="rounded-full bg-sand-light px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
          {course.type}
        </span>
        <h3 className="mt-3 text-lg font-display font-semibold text-navy leading-snug">{course.title}</h3>
        <dl className="mt-4 space-y-2 text-xs text-text-muted font-sans border-t border-sandstone/10 pt-4">
          <div className="flex gap-2">
            <dt className="font-semibold text-navy">Instructor:</dt>
            <dd>{course.instructor}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-navy">Category:</dt>
            <dd>{course.category}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-semibold text-navy">Dates:</dt>
            <dd>{course.dates}</dd>
          </div>
        </dl>
      </div>
      <button
        type="button"
        className="mt-6 w-full rounded-full bg-gradient-to-r from-copper to-copper-light text-center py-2.5 text-xs font-semibold text-white transition hover:scale-105 shadow shadow-copper/20 cursor-pointer border-none"
      >
        Register Course
      </button>
    </article>
  );
}
