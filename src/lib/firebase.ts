import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
// Safely load Firebase configuration from local file if present, or environment variables
const getFirebaseConfig = () => {
  let localConfig: any = null;
  try {
    const meta = import.meta as any;
    if (meta && typeof meta.glob === 'function') {
      const modules = meta.glob('../../firebase-applet-config.json', { eager: true });
      const match = modules['../../firebase-applet-config.json'] as any;
      if (match && match.default) {
        localConfig = match.default;
      }
    }
  } catch (e) {
    // Local config file not present in repository
  }

  if (localConfig && localConfig.apiKey && !localConfig.apiKey.includes('YOUR_')) {
    return localConfig;
  }

  const env = (import.meta as any).env || {};

  return {
    projectId: env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0688962560",
    appId: env.VITE_FIREBASE_APP_ID || "1:695536203828:web:667a37f616ee64ff133261",
    apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyAenwaWJqaL4N6kBslUfFeDSh4usLDdyaE",
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0688962560.firebaseapp.com",
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0688962560.firebasestorage.app",
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "695536203828",
    measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "",
    oAuthClientId: env.VITE_FIREBASE_OAUTH_CLIENT_ID || "695536203828-qol4e2asjonr8mrnglk2lu6kcoir1ait.apps.googleusercontent.com",
    recaptchaSiteKey: ""
  };
};

const firebaseConfig = getFirebaseConfig();
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Wait for sign in or user re-auth
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google access token from sign-in.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
