import { env } from '../../../../src/config/environment';
import { tokenBlacklistService } from '../../../../src/application/services/TokenBlacklistService';
import { TokenBlacklistCleanupJob } from '../../../../src/infrastructure/maintenance/tokenBlacklistCleanup.job';

jest.mock('../../../../src/application/services/TokenBlacklistService', () => ({
  tokenBlacklistService: {
    cleanupExpired: jest.fn(),
  },
}));

describe('TokenBlacklistCleanupJob', () => {
  const setIntervalSpy = jest.spyOn(global, 'setInterval');
  const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

  beforeEach(() => {
    jest.clearAllMocks();
    (tokenBlacklistService.cleanupExpired as jest.Mock).mockResolvedValue(0);
    setIntervalSpy.mockReturnValue({} as NodeJS.Timeout);
  });

  afterAll(() => {
    setIntervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  test('start calls cleanupExpired and registers interval with configured value', async () => {
    const job = new TokenBlacklistCleanupJob();

    job.start();

    await Promise.resolve();

    expect(tokenBlacklistService.cleanupExpired).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(
      expect.any(Function),
      env.security.tokenBlacklistCleanupIntervalMs,
    );
  });

  test('stop clears the registered interval handle', () => {
    const handle = { unref: jest.fn() } as unknown as NodeJS.Timeout;
    setIntervalSpy.mockReturnValue(handle);

    const job = new TokenBlacklistCleanupJob();
    job.start();
    job.stop();

    expect(clearIntervalSpy).toHaveBeenCalledWith(handle);
  });

  test('start is idempotent and does not register multiple intervals', () => {
    const handle = { unref: jest.fn() } as unknown as NodeJS.Timeout;
    setIntervalSpy.mockReturnValue(handle);

    const job = new TokenBlacklistCleanupJob();
    job.start();
    job.start();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  });
});
