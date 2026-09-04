import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase';
import { Prospect, EventRegistration, Session, User, PaymentRequest, FormSubmission } from '../types';

export class FirestoreSyncService {
  private static isInitialized = false;

  static async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      await testFirestoreConnection();
    } catch (e) {
      console.warn('Firestore initial check notice:', e);
    }
  }

  // Synchronize or save prospect to Firestore
  static async syncProspect(prospect: Prospect): Promise<void> {
    const collectionPath = 'prospects';
    try {
      const prospectRef = doc(db, collectionPath, prospect.id);
      await setDoc(
        prospectRef,
        {
          id: prospect.id,
          name: prospect.name,
          whatsapp: prospect.whatsapp,
          email: prospect.email || null,
          status: prospect.status,
          origin: prospect.origin,
          notes: prospect.notes || '',
          createdAt: prospect.createdAt || new Date().toISOString(),
          matrixSentAt: prospect.matrixSentAt || null,
          session20minDate: prospect.session20minDate || null,
        },
        { merge: true }
      );
    } catch (error) {
      // Non-blocking in preview if offline or rules are restrictive
      console.warn('Firestore syncProspect notice:', error);
    }
  }

  // Synchronize or save event registration
  static async syncEventRegistration(registration: EventRegistration): Promise<void> {
    const collectionPath = 'eventRegistrations';
    try {
      const regRef = doc(db, collectionPath, registration.id);
      await setDoc(
        regRef,
        {
          id: registration.id,
          ticketCode: registration.ticketCode,
          eventId: registration.eventId,
          eventTitle: registration.eventTitle,
          eventDate: registration.eventDate,
          name: registration.name,
          email: registration.email,
          phone: registration.phone,
          registeredAt: registration.registeredAt,
          icfTermsAccepted: registration.icfTermsAccepted,
          privacyTermsAccepted: registration.privacyTermsAccepted,
          attendedEvent: registration.attendedEvent,
          userUid: registration.userUid || null,
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncEventRegistration notice:', error);
    }
  }

  // Synchronize or save session
  static async syncSession(session: Session): Promise<void> {
    const collectionPath = 'sessions';
    try {
      const sessionRef = doc(db, collectionPath, session.id);
      await setDoc(
        sessionRef,
        {
          id: session.id,
          clientId: session.clientId,
          sessionNumber: session.sessionNumber || 1,
          date: session.date,
          meetLink: session.meetLink,
          status: session.status,
          notes: session.notes || '',
          isPaid: Boolean(session.isPaid),
          durationMinutes: session.durationMinutes || 60,
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncSession notice:', error);
    }
  }

  // Synchronize payment request
  static async syncPayment(payment: PaymentRequest): Promise<void> {
    const collectionPath = 'payments';
    try {
      const payRef = doc(db, collectionPath, payment.id);
      await setDoc(
        payRef,
        {
          id: payment.id,
          clientId: payment.clientId,
          voucherCode: `VOUCHER-${payment.id}`,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          concept: payment.concept,
          targetStep: payment.targetStep || 1,
          planType: payment.planType || 'level',
          timestamp: payment.createdAt,
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncPayment notice:', error);
    }
  }

  // Synchronize user profile into Firestore
  static async syncUserProfile(user: User): Promise<void> {
    const collectionPath = 'users';
    try {
      const userRef = doc(db, collectionPath, user.uid);
      await setDoc(
        userRef,
        {
          uid: user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl || '',
          phone: user.phone || '',
          status: user.status || 'active',
          programProgress: user.programProgress || 1,
          programStep: user.programStep || 1,
          company: user.company || '',
          primaryBreakdown: user.primaryBreakdown || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncUserProfile notice:', error);
    }
  }

  // Delete user from Firestore
  static async deleteUser(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.warn('Firestore deleteUser notice:', error);
    }
  }

  // Synchronize form submission into Firestore
  static async syncFormSubmission(form: FormSubmission): Promise<void> {
    const collectionPath = 'formSubmissions';
    try {
      const formRef = doc(db, collectionPath, form.id);
      await setDoc(
        formRef,
        {
          id: form.id,
          clientId: form.clientId,
          sessionId: form.sessionId || '',
          sessionStep: form.sessionStep,
          level: form.level,
          bodyEmotion: form.bodyEmotion || '',
          reflections: form.reflections || '',
          levelSpecificAnswer: form.levelSpecificAnswer || '',
          dynamicAnswers: form.dynamicAnswers || {},
          submittedAt: form.submittedAt,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncFormSubmission notice:', error);
    }
  }

  // Listen to prospects with error handling
  static subscribeToProspects(onUpdate: (prospects: Prospect[]) => void): () => void {
    const collectionPath = 'prospects';
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: Prospect[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push({
              id: docSnap.id,
              name: data.name || '',
              whatsapp: data.whatsapp || '',
              email: data.email || undefined,
              status: data.status || 'matriz_enviada',
              origin: data.origin || 'Conversatorio',
              notes: data.notes,
              matrixSentAt: data.matrixSentAt,
              session20minDate: data.session20minDate,
              convertedAt: data.convertedAt,
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, collectionPath);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to prospects in Firestore:', error);
      return () => {};
    }
  }

  // Fetch all users safely
  static async fetchUsers(): Promise<User[]> {
    const collectionPath = 'users';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      const list: User[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push(data as User);
      });
      return list;
    } catch (error) {
      console.warn('Firestore fetchUsers offline fallback:', error);
      return [];
    }
  }

  // Full synchronization sweep across all collections
  static async syncAllLocalToFirestore(params: {
    users: User[];
    sessions: Session[];
    forms: FormSubmission[];
    prospects: Prospect[];
    payments: PaymentRequest[];
    eventRegistrations: EventRegistration[];
  }): Promise<{ syncedCount: number; errors: number }> {
    let syncedCount = 0;
    let errors = 0;

    for (const u of params.users) {
      try {
        await this.syncUserProfile(u);
        syncedCount++;
      } catch {
        errors++;
      }
    }

    for (const s of params.sessions) {
      try {
        await this.syncSession(s);
        syncedCount++;
      } catch {
        errors++;
      }
    }

    for (const f of params.forms) {
      try {
        await this.syncFormSubmission(f);
        syncedCount++;
      } catch {
        errors++;
      }
    }

    for (const p of params.prospects) {
      try {
        await this.syncProspect(p);
        syncedCount++;
      } catch {
        errors++;
      }
    }

    for (const pay of params.payments) {
      try {
        await this.syncPayment(pay);
        syncedCount++;
      } catch {
        errors++;
      }
    }

    for (const reg of params.eventRegistrations) {
      try {
        await this.syncEventRegistration(reg);
        syncedCount++;
      } catch {
        errors++;
      }
    }

    return { syncedCount, errors };
  }
}

