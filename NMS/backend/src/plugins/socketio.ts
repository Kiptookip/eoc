import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Server } from 'socket.io';

/**
 * Socket.io Plugin (Custom wrapper for Fastify 5 compatibility).
 * Decorates fastify with `app.io`.
 */
const socketPlugin = fp(async (app: FastifyInstance) => {
  const io = new Server(app.server, {
    cors: {
      origin: app.config.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  app.decorate('io', io);

  io.on('connection', (socket) => {
    app.log.info(`🔌 Socket connected: ${socket.id}`);

    // Expect clients to emit 'join:room' with their user ID and roles
    // Example: socket.emit('join:room', { userId: '123', roles: ['DISPATCHER'] })
    socket.on('join:room', (data) => {
      if (data.userId) {
        socket.join(`user:${data.userId}`);
        app.log.info(`🔌 Socket ${socket.id} joined room user:${data.userId}`);
      }
      if (data.roles && Array.isArray(data.roles)) {
        data.roles.forEach((role: string) => {
          socket.join(`role:${role}`);
          app.log.info(`🔌 Socket ${socket.id} joined room role:${role}`);
        });
      }
    });

    socket.on('disconnect', () => {
      app.log.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  // Gracefully close on app shutdown
  app.addHook('onClose', (app, done) => {
    app.io.close();
    done();
  });
});

export default socketPlugin;

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}
