import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import type { Task } from "../types";

const todoDoc = () => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  return doc(db, "users", user.uid, "data", "todo");
};

export async function loadTasks() {
  const snap = await getDoc(todoDoc());

  if (!snap.exists()) return [];

  return (snap.data().tasks || []) as Task[];
}

export async function saveTasks(tasks: Task[]) {
  await setDoc(todoDoc(), { tasks }, { merge: true });
}

export function subscribeTasks(callback: (tasks: Task[]) => void) {
  return onSnapshot(todoDoc(), (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }

    callback((snap.data().tasks || []) as Task[]);
  });
}