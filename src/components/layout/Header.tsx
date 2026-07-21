import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  FolderPlus, 
  BookmarkPlus,
  LayoutGrid,
  Sparkles,
  Download
} from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { useAuth } from '../../context/AuthContext';
import { Group } from '../../types';

interface HeaderProps {
  onOpenBookmarkModal: () => void;
  onOpenGroupModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBookmarkModal,
  onOpenGroupModal,
}) => {
  const { filters, setFilters, activeGroups, activeBookmarks } = useBookmarks();
  const { user, logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Export JSON Database handler
  const handleExportDatabase = () => {
    const getGroupPath = (group: Group): string => {
      let current: Group | undefined = group;
      const pathParts: string[] = [];
      while (current) {
        pathParts.unshift(current.name);
        current = activeGroups.find((g) => g.id === current?.parentId);
      }
      return pathParts.join(' / ');
    };

    const collectionsData = activeGroups.map((group) => {
      const groupBookmarks = activeBookmarks
        .filter((b) => b.groupId === group.id)
        .map((b) => ({
          id: b.id,
          title: b.title,
          url: b.url,
          description: b.description || '',
          imageUrl: b.imageUrl || '',
          tags: b.tags,
          isPinned: b.isPinned,
          createdAt: b.createdAt,
        }));

      return {
        id: group.id,
        name: group.name,
        description: group.description || '',
        icon: group.icon,
        parentId: group.parentId || null,
        path: getGroupPath(group),
        bookmarksCount: groupBookmarks.length,
        bookmarks: groupBookmarks,
      };
    });

    const uncategorized = activeBookmarks
      .filter((b) => !activeGroups.some((g) => g.id === b.groupId))
      .map((b) => ({
        id: b.id,
        title: b.title,
        url: b.url,
        description: b.description || '',
        imageUrl: b.imageUrl || '',
        tags: b.tags,
        isPinned: b.isPinned,
        createdAt: b.createdAt,
      }));

    const exportPayload = {
      appName: 'Bookmark Studio Database',
      exportedAt: new Date().toISOString(),
      totalCollections: collectionsData.length,
      totalBookmarks: activeBookmarks.length,
      collections: collectionsData,
      uncategorizedBookmarks: uncategorized,
    };

    const jsonString = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookmark-studio-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut listener for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-links-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-16 bg-[#16181c] border-b border-[#26282e] px-4 md:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Search Input Container */}
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="search-links-input"
          type="text"
          value={filters.searchQuery}
          onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
          placeholder="Search for Links..."
          className="w-full bg-[#1e2025] hover:bg-[#23262d] focus:bg-[#252830] text-slate-100 placeholder-slate-500 text-xs md:text-sm pl-10 pr-12 py-2 rounded-xl border border-[#2a2d34] focus:border-purple-500 focus:outline-none transition-all"
        />
        <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#262930] rounded border border-[#323640]">
          ⌘K
        </kbd>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Export Button */}
        <button
          onClick={handleExportDatabase}
          className="h-9 px-3.5 bg-[#1e2025] hover:bg-[#252830] border border-[#2a2d34] hover:border-purple-500/50 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 group"
          title="Export Database to JSON"
        >
          <Download className="w-3.5 h-3.5 text-purple-400 group-hover:translate-y-0.5 transition-transform" />
          <span>Export</span>
        </button>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl bg-[#1e2025] hover:bg-[#252830] border border-[#2a2d34] flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Add Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="h-9 px-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {isAddMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-48 bg-[#1e2025] border border-[#2a2d34] rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setIsAddMenuOpen(false)}
            >
              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenBookmarkModal();
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 flex items-center gap-2 transition-colors"
              >
                <BookmarkPlus className="w-4 h-4 text-purple-400" />
                <span>Add Bookmark</span>
              </button>
              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onOpenGroupModal();
                }}
                className="w-full px-3 py-2 text-left text-xs font-medium text-slate-200 hover:bg-purple-600/20 hover:text-purple-300 flex items-center gap-2 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <span>Add Collection</span>
              </button>
            </div>
          )}
        </div>

        {/* User Auth Avatar / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-9 h-9 rounded-full overflow-hidden border-2 border-purple-500/50 hover:border-purple-400 transition-all ring-2 ring-purple-900/20"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-700 flex items-center justify-center text-white">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </button>

          {isUserMenuOpen && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-[#1e2025] border border-[#2a2d34] rounded-xl shadow-2xl py-2 z-30"
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <div className="px-3.5 py-2 border-b border-[#2a2d34]">
                <p className="text-xs font-bold text-white truncate">{user?.displayName || 'Logged In User'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
