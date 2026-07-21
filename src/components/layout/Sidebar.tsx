import React, { useState } from 'react';
import { 
  Home, 
  Pin, 
  Link2, 
  Folder, 
  ChevronDown, 
  ChevronRight, 
  Hash, 
  Trash2, 
  Plus, 
  FolderPlus,
  Edit2
} from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { ViewMode, Group } from '../../types';

interface SidebarProps {
  onOpenGroupModal: (group?: Group | null, parentId?: string | null) => void;
  onOpenTrashModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenGroupModal, onOpenTrashModal }) => {
  const { 
    activeGroups, 
    activeBookmarks, 
    allTags, 
    filters, 
    setFilters, 
    deletedBookmarks, 
    deletedGroups,
    softDeleteGroup
  } = useBookmarks();

  const [isCollectionsOpen, setIsCollectionsOpen] = useState(true);
  const [isTagsOpen, setIsTagsOpen] = useState(true);
  const [expandedGroupIds, setExpandedGroupIds] = useState<Record<string, boolean>>({
    'grp-5': true, // Productivity expanded by default to show sub-group
  });

  const totalDeletedCount = deletedBookmarks.length + deletedGroups.length;

  const toggleGroupExpand = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedGroupIds((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSelectView = (viewMode: ViewMode, selectedGroupId?: string | null, selectedTag?: string | null) => {
    setFilters((prev) => ({
      ...prev,
      viewMode,
      selectedGroupId: selectedGroupId ?? null,
      selectedTag: selectedTag ?? null,
    }));
  };

  // Helper to count bookmarks in a group including its sub-groups
  const getGroupBookmarkCount = (groupId: string) => {
    const childGroupIds = activeGroups.filter((g) => g.parentId === groupId).map((g) => g.id);
    const targetGroupIds = [groupId, ...childGroupIds];
    return activeBookmarks.filter((b) => targetGroupIds.includes(b.groupId)).length;
  };

  // Filter root groups vs sub groups
  const rootGroups = activeGroups.filter((g) => !g.parentId);

  return (
    <aside className="w-64 md:w-72 bg-[#16181c] border-r border-[#26282e] flex flex-col h-screen shrink-0 select-none text-slate-300">
      {/* App Branding */}
      <div className="p-5 flex items-center gap-3 border-b border-[#26282e]/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
          <Link2 className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-base text-white tracking-tight">Bookmark Studio</h1>
          <p className="text-[11px] text-slate-400 font-medium">Smart Link Manager</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 gap-2">
          {/* Dashboard */}
          <button
            onClick={() => handleSelectView('dashboard')}
            className={`p-3 rounded-xl flex flex-col items-start gap-2 transition-all ${
              filters.viewMode === 'dashboard'
                ? 'bg-slate-700/60 text-white border border-slate-600/60 shadow-inner'
                : 'bg-[#1e2025]/80 hover:bg-[#252830] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Home className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Dashboard</span>
          </button>

          {/* Pinned */}
          <button
            onClick={() => handleSelectView('pinned')}
            className={`p-3 rounded-xl flex flex-col items-start gap-2 transition-all ${
              filters.viewMode === 'pinned'
                ? 'bg-slate-700/60 text-white border border-slate-600/60 shadow-inner'
                : 'bg-[#1e2025]/80 hover:bg-[#252830] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Pin className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Pinned</span>
          </button>

          {/* All Links */}
          <button
            onClick={() => handleSelectView('all-links')}
            className={`p-3 rounded-xl flex flex-col items-start gap-2 transition-all ${
              filters.viewMode === 'all-links'
                ? 'bg-slate-700/60 text-white border border-slate-600/60 shadow-inner'
                : 'bg-[#1e2025]/80 hover:bg-[#252830] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Link2 className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">All Links</span>
          </button>

          {/* All Collections */}
          <button
            onClick={() => handleSelectView('all-collections')}
            className={`p-3 rounded-xl flex flex-col items-start gap-2 transition-all ${
              filters.viewMode === 'all-collections'
                ? 'bg-slate-700/60 text-white border border-slate-600/60 shadow-inner'
                : 'bg-[#1e2025]/80 hover:bg-[#252830] text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Folder className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">All Collections</span>
          </button>
        </div>

        {/* Collections Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <button
              onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              <span>Collections</span>
              {isCollectionsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => onOpenGroupModal(null, null)}
              className="w-6 h-6 rounded-md hover:bg-[#252830] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              title="Add New Collection"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCollectionsOpen && (
            <div className="space-y-0.5">
              {rootGroups.map((group) => {
                const subGroups = activeGroups.filter((g) => g.parentId === group.id);
                const hasSubGroups = subGroups.length > 0;
                const isExpanded = !!expandedGroupIds[group.id];
                const count = getGroupBookmarkCount(group.id);
                const isSelected = filters.viewMode === 'group' && filters.selectedGroupId === group.id;

                return (
                  <div key={group.id} className="group/item">
                    <div
                      onClick={() => handleSelectView('group', group.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-600/20 text-purple-300 font-medium border border-purple-500/30'
                          : 'hover:bg-[#20232a] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {hasSubGroups && (
                          <button
                            onClick={(e) => toggleGroupExpand(group.id, e)}
                            className="text-slate-500 hover:text-slate-200 p-0.5"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        
                        {/* Custom Folder Icon */}
                        {group.icon ? (
                          <img
                            src={`/folders/${group.icon}`}
                            alt={group.name}
                            className="w-5 h-5 object-contain shrink-0"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Folder className="w-4 h-4 text-purple-400 shrink-0" />
                        )}

                        <span className="truncate font-medium text-xs text-slate-200">{group.name}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Hover Action Buttons */}
                        <div className="hidden group-hover/item:flex items-center gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenGroupModal(null, group.id);
                            }}
                            className="p-1 hover:bg-[#2d303a] rounded text-slate-400 hover:text-purple-300"
                            title="Add Sub-group"
                          >
                            <FolderPlus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenGroupModal(group);
                            }}
                            className="p-1 hover:bg-[#2d303a] rounded text-slate-400 hover:text-blue-300"
                            title="Edit Group"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              softDeleteGroup(group.id);
                            }}
                            className="p-1 hover:bg-[#2d303a] rounded text-slate-400 hover:text-red-400"
                            title="Soft Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-[11px] font-semibold text-slate-500 group-hover/item:hidden">
                          {count}
                        </span>
                      </div>
                    </div>

                    {/* Sub-groups tree */}
                    {hasSubGroups && isExpanded && (
                      <div className="ml-5 pl-2 border-l border-[#2a2d36] space-y-0.5 mt-0.5">
                        {subGroups.map((sub) => {
                          const subCount = activeBookmarks.filter((b) => b.groupId === sub.id).length;
                          const isSubSelected = filters.viewMode === 'group' && filters.selectedGroupId === sub.id;

                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleSelectView('group', sub.id)}
                              className={`flex items-center justify-between px-2 py-1 rounded-md text-xs cursor-pointer transition-colors ${
                                isSubSelected
                                  ? 'bg-purple-600/20 text-purple-300 font-medium border border-purple-500/30'
                                  : 'hover:bg-[#20232a] text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {sub.icon ? (
                                  <img
                                    src={`/folders/${sub.icon}`}
                                    alt={sub.name}
                                    className="w-4 h-4 object-contain shrink-0"
                                  />
                                ) : (
                                  <Folder className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                                )}
                                <span className="truncate">{sub.name}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">{subCount}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <button
              onClick={() => setIsTagsOpen(!isTagsOpen)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
            >
              <span>Tags</span>
              {isTagsOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>

          {isTagsOpen && (
            <div className="space-y-0.5">
              {allTags.map((tag) => {
                const isSelected = filters.viewMode === 'tag' && filters.selectedTag === tag.name;

                return (
                  <div
                    key={tag.name}
                    onClick={() => handleSelectView('tag', null, tag.name)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-300 font-medium border border-blue-500/30'
                        : 'hover:bg-[#20232a] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Hash className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{tag.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{tag.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Trash Bin Footer Button */}
      <div className="p-3 border-t border-[#26282e]">
        <button
          onClick={onOpenTrashModal}
          className={`w-full p-2.5 rounded-xl flex items-center justify-between text-xs font-semibold transition-all ${
            totalDeletedCount > 0
              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
              : 'bg-[#1e2025] text-slate-400 hover:bg-[#252830] hover:text-slate-200 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Trash Bin</span>
          </div>
          {totalDeletedCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full animate-pulse">
              {totalDeletedCount}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
};
