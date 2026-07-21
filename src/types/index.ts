export interface Group {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  icon: string; // SVG icon filename in /folders/ or icon identifier
  color?: string; // Optional accent color
  parentId?: string | null; // For sub-groups
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface Bookmark {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  url: string;
  imageUrl?: string;
  faviconUrl?: string;
  groupId: string; // Belongs to a Group or Sub-group
  tags: string[];
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type ViewMode = 'dashboard' | 'pinned' | 'all-links' | 'all-collections' | 'group' | 'tag' | 'trash';

export interface FilterState {
  viewMode: ViewMode;
  selectedGroupId?: string | null;
  selectedTag?: string | null;
  searchQuery: string;
}
