import supabase from './supabase';

/**
 * Fetch all articles (optionally filtered by categories, tag, search keyword)
 * @param {object} params Query filters
 * @returns {Promise<object>} Articles array
 */
export async function getArticles(params = {}) {
  let query = supabase
    .from('Article')
    .select(`
      *,
      author:profiles!Article_authorId_fkey(firstName, lastName, email),
      categories:ArticleCategory!_ArticleToArticleCategory(id, name, slug),
      tags:Tag!_ArticleToTag(id, name, slug)
    `)
    .order('createdAt', { ascending: false });

  if (params.status) {
    query = query.eq('status', params.status);
  } else {
    query = query.eq('status', 'PUBLISHED');
  }

  if (params.search) {
    query = query.or(
      `title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%,body.ilike.%${params.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let articles = data || [];

  if (params.category) {
    articles = articles.filter((a) =>
      a.categories?.some((c) => c.slug === params.category)
    );
  }

  if (params.tag) {
    articles = articles.filter((a) =>
      a.tags?.some((t) => t.slug === params.tag)
    );
  }

  return { articles };
}

/**
 * Fetch specific article details by slug
 * @param {string} slug Article slug
 * @returns {Promise<object>} Article details
 */
export async function getArticleBySlug(slug) {
  const { data: article, error } = await supabase
    .from('Article')
    .select(`
      *,
      author:profiles!Article_authorId_fkey(firstName, lastName, email),
      categories:ArticleCategory!_ArticleToArticleCategory(id, name, slug),
      tags:Tag!_ArticleToTag(id, name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);
  return { article };
}

/**
 * Create a new article (Admin/Editor restricted)
 * @param {object} data Article fields
 * @returns {Promise<object>} Saved article
 */
export async function createArticle(data) {
  const { categories, tags, ...fields } = data;
  const { data: { session } } = await supabase.auth.getSession();

  const articlePayload = {
    ...fields,
    authorId: session?.user?.id || null,
    publishedAt: fields.status === 'PUBLISHED' ? new Date().toISOString() : null,
  };

  const { data: article, error } = await supabase
    .from('Article')
    .insert(articlePayload)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const catJoins = categories.map((catId) => ({ A: article.id, B: catId }));
    await supabase.from('_ArticleToArticleCategory').insert(catJoins);
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    const tagJoins = tags.map((tagId) => ({ A: article.id, B: tagId }));
    await supabase.from('_ArticleToTag').insert(tagJoins);
  }

  return { article };
}

/**
 * Update an existing article content (Admin/Editor restricted)
 * @param {string} id Article ID
 * @param {object} data Updated values
 * @returns {Promise<object>} Saved record
 */
export async function updateArticle(id, data) {
  const { categories, tags, ...fields } = data;

  const { data: article, error } = await supabase
    .from('Article')
    .update(fields)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (categories && Array.isArray(categories)) {
    await supabase.from('_ArticleToArticleCategory').delete().eq('A', id);
    if (categories.length > 0) {
      const catJoins = categories.map((catId) => ({ A: id, B: catId }));
      await supabase.from('_ArticleToArticleCategory').insert(catJoins);
    }
  }

  if (tags && Array.isArray(tags)) {
    await supabase.from('_ArticleToTag').delete().eq('A', id);
    if (tags.length > 0) {
      const tagJoins = tags.map((tagId) => ({ A: id, B: tagId }));
      await supabase.from('_ArticleToTag').insert(tagJoins);
    }
  }

  return { article };
}

/**
 * Delete a news article (Admin/Editor restricted)
 * @param {string} id Article ID
 * @returns {Promise<object>} Result outcome
 */
export async function deleteArticle(id) {
  const { error } = await supabase.from('Article').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Article deleted successfully' };
}

/**
 * Fetch a static page body content
 * @param {string} slug Page block identifier
 * @returns {Promise<object>} Page text body
 */
export async function getPageBySlug(slug) {
  const { data: page, error } = await supabase
    .from('Page')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw new Error(error.message);
  return { page };
}

/**
 * Update page block content (Admin/Editor restricted)
 * @param {string} slug Page block identifier
 * @param {object} data Updated details
 * @returns {Promise<object>} Saved page block
 */
export async function updatePageBlock(slug, data) {
  const { data: page, error } = await supabase
    .from('Page')
    .upsert({ slug, ...data })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return { page };
}

/**
 * Upload a media asset to Supabase Storage
 * @param {File} file Binary file
 * @returns {Promise<object>} Saved asset details
 */
export async function uploadMedia(file) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const fileExt = file.name.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `uploads/${filename}`;

  // 1. Upload to Supabase Storage 'media' bucket
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  // 2. Get Public URL
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath);
  const publicUrl = urlData.publicUrl;

  // 3. Save record in MediaAsset table
  const { data: asset, error: dbError } = await supabase
    .from('MediaAsset')
    .insert({
      filename,
      originalName: file.name,
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      path: publicUrl,
      uploaderId: session.user.id,
    })
    .select()
    .single();

  if (dbError) throw new Error(dbError.message);

  return { asset };
}

/**
 * Retrieve uploaded media asset logs (Admin/Editor restricted)
 * @returns {Promise<object>} Media items array
 */
export async function getMediaAssets() {
  const { data, error } = await supabase
    .from('MediaAsset')
    .select('*, uploader:profiles!MediaAsset_uploaderId_fkey(firstName, lastName, email)')
    .order('createdAt', { ascending: false });

  if (error) throw new Error(error.message);
  return { mediaAssets: data || [] };
}

/**
 * Delete a media asset from library (Admin/Editor restricted)
 * @param {string} id Asset ID
 * @returns {Promise<object>} Result status
 */
export async function deleteMediaAsset(id) {
  // 1. Get asset details to find file path
  const { data: asset } = await supabase
    .from('MediaAsset')
    .select('filename')
    .eq('id', id)
    .single();

  if (asset?.filename) {
    await supabase.storage.from('media').remove([`uploads/${asset.filename}`]);
  }

  const { error } = await supabase.from('MediaAsset').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { message: 'Asset removed successfully' };
}
