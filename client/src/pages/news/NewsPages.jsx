import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import SectionPage from '../../components/ui/SectionPage';
import NewsCard from '../../components/ui/NewsCard';
import { CardSkeleton, PageLoader } from '../../components/ui/Loader';
import { getArticles, getArticleBySlug } from '../../services/cms';
import { newsArticles as mockArticles, pressReleases as mockReleases } from '../../data/mockContent';

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Converts an API article to the shape NewsCard expects */
function toCardShape(article) {
  return {
    slug: article.slug,
    category: article.categories?.[0]?.name || article.category || 'News',
    title: article.title,
    excerpt: article.excerpt,
    date: formatDate(article.publishedAt || article.createdAt) || article.date,
    imageUrl: article.featuredImage,
  };
}

// ─── NEWS HOME PAGE ──────────────────────────────────────────────────────────

export default function NewsPage() {
  const [articlesList, setArticlesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const data = await getArticles();
        setArticlesList(data.articles);
      } catch (err) {
        console.error('Failed to fetch DB articles, falling back to mock.', err);
        setArticlesList(mockArticles);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <SectionPage
      content={{
        title: 'News',
        subtitle: 'Association announcements and community updates',
        sections: [],
      }}
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'News' }]}
    >
      <div className="mb-8 flex gap-4 text-xs font-semibold uppercase tracking-wider">
        <Link to="/news/archive" className="text-emerald-400 hover:text-emerald-300 hover:underline transition">Archive</Link>
        <span className="text-slate-700">|</span>
        <Link to="/news/press-releases" className="text-emerald-400 hover:text-emerald-300 hover:underline transition">Press releases</Link>
      </div>

      {loading ? (
        <CardSkeleton count={2} />
      ) : articlesList.length === 0 ? (
        <p className="text-slate-500 py-12 text-center text-sm">No news articles found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {articlesList.map((article) => (
            <NewsCard key={article.slug} article={toCardShape(article)} />
          ))}
        </div>
      )}
    </SectionPage>
  );
}

// ─── NEWS ARCHIVE PAGE (with category filtering) ─────────────────────────────

export function NewsArchivePage() {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchArchive() {
      try {
        const data = await getArticles();
        setAllArticles(data.articles);
      } catch (err) {
        console.error(err);
        setAllArticles(mockArticles);
      } finally {
        setLoading(false);
      }
    }
    fetchArchive();
  }, []);

  // Build unique categories from all articles
  const categories = ['all', ...Array.from(
    new Set(
      allArticles.flatMap(a =>
        (a.categories?.map(c => c.slug) ?? [a.category?.toLowerCase()?.replace(/\s+/g, '-')])
      ).filter(Boolean)
    )
  )];

  // Category label lookup
  const categoryLabel = (slug) => {
    if (slug === 'all') return 'All Categories';
    const article = allArticles.find(a => a.categories?.some(c => c.slug === slug));
    const cat = article?.categories?.find(c => c.slug === slug);
    return cat?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Filter by category and search query
  const filtered = allArticles.filter(article => {
    const matchCat =
      activeCategory === 'all' ||
      article.categories?.some(c => c.slug === activeCategory) ||
      article.category?.toLowerCase().replace(/\s+/g, '-') === activeCategory;

    const matchSearch =
      !searchQuery ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.excerpt ?? '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchCat && matchSearch;
  });

  return (
    <SectionPage
      content={{
        title: 'News Archive',
        subtitle: 'Browse all AGGE news and announcements',
        sections: [],
      }}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'News', to: '/news' },
        { label: 'Archive' },
      ]}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-56 shrink-0">
          {/* Search */}
          <div className="mb-5">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Search articles
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Keyword..."
                className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Filter by category
            </p>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full text-left rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {categoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          {(activeCategory !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 w-full rounded-lg border border-slate-700 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:border-slate-600 transition cursor-pointer"
            >
              Reset filters
            </button>
          )}
        </aside>

        {/* Article List */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <CardSkeleton count={2} />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-slate-800 border-dashed p-12 text-center">
              <p className="text-slate-500 text-sm">No articles match your current filters.</p>
              <button
                type="button"
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="mt-3 text-xs text-emerald-400 hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-5">
                Showing <span className="text-white font-semibold">{filtered.length}</span> of {allArticles.length} article{allArticles.length !== 1 ? 's' : ''}
              </p>
              <ul className="divide-y divide-slate-800/60">
                {filtered.map((article) => (
                  <li key={article.slug} className="py-5 text-left">
                    <Link to={`/news/${article.slug}`} className="group block">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          {article.categories?.[0]?.name || article.category || 'News'}
                        </span>
                        <time className="text-xs text-slate-500">
                          {formatDate(article.publishedAt || article.createdAt) || article.date}
                        </time>
                      </div>
                      <p className="font-bold text-white group-hover:text-emerald-400 transition text-base leading-snug">
                        {article.title}
                      </p>
                      <p className="mt-1.5 text-sm text-slate-400 leading-relaxed max-w-3xl line-clamp-2">
                        {article.excerpt}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </SectionPage>
  );
}

// ─── PRESS RELEASES PAGE ─────────────────────────────────────────────────────

export function PressReleasesPage() {
  const [releasesList, setReleasesList] = useState([]);

  useEffect(() => {
    async function fetchReleases() {
      try {
        const data = await getArticles({ category: 'announcements' });
        if (data.articles && data.articles.length > 0) {
          setReleasesList(data.articles);
        } else {
          setReleasesList([]);
        }
      } catch (err) {
        console.error(err);
        setReleasesList([]);
      }
    }
    fetchReleases();
  }, []);

  const items = releasesList.length > 0 ? releasesList : mockReleases;

  return (
    <SectionPage
      content={{
        title: 'Press Releases',
        subtitle: 'Official AGGE announcements for media',
        sections: [],
      }}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'News', to: '/news' },
        { label: 'Press Releases' },
      ]}
    >
      <div className="space-y-6 text-left">
        {items.map((item) => (
          <article key={item.slug} className="rounded-xl border border-slate-800 bg-slate-900/10 p-6 hover:border-slate-700 transition">
            <time className="text-xs text-slate-500 font-medium">{formatDate(item.publishedAt) || item.date}</time>
            <h3 className="mt-2 text-lg font-bold text-white leading-snug">{item.title}</h3>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">{item.excerpt}</p>
          </article>
        ))}
      </div>
    </SectionPage>
  );
}

// ─── NEWS DETAIL PAGE ─────────────────────────────────────────────────────────

export function NewsDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArticle() {
      try {
        const data = await getArticleBySlug(slug);
        setArticle(data.article);
      } catch (err) {
        console.error('Failed to retrieve dynamic article, searching mock list.', err);
        const matchedMock = mockArticles.find(a => a.slug === slug);
        setArticle(matchedMock || null);
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <PageLoader message="Loading news article content..." className="py-20" />
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-white">Article not found</h1>
        <Link to="/news" className="mt-4 inline-block text-emerald-400 hover:underline">← Back to news</Link>
      </div>
    );
  }

  const categoryName = article.categories?.[0]?.name || article.category || 'News';
  const displayDate = formatDate(article.publishedAt || article.createdAt) || article.date;
  const allTags = article.tags ?? [];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero */}
      <div className="relative border-b border-slate-800/80">
        {article.featuredImage && (
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={article.featuredImage}
              alt={article.title}
              className="h-full w-full object-cover opacity-15"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950" />
          </div>
        )}
        <div className="relative mx-auto max-w-4xl px-6 pt-16 pb-12">
          {/* Breadcrumbs */}
          <nav className="mb-6 flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-emerald-400 transition">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-emerald-400 transition">News</Link>
            <span>/</span>
            <span className="text-slate-400 truncate max-w-xs">{article.title}</span>
          </nav>

          {/* Category + Date */}
          <div className="mb-4 flex items-center gap-3 flex-wrap">
            <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
              {categoryName}
            </span>
            <time className="text-xs text-slate-500">{displayDate}</time>
            {article.author && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-400">
                  By {article.author.firstName} {article.author.lastName}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="mt-4 text-lg text-slate-300 leading-relaxed max-w-2xl">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Article Body */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="prose prose-invert prose-emerald max-w-none
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
          prose-h2:text-2xl prose-h3:text-xl
          prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base
          prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
          prose-code:text-emerald-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
          prose-blockquote:border-emerald-500 prose-blockquote:text-slate-400
          prose-ul:text-slate-300 prose-li:marker:text-emerald-500
          prose-hr:border-slate-800">
          <ReactMarkdown>{article.body || ''}</ReactMarkdown>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-800 flex flex-wrap gap-2">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider mr-2 self-center">Tags:</span>
            {allTags.map(tag => (
              <span key={tag.id} className="rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-xs text-slate-300">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <Link
            to="/news"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition"
          >
            ← Back to all news
          </Link>
        </div>
      </div>
    </div>
  );
}
