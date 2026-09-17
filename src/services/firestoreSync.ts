import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase';
import {
  Prospect,
  EventRegistration,
  Session,
  User,
  PaymentRequest,
  FormSubmission,
  CronogramaEvent,
  OntologicalExperience,
  PostSessionForm,
  DriveExportedFile,
  TallerRegistroEntry,
  SesionIndividualAcuerdoEntry,
  BitacoraSesionB2BEntry,
  BitacoraTallerEntry,
  FormsSheetsIntegrationPair,
} from '../types';
import { ServerDbSyncService } from './serverDbSync';

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
          memoryPdfUrl: registration.memoryPdfUrl || null,
          commitments: registration.commitments || null,
          keyBreakthrough: registration.keyBreakthrough || null,
          completedAt: registration.completedAt || null,
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncEventRegistration notice:', error);
    }

    // Mirror to persistent server database for absolute resilience
    try {
      ServerDbSyncService.saveRegistration(registration).catch(() => {});
    } catch {
      // ignore
    }
  }

  // Synchronize or save a cronograma event / workshop to Firestore
  static async syncCronogramaEvent(event: CronogramaEvent): Promise<void> {
    const collectionPath = 'cronogramaEvents';
    try {
      const eventRef = doc(db, collectionPath, event.id);
      await setDoc(
        eventRef,
        {
          id: event.id,
          title: event.title,
          subtitle: event.subtitle || '',
          category: event.category,
          eventType: event.eventType || 'Taller',
          date: event.date,
          displayDate: event.displayDate,
          time: event.time,
          mode: event.mode,
          meetUrl: event.meetUrl || '',
          description: event.description,
          imageUrl: event.imageUrl,
          coverImage: event.coverImage || event.imageUrl,
          showOnHome: event.showOnHome !== false,
          capacityType: event.capacityType || 'grupal',
          capacity: event.capacity || 12,
          spotsLeft: event.spotsLeft || 12,
          totalSpots: event.totalSpots || 12,
          priceAmount: event.priceAmount || 180000,
          price: event.price || '$180.000 COP',
          currency: event.currency || 'COP',
          launchDate: event.launchDate || '',
          eventDate: event.eventDate || '',
          facilitator: event.facilitator,
          featured: Boolean(event.featured),
          status: event.status,
          syllabus: event.syllabus || [],
          guidingQuestions: event.guidingQuestions || [],
          supportMaterials: event.supportMaterials || [],
          postWorkshopQuestions: event.postWorkshopQuestions || [],
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncCronogramaEvent notice:', error);
    }
  }

  // Synchronize all workshops to Firestore
  static async syncAllCronogramaEvents(events: CronogramaEvent[]): Promise<void> {
    for (const evt of events) {
      await this.syncCronogramaEvent(evt);
    }
  }

  // Delete workshop / cronograma event from Firestore
  static async deleteCronogramaEvent(id: string): Promise<void> {
    const collectionPath = 'cronogramaEvents';
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (error) {
      console.warn('Firestore deleteCronogramaEvent notice:', error);
    }
  }

  // Synchronize individual experience into Firestore
  static async syncExperience(experience: OntologicalExperience): Promise<void> {
    const collectionPath = 'experiences';
    if (!auth.currentUser) {
      return;
    }
    try {
      const expRef = doc(db, collectionPath, experience.id);
      await setDoc(
        expRef,
        {
          id: experience.id,
          type: experience.type,
          title: experience.title,
          subtitle: experience.subtitle,
          step: experience.step,
          category: experience.category,
          meetUrl: experience.meetUrl || '',
          colorPhotoUrl: experience.colorPhotoUrl || '',
          dateStr: experience.dateStr || '',
          guidingQuestions: experience.guidingQuestions || [],
          blocks: experience.blocks || [],
          isPublished: Boolean(experience.isPublished),
          isTemplate: Boolean(experience.isTemplate),
          templateName: experience.templateName || '',
          badgeLabel: experience.badgeLabel || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncExperience notice:', error);
    }
  }

  // Delete experience from Firestore
  static async deleteExperience(id: string): Promise<void> {
    const collectionPath = 'experiences';
    if (!auth.currentUser) {
      return;
    }
    try {
      const expRef = doc(db, collectionPath, id);
      await deleteDoc(expRef);
    } catch (error) {
      console.warn('Firestore deleteExperience notice:', error);
    }
  }

  // Synchronize all experiences to Firestore
  static async syncAllExperiences(experiences: OntologicalExperience[]): Promise<void> {
    if (!auth.currentUser) {
      return;
    }
    for (const exp of experiences) {
      await this.syncExperience(exp);
    }
  }

  // Fetch experiences from Firestore
  static async fetchExperiences(): Promise<OntologicalExperience[]> {
    const collectionPath = 'experiences';
    if (!auth.currentUser) {
      return [];
    }
    try {
      const snap = await getDocs(collection(db, collectionPath));
      const list: OntologicalExperience[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push(data as OntologicalExperience);
      });
      return list;
    } catch (error) {
      console.warn('Firestore fetchExperiences fallback:', error);
      return [];
    }
  }

  // Subscribe to real-time experiences updates (only when authenticated)
  static subscribeToExperiences(onUpdate: (experiences: OntologicalExperience[]) => void): () => void {
    const collectionPath = 'experiences';
    // Firebase Skill rule: Only attach onSnapshot listeners if auth is ready and user is authenticated
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: OntologicalExperience[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            list.push(data as OntologicalExperience);
          });
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore subscribeToExperiences notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to experiences in Firestore:', error);
      return () => {};
    }
  }

  // Subscribe to real-time sessions updates for a client (only when authenticated)
  static subscribeToClientSessions(clientId: string, onUpdate: (sessions: Session[]) => void): () => void {
    const collectionPath = 'sessions';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: Session[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.clientId === clientId) {
              list.push(data as Session);
            }
          });
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore subscribeToClientSessions notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to sessions in Firestore:', error);
      return () => {};
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
          ontologicalFocus: session.ontologicalFocus || '',
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncSession notice:', error);
    }
  }

  // Delete session from Firestore
  static async deleteSession(sessionId: string): Promise<void> {
    const collectionPath = 'sessions';
    try {
      const sessionRef = doc(db, collectionPath, sessionId);
      await deleteDoc(sessionRef);
    } catch (error) {
      console.warn('Firestore deleteSession notice:', error);
    }
  }

  // Synchronize post-session form (Cuestionario Posterior / Bitácora) to Firestore
  static async syncPostSessionForm(form: PostSessionForm): Promise<void> {
    const collectionPath = 'postSessionForms';
    try {
      const formRef = doc(db, collectionPath, form.id);
      await setDoc(
        formRef,
        {
          id: form.id,
          sessionId: form.sessionId,
          sessionNumber: form.sessionNumber,
          clientId: form.clientId,
          clientName: form.clientName,
          sessionDate: form.sessionDate,
          submittedAt: form.submittedAt,
          emergentTopic: form.emergentTopic || '',
          discovery: form.discovery || '',
          actionStep: form.actionStep || '',
          cycleHarvest: form.cycleHarvest || null,
          isCycleMilestone: Boolean(form.isCycleMilestone),
          cycleNumber: form.cycleNumber || Math.ceil(form.sessionNumber / 4),
          sessionPhase: form.sessionPhase || (form.isCycleMilestone ? 'consolidation' : 'exploration'),
          openingQuestion: form.openingQuestion || '¿Qué es importante para ti traer a este espacio hoy?',
          coacheeEmotionAndOpenness: form.coacheeEmotionAndOpenness || '',
          masterJudgmentAndNarrative: form.masterJudgmentAndNarrative || '',
          perspectiveShiftEvidence: form.perspectiveShiftEvidence || '',
          directivenessAndIcfCompetency: form.directivenessAndIcfCompetency || '',
          workbookTitle: form.workbookTitle || '',
          somaticHomework: form.somaticHomework || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncPostSessionForm notice:', error);
    }
  }

  // Subscribe to real-time post session forms for a client
  static subscribeToClientPostForms(clientId: string, onUpdate: (forms: PostSessionForm[]) => void): () => void {
    const collectionPath = 'postSessionForms';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: PostSessionForm[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.clientId === clientId) {
              list.push(data as PostSessionForm);
            }
          });
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore subscribeToClientPostForms notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to postSessionForms in Firestore:', error);
      return () => {};
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
          title: user.title || 'Participante Activo',
          avatarUrl: user.avatarUrl || '',
          phone: user.phone || '',
          status: user.status || 'active',
          programProgress: user.programProgress || 1,
          programStep: user.programStep || 1,
          company: user.company || '',
          notes: user.notes || '',
          primaryBreakdown: user.primaryBreakdown || '',
          paymentStatus: user.paymentStatus || 'Pago Único',
          joinedAt: user.joinedAt || new Date().toISOString().split('T')[0],
          transformationSpacesEnabled: user.transformationSpacesEnabled ?? true,
          welcomeMessage: user.welcomeMessage || '',
          completedWorkshopIds: user.completedWorkshopIds || [],
          enrolledWorkshopIds: user.enrolledWorkshopIds || [],
          workshopMemories: user.workshopMemories || {},
          hasWorkshopsAccess: user.hasWorkshopsAccess ?? true,
          hasSessionsAccess: user.hasSessionsAccess ?? true,
          programAccessLevel: user.programAccessLevel || 'premium',
          authorizedForOneOnOne: Boolean(user.authorizedForOneOnOne),
          oneOnOnePackagePurchased: Boolean(user.oneOnOnePackagePurchased),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncUserProfile notice:', error);
    }

    // Mirror to persistent server database for absolute resilience
    try {
      ServerDbSyncService.saveUser(user).catch(() => {});
    } catch {
      // ignore
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

  // Clean old dummy user accounts from Firestore
  static async cleanOldDummyUsersFromFirestore(): Promise<void> {
    const dummyUids = [
      'client-1',
      'client-2',
      'client-3',
      'client-4',
      'client-5',
      'client-6',
      'client-andres',
    ];
    for (const uid of dummyUids) {
      try {
        await this.deleteUser(uid);
      } catch {
        // ignore
      }
    }
  }

  // Wipe all clients, sessions, forms, payments and registrations from Firestore
  static async wipeAllFirestoreData(): Promise<{ success: boolean; deletedCount: number }> {
    let deletedCount = 0;
    const collectionsToClear = [
      'sessions',
      'formSubmissions',
      'postSessionForms',
      'eventRegistrations',
      'payments',
      'prospects',
      'aiInsights',
    ];

    for (const colName of collectionsToClear) {
      try {
        const snap = await getDocs(collection(db, colName));
        for (const docSnap of snap.docs) {
          try {
            await deleteDoc(doc(db, colName, docSnap.id));
            deletedCount++;
          } catch {
            // ignore item failure
          }
        }
      } catch (e) {
        console.warn(`Could not clear Firestore collection ${colName}:`, e);
      }
    }

    // Clear non-coach users from users collection
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data() as User;
        if (
          userData.role !== 'coach' &&
          userData.email !== 'rengifobastoco@gmail.com'
        ) {
          try {
            await deleteDoc(doc(db, 'users', userDoc.id));
            deletedCount++;
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      console.warn('Could not clear Firestore users collection:', e);
    }

    // Explicitly delete known test client IDs
    const knownClientIds = [
      'client-carolina',
      'client-andres',
      'client-1',
      'client-2',
      'client-3',
      'client-4',
      'client-5',
      'client-6',
    ];
    for (const cid of knownClientIds) {
      try {
        await this.deleteUser(cid);
      } catch {
        // ignore
      }
    }

    return { success: true, deletedCount };
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

  // Listen to prospects with error handling (only when authenticated)
  static subscribeToProspects(onUpdate: (prospects: Prospect[]) => void): () => void {
    const collectionPath = 'prospects';
    // Firebase Skill rule: Only attach onSnapshot listeners if auth is ready and user is authenticated
    if (!auth.currentUser) {
      return () => {};
    }
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
          console.warn('Firestore subscribeToProspects notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to prospects in Firestore:', error);
      return () => {};
    }
  }

  // Listen to user profile changes in real-time
  static subscribeToUserProfile(uid: string, onUpdate: (user: User) => void): () => void {
    const collectionPath = 'users';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const userRef = doc(db, collectionPath, uid);
      return onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            onUpdate(docSnap.data() as User);
          }
        },
        (error) => {
          console.warn('Firestore subscribeToUserProfile notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to user profile in Firestore:', error);
      return () => {};
    }
  }

  // Listen to cronograma events / workshops in real-time
  static subscribeToCronogramaEvents(onUpdate: (events: CronogramaEvent[]) => void): () => void {
    const collectionPath = 'cronogramaEvents';
    if (!auth.currentUser) {
      return () => {};
    }
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: CronogramaEvent[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CronogramaEvent);
          });
          if (list.length > 0) {
            onUpdate(list);
          }
        },
        (error) => {
          console.warn('Firestore subscribeToCronogramaEvents notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to cronogramaEvents in Firestore:', error);
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
        if (data && (data as User).email) {
          list.push(data as User);
        }
      });
      return list;
    } catch (error) {
      console.warn('Firestore fetchUsers notice (fallback to local):', error);
      return [];
    }
  }

  // Fetch all event registrations safely
  static async fetchEventRegistrations(): Promise<EventRegistration[]> {
    const collectionPath = 'eventRegistrations';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      const list: EventRegistration[] = [];
      snap.forEach((d) => {
        const data = d.data() as EventRegistration;
        if (data && (data.ticketCode || data.email)) {
          list.push(data);
        }
      });
      return list;
    } catch (error) {
      console.warn('Firestore fetchEventRegistrations notice:', error);
      return [];
    }
  }

  // Subscribe to real-time users collection updates
  static subscribeToUsers(onUpdate: (users: User[]) => void): () => void {
    const collectionPath = 'users';
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: User[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as User;
            if (data && data.email) {
              list.push(data);
            }
          });
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore subscribeToUsers notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to users in Firestore:', error);
      return () => {};
    }
  }

  // Subscribe to real-time event registrations
  static subscribeToEventRegistrations(
    onUpdate: (registrations: EventRegistration[]) => void
  ): () => void {
    const collectionPath = 'eventRegistrations';
    try {
      const q = collection(db, collectionPath);
      return onSnapshot(
        q,
        (snapshot) => {
          const list: EventRegistration[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as EventRegistration;
            if (data && (data.ticketCode || data.email)) {
              list.push(data);
            }
          });
          onUpdate(list);
        },
        (error) => {
          console.warn('Firestore subscribeToEventRegistrations notice:', error);
        }
      );
    } catch (error) {
      console.warn('Could not subscribe to eventRegistrations in Firestore:', error);
      return () => {};
    }
  }

  // Fetch a user document from Firestore directly by UID (bypasses collection listing)
  static async fetchUserByUid(uid: string): Promise<User | null> {
    if (!uid) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        return snap.data() as User;
      }
    } catch (e) {
      console.warn('fetchUserByUid notice:', e);
    }
    return null;
  }

  // Fetch all sessions for a specific client from Firestore
  static async fetchClientSessions(clientId: string): Promise<Session[]> {
    if (!clientId) return [];
    try {
      const q = query(collection(db, 'sessions'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      const results: Session[] = [];
      snap.forEach((d) => {
        results.push(d.data() as Session);
      });
      return results;
    } catch (e) {
      console.warn('fetchClientSessions notice:', e);
      return [];
    }
  }

  // Fetch all post-session forms for a specific client from Firestore
  static async fetchClientPostForms(clientId: string): Promise<PostSessionForm[]> {
    if (!clientId) return [];
    try {
      const q = query(collection(db, 'postSessionForms'), where('clientId', '==', clientId));
      const snap = await getDocs(q);
      const results: PostSessionForm[] = [];
      snap.forEach((d) => {
        results.push(d.data() as PostSessionForm);
      });
      return results;
    } catch (e) {
      console.warn('fetchClientPostForms notice:', e);
      return [];
    }
  }

  // Look up a user in Firestore by email or uid
  static async findUserInFirestoreByEmail(email: string, uid?: string): Promise<User | null> {
    if (!email && !uid) return null;
    const cleanEmail = (email || '').trim().toLowerCase();

    // 1. If UID provided, fetch directly via owner permission (fastest & compliant)
    if (uid) {
      const byUid = await this.fetchUserByUid(uid);
      if (byUid) return byUid;
    }

    // 2. Try finding in users collection
    if (cleanEmail) {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        for (const d of usersSnap.docs) {
          const u = d.data() as User;
          if (u && u.email && u.email.trim().toLowerCase() === cleanEmail) {
            return u;
          }
        }
      } catch (e) {
        console.warn('findUserInFirestoreByEmail in users notice:', e);
      }
    }

    // 3. Try finding in eventRegistrations collection
    if (cleanEmail) {
      try {
        const regSnap = await getDocs(collection(db, 'eventRegistrations'));
        for (const d of regSnap.docs) {
          const reg = d.data() as EventRegistration;
          if (reg && reg.email && reg.email.trim().toLowerCase() === cleanEmail) {
            const synthesizedUser: User = {
              uid: reg.userUid || uid || `client-${Date.now()}`,
              name: reg.name || cleanEmail.split('@')[0],
              email: cleanEmail,
              phone: reg.phone || '',
              role: 'client',
              title: 'Participante Activo',
              avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
              joinedAt: reg.registeredAt
                ? reg.registeredAt.split('T')[0]
                : new Date().toISOString().split('T')[0],
              programProgress: 1,
              programStep: 1,
              paymentStatus: 'Pago Único',
              programName: 'Certeza, Fronteras & Dirección Personal',
              programFee: '$1.500.000 COP',
              status: 'active',
              transformationSpacesEnabled: true,
              hasWorkshopsAccess: true,
              hasSessionsAccess: true,
              completedWorkshopIds: [],
              enrolledWorkshopIds: ['taller-1-raiz'],
              workshopMemories: {},
              welcomeMessage: 'Bienvenido a tu Espacio Ontológico de Consultoría RBC.',
              programAccessLevel: 'premium',
            };
            return synthesizedUser;
          }
        }
      } catch (e) {
        console.warn('findUserInFirestoreByEmail in eventRegistrations notice:', e);
      }
    }

    // 4. Try finding in persistent server database (ensures legadobarber2026 and all clients are resolved even if Firestore is offline)
    if (cleanEmail) {
      try {
        const serverUser = await ServerDbSyncService.findUserByEmail(cleanEmail);
        if (serverUser) {
          return serverUser;
        }
      } catch (e) {
        console.warn('findUserInFirestoreByEmail in server DB notice:', e);
      }
    }

    return null;
  }

  // Pull all cloud records to keep client store in sync
  static async syncAllFromFirestore(): Promise<{
    usersCount: number;
    regsCount: number;
    tallerRegistrosCount: number;
    formsSheetsCount: number;
  }> {
    try {
      const [remoteUsers, remoteRegs, remoteTalleres, remoteIntegrations] = await Promise.all([
        this.fetchUsers(),
        this.fetchEventRegistrations(),
        this.fetchTallerRegistros(),
        this.fetchFormsSheetsIntegrations(),
      ]);
      return {
        usersCount: remoteUsers.length,
        regsCount: remoteRegs.length,
        tallerRegistrosCount: remoteTalleres.length,
        formsSheetsCount: remoteIntegrations.length,
      };
    } catch (e) {
      console.warn('syncAllFromFirestore notice:', e);
      return { usersCount: 0, regsCount: 0, tallerRegistrosCount: 0, formsSheetsCount: 0 };
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
    tallerRegistros?: TallerRegistroEntry[];
    sesionIndividualAcuerdos?: SesionIndividualAcuerdoEntry[];
    bitacorasSesionesB2B?: BitacoraSesionB2BEntry[];
    bitacorasTalleres?: BitacoraTallerEntry[];
    formsSheetsIntegrations?: FormsSheetsIntegrationPair[];
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

    if (params.tallerRegistros && params.tallerRegistros.length > 0) {
      for (const tr of params.tallerRegistros) {
        try {
          await this.syncTallerRegistro(tr);
          syncedCount++;
        } catch {
          errors++;
        }
      }
    }

    if (params.sesionIndividualAcuerdos && params.sesionIndividualAcuerdos.length > 0) {
      for (const sia of params.sesionIndividualAcuerdos) {
        try {
          await this.syncSesionIndividualAcuerdo(sia);
          syncedCount++;
        } catch {
          errors++;
        }
      }
    }

    if (params.bitacorasSesionesB2B && params.bitacorasSesionesB2B.length > 0) {
      for (const b2b of params.bitacorasSesionesB2B) {
        try {
          await this.syncBitacoraSesionB2B(b2b);
          syncedCount++;
        } catch {
          errors++;
        }
      }
    }

    if (params.bitacorasTalleres && params.bitacorasTalleres.length > 0) {
      for (const bt of params.bitacorasTalleres) {
        try {
          await this.syncBitacoraTaller(bt);
          syncedCount++;
        } catch {
          errors++;
        }
      }
    }

    if (params.formsSheetsIntegrations && params.formsSheetsIntegrations.length > 0) {
      for (const pair of params.formsSheetsIntegrations) {
        try {
          await this.syncFormsSheetsIntegration(pair);
          syncedCount++;
        } catch {
          errors++;
        }
      }
    }

    return { syncedCount, errors };
  }

  // Synchronize Workspace Document into Firestore (Cerebro General)
  static async syncWorkspaceDocument(docData: DriveExportedFile): Promise<void> {
    const collectionPath = 'workspaceDocuments';
    try {
      const docRef = doc(db, collectionPath, docData.id);
      await setDoc(
        docRef,
        {
          id: docData.id,
          name: docData.name,
          mimeType: docData.mimeType,
          webViewLink: docData.webViewLink,
          uploadedAt: docData.uploadedAt || new Date().toISOString(),
          sizeFormatted: docData.sizeFormatted || '',
          category: docData.category,
          description: docData.description || '',
          tags: docData.tags || [],
          clientId: docData.clientId || null,
          clientName: docData.clientName || null,
          isBrainDocument: docData.isBrainDocument ?? true,
          contentSnippet: docData.contentSnippet || '',
          fullContent: docData.fullContent || '',
          axiomaClave: docData.axiomaClave || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncWorkspaceDocument notice:', error);
    }
  }

  // Delete Workspace Document from Firestore
  static async deleteWorkspaceDocument(id: string): Promise<void> {
    const collectionPath = 'workspaceDocuments';
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (error) {
      console.warn('Firestore deleteWorkspaceDocument notice:', error);
    }
  }

  // Fetch all Workspace Documents from Firestore
  static async fetchWorkspaceDocuments(): Promise<DriveExportedFile[]> {
    const collectionPath = 'workspaceDocuments';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      if (snap.empty) return [];
      return snap.docs.map((d) => d.data() as DriveExportedFile);
    } catch (error) {
      console.warn('Firestore fetchWorkspaceDocuments notice:', error);
      return [];
    }
  }

  // Real-time subscription to Workspace Documents in Firestore
  static subscribeToWorkspaceDocuments(
    onUpdate: (docs: DriveExportedFile[]) => void
  ): () => void {
    const collectionPath = 'workspaceDocuments';
    try {
      const unsubscribe = onSnapshot(
        collection(db, collectionPath),
        (snap) => {
          const docs = snap.docs.map((d) => d.data() as DriveExportedFile);
          onUpdate(docs);
        },
        (error) => {
          console.warn('Firestore subscribeToWorkspaceDocuments notice:', error);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn('Firestore subscribe error:', error);
      return () => {};
    }
  }

  // Batch sync workspace documents to Firestore
  static async syncAllWorkspaceDocuments(docs: DriveExportedFile[]): Promise<number> {
    let count = 0;
    for (const d of docs) {
      try {
        await this.syncWorkspaceDocument(d);
        count++;
      } catch {
        // ignore single fail
      }
    }
    return count;
  }

  // ==========================================
  // GOOGLE FORMS & SHEETS INTEGRATED COLLECTIONS
  // ==========================================

  // 1. Talleres (Registro General & Acuerdos de Participantes)
  static async syncTallerRegistro(entry: TallerRegistroEntry): Promise<void> {
    const collectionPath = 'tallerRegistros';
    try {
      const ref = doc(db, collectionPath, entry.id);
      await setDoc(
        ref,
        {
          id: entry.id,
          timestamp: entry.timestamp || new Date().toISOString(),
          email: entry.email || '',
          participantName: entry.participantName || '',
          phone: entry.phone || '',
          confidentialityAccepted: entry.confidentialityAccepted !== false,
          aiConsentAccepted: entry.aiConsentAccepted !== false,
          conductAgreed: entry.conductAgreed !== false,
          groupConfidentialityAccepted: entry.confidentialityAccepted !== false,
          aiAdministrativeSupportAccepted: entry.aiConsentAccepted !== false,
          ethicalStandardsAccepted: entry.conductAgreed !== false,
          matchedWorkshopId: entry.matchedWorkshopId || entry.matchedEventId || null,
          matchedWorkshopTitle: entry.matchedWorkshopTitle || entry.matchedEventTitle || null,
          matchedEventId: entry.matchedEventId || entry.matchedWorkshopId || null,
          matchedEventTitle: entry.matchedEventTitle || entry.matchedWorkshopTitle || null,
          matchedDate: entry.matchedDate || null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncTallerRegistro notice:', error);
    }
  }

  static async syncAllTallerRegistros(entries: TallerRegistroEntry[]): Promise<number> {
    let count = 0;
    for (const e of entries) {
      try {
        await this.syncTallerRegistro(e);
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  static async deleteTallerRegistro(id: string): Promise<void> {
    const collectionPath = 'tallerRegistros';
    try {
      await deleteDoc(doc(db, collectionPath, id));
    } catch (error) {
      console.warn('Firestore deleteTallerRegistro notice:', error);
    }
  }

  static async fetchTallerRegistros(): Promise<TallerRegistroEntry[]> {
    const collectionPath = 'tallerRegistros';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      if (snap.empty) return [];
      return snap.docs.map((d) => d.data() as TallerRegistroEntry);
    } catch (error) {
      console.warn('Firestore fetchTallerRegistros notice:', error);
      return [];
    }
  }

  static subscribeToTallerRegistros(
    onUpdate: (entries: TallerRegistroEntry[]) => void
  ): () => void {
    const collectionPath = 'tallerRegistros';
    try {
      const unsubscribe = onSnapshot(
        collection(db, collectionPath),
        (snap) => {
          const entries = snap.docs.map((d) => d.data() as TallerRegistroEntry);
          onUpdate(entries);
        },
        (error) => {
          console.warn('Firestore subscribeToTallerRegistros notice:', error);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn('Firestore subscribeToTallerRegistros error:', error);
      return () => {};
    }
  }

  // 2. Sesiones Individuales (Acuerdos Co-creativos de Trabajo)
  static async syncSesionIndividualAcuerdo(entry: SesionIndividualAcuerdoEntry): Promise<void> {
    const collectionPath = 'sesionIndividualAcuerdos';
    try {
      const ref = doc(db, collectionPath, entry.id);
      await setDoc(
        ref,
        {
          id: entry.id,
          timestamp: entry.timestamp || new Date().toISOString(),
          email: entry.email || '',
          fullName: entry.fullName || '',
          phone: entry.phone || '',
          coachingScopeAccepted: entry.coachingScopeAccepted !== false,
          commitmentAccepted: entry.commitmentAccepted !== false,
          techSupportAuthorized: entry.techSupportAuthorized !== false,
          aiScopeClarificationAccepted: entry.aiScopeClarificationAccepted !== false,
          confidentialityAccepted: entry.confidentialityAccepted !== false,
          digitalSignatureAndIdNumber: entry.digitalSignatureAndIdNumber || '',
          mergedDocId: entry.mergedDocId || null,
          mergedDocUrl: entry.mergedDocUrl || null,
          linkToMergedDoc: entry.linkToMergedDoc || null,
          documentMergeStatus: entry.documentMergeStatus || 'Registrado en Firestore',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncSesionIndividualAcuerdo notice:', error);
    }
  }

  static async syncAllSesionIndividualAcuerdos(entries: SesionIndividualAcuerdoEntry[]): Promise<number> {
    let count = 0;
    for (const e of entries) {
      try {
        await this.syncSesionIndividualAcuerdo(e);
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  static async fetchSesionIndividualAcuerdos(): Promise<SesionIndividualAcuerdoEntry[]> {
    const collectionPath = 'sesionIndividualAcuerdos';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      if (snap.empty) return [];
      return snap.docs.map((d) => d.data() as SesionIndividualAcuerdoEntry);
    } catch (error) {
      console.warn('Firestore fetchSesionIndividualAcuerdos notice:', error);
      return [];
    }
  }

  // 3. Bitácora de Sesiones B2B
  static async syncBitacoraSesionB2B(entry: BitacoraSesionB2BEntry): Promise<void> {
    const collectionPath = 'bitacorasSesionesB2B';
    try {
      const ref = doc(db, collectionPath, entry.id);
      await setDoc(
        ref,
        {
          id: entry.id,
          timestamp: entry.timestamp || new Date().toISOString(),
          email: entry.email || '',
          fullName: entry.fullName || '',
          city: entry.city || '',
          centralChallenge: entry.centralChallenge || '',
          primaryEmotion: entry.primaryEmotion || '',
          limitingBeliefsAndJudgments: entry.limitingBeliefsAndJudgments || '',
          realizationOrPerspective: entry.realizationOrPerspective || '',
          balanceAreaNeeded: entry.balanceAreaNeeded || '',
          valuableLearning: entry.valuableLearning || '',
          concreteActionCommitment: entry.concreteActionCommitment || '',
          digitalValidationSignatureAndId: entry.digitalValidationSignatureAndId || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncBitacoraSesionB2B notice:', error);
    }
  }

  static async syncAllBitacorasSesionesB2B(entries: BitacoraSesionB2BEntry[]): Promise<number> {
    let count = 0;
    for (const e of entries) {
      try {
        await this.syncBitacoraSesionB2B(e);
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  static async fetchBitacorasSesionesB2B(): Promise<BitacoraSesionB2BEntry[]> {
    const collectionPath = 'bitacorasSesionesB2B';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      if (snap.empty) return [];
      return snap.docs.map((d) => d.data() as BitacoraSesionB2BEntry);
    } catch (error) {
      console.warn('Firestore fetchBitacorasSesionesB2B notice:', error);
      return [];
    }
  }

  // 4. Bitácora de Talleres
  static async syncBitacoraTaller(entry: BitacoraTallerEntry): Promise<void> {
    const collectionPath = 'bitacorasTalleres';
    try {
      const ref = doc(db, collectionPath, entry.id);
      await setDoc(
        ref,
        {
          id: entry.id,
          timestamp: entry.timestamp || new Date().toISOString(),
          email: entry.email || '',
          fullName: entry.fullName || '',
          city: entry.city || '',
          workshopLevel: entry.workshopLevel || '',
          personalChallenge: entry.personalChallenge || '',
          predominantEmotion: entry.predominantEmotion || '',
          limitingTruths: entry.limitingTruths || '',
          newDiscovery: entry.newDiscovery || '',
          lifeBalanceMessage: entry.lifeBalanceMessage || '',
          mostValuableLearning: entry.mostValuableLearning || '',
          concreteCommitmentAction: entry.concreteCommitmentAction || '',
          digitalValidationSignatureAndId: entry.digitalValidationSignatureAndId || '',
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncBitacoraTaller notice:', error);
    }
  }

  static async syncAllBitacorasTalleres(entries: BitacoraTallerEntry[]): Promise<number> {
    let count = 0;
    for (const e of entries) {
      try {
        await this.syncBitacoraTaller(e);
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  static async fetchBitacorasTalleres(): Promise<BitacoraTallerEntry[]> {
    const collectionPath = 'bitacorasTalleres';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      if (snap.empty) return [];
      return snap.docs.map((d) => d.data() as BitacoraTallerEntry);
    } catch (error) {
      console.warn('Firestore fetchBitacorasTalleres notice:', error);
      return [];
    }
  }

  // 5. Configuración y Estado de Pares Google Forms & Sheets
  static async syncFormsSheetsIntegration(pair: FormsSheetsIntegrationPair): Promise<void> {
    const collectionPath = 'formsSheetsIntegrations';
    try {
      const ref = doc(db, collectionPath, pair.id);
      await setDoc(
        ref,
        {
          id: pair.id,
          title: pair.title,
          sheetId: pair.sheetId || '',
          sheetTabName: pair.sheetTabName || '',
          formUrl: pair.formUrl || '',
          sheetUrl: pair.sheetUrl || '',
          sheetEmbedUrl: pair.sheetEmbedUrl || '',
          status: pair.status || 'connected',
          lastSyncedAt: pair.lastSyncedAt || new Date().toISOString(),
          recordsCount: pair.recordsCount || 0,
          notes: pair.notes || '',
          webhookUrl: pair.webhookUrl || '',
          targetDatabaseCollection: pair.targetDatabaseCollection || pair.id,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.warn('Firestore syncFormsSheetsIntegration notice:', error);
    }
  }

  static async syncAllFormsSheetsIntegrations(pairs: FormsSheetsIntegrationPair[]): Promise<number> {
    let count = 0;
    for (const p of pairs) {
      try {
        await this.syncFormsSheetsIntegration(p);
        count++;
      } catch {
        // continue
      }
    }
    return count;
  }

  static async fetchFormsSheetsIntegrations(): Promise<FormsSheetsIntegrationPair[]> {
    const collectionPath = 'formsSheetsIntegrations';
    try {
      const snap = await getDocs(collection(db, collectionPath));
      if (snap.empty) return [];
      return snap.docs.map((d) => d.data() as FormsSheetsIntegrationPair);
    } catch (error) {
      console.warn('Firestore fetchFormsSheetsIntegrations notice:', error);
      return [];
    }
  }

  static subscribeToFormsSheetsIntegrations(
    onUpdate: (pairs: FormsSheetsIntegrationPair[]) => void
  ): () => void {
    const collectionPath = 'formsSheetsIntegrations';
    try {
      const unsubscribe = onSnapshot(
        collection(db, collectionPath),
        (snap) => {
          const pairs = snap.docs.map((d) => d.data() as FormsSheetsIntegrationPair);
          onUpdate(pairs);
        },
        (error) => {
          console.warn('Firestore subscribeToFormsSheetsIntegrations notice:', error);
        }
      );
      return unsubscribe;
    } catch (error) {
      console.warn('Firestore subscribeToFormsSheetsIntegrations error:', error);
      return () => {};
    }
  }
}


