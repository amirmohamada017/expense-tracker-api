import app from './app.js';
import { connectDB, disconnectDB } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env['PORT'] || 3000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    console.log('✅ Database connection established');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
      console.log(`🌍 Environment: ${process.env['NODE_ENV'] || 'development'}`);
    });

    const gracefulShutdown = (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async err => {
        if (err) {
          console.error('❌ Error during server shutdown:', err);
          process.exit(1);
        }

        try {
          await disconnectDB();
          console.log('✅ Database connections closed');

          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during database shutdown:', error);
          process.exit(1);
        }
      });

      setTimeout(() => {
        console.error('❌ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
