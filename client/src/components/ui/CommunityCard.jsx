import { Link } from 'react-router-dom';

export default function CommunityCard({ community }) {
  return (
    <article className="rounded-xl border border-sandstone/30 bg-white p-6 shadow-md shadow-navy/5 transition-all duration-300 hover:shadow-lg hover:border-copper/45 hover:-translate-y-1 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-display font-semibold text-navy leading-snug">
          <Link to={`/communities/${community.slug}`} className="hover:text-copper transition-colors">
            {community.name}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted font-sans">{community.focus}</p>
      </div>
      <div className="mt-6 pt-4 border-t border-sandstone/10 flex items-center justify-between text-xs text-text-muted">
        <span className="font-semibold text-navy">{community.members} members</span>
        <Link to={`/communities/${community.slug}`} className="text-copper hover:text-copper-light font-bold uppercase tracking-wider">
          Explore SIG <i className="fas fa-chevron-right text-[10px]" />
        </Link>
      </div>
    </article>
  );
}
