import { FastifyPluginAsync } from 'fastify';
import { db } from '@devteam/database';
import * as bcrypt from 'bcryptjs';
import { 
  ForgotPasswordSchema, 
  ResetPasswordSchema, 
  VerifyEmailSchema,
  ResendVerificationSchema 
} from '../schemas/auth';
import { generateTokenWithExpiry, hashToken, verifyToken } from '../utils/token';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /forgot-password
   * Request a password reset email
   */
  fastify.post('/forgot-password', async (request, reply) => {
    const { email } = ForgotPasswordSchema.parse(request.body);

    // Find user (don't reveal if user exists)
    const user = await db.user.findUnique({ where: { email } });

    if (user) {
      // Generate reset token
      const { token, expires } = generateTokenWithExpiry(60); // 1 hour expiry
      const hashedToken = hashToken(token);

      // Store token in VerificationToken table (reusing for password reset)
      await db.verificationToken.deleteMany({
        where: { identifier: `reset:${email}` },
      });

      await db.verificationToken.create({
        data: {
          identifier: `reset:${email}`,
          token: hashedToken,
          expires,
        },
      });

      // TODO: Send password reset email
      // await sendPasswordResetEmail(email, token);
      
      fastify.log.info({ email }, 'Password reset token generated');
    }

    // Always return success to prevent email enumeration
    return reply.send({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  });

  /**
   * POST /reset-password
   * Reset password using token
   */
  fastify.post('/reset-password', async (request, reply) => {
    const { token, password } = ResetPasswordSchema.parse(request.body);
    const hashedToken = hashToken(token);

    // Find valid token
    const storedToken = await db.verificationToken.findFirst({
      where: {
        token: hashedToken,
        identifier: { startsWith: 'reset:' },
        expires: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid or expired reset token',
      });
    }

    // Extract email from identifier
    const email = storedToken.identifier.replace('reset:', '');

    // Update user password
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { email },
      data: { passwordHash: hashedPassword },
    });

    // Delete used token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: storedToken.identifier,
          token: storedToken.token,
        },
      },
    });

    fastify.log.info({ email }, 'Password reset successfully');

    return reply.send({
      message: 'Password has been reset successfully. You can now log in.',
    });
  });

  /**
   * POST /verify-email
   * Verify email address using token
   */
  fastify.post('/verify-email', async (request, reply) => {
    const { token } = VerifyEmailSchema.parse(request.body);
    const hashedToken = hashToken(token);

    // Find valid token
    const storedToken = await db.verificationToken.findFirst({
      where: {
        token: hashedToken,
        identifier: { startsWith: 'verify:' },
        expires: { gt: new Date() },
      },
    });

    if (!storedToken) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid or expired verification token',
      });
    }

    // Extract email from identifier
    const email = storedToken.identifier.replace('verify:', '');

    // Update user emailVerified
    await db.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: storedToken.identifier,
          token: storedToken.token,
        },
      },
    });

    fastify.log.info({ email }, 'Email verified successfully');

    return reply.send({
      message: 'Email verified successfully.',
    });
  });

  /**
   * POST /resend-verification
   * Resend email verification link
   */
  fastify.post('/resend-verification', async (request, reply) => {
    const { email } = ResendVerificationSchema.parse(request.body);

    const user = await db.user.findUnique({ where: { email } });

    if (user && !user.emailVerified) {
      // Generate verification token
      const { token, expires } = generateTokenWithExpiry(24 * 60); // 24 hours expiry
      const hashedToken = hashToken(token);

      // Delete existing tokens
      await db.verificationToken.deleteMany({
        where: { identifier: `verify:${email}` },
      });

      // Create new token
      await db.verificationToken.create({
        data: {
          identifier: `verify:${email}`,
          token: hashedToken,
          expires,
        },
      });

      // TODO: Send verification email
      // await sendVerificationEmail(email, token);

      fastify.log.info({ email }, 'Verification email resent');
    }

    // Always return success to prevent email enumeration
    return reply.send({
      message: 'If an unverified account with that email exists, a verification link has been sent.',
    });
  });
};

export default authRoutes;
