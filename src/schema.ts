export interface Authorize {
  user: User;
  userDefaultLibraryId: string;
}
export interface User {
  id: string;
  username: string;
  type: string;
  mediaProgress: Progress[];
}

// Schema https://api.audiobookshelf.org/#library-item
export interface BookLibraryItems {
  results: BookLibraryItem[];
  collapseseries: boolean;
  total: number;
  limit: number;
  sortBy: string;
  sortDesc: boolean;
  mediaType: string;
  minified: boolean;
  include: string;
}

export interface PodcastLibraryItems {
  results: PodcastLibraryItem[];
  collapseseries: boolean;
  total: number;
  limit: number;
  sortBy: string;
  sortDesc: boolean;
  mediaType: string;
  minified: boolean;
  include: string;
}

export interface LibraryItem {
  id: string;
  ino: string;
  libraryId: string;
  folderId: string;
  path: string;
  relPath: string;
  isFile: boolean;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  addedAt: number;
  updatedAt: number;
  isMissing: boolean;
  isInvalid: boolean;
  mediaType: string;
  rssFeed: string | null;
}

export interface BookLibraryItem extends LibraryItem {
  mediaType: string;
  media: BookMedia;
}

export interface BookMedia {
  libraryItemId: string;
  coverPath: string;
  metadata: BookMetadata;
  tags: string[];
  missingParts: string[];
  ebookFile: string | null;
}

export interface BookMetadata {
  title: string;
  subtitle: string | null;
  asin: string;
  authors: Authors[];
  description: string;
  explicit: boolean;
  genres: string[];
  isbn: string | null;
  language: string | null;
  narrators: string[];
  publishedDate: string | null;
  publishedYear: string;
  publisher: string;
  series: Series[];
}

export interface PodcastLibraryItem extends LibraryItem {
  id: string;
  ino: string;
  libraryId: string;
  folderId: string;
  path: string;
  relPath: string;
  isFile: boolean;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  addedAt: number;
  updatedAt: number;
  lastScan: number | null;
  scanVersion: string | null;
  isMissing: boolean;
  isInvalid: boolean;
  mediaType: string;
  media: Podcast;
  rssFeed: null | string;
}

export interface Podcast {
  libraryItemId: string;
  tags: string[];
  metadata: PodcastMetadata;
  autoDownloadEpisodes: boolean;
  lastEpisodeCheck: number;
  maxEpisodesToKeep: number;
  maxNewEpisodesToDownload: number;
  episodes: PodcastEpisode[];
}

export interface PodcastMetadata {
  title: string;
  author: string | null;
  description: string | null;
  releaseDate: string | null;
  genres: string[];
  feedUrl: string | null;
  imageUrl: string | null;
  itunesPageUrl: string | null;
  itunesId: number | null;
  itunesArtistId: number | null;
  explicit: boolean;
  language: string | null;
}

export interface PodcastEpisode {
  libraryItemId: string;
  id: string;
  index: number;
  season: string;
  episode: string;
  episodeType: string;
  title: string;
  subtitle: string;
  description: string;
  pubDate: string;
  publishedAt: number;
  addedAt: number;
  updatedAt: number;
}

export interface Authors {
  id: string;
  name: string;
}

export interface Series {
  id: string;
  name: string;
  sequence: number;
}

export interface CollapsedSeries {
  id: string;
  name: string;
  nameIgnorePrefix: string;
  numBooks: number;
}

export interface Libraries {
  libraries: Library[];
}
export interface Library {
  id: string;
  name: string;
  mediaType: string;
}

export interface Progress {
  id: string;
  libraryItemId: string;
  episodeId: string;
  duration: number;
  progress: number;
  currentTime: number;
  isFinished: boolean;
  hideFromContinueListening: boolean;
  lastUpdate: number;
  startedAt: number;
  finishedAt: null | number;
}
