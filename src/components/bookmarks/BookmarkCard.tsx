import React from 'react';
import { 
  Pin, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Calendar, 
  FileCode,
  Globe
} from 'lucide-react';
import { Bookmark, Group } from '../../types';
import { useBookmarks } from '../../context/BookmarkContext';

interface BookmarkCardProps {
  bookmark: Bookmark;
  group?: Group;
  onEdit: (bookmark: Bookmark) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, group, onEdit }) => {
  const { togglePinBookmark, softDeleteBookmark } = useBookmarks();

  // Extract domain name from URL
  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  // Format date
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Jul 18, 2024';
    }
  };

  const domain = getDomain(bookmark.url);
  const faviconUrl = bookmark.faviconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  return (
    <div className="group relative bg-[#1c1e23] hover:bg-[#22252c] rounded-2xl border border-[#282b33] hover:border-purple-500/40 transition-all duration-200 overflow-hidden flex flex-col shadow-lg hover:shadow-xl hover:shadow-purple-950/20">
      {/* Top Image Container */}
      <div className="relative h-36 md:h-40 w-full bg-[#121417] overflow-hidden">
        {bookmark.imageUrl ? (
          <img
            src={bookmark.imageUrl}
            alt={bookmark.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
            onError={(e) => {
              // Fallback to placeholder gradient
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 via-slate-800 to-indigo-950/50 flex items-center justify-center">
            <Globe className="w-10 h-10 text-purple-400/40" />
          </div>
        )}

        {/* Dark Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1e23] via-transparent to-black/20" />

        {/* Center Favicon Badge */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center p-2 shadow-2xl">
          <img
            src={faviconUrl}
            alt={domain}
            className="w-6 h-6 object-contain rounded"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png';
            }}
          />
        </div>

        {/* Bottom Right HTML / Code Badge Stack (Matching Reference Design) */}
        <div className="absolute right-2 bottom-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-slate-300">
          <FileCode className="w-3 h-3 text-purple-400" />
          <span>HTML</span>
        </div>

        {/* Pin Badge */}
        {bookmark.isPinned && (
          <div className="absolute top-2.5 left-2.5 bg-amber-500 text-black p-1 rounded-lg shadow-md">
            <Pin className="w-3.5 h-3.5 fill-current" />
          </div>
        )}

        {/* Quick Action Overlay Buttons (Top Right on Hover) */}
        <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black/75 backdrop-blur-md p-1 rounded-xl border border-white/10 shadow-xl">
          <button
            onClick={() => togglePinBookmark(bookmark.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              bookmark.isPinned ? 'text-amber-400 hover:bg-amber-400/20' : 'text-slate-300 hover:bg-white/10'
            }`}
            title={bookmark.isPinned ? 'Unpin Bookmark' : 'Pin Bookmark'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 text-slate-300 hover:bg-white/10 rounded-lg transition-colors"
            title="Edit Bookmark"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => softDeleteBookmark(bookmark.id)}
            className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
            title="Move to Trash"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-sm text-slate-100 group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug flex items-start justify-between gap-1"
          >
            <span>{bookmark.title}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </a>

          {/* Domain */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-mono">
            <Globe className="w-3 h-3 text-slate-500 shrink-0" />
            <span className="truncate">{domain}</span>
          </div>
        </div>

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bookmark.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#252830] text-slate-300 border border-[#30333d]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Group Badge & Date */}
        <div className="pt-2 border-t border-[#26282f] flex items-center justify-between text-[11px] text-slate-400">
          {group ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/10 text-purple-300 rounded border border-purple-500/20 max-w-[130px] truncate">
              {group.icon ? (
                <img src={`/folders/${group.icon}`} alt={group.name} className="w-3.5 h-3.5 object-contain" />
              ) : (
                <Globe className="w-3 h-3 text-purple-400" />
              )}
              <span className="truncate text-[10px] font-semibold">{group.name}</span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500">Uncategorized</span>
          )}

          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(bookmark.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
