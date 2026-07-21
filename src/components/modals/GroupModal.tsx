import React, { useState, useEffect } from 'react';
import { X, Folder, FolderPlus } from 'lucide-react';
import { useBookmarks } from '../../context/BookmarkContext';
import { Group } from '../../types';

const FOLDER_ICONS = [
  'blue-folder-13670.svg',
  'blue-mac-folder-13648.svg',
  'blue-mac-folder-13656.svg',
  'blue-mac-folder-13657.svg',
  'dark-green-simple-folder-13672.svg',
  'gray-folder-13668.svg',
  'gray-mac-folder-13647.svg',
  'gray-mac-folder-13655.svg',
  'green-folder-13683.svg',
  'mac-folder-6654.svg',
  'mac-folder-6657.svg',
  'orange-folder-13679.svg',
  'orange-mac-folder-13650.svg',
  'pink-mac-folder-13664.svg',
  'purple-folder-13687.svg',
  'purple-mac-folder-13653.svg',
  'purple-mac-folder-13663.svg',
  'red-folder-13677.svg',
  'red-mac-folder-13649.svg',
  'red-mac-folder-13658.svg',
  'yellow-mac-folder-13660.svg'
];

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroup?: Group | null;
  initialParentId?: string | null;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  editingGroup,
  initialParentId,
}) => {
  const { activeGroups, addGroup, updateGroup } = useBookmarks();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState(FOLDER_ICONS[0]);
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setDescription(editingGroup.description || '');
      setIcon(editingGroup.icon || FOLDER_ICONS[0]);
      setParentId(editingGroup.parentId || null);
    } else {
      setName('');
      setDescription('');
      setIcon(FOLDER_ICONS[0]);
      setParentId(initialParentId || null);
    }
  }, [editingGroup, initialParentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingGroup) {
      await updateGroup(editingGroup.id, {
        name,
        description,
        icon,
        parentId: parentId || null,
      });
    } else {
      await addGroup({
        name,
        description,
        icon,
        parentId: parentId || null,
      });
    }

    onClose();
  };

  // Filter valid parent options (prevent selecting itself as parent)
  const availableParents = activeGroups.filter(
    (g) => !editingGroup || (g.id !== editingGroup.id && g.parentId !== editingGroup.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#1c1e23] border border-[#282b33] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#282b33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              {editingGroup ? 'Edit Collection' : parentId ? 'Add Sub-group' : 'Add New Collection'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#282b33] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Collection Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Folder Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Productivity, Machine Learning"
              className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            />
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
              placeholder="Brief summary of links in this folder..."
              className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Parent Group (Sub-group option) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Parent Folder (Optional for Sub-groups)
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full bg-[#121417] text-slate-100 text-xs px-3.5 py-2.5 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none"
            >
              <option value="">None (Top Level Collection)</option>
              {availableParents.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Folder Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Select Folder Icon (From Custom SVG Assets)
            </label>
            <div className="grid grid-cols-6 sm:grid-cols-7 gap-2.5 bg-[#121417] p-3 rounded-xl border border-[#2d3036] max-h-48 overflow-y-auto">
              {FOLDER_ICONS.map((ic) => (
                <button
                  type="button"
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'bg-purple-600/30 border-2 border-purple-500 shadow-md scale-105'
                      : 'hover:bg-[#20232a] border border-transparent'
                  }`}
                >
                  <img src={`/folders/${ic}`} alt={ic} className="w-7 h-7 object-contain" />
                </button>
              ))}
            </div>
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
              {editingGroup ? 'Save Changes' : 'Create Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
