import React from 'react';
import { 
  Link2, 
  Folder, 
  Hash, 
  Pin, 
  Clock, 
  ChevronRight, 
  SlidersHorizontal,
  LayoutGrid,
  Home,
  Plus
} from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { BookmarkCard } from '../bookmarks/BookmarkCard';
import { Bookmark, Group } from '../../types';

interface DashboardViewProps {
  onEditBookmark: (bookmark: Bookmark) => void;
  onOpenBookmarkModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onEditBookmark, onOpenBookmarkModal }) => {
  const { 
    activeBookmarks, 
    activeGroups, 
    allTags, 
    filters, 
    setFilters 
  } = useBookmarks();

  // Filter bookmarks based on active view mode and search query
  const getFilteredBookmarks = () => {
    let list = activeBookmarks;

    // Search query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.url.toLowerCase().includes(q) ||
          (b.description && b.description.toLowerCase().includes(q)) ||
          b.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // View Mode filters
    if (filters.viewMode === 'pinned') {
      return list.filter((b) => b.isPinned);
    }

    if (filters.viewMode === 'group' && filters.selectedGroupId) {
      // Include child sub-groups
      const subGroupIds = activeGroups
        .filter((g) => g.parentId === filters.selectedGroupId)
        .map((g) => g.id);
      const targetGroupIds = [filters.selectedGroupId, ...subGroupIds];
      return list.filter((b) => targetGroupIds.includes(b.groupId));
    }

    if (filters.viewMode === 'tag' && filters.selectedTag) {
      return list.filter((b) => b.tags.includes(filters.selectedTag!));
    }

    return list;
  };

  const filteredBookmarks = getFilteredBookmarks();
  const pinnedBookmarks = activeBookmarks.filter((b) => b.isPinned);

  // Get current view title
  const getViewTitle = () => {
    if (filters.searchQuery) return `Search Results for "${filters.searchQuery}"`;
    if (filters.viewMode === 'pinned') return 'Pinned Bookmarks';
    if (filters.viewMode === 'all-links') return 'All Saved Links';
    if (filters.viewMode === 'all-collections') return 'All Collections';
    if (filters.viewMode === 'group' && filters.selectedGroupId) {
      const g = activeGroups.find((grp) => grp.id === filters.selectedGroupId);
      return g ? g.name : 'Collection View';
    }
    if (filters.viewMode === 'tag' && filters.selectedTag) {
      return `Tag: #${filters.selectedTag}`;
    }
    return 'Dashboard';
  };

  // Helper mapping groupId to Group object
  const groupMap = new Map<string, Group>();
  activeGroups.forEach((g) => groupMap.set(g.id, g));

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-[#121417] text-slate-100">
      {/* Top Header Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Home className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{getViewTitle()}</h2>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl bg-[#1e2025] hover:bg-[#252830] border border-[#2a2d34] text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Edit Layout</span>
          </button>
          <button className="w-8 h-8 rounded-xl bg-[#1e2025] hover:bg-[#252830] border border-[#2a2d34] flex items-center justify-center text-slate-400">
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards (Matching Reference UI) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Links Count */}
        <div 
          onClick={() => setFilters((p) => ({ ...p, viewMode: 'all-links' }))}
          className="bg-[#1c1e23] hover:bg-[#22252c] border border-[#282b33] p-4 md:p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
            <Link2 className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Links</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{activeBookmarks.length}</p>
          </div>
        </div>

        {/* Collections Count */}
        <div 
          onClick={() => setFilters((p) => ({ ...p, viewMode: 'all-collections' }))}
          className="bg-[#1c1e23] hover:bg-[#22252c] border border-[#282b33] p-4 md:p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
            <Folder className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Collections</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{activeGroups.length}</p>
          </div>
        </div>

        {/* Tags Count */}
        <div className="bg-[#1c1e23] border border-[#282b33] p-4 md:p-5 rounded-2xl flex items-center justify-between shadow-md">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-indigo-400">
            <Hash className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{allTags.length}</p>
          </div>
        </div>

        {/* Pinned Count */}
        <div 
          onClick={() => setFilters((p) => ({ ...p, viewMode: 'pinned' }))}
          className="bg-[#1c1e23] hover:bg-[#22252c] border border-[#282b33] p-4 md:p-5 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md group"
        >
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
            <Pin className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pinned</p>
            <p className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{pinnedBookmarks.length}</p>
          </div>
        </div>
      </div>

      {/* Main Filtered / Dashboard Content */}
      {filters.viewMode === 'dashboard' && !filters.searchQuery ? (
        <>
          {/* Section 1: Recent Links */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200">
                <Clock className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold">Recent Links</h3>
              </div>
              <button 
                onClick={() => setFilters((p) => ({ ...p, viewMode: 'all-links' }))}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeBookmarks.slice(0, 4).map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  group={groupMap.get(bookmark.groupId)}
                  onEdit={onEditBookmark}
                />
              ))}
            </div>
          </section>

          {/* Section 2: Grouped Collection Sections */}
          {activeGroups.filter((g) => !g.parentId).map((group) => {
            const groupBms = activeBookmarks.filter((b) => b.groupId === group.id);
            if (groupBms.length === 0) return null;

            return (
              <section key={group.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {group.icon ? (
                      <img src={`/folders/${group.icon}`} alt={group.name} className="w-6 h-6 object-contain" />
                    ) : (
                      <Folder className="w-5 h-5 text-purple-400" />
                    )}
                    <h3 className="text-lg font-bold text-white">{group.name}</h3>
                  </div>

                  <button
                    onClick={() => setFilters((p) => ({ ...p, viewMode: 'group', selectedGroupId: group.id }))}
                    className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {groupBms.slice(0, 4).map((bookmark) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      group={group}
                      onEdit={onEditBookmark}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      ) : (
        /* Specific View Filtered Grid */
        <section className="space-y-4">
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.id}
                  bookmark={bookmark}
                  group={groupMap.get(bookmark.groupId)}
                  onEdit={onEditBookmark}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#1c1e23] border border-[#282b33] rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-300">No bookmarks found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no bookmarks matching your current view filter. Click the button below to add your first bookmark!
              </p>
              <button
                onClick={onOpenBookmarkModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bookmark</span>
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
