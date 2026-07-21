import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BookmarkProvider } from './context/BookmarkContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { BookmarkModal } from './components/modals/BookmarkModal';
import { GroupModal } from './components/modals/GroupModal';
import { TrashBinModal } from './components/modals/TrashBinModal';
import { AuthPage } from './components/auth/AuthPage';
import { Bookmark, Group } from './types';
import { Loader2 } from 'lucide-react';

const ProtectedAppContent: React.FC = () => {
  const { user, loading } = useAuth();

  // Modal states
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [initialParentId, setInitialParentId] = useState<string | null>(null);

  const [isTrashModalOpen, setIsTrashModalOpen] = useState(false);

  // Loading Screen while Firebase Auth initializes
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#121417] flex flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        <p className="text-xs font-semibold tracking-wide text-slate-400">Loading Bookmark Studio...</p>
      </div>
    );
  }

  // Protected Route: Render AuthPage if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Handlers
  const handleOpenBookmarkModal = (bm?: Bookmark | null) => {
    setEditingBookmark(bm || null);
    setIsBookmarkModalOpen(true);
  };

  const handleOpenGroupModal = (group?: Group | null, parentId?: string | null) => {
    setEditingGroup(group || null);
    setInitialParentId(parentId || null);
    setIsGroupModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121417] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        onOpenGroupModal={handleOpenGroupModal}
        onOpenTrashModal={() => setIsTrashModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          onOpenBookmarkModal={() => handleOpenBookmarkModal(null)}
          onOpenGroupModal={() => handleOpenGroupModal(null)}
        />

        <DashboardView
          onEditBookmark={(bm) => handleOpenBookmarkModal(bm)}
          onOpenBookmarkModal={() => handleOpenBookmarkModal(null)}
        />
      </div>

      {/* Modals */}
      <BookmarkModal
        isOpen={isBookmarkModalOpen}
        onClose={() => setIsBookmarkModalOpen(false)}
        editingBookmark={editingBookmark}
      />

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        editingGroup={editingGroup}
        initialParentId={initialParentId}
      />

      <TrashBinModal
        isOpen={isTrashModalOpen}
        onClose={() => setIsTrashModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BookmarkProvider>
        <ProtectedAppContent />
      </BookmarkProvider>
    </AuthProvider>
  );
}
