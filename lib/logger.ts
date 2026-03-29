type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

class Logger {
  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (meta) {
      console.log(formattedMessage, JSON.stringify(meta));
    } else {
      console.log(formattedMessage);
    }
  }

  info(message: string, meta?: any) { this.log('INFO', message, meta); }
  warn(message: string, meta?: any) { this.log('WARN', message, meta); }
  error(message: string, meta?: any) { this.log('ERROR', message, meta); }
  debug(message: string, meta?: any) { this.log('DEBUG', message, meta); }
}

export const logger = new Logger();