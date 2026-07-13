import fs from 'fs';
import path from 'path';
import { prisma } from '../prisma/client.js';

// Helper: Slugify title
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

/**
 * Get all articles with filter criteria
 */
export async function getArticles(req, res) {
  try {
    const { category, tag, search, status } = req.query;
    
    // Auth context check (if user is admin/editor, let them see draft/archived)
    const isAdminOrEditor = req.user && ['ADMIN', 'SUPER_ADMIN', 'EDITOR'].includes(req.user.role);
    
    const where = {};
    if (isAdminOrEditor) {
      if (status) {
        where.status = status;
      }
    } else {
      where.status = 'PUBLISHED';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = {
        some: { slug: category },
      };
    }

    if (tag) {
      where.tags = {
        some: { slug: tag },
      };
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        author: { select: { firstName: true, lastName: true, email: true } },
        categories: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ articles });
  } catch (error) {
    console.error('Fetch articles error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get article by slug
 */
export async function getArticleBySlug(req, res) {
  try {
    const { slug } = req.params;
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { firstName: true, lastName: true, email: true } },
        categories: { select: { id: true, name: true, slug: true } },
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    return res.status(200).json({ article });
  } catch (error) {
    console.error('Fetch article by slug error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create news article
 */
export async function createArticle(req, res) {
  try {
    const { title, excerpt, body, featuredImage, status, metaTitle, metaDescription, categoryIds } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required' });
    }

    let slug = slugify(title);
    // Handle duplicate slugs by appending timestamp
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        body,
        featuredImage,
        status: status || 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: req.user.userId,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        categories: categoryIds ? {
          connect: categoryIds.map(id => ({ id }))
        } : undefined,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'CREATE_ARTICLE',
        entityType: 'Article',
        entityId: article.id,
        details: `Created news article: ${title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(201).json({ message: 'Article created successfully', article });
  } catch (error) {
    console.error('Create article error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Update article content
 */
export async function updateArticle(req, res) {
  try {
    const { id } = req.params;
    const { title, excerpt, body, featuredImage, status, metaTitle, metaDescription, categoryIds } = req.body;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const data = {
      title,
      excerpt,
      body,
      featuredImage,
      status,
      metaTitle,
      metaDescription,
    };

    if (status === 'PUBLISHED' && existing.status !== 'PUBLISHED') {
      data.publishedAt = new Date();
    }

    // Handle categories sync
    if (categoryIds) {
      data.categories = {
        set: categoryIds.map(catId => ({ id: catId }))
      };
    }

    const updated = await prisma.article.update({
      where: { id },
      data,
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'UPDATE_ARTICLE',
        entityType: 'Article',
        entityId: id,
        details: `Updated news article: ${title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({ message: 'Article updated successfully', article: updated });
  } catch (error) {
    console.error('Update article error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete news article
 */
export async function deleteArticle(req, res) {
  try {
    const { id } = req.params;
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Article not found' });
    }

    await prisma.article.delete({ where: { id } });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'DELETE_ARTICLE',
        entityType: 'Article',
        entityId: id,
        details: `Deleted article: ${existing.title}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Delete article error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get static page block content by slug
 */
export async function getPageBySlug(req, res) {
  try {
    const { slug } = req.params;
    let page = await prisma.page.findUnique({ where: { slug } });

    // Create default records if they don't exist yet
    if (!page) {
      page = await prisma.page.create({
        data: {
          slug,
          title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          body: `# ${slug.toUpperCase()}\n\nContent coming soon.`,
          status: 'PUBLISHED',
        },
      });
    }

    return res.status(200).json({ page });
  } catch (error) {
    console.error('Fetch page error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Save / Update static page content block
 */
export async function upsertPage(req, res) {
  try {
    const { slug } = req.params;
    const { title, body, status, metaTitle, metaDescription } = req.body;

    const page = await prisma.page.upsert({
      where: { slug },
      update: {
        title,
        body,
        status: status || 'PUBLISHED',
        metaTitle,
        metaDescription,
      },
      create: {
        slug,
        title,
        body,
        status: status || 'PUBLISHED',
        metaTitle,
        metaDescription,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'UPDATE_PAGE_BLOCK',
        entityType: 'Page',
        entityId: page.id,
        details: `Updated static page block content: ${slug}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({ message: 'Page block updated successfully', page });
  } catch (error) {
    console.error('Upsert page error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Process media asset local uploads
 */
export async function uploadMediaAsset(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Save details to DB
    const media = await prisma.mediaAsset.create({
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        path: `/uploads/${req.file.filename}`,
        uploaderId: req.user.userId,
      },
    });

    const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    return res.status(201).json({
      message: 'Media asset uploaded successfully',
      media: {
        ...media,
        publicUrl,
      },
    });
  } catch (error) {
    console.error('Upload media asset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Fetch all media library assets
 */
export async function getMediaAssets(req, res) {
  try {
    const assets = await prisma.mediaAsset.findMany({
      include: { uploader: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = assets.map(asset => ({
      ...asset,
      publicUrl: `${req.protocol}://${req.get('host')}/uploads/${asset.filename}`,
    }));

    return res.status(200).json({ assets: enriched });
  } catch (error) {
    console.error('Fetch media assets error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Delete a media asset from disk and DB
 */
export async function deleteMediaAsset(req, res) {
  try {
    const { id } = req.params;
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    // Try deleting file from disk
    const diskPath = path.join(process.cwd(), 'uploads', asset.filename);
    try {
      if (fs.existsSync(diskPath)) {
        fs.unlinkSync(diskPath);
      }
    } catch (fsErr) {
      console.warn(`Failed to delete physical file from disk at ${diskPath}`, fsErr);
    }

    // Delete database entry
    await prisma.mediaAsset.delete({ where: { id } });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'DELETE_MEDIA_ASSET',
        entityType: 'MediaAsset',
        entityId: id,
        details: `Deleted media file: ${asset.originalName}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(200).json({ message: 'Media asset deleted successfully' });
  } catch (error) {
    console.error('Delete media asset error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
