// FitSync Circuit Breaker & Crash Recovery Service
// Prevents cascade failures by tripping open connections on repetitive service failures

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getFromMockDb, saveToMockDb } from '../mockDb';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private readonly failureThreshold = 3;
  private readonly recoveryThreshold = 2;
  private readonly cooldownPeriodMs = 5000;
  private nextAttemptTime = 0;

  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Execute callback inside circuit breaker wrapper
   */
  async execute<T>(fn: () => Promise<T>, fallbackValue: T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttemptTime) {
        console.warn(`[Circuit Breaker] Half-opening service: ${this.serviceName}`);
        this.state = 'HALF_OPEN';
      } else {
        console.warn(`[Circuit Breaker] Service ${this.serviceName} is tripped open. Executing fallback.`);
        return fallbackValue;
      }
    }

    try {
      const result = await fn();
      if (this.state === 'HALF_OPEN') {
        this.successCount++;
        if (this.successCount >= this.recoveryThreshold) {
          console.log(`[Circuit Breaker] Service ${this.serviceName} fully recovered.`);
          this.state = 'CLOSED';
          this.failureCount = 0;
          this.successCount = 0;
          this.logEvent('close_recovered');
        }
      }
      return result;
    } catch (err) {
      this.failureCount++;
      this.successCount = 0;

      if (this.failureCount >= this.failureThreshold) {
        console.error(`[Circuit Breaker] Tripped open service: ${this.serviceName}`);
        this.state = 'OPEN';
        this.nextAttemptTime = Date.now() + this.cooldownPeriodMs;
        this.logEvent('trip_open');
      }

      return fallbackValue;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  private async logEvent(eventType: 'trip_open' | 'close_recovered'): Promise<void> {
    const payload = {
      service_name: this.serviceName,
      event_type: eventType,
      details: `Breaker state transitioned to: ${eventType}`
    };

    try {
      if (isSupabaseConfigured) {
        await supabase.from('recovery_events').insert(payload);
      } else {
        const events = getFromMockDb<any>('recovery_events');
        events.push({
          id: 'evt-' + Math.random().toString(36).substr(2, 9),
          ...payload,
          created_at: new Date().toISOString()
        });
        saveToMockDb('recovery_events', events);
      }
    } catch {
      // ignore log failures
    }
  }
}

// Instantiate breakers for key dependencies
export const SupabaseBreaker = new CircuitBreaker('supabase');
export const AICoachBreaker = new CircuitBreaker('ai_coach');
