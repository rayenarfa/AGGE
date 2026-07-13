import { Link } from 'react-router-dom';

export default function CommunityCard({ community }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-500/30">
      <h3 className="text-lg font-semibold text-white">
        <Link to={`/communities/${community.slug}`} className="hover:text-emerald-400">
          {community.name}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{community.focus}</p>
      <p className="mt-4 text-xs text-slate-500">{community.members} members</p>
    </article>
  );
}
