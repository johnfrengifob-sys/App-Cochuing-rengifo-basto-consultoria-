import { User, EventRegistration, Session, FormSubmission, PostSessionForm, CronogramaEvent, ProgramNodeInfo, FormsSheetsIntegrationPair } from '../types';

export interface ServerDbHealth {
  status: string;
  message: string;
  databaseFile: string;
  totalUsers: number;
  totalClients: number;
  totalEventRegistrations: number;
  totalWorkshops?: number;
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
  cronogramaEvents?: CronogramaEvent[];
  programNodes?: ProgramNodeInfo[];
  formsSheetsIntegrations?: FormsSheetsIntegrationPair[];
  deletedWorkshopIds?: string[];
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
    cronogramaEvents?: CronogramaEvent[];
    programNodes?: ProgramNodeInfo[];
    formsSheetsIntegrations?: FormsSheetsIntegrationPair[];
    deletedWorkshopIds?: string[];
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

  /**
   * Save a single workshop / cronograma event directly to server DB
   */
  static async saveWorkshop(workshop: CronogramaEvent): Promise<CronogramaEvent | null> {
    try {
      const res = await fetch('/api/db/workshops', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ workshop }),
      });

      if (!res.ok) {
        console.warn('[ServerDbSync] Failed to save workshop to server DB, status:', res.status);
        return null;
      }
      const data = await res.json();
      return data.workshop || null;
    } catch (err) {
      console.warn('[ServerDbSync] Error saving workshop to server DB:', err);
      return null;
    }
  }

  /**
   * Delete a workshop from server DB
   */
  static async deleteWorkshop(workshopId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/db/workshops/${encodeURIComponent(workshopId)}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      return res.ok;
    } catch (err) {
      console.warn('[ServerDbSync] Error deleting workshop from server DB:', err);
      return false;
    }
  }

  /**
   * Fetch all workshops from server DB
   */
  static async fetchWorkshops(): Promise<CronogramaEvent[]> {
    try {
      const res = await fetch('/api/db/workshops', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.workshops) ? data.workshops : (Array.isArray(data.events) ? data.events : []);
    } catch (err) {
      console.warn('[ServerDbSync] Error fetching workshops from server DB:', err);
      return [];
    }
  }

  /**
   * Fetch Google Forms & Sheets integrations from server DB
   */
  static async fetchFormsSheetsIntegrations(): Promise<FormsSheetsIntegrationPair[]> {
    try {
      const res = await fetch('/api/db/forms-sheets-integrations', {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data.integrations) ? data.integrations : [];
    } catch (err) {
      console.warn('[ServerDbSync] Error fetching forms-sheets integrations from server DB:', err);
      return [];
    }
  }

  /**
   * Save Google Forms & Sheets integrations to server DB and propagate
   */
  static async saveFormsSheetsIntegrations(integrations: FormsSheetsIntegrationPair[]): Promise<boolean> {
    try {
      const res = await fetch('/api/db/forms-sheets-integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ integrations }),
      });
      return res.ok;
    } catch (err) {
      console.warn('[ServerDbSync] Error saving forms-sheets integrations to server DB:', err);
      return false;
    }
  }
}
