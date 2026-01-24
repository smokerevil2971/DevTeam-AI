import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError, ZodSchema } from 'zod';

declare module 'fastify' {
  interface FastifyRequest {
    validate: <T>(schema: ZodSchema<T>, data: unknown) => T;
  }
}

const zodValidationPlugin: FastifyPluginAsync = async (fastify) => {
  // Add validation helper to request
  fastify.decorateRequest('validate', function <T>(schema: ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
  });

  // Handle Zod validation errors globally
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Validation Error',
        message: 'Request validation failed',
        issues: error.errors.map((e) => ({
          path: e.path,
          message: e.message,
        })),
      });
    }

    // Handle Fastify Sensible errors
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      return reply.status(error.statusCode).send({
        statusCode: error.statusCode,
        error: error.name || 'Error',
        message: error.message,
      });
    }

    // Generic server error
    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });
};

export default fp(zodValidationPlugin, {
  name: 'zod-validation',
});
