import { prisma } from '../prisma/client.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  setTokenCookies,
  clearTokenCookies,
} from '../utils/auth.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

/**
 * Register a new user
 */
export async function register(req, res) {
  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const { email, password, firstName, lastName } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in DB
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'MEMBER', // Default role
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    // Return user details (omit password hash)
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Login user
 */
export async function login(req, res) {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.format(),
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Compare passwords
    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set cookies
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Logout user
 */
export async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      // Invalidate refresh token in DB
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    // Clear cookies
    clearTokenCookies(res);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Refresh tokens (Refresh Token Rotation)
 */
export async function refresh(req, res) {
  try {
    const oldRefreshToken = req.cookies.refresh_token;

    if (!oldRefreshToken) {
      return res.status(401).json({ error: 'Refresh token missing', code: 'REFRESH_TOKEN_MISSING' });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(oldRefreshToken);
    } catch (err) {
      // Invalidate the token from DB anyway on failed verification
      await prisma.refreshToken.deleteMany({ where: { token: oldRefreshToken } });
      clearTokenCookies(res);
      return res.status(401).json({ error: 'Invalid refresh token', code: 'REFRESH_TOKEN_INVALID' });
    }

    // Check if token exists in DB and is active
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
      include: { user: true },
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) {
        await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      }
      clearTokenCookies(res);
      return res.status(401).json({ error: 'Expired or reused refresh token', code: 'REFRESH_TOKEN_EXPIRED' });
    }

    const user = savedToken.user;

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: savedToken.id } });

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Save new refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    // Set new cookies
    setTokenCookies(res, newAccessToken, newRefreshToken);

    return res.status(200).json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current user profile
 */
export async function me(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', code: 'UNAUTHORIZED' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
