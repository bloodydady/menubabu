import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, SUPER_ADMIN_EMAIL } from "../firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [ownerRestaurant, setOwnerRestaurant] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        if (firebaseUser.email === SUPER_ADMIN_EMAIL) {
          setIsSuperAdmin(true);
          setOwnerRestaurant(null);
        } else {
          setIsSuperAdmin(false);
          // check if this user is an owner of any restaurant
          try {
            const q = query(
              collection(db, "restaurants"),
              where("ownerEmail", "==", firebaseUser.email)
            );
            const snap = await getDocs(q);
            if (!snap.empty) {
              const docData = snap.docs[0];
              setOwnerRestaurant({ id: docData.id, ...docData.data() });
            } else {
              setOwnerRestaurant(null);
            }
          } catch (e) {
            setOwnerRestaurant(null);
          }
        }
      } else {
        setUser(null);
        setIsSuperAdmin(false);
        setOwnerRestaurant(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{ user, loading, isSuperAdmin, ownerRestaurant, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
