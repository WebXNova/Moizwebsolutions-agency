import { describeError, logger } from './logger.js';

/**
 * Fatal-signal handlers. systemd/process manager restarts the service.
 * Never prints secrets; never continues after an unknown process state.
 *
 * @param {{ shutdown: (signal: string) => void }} options
 */
export function installProcessGuards({ shutdown }) {
  process.on('unhandledRejection', (reason) => {
    logger.error('process.unhandled_rejection', { error: describeError(reason) });
    shutdown('unhandledRejection');
  });

  process.on('uncaughtException', (error) => {
    logger.error('process.uncaught_exception', { error: describeError(error) });
    shutdown('uncaughtException');
  });
}
