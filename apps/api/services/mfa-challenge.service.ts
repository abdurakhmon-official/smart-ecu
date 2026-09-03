import { Injectable } from '@tsed/di';
import { isRedisReady, redis } from '@/modules/redis';
import { nanoid } from '@/modules/nanoid';

interface LocalEntry {
  userId: string;
  expiresAt: number;
}

@Injectable()
export class MfaChallengeService {
  private static readonly PREFIX = 'mfa-challenge:';
  private static readonly TTL_SECONDS = 5 * 60;
  private static readonly MAX_LOCAL_ENTRIES = 10_000;
  private static readonly SWEEP_INTERVAL_MS = 5 * 60 * 1000;

  private readonly local = new Map<string, LocalEntry>();
  private sweeper?: NodeJS.Timeout;

  $onInit() {
    this.sweeper = setInterval(() => this.sweep(), MfaChallengeService.SWEEP_INTERVAL_MS);
    this.sweeper.unref();
  }

  $onDestroy() {
    if (this.sweeper) clearInterval(this.sweeper);
  }

  async create(userId: string): Promise<string> {
    const token = nanoid();

    if (isRedisReady()) {
      try {
        await redis.set(MfaChallengeService.PREFIX + token, userId, 'EX', MfaChallengeService.TTL_SECONDS);
        return token;
      } catch {

      }
    }

    this.remember(token, userId);
    return token;
  }

  async resolve(token: string): Promise<string | null> {
    if (isRedisReady()) {
      try {
        return await redis.get(MfaChallengeService.PREFIX + token);
      } catch {

      }
    }

    const entry = this.local.get(token);
    if (!entry) return null;
    if (entry.expiresAt <= this.now()) {
      this.local.delete(token);
      return null;
    }

    return entry.userId;
  }

  async invalidate(token: string): Promise<void> {
    if (isRedisReady()) {
      try {
        await redis.del(MfaChallengeService.PREFIX + token);
        return;
      } catch {

      }
    }

    this.local.delete(token);
  }

  private remember(token: string, userId: string) {
    if (this.local.size >= MfaChallengeService.MAX_LOCAL_ENTRIES) {
      const oldest = this.local.keys().next().value;
      if (oldest !== undefined) this.local.delete(oldest);
    }

    this.local.set(token, { userId, expiresAt: this.now() + MfaChallengeService.TTL_SECONDS });
  }

  private sweep() {
    const now = this.now();

    for (const [token, entry] of this.local) {
      if (entry.expiresAt <= now) this.local.delete(token);
    }
  }

  private now(): number {
    return Math.floor(Date.now() / 1000);
  }
}
