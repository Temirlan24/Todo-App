import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD-HAwl96oIUolKqJoeKIuSeK08YpysMnQ',
  authDomain: 'todo-app-ab381.firebaseapp.com',
  projectId: 'todo-app-ab381',
  storageBucket: 'todo-app-ab381.firebasestorage.app',
  messagingSenderId: '1005318047239',
  appId: '1:1005318047239:web:b98312ade2fa0f54768ca2',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
