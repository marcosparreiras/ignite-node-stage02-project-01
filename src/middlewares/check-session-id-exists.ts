import { FastifyReply, FastifyRequest } from 'fastify';

async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const sessionId = request.cookies.sessionId;
  if (!sessionId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    });
  }
}

export default checkSessionIdExists;
