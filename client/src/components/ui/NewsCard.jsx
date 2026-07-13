import { Link } from 'react-router-dom';

export default function NewsCard({ article, compact = false }) {
  return (
    <article className={`group rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-slate-700 transition-all duration-300 ${compact ? '' : ''}`}>
      {/* Featured Image */}
      {article.imageUrl && !compact && (
        <div className="h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="mb-2 flex items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 font-semibold">
            {article.category}
          </span>
          <time>{article.date}</time>
        </div>
        <h3 className={`font-bold text-white leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
          <Link to={`/news/${article.slug}`} className="hover:text-emerald-400 transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className={`mt-2 text-slate-400 leading-relaxed ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
          {article.excerpt}
        </p>
        <Link
          to={`/news/${article.slug}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Read article <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </Link>
      </div>
    </article>
  );
}
