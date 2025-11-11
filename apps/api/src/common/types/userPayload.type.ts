export interface UserPayload {
  id: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user: UserPayload;
  }
}
