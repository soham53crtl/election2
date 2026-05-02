import { describe, it, expect, vi } from 'vitest';
import { logger } from '../utils/logger.js';

describe('Logger Utility', () => {
  it('should format logs as valid JSON with correct severity', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    logger.info('Test message', { userId: '123' });
    
    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0]);
    
    expect(logOutput.severity).toBe('INFO');
    expect(logOutput.message).toBe('Test message');
    expect(logOutput.userId).toBe('123');
    expect(logOutput.timestamp).toBeDefined();
    
    consoleSpy.mockRestore();
  });

  it('should handle errors with correct severity', () => {
    const consoleSpy = vi.spyOn(console, 'error');
    logger.error('Critical failure');
    
    expect(consoleSpy).toHaveBeenCalled();
    const logOutput = JSON.parse(consoleSpy.mock.calls[0][0]);
    expect(logOutput.severity).toBe('ERROR');
    
    consoleSpy.mockRestore();
  });
});
