import {
  seconds_human_readable,
  loadLibraries,
  loadProgress,
  loadBooks,
  createFilter,
  decodeHTML,
  abLog,
  updateStatus,
} from "../src/utils";

import audiobookshelfLibraries from "../tests/__fixtures__/libraries.json";
import audiobookshelfProgress from "../tests/__fixtures__/progress.json";
import audiobookshelfLibraryItems from "../tests/__fixtures__/library_items.json";

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
});

describe("loadBooks()", () => {
  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      json: () => audiobookshelfLibraryItems,
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

    expect(total).toEqual(1);
    expect(books).toHaveLength(1);
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

    expect(total).toEqual(1);
    expect(books).toHaveLength(1);
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

    expect(total).toEqual(1);
    expect(books).toHaveLength(1);
    expect(books[0]).toHaveProperty("id");
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
