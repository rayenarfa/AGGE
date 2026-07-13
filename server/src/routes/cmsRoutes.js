import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  getPageBySlug,
  upsertPage,
  uploadMediaAsset,
  getMediaAssets,
  deleteMediaAsset,
} from '../controllers/cmsController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { verifyToken } from '../utils/auth.js';

const router = express.Router();

// Optional token validation middleware for public listings
function optionalAuthenticate(req, res, next) {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Ignore token verification failure for public lists
    }
  }
  next();
}

// Configure Multer storage for local uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Articles CRUD
router.get('/articles', optionalAuthenticate, getArticles);
router.get('/articles/:slug', getArticleBySlug);
router.post('/articles', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), createArticle);
router.put('/articles/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), updateArticle);
router.delete('/articles/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), deleteArticle);

// Static Page blocks
router.get('/pages/:slug', getPageBySlug);
router.put('/pages/:slug', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), upsertPage);

// Media Assets
router.post('/media/upload', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), upload.single('file'), uploadMediaAsset);
router.get('/media', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), getMediaAssets);
router.delete('/media/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EDITOR']), deleteMediaAsset);

export default router;
