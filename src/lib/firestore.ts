import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { BusinessClinicReport, BusinessIdea, UserProfile } from '../types';
import { db } from './firebase';

export interface UserWorkspaceSnapshot {
  clinicInput: string | null;
  createdAt?: string;
  profile: UserProfile | null;
  ideas: BusinessIdea[];
  clinicReport: BusinessClinicReport | null;
  updatedAt: string;
}

const usersCollection = 'users';

export async function loadWorkspace(uid: string): Promise<UserWorkspaceSnapshot | null> {
  if (!db) {
    return null;
  }

  const snapshot = await getDoc(doc(db, usersCollection, uid));
  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserWorkspaceSnapshot;
}

export async function ensureWorkspace(uid: string) {
  if (!db) {
    return;
  }

  const now = new Date().toISOString();

  await setDoc(
    doc(db, usersCollection, uid),
    {
      clinicInput: null,
      profile: null,
      ideas: [],
      clinicReport: null,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function saveWorkspace(uid: string, data: Partial<UserWorkspaceSnapshot>) {
  if (!db) {
    return;
  }

  await setDoc(
    doc(db, usersCollection, uid),
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
