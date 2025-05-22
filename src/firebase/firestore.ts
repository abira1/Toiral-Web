import { collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';
// Collection references
const companyRef = collection(db, 'company');
const teamRef = collection(db, 'team');
const portfolioRef = collection(db, 'portfolio');
const reviewsRef = collection(db, 'reviews');
const bookingsRef = collection(db, 'bookings');
const messagesRef = collection(db, 'messages');
const settingsRef = collection(db, 'settings');
// Company operations
export const getCompanyData = async () => {
  const docRef = doc(companyRef, 'profile');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
export const updateCompanyData = async (data: any) => {
  const docRef = doc(companyRef, 'profile');
  await setDoc(docRef, data, {
    merge: true
  });
};
// Team operations
export const addTeamMember = async (member: any) => {
  const docRef = doc(teamRef, member.id);
  await setDoc(docRef, member);
};
export const removeTeamMember = async (id: string) => {
  await deleteDoc(doc(teamRef, id));
};
// Portfolio operations
export const addPortfolioItem = async (item: any) => {
  const docRef = doc(portfolioRef, item.id);
  await setDoc(docRef, item);
};
export const removePortfolioItem = async (id: string) => {
  await deleteDoc(doc(portfolioRef, id));
};
// Reviews operations
export const addReview = async (review: any) => {
  const docRef = doc(reviewsRef, review.id);
  await setDoc(docRef, review);
};
export const updateReviewStatus = async (id: string, approved: boolean) => {
  const docRef = doc(reviewsRef, id);
  await updateDoc(docRef, {
    approved
  });
};
// Bookings operations
export const addBooking = async (booking: any) => {
  const docRef = doc(bookingsRef, booking.id);
  await setDoc(docRef, booking);
};
export const updateBookingStatus = async (id: string, status: string) => {
  const docRef = doc(bookingsRef, id);
  await updateDoc(docRef, {
    status
  });
};
// Messages operations
export const addMessage = async (message: any) => {
  const docRef = doc(messagesRef, message.id);
  await setDoc(docRef, message);
};
export const updateMessageStatus = async (id: string, status: string) => {
  const docRef = doc(messagesRef, id);
  await updateDoc(docRef, {
    status
  });
};
// Settings operations
export const updateSettings = async (settings: any) => {
  const docRef = doc(settingsRef, 'theme');
  await setDoc(docRef, settings, {
    merge: true
  });
};
// Real-time listeners
export const subscribeToCompany = (callback: (data: any) => void) => {
  const docRef = doc(companyRef, 'profile');
  return onSnapshot(docRef, doc => {
    callback(doc.exists() ? doc.data() : null);
  });
};
export const subscribeToTeam = (callback: (data: any[]) => void) => {
  return onSnapshot(teamRef, snapshot => {
    const team = snapshot.docs.map(doc => doc.data());
    callback(team);
  });
};
export const subscribeToPortfolio = (callback: (data: any[]) => void) => {
  return onSnapshot(portfolioRef, snapshot => {
    const portfolio = snapshot.docs.map(doc => doc.data());
    callback(portfolio);
  });
};
export const subscribeToReviews = (callback: (data: any[]) => void) => {
  return onSnapshot(reviewsRef, snapshot => {
    const reviews = snapshot.docs.map(doc => doc.data());
    callback(reviews);
  });
};
export const subscribeToBookings = (callback: (data: any[]) => void) => {
  return onSnapshot(bookingsRef, snapshot => {
    const bookings = snapshot.docs.map(doc => doc.data());
    callback(bookings);
  });
};
export const subscribeToMessages = (callback: (data: any[]) => void) => {
  return onSnapshot(messagesRef, snapshot => {
    const messages = snapshot.docs.map(doc => doc.data());
    callback(messages);
  });
};
export const subscribeToSettings = (callback: (data: any) => void) => {
  const docRef = doc(settingsRef, 'theme');
  return onSnapshot(docRef, doc => {
    callback(doc.exists() ? doc.data() : null);
  });
};