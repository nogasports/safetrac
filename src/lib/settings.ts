import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';
import type { OrganizationSettings, IntegrationSettings } from '../types/settings';

const SETTINGS_DOC = 'settings/organization';
const INTEGRATIONS_DOC = 'settings/integrations';

export const getOrganizationSettings = async (): Promise<OrganizationSettings | null> => {
  const docRef = doc(db, SETTINGS_DOC);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as OrganizationSettings : null;
};

export const updateOrganizationSettings = async (settings: Partial<OrganizationSettings>) => {
  const docRef = doc(db, SETTINGS_DOC);
  await setDoc(docRef, settings, { merge: true });
};

export const getIntegrationSettings = async (): Promise<IntegrationSettings | null> => {
  const docRef = doc(db, INTEGRATIONS_DOC);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() as IntegrationSettings : null;
};

export const updateIntegrationSettings = async (settings: Partial<IntegrationSettings>) => {
  const docRef = doc(db, INTEGRATIONS_DOC);
  await setDoc(docRef, settings, { merge: true });
};

export const subscribeToSettings = (
  callback: (settings: { organization: OrganizationSettings | null, integrations: IntegrationSettings | null }) => void
) => {
  const orgRef = doc(db, SETTINGS_DOC);
  const intRef = doc(db, INTEGRATIONS_DOC);
  
  let orgSettings: OrganizationSettings | null = null;
  let intSettings: IntegrationSettings | null = null;
  
  const unsubOrg = onSnapshot(orgRef, (doc) => {
    orgSettings = doc.exists() ? doc.data() as OrganizationSettings : null;
    callback({ organization: orgSettings, integrations: intSettings });
  });
  
  const unsubInt = onSnapshot(intRef, (doc) => {
    intSettings = doc.exists() ? doc.data() as IntegrationSettings : null;
    callback({ organization: orgSettings, integrations: intSettings });
  });
  
  return () => {
    unsubOrg();
    unsubInt();
  };
};