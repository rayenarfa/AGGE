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
        if (data && data.article) {
          setArticle(data.article);
        } else {
          const matchedMock = mockArticles.find(a => a.slug === slug);
          setArticle(matchedMock || null);
        }
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
        <h1 className="text-2xl font-bold text-navy font-display">Article Not Found</h1>
        <p className="text-xs text-text-muted mt-2">The news article you are looking for is unavailable.</p>
        <Link to="/news" className="mt-6 inline-block rounded-full bg-navy text-white px-6 py-2.5 text-xs font-semibold hover:bg-navy-mid transition">← Back to news archive</Link>
      </div>
    );
  }

  const categoryName = article.categories?.[0]?.name || article.category || 'News';
  const displayDate = formatDate(article.publishedAt || article.createdAt) || article.date;
  const allTags = article.tags ?? [];

  return (
    <div className="min-h-screen bg-cream text-navy">
      {/* High Contrast Header Hero */}
      <div className="relative bg-navy text-white py-16 px-6 border-b-4 border-sandstone overflow-hidden">
        <div className="contour-bg opacity-20" />
        <div className="relative mx-auto max-w-4xl space-y-4">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-300">
            <Link to="/" className="hover:text-sand transition font-medium">Home</Link>
            <span>/</span>
            <Link to="/news" className="hover:text-sand transition font-medium">News</Link>
            <span>/</span>
            <span className="text-sand font-semibold truncate max-w-xs">{article.title}</span>
          </nav>

          {/* Category Badge & Date */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            <span className="rounded-full bg-copper px-3 py-1 text-xs font-bold text-white shadow-sm">
              {categoryName}
            </span>
            <time className="text-xs text-slate-300 font-medium">
              <i className="fas fa-calendar-alt text-sand mr-1.5"></i>
              {displayDate}
            </time>
            {article.author && (
              <>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300">
                  <i className="fas fa-user-circle text-sand mr-1.5"></i>
                  By {article.author.firstName} {article.author.lastName}
                </span>
              </>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-bold text-cream leading-tight tracking-tight">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-slate-200 font-light leading-relaxed max-w-3xl pt-2 border-t border-navy-light">
              {article.excerpt}
            </p>
          )}
        </div>
      </div>

      {/* Article Body - Light background with high-contrast dark text */}
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-sand/40 shadow-sm">
          
          {article.featuredImage && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-md">
              <img
                src={article.featuredImage}
                alt={article.title}
                className="w-full max-h-96 object-cover"
              />
            </div>
          )}

          <div className="prose max-w-none text-slate-800 leading-relaxed text-base
            prose-headings:font-display prose-headings:font-bold prose-headings:text-navy
            prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-sand/30 prose-h2:pb-2
            prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
            prose-p:text-slate-800 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-base
            prose-a:text-copper prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
            prose-strong:text-navy prose-strong:font-bold
            prose-code:text-copper prose-code:bg-cream prose-code:px-2 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-semibold
            prose-pre:bg-navy prose-pre:text-white prose-pre:p-4 prose-pre:rounded-xl
            prose-blockquote:border-l-4 prose-blockquote:border-copper prose-blockquote:bg-cream/60 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:text-slate-700 prose-blockquote:italic
            prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2 prose-ul:mb-5
            prose-li:text-slate-800
            prose-hr:border-sand/40 prose-hr:my-8">
            {article.body ? (
              <ReactMarkdown>{article.body}</ReactMarkdown>
            ) : (
              <div className="space-y-5 text-slate-800 leading-relaxed">
                <p>
                  As global energy systems transition toward low-carbon futures, geoscientists and geotechnical engineers are taking center stage in shaping sustainable solutions. Subsurface engineering, carbon capture and storage (CCS), geothermal exploration, and groundwater management present unprecedented opportunities for early career professionals.
                </p>
                <h2 className="text-2xl font-display font-bold text-navy border-b border-sand/30 pb-2">The Evolving Role of Early Career Geoscientists</h2>
                <p>
                  Young minds bring innovative perspectives, computational skills, and machine learning fluency to traditional geological modeling. Through interdisciplinary collaboration across hydrogeology, geophysics, and soil mechanics, young professionals are bridging the gap between field research and policy implementation.
                </p>
                <blockquote className="border-l-4 border-copper bg-cream/60 p-4 rounded-r-xl text-slate-700 italic">
                  "Innovations in natural resource management require young geoscientists to unite field experience with digital subsurface modeling."
                </blockquote>
                <p>
                  AGGE student chapters and regional committees continue to support young leaders through travel grants, workshop registrations, and mentorship pairings with senior industry fellows.
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-sand/40 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy mr-2">Tags:</span>
              {allTags.map((tag) => (
                <span key={tag.id || tag.name} className="rounded-full bg-cream border border-sand/40 px-3 py-1 text-xs font-semibold text-navy">
                  {tag.name || tag}
                </span>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-sand/40 flex justify-between items-center">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-copper hover:underline transition"
            >
              ← Back to all news
            </Link>
            <Link
              to="/membership/join"
              className="rounded-full bg-navy text-white px-5 py-2 text-xs font-semibold hover:bg-navy-mid transition"
            >
              Join AGGE Network
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

