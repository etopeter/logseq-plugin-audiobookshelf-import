import {
  Authorize,
  User,
  BookLibraryItem,
  Progress,
  Library,
  Libraries,
  PodcastLibraryItem,
  PodcastEpisode,
} from "./schema";

import { format } from "date-fns";

import { render } from "mustache";

const requestHeaders = (bearerToken: string) => ({
  Authorization: "Bearer " + bearerToken,
  Accept: "application/json",
  "Content-Type": "application/json",
});

export const loadUser = async (
  serverUrl: string,
  bearerToken: string
): Promise<User> => {
  const res = await fetch(serverUrl + "/api/authorize", {
    method: "post",
    headers: requestHeaders(bearerToken),
  });
  const authorize = (await res.json()) as Authorize;
  return authorize.user;
};

export const userMediaProgress = async (
  user: User,
  libraryItemId: string,
  episodeId?: string
): Promise<Progress> => {
  for (let item of user.mediaProgress) {
    // Match book
    if (item.libraryItemId == libraryItemId && episodeId == undefined) {
      return item as Progress;
    }
    // Match podcast episode
    if (
      item.libraryItemId == libraryItemId &&
      episodeId != undefined &&
      item.episodeId == episodeId
    ) {
      return item as Progress;
    }
  }
  return new ItemProgress();
};

// https://api.audiobookshelf.org/#get-a-library-39-s-items
export const loadBooks = async (
  serverUrl: string,
  bearerToken: string,
  limit: number = 10,
  page: number = 0,
  library: string,
  filter?: string
): Promise<[BookLibraryItem[], number]> => {
  const url =
    serverUrl +
    "/api/libraries/" +
    library +
    "/items?limit=" +
    limit +
    "&page=" +
    page +
    "&filter=" +
    filter; // ZmluaXNoZWQ= aW4tcHJvZ3Jlc3M= filter in-progress
  const res = await fetch(url, {
    headers: requestHeaders(bearerToken),
  });

  const jsonRes = await res.json(); // as GetLibraryItemsResponse
  //const articles = jsonRes.data.search.edges.map((e) => e.node)

  return [jsonRes.results, jsonRes.total];
};

export const loadPodcasts = async (
  serverUrl: string,
  bearerToken: string,
  limit: number = 10,
  page: number = 0,
  library: string
): Promise<[PodcastLibraryItem[], number]> => {
  const url =
    serverUrl +
    "/api/libraries/" +
    library +
    "/items?limit=" +
    limit +
    "&page=" +
    page;

  const res = await fetch(url, {
    headers: requestHeaders(bearerToken),
  });

  const jsonRes = await res.json();
  return [jsonRes.results, jsonRes.total];
};

export const loadLibraries = async (
  serverUrl: string,
  bearerToken: string,
  filter: string[] //array of library names to filter
): Promise<Library[]> => {
  const res = await fetch(serverUrl + "/api/libraries/", {
    headers: requestHeaders(bearerToken),
  });

  const jsonRes = (await res.json()) as Libraries;

  if (filter.length > 0) {
    abLog("utils", "filtered libraries because length is " + filter.length);
    return jsonRes.libraries.filter((i) => filter.includes(i.name));
  }

  return jsonRes.libraries;
};

class ItemProgress implements Progress {
  id = "";
  libraryItemId = "";
  episodeId = "";
  duration = 0;
  progress = 0;
  currentTime = 0;
  isFinished = false;
  hideFromContinueListening = false;
  lastUpdate = 0;
  startedAt = 0;
  finishedAt = null;
}

export const loadProgress = async (
  serverUrl: string,
  bearerToken: string,
  libraryId: string,
  episodeId?: string
): Promise<Progress> => {
  try {
    const episodeUrl = episodeId == undefined ? "" : "/" + episodeId;
    const res = await fetch(
      serverUrl + "/api/me/progress/" + libraryId + episodeUrl,
      {
        headers: requestHeaders(bearerToken),
      }
    );
    return (await res.json()) as Progress;
  } catch (e) {
    return new ItemProgress();
  }
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
  if (
    logseq.settings!.hasOwnProperty("debug") &&
    logseq.settings!.debug.includes(functionName)
  ) {
    console.info(functionName + "> " + message);
  }
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
    (0 < days ? days + "d " : "") +
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

export function renderTemplate(
  template: string,
  serverUrl: string,
  preferredDateFormat: string,
  itemType: string,
  progress: Progress,
  book?: BookLibraryItem,
  podcast?: PodcastLibraryItem,
  episode?: PodcastEpisode
) {
  let result = "";

  const itemStartedDate =
    progress.startedAt > 0
      ? format(new Date(progress.startedAt), preferredDateFormat)
      : "";

  const itemFinishedDate = progress.finishedAt
    ? format(new Date(progress.finishedAt), preferredDateFormat)
    : "";

  if (itemType == "book" && book) {
    abLog("utils", book.media.metadata.title + " started " + itemStartedDate);
    result = render(template, {
      audiobookshelfUrl: `${serverUrl}/item/${book.id}`,
      asin: book.media.metadata.asin,
      authors: book.media.metadata.authors,
      description: book.media.metadata.description,
      duration: seconds_human_readable(progress.duration),
      currentTime: seconds_human_readable(progress.currentTime),
      isFinished: progress.isFinished,
      explicit: book.media.metadata.explicit,
      genres: book.media.metadata.genres,
      isbn: book.media.metadata.isbn,
      startedDate: progress.startedAt,
      startedDateParsed: itemStartedDate,
      finishedDate: progress.finishedAt,
      finishedDateParsed: itemFinishedDate,
      language: book.media.metadata.language,
      narrators: book.media.metadata.narrators,
      progress:
        (progress.progress * 100).toFixed(progress.progress == 1 ? 0 : 2) + "%",
      publishedDate: book.media.metadata.publishedDate,
      publishedYear: book.media.metadata.publishedYear,
      publisher: book.media.metadata.publisher,
      series: book.media.metadata.series,
      subtitle: book.media.metadata.subtitle,
      tags: book.media.tags,
      title: book.media.metadata.title,
    });
  }

  if (itemType == "podcast" && podcast) {
    abLog(
      "utils",
      podcast.media.metadata.title + " started " + itemStartedDate
    );

    result = render(template, {
      audiobookshelfUrl: `${serverUrl}/item/${podcast.id}`,
      author: podcast.media.metadata.author,
      description: podcast.media.metadata.description,
      duration: seconds_human_readable(progress.duration),
      currentTime: seconds_human_readable(progress.currentTime),
      isFinished: progress.isFinished,
      explicit: podcast.media.metadata.explicit,
      genres: podcast.media.metadata.genres,
      startedDate: progress.startedAt,
      startedDateParsed: itemStartedDate,
      finishedDate: progress.finishedAt,
      finishedDateParsed: itemFinishedDate,
      language: podcast.media.metadata.language,
      progress:
        (progress.progress * 100).toFixed(progress.progress == 1 ? 0 : 2) + "%",
      releaseDate: podcast.media.metadata.releaseDate,
      tags: podcast.media.tags,
      title: podcast.media.metadata.title,
      index: episode?.index,
      season: episode?.season,
      episode: episode?.episode,
      episodeType: episode?.episodeType,
      episodeTitle: episode?.title,
      episodeSubtitle: episode?.subtitle,
      episodeDescription: episode?.description,
      episdoePubDate: episode?.pubDate,
      episodePublishedAt: episode?.publishedAt,
      episodeAddedAt: episode?.addedAt,
      episodeUpdatedAt: episode?.updatedAt,
    });
  }

  return result;
}
