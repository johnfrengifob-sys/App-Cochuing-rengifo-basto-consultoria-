import { User, EventRegistration, Session, FormSubmission, PostSessionForm } from '../types';

export interface ServerDbHealth {
  status: string;
  message: string;
  databaseFile: string;
  totalUsers: number;
  totalClients: number;
  totalEventRegistrations: number;
  lastUpdated: string;
  legadoBarberStatus: string;
  legadoBarberRecord: User | null;
  coachStatus: string;
  storageEngine: string;
}

export interface ServerDbState {
  users: User[];
  eventRegistrations: EventRegistration[];
  sessions: Session[];
  forms: FormSubmission[];
  postSessionForms: PostSessionForm[];
  aiInsights: any[];
  prospects: any[];
  paymentRequests: any[];
  lastUpdated: string;
}

export class ServerDbSyncService {
  private static isSyncing = false;
  private static lastSyncTime = 0;

  /**
   * Health check for server-side persistent database
   */
  static async checkHealth(): Promise<ServerDbHealth | null> {
    try {
      const res = await fetch('/api/db/health', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[ServerDbSync] Health check error:', err);
      return null;
    }
  }

  /**
   * Fetch full state from server database
   */
  static async fetchServerState(): Promise<ServerDbState | null> {
    try {
      const res = await fetch('/api/db/state', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.warn('[ServerDbSync] Fetch state error:', err);
      return null;
    }
  }

  /**
   * Push local changes and merge bidirectional state
   */
  static async syncWithServer(localState: {
    users?: User[];
    eventRegistrations?: EventRegistration[];
    sessions?: Session[];
    forms?: FormSubmission[];
    postSessionForms?: PostSessionForm[];
  }): Promise<ServerDbState | null> {
    if (this.isSyncing) return null;
    this.isSyncing = true;

    try {
      const res = await fetch('/api/db/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(localState),
      });

      if (!res.ok) {
        console.warn('[ServerDbSync] Sync request failed with status:', res.status);
        return null;
      }

      const data = await res.json();
      this.lastSyncTime = Date.now();
      return data.state || null;
    } catch (err) {
      console.warn('[ServerDbSync] Error during bidirectional sync:', err);
      return null;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Save a single user profile directly to server DB
   */
  static async saveUser(user: User): Promise<User | null> {
    try {
      const res = await fetch('/api/db/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch (err) {
      console.warn('[ServerDbSync] Error saving user to server DB:', err);
      return null;
    }
  }

  /**
   * Save an event registration directly to server DB
   */
  static async saveRegistration(registration: EventRegistration): Promise<EventRegistration | null> {
    try {
      const res = await fetch('/api/db/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ registration }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.registration || null;
    } catch (err) {
      console.warn('[ServerDbSync] Error saving registration to server DB:', err);
      return null;
    }
  }

  /**
   * Find user by email on the server database
   */
  static async findUserByEmail(email: string): Promise<User | null> {
    try {
      const res = await fetch(`/api/db/users/${encodeURIComponent(email.trim().toLowerCase())}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch (err) {
      console.warn('[ServerDbSync] Error finding user by email:', err);
      return null;
    }
  }
}
