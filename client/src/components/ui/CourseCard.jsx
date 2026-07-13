export default function CourseCard({ course }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{course.type}</span>
      <h3 className="mt-3 text-lg font-semibold text-white">{course.title}</h3>
      <dl className="mt-3 space-y-1 text-sm text-slate-400">
        <div className="flex gap-2">
          <dt className="text-slate-500">Instructor:</dt>
          <dd>{course.instructor}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">Category:</dt>
          <dd>{course.category}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="text-slate-500">Dates:</dt>
          <dd>{course.dates}</dd>
        </div>
      </dl>
      <button
        type="button"
        className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
      >
        Register
      </button>
    </article>
  );
}
