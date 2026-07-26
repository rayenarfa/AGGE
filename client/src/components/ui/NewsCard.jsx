import { Link } from 'react-router-dom';

const getFallbackImage = (category) => {
  if (category === 'Membership') {
    return 'https://agge.in/uploads/gallery/c270a72f2acd4631c8e1f26ae19841fe.png';
  } else if (category === 'Students') {
    return 'https://agge.in/uploads/gallery/dc5cfee5669c333871a09160ccba64e6.jpg';
  }
  return 'https://agge.in/uploads/events/57834d5186403e74697bcebd1ce157f9.jpg';
};

export default function NewsCard({ article, compact = false }) {
  const imageUrl = article.imageUrl || getFallbackImage(article.category);

  return (
    <article className="group rounded-xl border border-sandstone/30 bg-white overflow-hidden shadow-md shadow-navy/5 transition-all duration-300 hover:shadow-lg hover:border-copper/45 hover:-translate-y-1">
      {/* Featured Image */}
      {!compact && (
        <div className="h-48 w-full overflow-hidden bg-navy-mid relative">
          <img
            src={imageUrl}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-navy/85 backdrop-blur px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-sand">
              {article.category}
            </span>
          </div>
        </div>
      )}

      <div className={compact ? 'p-4' : 'p-5'}>
        {compact && (
          <div className="mb-2">
            <span className="rounded-full bg-sand-light px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-navy">
              {article.category}
            </span>
          </div>
        )}
        <div className="mb-2 flex items-center gap-3 text-[11px] text-text-muted">
          <time className="font-semibold">{article.date}</time>
        </div>
        <h3 className={`font-display font-semibold text-navy leading-snug ${compact ? 'text-sm' : 'text-base'}`}>
          <Link to={`/news/${article.slug}`} className="hover:text-copper transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className={`mt-2 text-text-muted leading-relaxed font-sans ${compact ? 'text-xs line-clamp-2' : 'text-sm line-clamp-3'}`}>
          {article.excerpt}
        </p>
        <Link
          to={`/news/${article.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-copper hover:text-copper-light transition-colors"
        >
          Read Article <i className="fas fa-chevron-right text-[9px] transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
