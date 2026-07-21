import React, { createContext, useContext, useEffect, useState } from 'react';
import { Bookmark, Group, FilterState } from '../types';
import { useAuth } from './AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface BookmarkContextType {
  groups: Group[];
  bookmarks: Bookmark[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  loadingData: boolean;
  
  // Group CRUD
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'isDeleted'>) => Promise<void>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<void>;
  softDeleteGroup: (id: string) => Promise<void>;
  restoreGroup: (id: string) => Promise<void>;
  permanentDeleteGroup: (id: string) => Promise<void>;
  
  // Bookmark CRUD
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'isDeleted'>) => Promise<void>;
  updateBookmark: (id: string, bookmark: Partial<Bookmark>) => Promise<void>;
  togglePinBookmark: (id: string) => Promise<void>;
  softDeleteBookmark: (id: string) => Promise<void>;
  restoreBookmark: (id: string) => Promise<void>;
  permanentDeleteBookmark: (id: string) => Promise<void>;

  // Trash Bin bulk actions
  emptyTrash: () => Promise<void>;

  // Stats
  activeBookmarks: Bookmark[];
  activeGroups: Group[];
  deletedBookmarks: Bookmark[];
  deletedGroups: Group[];
  allTags: { name: string; count: number }[];
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  const [filters, setFilters] = useState<FilterState>({
    viewMode: 'dashboard',
    selectedGroupId: null,
    selectedTag: null,
    searchQuery: '',
  });

  // Pure Firebase Firestore Real-Time Listener
  useEffect(() => {
    if (!user) {
      setGroups([]);
      setBookmarks([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // Listen to Groups collection for current user
    const qGroups = query(collection(db, 'groups'), where('userId', '==', user.uid));
    const unsubGroups = onSnapshot(qGroups, (snapshot) => {
      const remoteGroups: Group[] = [];
      snapshot.forEach((docSnap) => {
        remoteGroups.push({ id: docSnap.id, ...docSnap.data() } as Group);
      });
      setGroups(remoteGroups);
    }, (err) => {
      console.error("Firestore groups listener error:", err);
    });

    // Listen to Bookmarks collection for current user
    const qBookmarks = query(collection(db, 'bookmarks'), where('userId', '==', user.uid));
    const unsubBookmarks = onSnapshot(qBookmarks, (snapshot) => {
      const remoteBookmarks: Bookmark[] = [];
      snapshot.forEach((docSnap) => {
        remoteBookmarks.push({ id: docSnap.id, ...docSnap.data() } as Bookmark);
      });
      setBookmarks(remoteBookmarks);
      setLoadingData(false);
    }, (err) => {
      console.error("Firestore bookmarks listener error:", err);
      setLoadingData(false);
    });

    return () => {
      unsubGroups();
      unsubBookmarks();
    };
  }, [user]);

  // Derived lists
  const activeBookmarks = bookmarks.filter((b) => !b.isDeleted);
  const deletedBookmarks = bookmarks.filter((b) => b.isDeleted);
  const activeGroups = groups.filter((g) => !g.isDeleted);
  const deletedGroups = groups.filter((g) => g.isDeleted);

  // Compute tag counts
  const tagMap = new Map<string, number>();
  activeBookmarks.forEach((b) => {
    (b.tags || []).forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });
  const allTags = Array.from(tagMap.entries()).map(([name, count]) => ({ name, count }));

  // Group Actions (Firebase Firestore)
  const addGroup = async (groupData: Omit<Group, 'id' | 'createdAt' | 'isDeleted'>) => {
    if (!user) return;
    const newGroup = {
      ...groupData,
      userId: user.uid,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'groups'), newGroup);
  };

  const updateGroup = async (id: string, groupData: Partial<Group>) => {
    if (!user) return;
    await updateDoc(doc(db, 'groups', id), groupData);
  };

  const softDeleteGroup = async (id: string) => {
    if (!user) return;
    const deletedAt = new Date().toISOString();
    
    // Soft delete target group
    await updateDoc(doc(db, 'groups', id), { isDeleted: true, deletedAt });

    // Soft delete child sub-groups and bookmarks under this group
    const childGroups = groups.filter((g) => g.parentId === id);
    for (const child of childGroups) {
      await updateDoc(doc(db, 'groups', child.id), { isDeleted: true, deletedAt });
    }

    const childBookmarks = bookmarks.filter((b) => b.groupId === id);
    for (const bm of childBookmarks) {
      await updateDoc(doc(db, 'bookmarks', bm.id), { isDeleted: true, deletedAt });
    }
  };

  const restoreGroup = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'groups', id), { isDeleted: false, deletedAt: null });

    // Restore bookmarks under this group
    const childBookmarks = bookmarks.filter((b) => b.groupId === id);
    for (const bm of childBookmarks) {
      await updateDoc(doc(db, 'bookmarks', bm.id), { isDeleted: false, deletedAt: null });
    }
  };

  const permanentDeleteGroup = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'groups', id));

    // Permanently delete child bookmarks
    const childBookmarks = bookmarks.filter((b) => b.groupId === id);
    for (const bm of childBookmarks) {
      await deleteDoc(doc(db, 'bookmarks', bm.id));
    }
  };

  // Bookmark Actions (Firebase Firestore)
  const addBookmark = async (bmData: Omit<Bookmark, 'id' | 'createdAt' | 'isDeleted'>) => {
    if (!user) return;
    const newBookmark = {
      ...bmData,
      userId: user.uid,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
    await addDoc(collection(db, 'bookmarks'), newBookmark);
  };

  const updateBookmark = async (id: string, bmData: Partial<Bookmark>) => {
    if (!user) return;
    await updateDoc(doc(db, 'bookmarks', id), bmData);
  };

  const togglePinBookmark = async (id: string) => {
    const target = bookmarks.find((b) => b.id === id);
    if (!target) return;
    await updateBookmark(id, { isPinned: !target.isPinned });
  };

  const softDeleteBookmark = async (id: string) => {
    if (!user) return;
    const deletedAt = new Date().toISOString();
    await updateDoc(doc(db, 'bookmarks', id), { isDeleted: true, deletedAt });
  };

  const restoreBookmark = async (id: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'bookmarks', id), { isDeleted: false, deletedAt: null });
  };

  const permanentDeleteBookmark = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'bookmarks', id));
  };

  const emptyTrash = async () => {
    if (!user) return;
    for (const b of deletedBookmarks) {
      await deleteDoc(doc(db, 'bookmarks', b.id));
    }
    for (const g of deletedGroups) {
      await deleteDoc(doc(db, 'groups', g.id));
    }
  };

  return (
    <BookmarkContext.Provider value={{
      groups,
      bookmarks,
      filters,
      setFilters,
      loadingData,
      addGroup,
      updateGroup,
      softDeleteGroup,
      restoreGroup,
      permanentDeleteGroup,
      addBookmark,
      updateBookmark,
      togglePinBookmark,
      softDeleteBookmark,
      restoreBookmark,
      permanentDeleteBookmark,
      emptyTrash,
      activeBookmarks,
      activeGroups,
      deletedBookmarks,
      deletedGroups,
      allTags,
    }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
