import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
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
} from '../types';

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
          avatarUrl: user.avatarUrl || '',
          phone: user.phone || '',
          status: user.status || 'active',
          programProgress: user.programProgress || 1,
          programStep: user.programStep || 1,
          company: user.company || '',
          primaryBreakdown: user.primaryBreakdown || '',
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

