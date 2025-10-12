'use server';

import { initializeFirebaseServer } from '@/firebase/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Define a simple interface for the user data we expect
interface UserData {
  id: string;
  email: string | null;
  displayName: string | null;
  isNewUser: boolean;
}

export async function handleUserLogin(userData: UserData) {
  const { firestore } = initializeFirebaseServer();
  const userRef = doc(firestore, 'users', userData.id);

  const dataToSave: any = {
    id: userData.id,
    email: userData.email,
    username: userData.displayName || userData.email?.split('@')[0],
  };

  // Use the boolean passed from the client to determine if it's a new user
  if (userData.isNewUser) {
    dataToSave.createdAt = serverTimestamp();
  }

  try {
    // Use { merge: true } to create the document if it doesn't exist,
    // or update it if it does, without overwriting existing fields like 'tag'.
    await setDoc(userRef, dataToSave, { merge: true });
    console.log('User document written/updated for:', userData.id);
  } catch (error) {
    console.error('Error writing user document:', error);
    // You might want to throw the error or handle it in a specific way
    throw new Error('Failed to update user profile in Firestore.');
  }
}
