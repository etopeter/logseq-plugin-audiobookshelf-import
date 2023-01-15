// Schema https://github.com/advplyr/audiobookshelf/blob/master/docs/SampleBookLibraryItem.js
export interface Book {
  id: string;
  mediaType: string;
  media: Media;
}

export interface Media {
  libraryItemId: string;
  metadata: Metadata;
  tags: [];
}

export interface Metadata {
  asin: string;
  authors: Authors;
  description: string;
  explicit: boolean;
  genres: [];
  isbn: string;
  language: string;
  narrators: [];
  publishedDate: string;
  publishedYear: number;
  publisher: string;
  series: Series;
  subtitle: string;
  title: string;
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
  finishedAt: number;
}

const requestHeaders = (bearerToken: string) => ({
  Authorization: "Bearer " + bearerToken,
  Accept: "application/json",
  "Content-Type": "application/json",
});

// https://api.audiobookshelf.org/#get-a-library-39-s-items
export const loadBooks = async (
  serverUrl: string,
  bearerToken: string,
  limit = 10,
  page = 0,
  library: string,
  filter: string
): Promise<[Book[], number]> => {
  const url = new URL(
    serverUrl +
      "/api/libraries/" +
      library +
      "/items?limit=" +
      limit +
      "&page=" +
      page +
      "&filter=" +
      filter
  ); // ZmluaXNoZWQ= aW4tcHJvZ3Jlc3M= filter in-progress

  const res = await fetch(url, {
    headers: requestHeaders(bearerToken),
  });

  const jsonRes = await res.json(); // as GetLibraryItemsResponse
  //const articles = jsonRes.data.search.edges.map((e) => e.node)

  return [jsonRes.results, jsonRes.total];
};

export const loadLibraries = async (
  serverUrl: string,
  bearerToken: string,
  filter: string[] //array of library names to filter
): Promise<Library[]> => {
  const url = new URL(serverUrl + "/api/libraries/");

  const res = await fetch(url, {
    headers: requestHeaders(bearerToken),
  });

  const jsonRes = (await res.json()) as Libraries;

  if (filter.length > 0) {
    abLog("utils", "filtered libraries because length is " + filter.length);
    return jsonRes.libraries.filter((i) => filter.includes(i.name));
  }

  return jsonRes.libraries;
};

export const loadProgress = async (
  serverUrl: string,
  bearerToken: string,
  libraryId: string,
  episodeId?: string
): Promise<Progress> => {
  const episodeUrl = episodeId == undefined ? "" : "/" + episodeId;

  const url = new URL(serverUrl + "/api/me/progress/" + libraryId + episodeUrl);

  const res = await fetch(url, {
    headers: requestHeaders(bearerToken),
  });

  const jsonRes = (await res.json()) as Progress;

  return jsonRes;
};

export function decodeHTML(str: string) {
  let results = "";
  if (str !== null) {
    ///&#([0-9]+);/g
    results = str.replace(/&#(\d+);/g, function (full, int) {
      abLog("utils", "Replacing " + int);
      return String.fromCharCode(parseInt(int));
    });
  }
  return results;
}

// https://api.audiobookshelf.org/#filtering
export function createFilter(group: string, value: string) {
  const encodedFilter = encodeURIComponent(btoa(value));
  return group + "." + encodedFilter;
}

export function abLog(functionName: string, message: string) {
  // @ts-ignore
  if (logseq.settings.debug.includes(functionName))
    console.info(functionName + "> " + message);
}

export function seconds_human_readable(seconds: number) {
  // day, h, m and s
  var days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * (24 * 60 * 60);
  var hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * (60 * 60);
  var minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return (
    (0 < days ? days + " d " : "") +
    hours +
    "h " +
    minutes +
    "m " +
    seconds.toFixed() +
    "s"
  );
}

export function updateStatus(msg: string) {
  logseq.UI.showMsg(msg);
}
