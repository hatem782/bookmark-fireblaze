import React, { useState, useEffect } from 'react';
import { X, Upload, Link2, Sparkles, Pin, Image as ImageIcon } from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { Bookmark } from '../../types';
import { uploadImageToB2 } from '../../lib/b2Storage';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBookmark?: Bookmark | null;
}

export const BookmarkModal: React.FC<BookmarkModalProps> = ({
  isOpen,
  onClose,
  editingBookmark,
}) => {
  const { activeGroups, addBookmark, updateBookmark } = useBookmarks();

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingBookmark) {
      setTitle(editingBookmark.title);
      setUrl(editingBookmark.url);
      setDescription(editingBookmark.description || '');
      setGroupId(editingBookmark.groupId);
      setTagsInput(editingBookmark.tags.join(', '));
      setImageUrl(editingBookmark.imageUrl || '');
      setIsPinned(editingBookmark.isPinned);
    } else {
      setTitle('');
      setUrl('');
      setDescription('');
      setGroupId(activeGroups[0]?.id || '');
      setTagsInput('');
      setImageUrl('');
      setIsPinned(false);
    }
  }, [editingBookmark, activeGroups, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const uploadedUrl = await uploadImageToB2(file);
      setImageUrl(uploadedUrl);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim() || !groupId) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    if (editingBookmark) {
      await updateBookmark(editingBookmark.id, {
        title,
        url,
        description,
        groupId,
        tags,
        imageUrl,
        isPinned,
      });
    } else {
      await addBookmark({
        title,
        url,
        description,
        groupId,
        tags,
        imageUrl,
        isPinned,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#1c1e23] border border-[#282b33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#282b33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">
              {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#282b33] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Link URL <span className="text-red-400">*</span>
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bookmark Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biological Science Research Paper"
              className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Group Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Collection Group <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="w-full bg-[#121417] text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            >
              {activeGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.parentId ? `└ ${g.name} (Sub-group)` : g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Key notes or summary..."
              className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="productivity, research, science"
              className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Image Upload / URL Section (Backblaze B2 Integration) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Thumbnail Image (Upload to B2 Storage or Paste URL)
            </label>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
                />

                <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Uploading...' : 'B2 Upload'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {imageUrl && (
                <div className="h-24 w-full bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1 bg-black/70 rounded-full text-slate-300 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pin Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 text-purple-600 focus:ring-purple-500 bg-[#121417]"
            />
            <label htmlFor="isPinned" className="text-xs font-medium text-slate-300 flex items-center gap-1 cursor-pointer">
              <Pin className="w-3.5 h-3.5 text-amber-400" />
              <span>Pin this bookmark to top</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#282b33] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#252830] hover:bg-[#2d303a] text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/30 transition-all"
            >
              {editingBookmark ? 'Save Changes' : 'Create Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
