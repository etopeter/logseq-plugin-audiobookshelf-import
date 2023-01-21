import {
  seconds_human_readable,
  loadUser,
  loadLibraries,
  loadProgress,
  loadBooks,
  createFilter,
  decodeHTML,
  abLog,
  updateStatus,
  renderTemplate,
  loadPodcasts,
  userMediaProgress,
} from "../src/utils";

import audiobookshelfAuthorize from "../tests/__fixtures__/authorize.json";
import audiobookshelfLibraries from "../tests/__fixtures__/libraries.json";
import audiobookshelfProgress from "../tests/__fixtures__/progress.json";
import audiobookshelfProgressFinished from "../tests/__fixtures__/progress_finished.json";

import audiobookshelfBooksLibraryItems from "../tests/__fixtures__/books_library_items.json";
import audiobookshelfPodcastsLibraryItems from "../tests/__fixtures__/podcasts_library_items.json";

import {
  User,
  Progress,
  BookLibraryItems,
  PodcastLibraryItems,
  Authorize,
} from "../src/schema";

let originalFetch = global.fetch;

describe("seconds_human_readable()", () => {
  it("should calculate seconds", () => {
    let content = seconds_human_readable(9);
    expect(content).toBe("0h 0m 9s");
  });
  it("should calculate minutes", () => {
    let content = seconds_human_readable(300);
    expect(content).toBe("0h 5m 0s");
  });
  it("should calculate hours", () => {
    let content = seconds_human_readable(3600);
    expect(content).toBe("1h 0m 0s");
  });
  it("should calculate long duration", () => {
    let content = seconds_human_readable(180094);
    expect(content).toBe("2d 2h 1m 34s");
  });
  it("should calculate no duration", () => {
    let content = seconds_human_readable(0);
    expect(content).toBe("0h 0m 0s");
  });
});

describe("loadUser()", () => {
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => audiobookshelfAuthorize,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("loads user", async () => {
    await loadUser("http://localhost", "TOKEN");

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/authorize",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
        method: "post",
      }
    );
  });

  it("loads user with progress", async () => {
    const user: User = await loadUser("http://localhost", "TOKEN");

    expect(user).toHaveProperty("username");
    expect(user.mediaProgress).toHaveLength(3);

    const progressItem = user.mediaProgress[0];
    expect(progressItem.episodeId).toEqual("ep_lh6ko39pumnrma3dhv");
    expect(progressItem.isFinished).toBe(false);
  });
});

describe("userMediaProgress()", () => {
  it("finds book progress", async () => {
    const authorize = audiobookshelfAuthorize as Authorize;
    const user = authorize.user;
    const mediaProgress: Progress = (await userMediaProgress(
      user,
      "li_bufnnmp4y5892ebbxfm"
    )) as Progress;

    expect(mediaProgress).toBeDefined;
    expect(mediaProgress).toHaveProperty("progress");
    expect(mediaProgress.progress).toBe(0.42057298864465265);
  });

  it("finds podcast episode finished progress", async () => {
    const authorize = audiobookshelfAuthorize as Authorize;
    const user = authorize.user;
    const mediaProgress: Progress = (await userMediaProgress(
      user,
      "li_bufnnmp4y5o2gbbxfm",
      "ep_rwi8o39pumnrma3dhv"
    )) as Progress;

    expect(mediaProgress).toBeDefined;
    expect(mediaProgress).toHaveProperty("progress");
    expect(mediaProgress.progress).toBe(1);
    expect(mediaProgress.isFinished).toEqual(true);
  });

  it("it does not find any progress", async () => {
    const authorize = audiobookshelfAuthorize as Authorize;
    const user = authorize.user;
    const mediaProgress: Progress = (await userMediaProgress(
      user,
      "FAKE",
      "FAKE"
    )) as Progress;

    expect(mediaProgress).toBeDefined;
    expect(mediaProgress).toHaveProperty("progress");
    expect(mediaProgress.progress).toBe(0);
    expect(mediaProgress.isFinished).toEqual(false);
  });
});

describe("loadLibraries()", () => {
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => audiobookshelfLibraries,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("finds all libraries", async () => {
    const libraries = await loadLibraries("http://localhost", "TOKEN", []);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(libraries).toHaveLength(2);
  });

  it("finds filtered libraries", async () => {
    const libraries = await loadLibraries("http://localhost", "TOKEN", [
      "Main",
    ]);

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(libraries).toHaveLength(1);
  });
});

describe("loadProgress()", () => {
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => audiobookshelfProgress,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("fetches book progress", async () => {
    const progress = await loadProgress(
      "http://localhost",
      "TOKEN",
      "li_bufnnmp4y5o2gbbxfm"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/me/progress/" + "li_bufnnmp4y5o2gbbxfm",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(progress).toHaveProperty("libraryItemId");
  });

  it("fetches podcast progress", async () => {
    const progress = await loadProgress(
      "http://localhost",
      "TOKEN",
      "li_bufnnmp4y5o2gbbxfm",
      "fake_id"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/me/progress/" +
        "li_bufnnmp4y5o2gbbxfm" +
        "/fake_id",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(progress).toHaveProperty("libraryItemId");
  });

  it("fetches podcast progress that does not exist", async () => {
    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject("NOT FOUND"));

    const progress = await loadProgress(
      "http://localhost",
      "TOKEN",
      "li_bufnnmp4y5o2gbbxfm",
      "fake_id"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/me/progress/" +
        "li_bufnnmp4y5o2gbbxfm" +
        "/fake_id",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(progress).toHaveProperty("libraryItemId");
    expect(progress.libraryItemId).toEqual("");
    expect(progress).toHaveProperty("finishedAt");
    expect(progress.finishedAt).toEqual(null);
  });
});

describe("loadBooks()", () => {
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => audiobookshelfBooksLibraryItems,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("load books from main library", async () => {
    const [books, total] = await loadBooks(
      "http://localhost",
      "TOKEN",
      10,
      0,
      "main",
      "W4tcHJvZ3Jlc3M="
    ); //ZmluaXNoZWQ= aW4tcHJvZ3Jlc3M= filter in-progress

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/main/items?limit=10&page=0&filter=W4tcHJvZ3Jlc3M=",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(total).toEqual(3);
    expect(books).toHaveLength(3);
    expect(books[0]).toHaveProperty("id");
  });

  it("load books from pagination", async () => {
    const [books, total] = await loadBooks(
      "http://localhost",
      "TOKEN",
      2,
      1,
      "main",
      "W4tcHJvZ3Jlc3M="
    ); //ZmluaXNoZWQ= aW4tcHJvZ3Jlc3M= filter in-progress

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/main/items?limit=2&page=1&filter=W4tcHJvZ3Jlc3M=",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(total).toEqual(3);
    expect(books).toHaveLength(3);
    expect(books[0]).toHaveProperty("id");
  });

  it("load books with undefined pagination", async () => {
    const [books, total] = await loadBooks(
      "http://localhost",
      "TOKEN",
      undefined,
      undefined,
      "main",
      "W4tcHJvZ3Jlc3M="
    ); //ZmluaXNoZWQ= aW4tcHJvZ3Jlc3M= filter in-progress

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/main/items?limit=10&page=0&filter=W4tcHJvZ3Jlc3M=",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(total).toEqual(3);
    expect(books).toHaveLength(3);
    expect(books[0]).toHaveProperty("id");
  });
});

describe("loadPodcasts()", () => {
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => audiobookshelfPodcastsLibraryItems,
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });
  it("load podcasts from main library", async () => {
    const [podcasts, total] = await loadPodcasts(
      "http://localhost",
      "TOKEN",
      10,
      0,
      "podcasts"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/podcasts/items?limit=10&page=0",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(total).toEqual(2);
    expect(podcasts).toHaveLength(2);
    expect(podcasts[0]).toHaveProperty("id");
  });

  it("load podcasts from pagination", async () => {
    const [podcasts, total] = await loadPodcasts(
      "http://localhost",
      "TOKEN",
      2,
      1,
      "podcasts"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/podcasts/items?limit=2&page=1",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(total).toEqual(2);
    expect(podcasts).toHaveLength(2);
    expect(podcasts[0]).toHaveProperty("id");
  });

  it("load podcasts with undefined pagination", async () => {
    const [podcasts, total] = await loadPodcasts(
      "http://localhost",
      "TOKEN",
      undefined,
      undefined,
      "podcasts"
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost/api/libraries/podcasts/items?limit=10&page=0",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer TOKEN",
          "Content-Type": "application/json",
        },
      }
    );

    expect(total).toEqual(2);
    expect(podcasts).toHaveLength(2);
    expect(podcasts[0]).toHaveProperty("id");
  });
});

describe("createFilter()", () => {
  it("should calculate seconds", () => {
    let filter = createFilter("progress", "in-progress");
    expect(filter).toBe("progress.aW4tcHJvZ3Jlc3M%3D");
  });
});

describe("decodeHTML()", () => {
  it("should decode quote", () => {
    let entity = decodeHTML("&#39;");
    expect(entity).toEqual("'");
  });
  it("should handle empty", () => {
    let entity = decodeHTML("");
    expect(entity).toEqual("");
  });
});

describe("abLog()", () => {
  it("show console log", () => {
    jest.spyOn(global.console, "info").mockReturnValue(undefined);
    abLog("index", "test");
    expect(console.info).toBeCalled();
  });
});

describe("updateStatus()", () => {
  it("show status ", () => {
    jest.spyOn(logseq.UI, "showMsg");
    const message = updateStatus("Status update test");
    expect(logseq.UI.showMsg).toBeCalled();
  });
});

describe("renderTemplate()", () => {
  it("renders simple book template", () => {
    const template = "{{{title}}}";

    const progress: Progress = audiobookshelfProgress as Progress;
    const book = audiobookshelfBooksLibraryItems as BookLibraryItems;
    //progress.finishedAt == null
    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "book",
      progress,
      book.results[0]
    );
    expect(templateRendered).toEqual(
      "Adventures of Huckleberry Finn: A Signature Performance by Elijah Wood"
    );
  });

  it("renders complex book template()", () => {
    const template = `### books/{{{title}}}
collapsed:: false
subtitle:: {{subtitle}}
progress:: {{{progress}}}
isFinished:: {{{isFinished}}}
duration:: {{{duration}}}
currentTime:: {{{currentTime}}}
{{!===== Authors =====}}
{{#authors.length}}
authors:: {{#authors}}[[{{{name}}}]]{{/authors}}
{{/authors.length}}
{{!===== Narrators =====}}
{{#narrators.length}}
narrators:: {{#narrators}}[[{{{.}}}]]{{/narrators}}
{{/narrators.length}}
{{!===== Genres =====}}
{{#genres.length}}
genres:: {{#genres}}[[{{{.}}}]]{{/genres}}
{{/genres.length}}
{{!===== Series =====}}
{{#series}}
series:: {{#series}}[[{{{name}}}]]{{/series}}
{{/series}}
source:: [Open in Audiobookshelf]({{{audiobookshelfUrl}}})
asin:: {{{asin}}}
isbn:: {{{isbn}}}
{{!===== Tags =====}}
{{#tags.length}}
tags:: {{#tags}}[[{{{.}}}]] {{/tags}}
{{/tags.length}}
{{!===== Started Date =====}}
{{#startedDate}}
startedDate:: [[{{{startedDateParsed}}}]]
{{/startedDate}}
{{!===== Finished Date =====}}
{{#finishedDate}}
finishedDate:: [[{{{finishedDateParsed}}}]]
{{/finishedDate}}

{{{description}}}`;

    const progress = audiobookshelfProgress as Progress;
    const book = audiobookshelfBooksLibraryItems as BookLibraryItems;

    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "book",
      progress,
      book.results[0]
    );
    expect(templateRendered)
      .toEqual(`### books/Adventures of Huckleberry Finn: A Signature Performance by Elijah Wood
collapsed:: false
subtitle:: 
progress:: 42.06%
isFinished:: false
duration:: 0h 24m 14s
currentTime:: 0h 10m 12s
authors:: [[Mark Twain]]
narrators:: [[Elijah Wood]]
genres:: [[Literature & Fiction]]
series:: [[Twain's Tom and Huck]]
source:: [Open in Audiobookshelf](http://localhost/item/li_q9teoi4jste86wnk76)
asin:: B0040J17CW
isbn:: 
tags:: [[Classics]] [[Genre Fiction]] [[Coming of Age]] [[Literary Fiction]] 
startedDate:: [[Nov 10th,2022]]

Earphones Award Winner (AudioFile Magazine)  Audible is pleased to announce the premiere of an exciting new series, Audible Signature Classics, featuring literature’s greatest stories, performed by accomplished stars handpicked for their ability to interpret each work in a new and refreshing way. The first book in the series is Mark Twain’s Adventures of Huckleberry Finn, performed by Elijah Wood.  Ernest Hemingway said, “All modern American literature comes from one book by Mark Twain called Huckleberry Finn". One hundred years after its author’s death, this classic remains remarkably modern and poignantly relevant. In this brand new edition, Elijah Wood reads Huck in a youthful voice that may be the closest interpretation to Twain’s original intent. His performance captures the excitement and confusion of adolescence and adventure. Best of all, the immediacy of Wood’s energetic reading sweeps listeners up and makes them feel as though they’re along for the ride, as Huck and Jim push their raft toward freedom.  Stay tuned for more one-of-a-kind performances from actors Kenneth Branagh, David Hyde Pierce, Leelee Sobieski, and more, only from Audible Signature Classics.`);
  });

  it("renders progress finished template()", () => {
    const template = `### books/{{{title}}}
progress:: {{{progress}}}
isFinished:: {{{isFinished}}}
duration:: {{{duration}}}
currentTime:: {{{currentTime}}}`;

    const progress = audiobookshelfProgressFinished as Progress;
    const book = audiobookshelfBooksLibraryItems as BookLibraryItems;

    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "book",
      progress,
      book.results[1]
    );
    expect(templateRendered).toEqual(`### books/The Alchemist
progress:: 100%
isFinished:: true
duration:: 0h 24m 14s
currentTime:: 0h 10m 12s`);
  });

  it("renders non existing progress emplate()", async () => {
    const template = `### books/{{{title}}}
progress:: {{{progress}}}
isFinished:: {{{isFinished}}}
duration:: {{{duration}}}
currentTime:: {{{currentTime}}}`;

    global.fetch = jest
      .fn()
      .mockImplementationOnce(() => Promise.reject("NOT FOUND"));

    const progress = await loadProgress(
      "http://localhost",
      "TOKEN",
      "li_bufnnmp4y5o2gbbxfm",
      "fake_id"
    );

    const book = audiobookshelfBooksLibraryItems as BookLibraryItems;

    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "book",
      progress,
      book.results[1]
    );
    expect(templateRendered).toEqual(`### books/The Alchemist
progress:: 0.00%
isFinished:: false
duration:: 0h 0m 0s
currentTime:: 0h 0m 0s`);
  });

  it("renders simple podcast template", () => {
    const template = "{{{title}}} - {{{episodeTitle}}}";

    const progress: Progress = audiobookshelfProgress as Progress;
    const podcastItems =
      audiobookshelfPodcastsLibraryItems as PodcastLibraryItems;
    //TODO create Podcast variable with only podcast data
    //TODO create episode variable with only episode, progress shoudl be for that episode
    const podcast = podcastItems.results[0];
    const episode = podcast.media.episodes[0];
    //progress.finishedAt == null
    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "podcast",
      progress,
      undefined,
      podcast,
      episode
    );
    expect(templateRendered).toEqual(
      "Lex Fridman Podcast - 351-–-Mr-Beast-Future-of-You-Tube,-Twitter,-Tik-Tok,-and-Instagram"
    );
  });

  it("renders simple podcast template finished", () => {
    const template = "{{{title}}} - {{{episodeTitle}}}";

    const progress: Progress = audiobookshelfProgressFinished as Progress;
    const podcastItems =
      audiobookshelfPodcastsLibraryItems as PodcastLibraryItems;
    const podcast = podcastItems.results[1];
    const episode = podcast.media.episodes[1];

    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "podcast",
      progress,
      undefined,
      podcast,
      episode
    );
    expect(templateRendered).toEqual(
      "You Are Not So Smart - 250 - Awe - Dacher Keltner"
    );
  });

  it("renders complex podcast template", () => {
    const template = `## {{{episodeTitle}}}
{{#genres.length}}
genres:: {{#genres}}[[{{{.}}}]]{{/genres}}
{{/genres.length}}
{{!===== Tags =====}}
{{#tags.length}}
tags:: {{#tags}}[[{{{.}}}]] {{/tags}}
{{/tags.length}}
{{!===== Started Date =====}}
{{#startedDate}}
startedDate:: [[{{{startedDateParsed}}}]]
{{/startedDate}}
{{!===== Finished Date =====}}
{{#finishedDate}}
finishedDate:: [[{{{finishedDateParsed}}}]]
{{/finishedDate}}
{{{episodeDescription}}}`;

    const progress: Progress = audiobookshelfProgress as Progress;
    const podcastItems =
      audiobookshelfPodcastsLibraryItems as PodcastLibraryItems;
    const podcast = podcastItems.results[0];
    const episode = podcast.media.episodes[1];

    const templateRendered = renderTemplate(
      template,
      "http://localhost",
      "MMM do,yyyy",
      "podcast",
      progress,
      undefined,
      podcast,
      episode
    );
    expect(templateRendered).toEqual(
      `## #352 – Omar Suleiman: Islam
genres:: [[Technology]][[Podcasts]][[Science]]
startedDate:: [[Nov 10th,2022]]
<p>Imam Omar Suleiman is the Founder and President of the Yaqeen Institute for Islamic Research and a professor of Islamic Studies at Southern Methodist University. Please support this podcast by checking out our sponsors:
– NetSuite: <a>http://netsuite.com/lex</a> to get free product tour
– House of Macadamias: <a href="https://houseofmacadamias.com/lex">https://houseofmacadamias.com/lex</a> and use code LEX to get 20% off your first order
– ExpressVPN: <a href="https://expressvpn.com/lexpod">https://expressvpn.com/lexpod</a> to get 3 months free</p>
<p>EPISODE LINKS:
Omar’s Instagram: <a href="https://instagram.com/imamomarsuleiman">https://instagram.com/imamomarsuleiman</a>
Omar’s Twitter: <a href="https://twitter.com/omarsuleiman504">https://twitter.com/omarsuleiman504</a>
Omar’s Facebook: <a href="https://www.facebook.com/imamomarsuleiman">https://www.facebook.com/imamomarsuleiman</a>
Yaqeen Institute’s YouTube: <a href="https://www.youtube.com/@yaqeeninstituteofficial">https://www.youtube.com/@yaqeeninstituteofficial</a>
Yaqeen Institute’s Website: <a href="https://yaqeeninstitute.org">https://yaqeeninstitute.org</a></p>
<p>PODCAST INFO:
Podcast website: <a href="https://lexfridman.com/podcast">https://lexfridman.com/podcast</a>
Apple Podcasts: <a href="https://apple.co/2lwqZIr">https://apple.co/2lwqZIr</a>
Spotify: <a href="https://spoti.fi/2nEwCF8">https://spoti.fi/2nEwCF8</a>
RSS: <a href="https://lexfridman.com/feed/podcast/">https://lexfridman.com/feed/podcast/</a>
YouTube Full Episodes: <a href="https://youtube.com/lexfridman">https://youtube.com/lexfridman</a>
YouTube Clips: <a href="https://youtube.com/lexclips">https://youtube.com/lexclips</a></p>
<p>SUPPORT &amp; CONNECT:
– Check out the sponsors above, it’s the best way to support this podcast
– Support on Patreon: <a href="https://www.patreon.com/lexfridman">https://www.patreon.com/lexfridman</a>
– Twitter: <a href="https://twitter.com/lexfridman">https://twitter.com/lexfridman</a>
– Instagram: <a href="https://www.instagram.com/lexfridman">https://www.instagram.com/lexfridman</a>
– LinkedIn: <a href="https://www.linkedin.com/in/lexfridman">https://www.linkedin.com/in/lexfridman</a>
– Facebook: <a href="https://www.facebook.com/lexfridman">https://www.facebook.com/lexfridman</a>
– Medium: <a href="https://medium.com/@lexfridman">https://medium.com/@lexfridman</a></p>
<p>OUTLINE:
Here’s the timestamps for the episode. On some podcast players you should be able to click the timestamp to jump to that time.
(00:00) – Introduction
(08:39) – God
(16:25) – Loss
(25:14) – Life after death
(26:53) – Why God allows suffering
(40:18) – Seeking the truth
(47:58) – Islamophobia
(1:12:55) – Muslim ban
(1:20:24) – Meaning of prayer
(1:34:01) – Mecca
(1:39:12) – Malcolm X
(1:42:23) – Muhammad Ali
(1:47:09) – Khabib Nurmagomedov
(1:53:19) – Prophets
(1:59:31) – Quran
(2:05:17) – Ramadan
(2:12:21) – Future of Islam
(2:15:30) – Colleyville synagogue hostage crisis
(2:23:37) – War and religion
(2:33:29) – Israel and Palestine
(2:59:13) – Hope for the future
(3:03:56) – Prayer</p>`
    );
  });
});
