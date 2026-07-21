import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  RotateCcw, 
  Folder, 
  Link2, 
  Search,
  Flame
} from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { Bookmark, Group } from '../../types';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface TrashBinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrashBinModal: React.FC<TrashBinModalProps> = ({ isOpen, onClose }) => {
  const { 
    deletedBookmarks, 
    deletedGroups, 
    restoreBookmark, 
    restoreGroup, 
    permanentDeleteBookmark, 
    permanentDeleteGroup,
    emptyTrash 
  } = useBookmarks();

  const [activeTab, setActiveTab] = useState<'bookmarks' | 'groups'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');

  // Confirmation state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  if (!isOpen) return null;

  const filteredBm = deletedBookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGrp = deletedGroups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePermanentDeleteBm = (bm: Bookmark) => {
    setConfirmState({
      isOpen: true,
      title: 'Permanently Delete Bookmark?',
      message: `Are you sure you want to permanently delete "${bm.title}"? This cannot be undone.`,
      onConfirm: () => permanentDeleteBookmark(bm.id),
    });
  };

  const handlePermanentDeleteGrp = (grp: Group) => {
    setConfirmState({
      isOpen: true,
      title: 'Permanently Delete Collection?',
      message: `Are you sure you want to permanently delete collection "${grp.name}" and any links inside it?`,
      onConfirm: () => permanentDeleteGroup(grp.id),
    });
  };

  const handleEmptyTrash = () => {
    setConfirmState({
      isOpen: true,
      title: 'Empty Entire Trash Bin?',
      message: 'All soft-deleted bookmarks and collections will be permanently deleted forever.',
      onConfirm: () => emptyTrash(),
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
        <div className="w-full max-w-2xl bg-[#1c1e23] border border-[#282b33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#282b33] flex items-center justify-between bg-red-950/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Trash Bin</h3>
                <p className="text-[11px] text-slate-400">Restore or permanently delete soft-deleted items</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#282b33] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Toolbar & Search */}
          <div className="px-6 py-3 bg-[#16181c] border-b border-[#282b33] flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-[#1e2025] p-1 rounded-xl border border-[#2a2d34] w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'bookmarks'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Links ({deletedBookmarks.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'groups'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Collections ({deletedGroups.length})</span>
              </button>
            </div>

            {/* Empty Trash Button */}
            {(deletedBookmarks.length > 0 || deletedGroups.length > 0) && (
              <button
                onClick={handleEmptyTrash}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="p-6 overflow-y-auto space-y-2 flex-1 min-h-[300px]">
            {activeTab === 'bookmarks' ? (
              filteredBm.length > 0 ? (
                filteredBm.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-3.5 bg-[#121417] hover:bg-[#191c21] rounded-xl border border-[#252830] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-100 truncate">{bm.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{bm.url}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => restoreBookmark(bm.id)}
                        className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Restore Bookmark"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                      <button
                        onClick={() => handlePermanentDeleteBm(bm)}
                        className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No soft-deleted links found in Trash Bin.
                </div>
              )
            ) : filteredGrp.length > 0 ? (
              filteredGrp.map((grp) => (
                <div
                  key={grp.id}
                  className="p-3.5 bg-[#121417] hover:bg-[#191c21] rounded-xl border border-[#252830] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {grp.icon ? (
                      <img src={`/folders/${grp.icon}`} alt={grp.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Folder className="w-5 h-5 text-purple-400" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-100 truncate">{grp.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{grp.description || 'Collection'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => restoreGroup(grp.id)}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore</span>
                    </button>
                    <button
                      onClick={() => handlePermanentDeleteGrp(grp)}
                      className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                No soft-deleted collections found in Trash Bin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog Popup */}
      <ConfirmDeleteModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        onClose={() => setConfirmState((p) => ({ ...p, isOpen: false }))}
        onConfirm={confirmState.onConfirm}
      />
    </>
  );
};
