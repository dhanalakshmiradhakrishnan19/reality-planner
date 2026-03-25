import { db } from "./firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
export const addTaskToDB = async (task, userId) => {
  await addDoc(collection(db, "tasks"), { ...task, userId });
};
export const updateTask = async (id, data) => {
  const taskRef = doc(db, "tasks", id);
  await updateDoc(taskRef, data);
};
export const deleteTask = async (id) => {
  await deleteDoc(doc(db, "tasks", id));
};
export const subscribeToTasks = (userId, callback) => {
  const q = query(collection(db, "tasks"), where("userId", "==", userId));
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(tasks);
  });
};
