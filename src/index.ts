import "@logseq/libs";
import {
  BlockEntity,
  IBatchBlock,
  LSPluginBaseInfo,
  PageEntity,
} from "@logseq/libs/dist/LSPlugin";

import { format } from "date-fns";

import { settingsSchema } from "./settings";

import {
  Book,
  loadBooks,
  Library,
  loadLibraries,
  loadProgress,
  decodeHTML,
  createFilter,
  abLog,
  seconds_human_readable,
  updateStatus,
} from "./utils";

import { render } from "mustache";

// TODO handle HTML encoded entities in audiobookshelf items data
// import { decode } from 'html-entities'

interface Settings {
  serverUrl: string;
  serverToken: string;
  pageName: string;
  importProgressFilters: [];
  libraryNameList: string;
  singlePageModeEnabled: boolean;
  createPages: boolean;
  updatePages: boolean;
  pageTitlePrefix: string;
  pageTitlePostfix: string;
  singlePageItemTemplate: string;
  multiPageItemTemplate: string;
  disabled: false;
}

interface AudiobookshelfBlock {
  string: string;
  children?: Array<AudiobookshelfBlock>;
}

const delay = (t = 100) => new Promise((r) => setTimeout(r, t));
let loading = false;
let pluginId = "logseq-plugin-audiobookshelf-import";

// @ts-ignore
const partial =
  (func, ...args) =>
  (...rest) =>
    func(...args, ...rest);

/**
 * main entry
 * @param baseInfo
 */
const main = async (baseInfo: LSPluginBaseInfo) => {
  logseq.useSettingsSchema(settingsSchema);

  /* toolbarItem */
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `<div data-on-click="loadAudiobookshelf" class="button">
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="26px" height="26px" viewBox="0 0 32 32" version="1.1">
    <g id="surface1">
    <path style=" fill-rule:evenodd;clip-rule=evenodd;fill:currentColor;" d="M 26.035156 14.871094 C 25.910156 14.765625 25.714844 14.613281 25.449219 14.429688 L 25.449219 12.378906 C 25.449219 7.148438 21.214844 2.910156 15.988281 2.910156 C 10.761719 2.910156 6.527344 7.148438 6.527344 12.378906 L 6.527344 14.429688 C 6.261719 14.613281 6.066406 14.765625 5.941406 14.871094 C 5.835938 14.957031 5.773438 15.089844 5.773438 15.230469 L 5.773438 17.6875 C 5.773438 17.828125 5.835938 17.960938 5.941406 18.050781 C 6.234375 18.296875 6.902344 18.804688 7.945312 19.328125 L 7.945312 19.566406 C 7.945312 20.210938 8.359375 20.730469 8.875 20.730469 C 9.386719 20.730469 9.800781 20.210938 9.800781 19.566406 L 9.800781 13.671875 C 9.800781 13.027344 9.386719 12.503906 8.875 12.503906 C 8.382812 12.503906 7.980469 12.984375 7.945312 13.589844 L 7.945312 12.375 C 7.945312 7.929688 11.542969 4.328125 15.984375 4.328125 C 20.429688 4.332031 24.027344 7.933594 24.027344 12.378906 L 24.027344 13.59375 C 23.992188 12.988281 23.59375 12.507812 23.101562 12.507812 C 22.589844 12.507812 22.175781 13.03125 22.175781 13.675781 L 22.175781 19.570312 C 22.175781 20.214844 22.589844 20.734375 23.101562 20.734375 C 23.613281 20.734375 24.027344 20.210938 24.027344 19.570312 L 24.027344 19.332031 C 25.070312 18.808594 25.742188 18.296875 26.03125 18.054688 C 26.140625 17.964844 26.203125 17.832031 26.203125 17.691406 L 26.203125 15.230469 C 26.203125 15.089844 26.140625 14.957031 26.035156 14.871094 Z M 26.035156 14.871094 "/>
    <path style=" fill-rule:evenodd;clip-rule=evenodd;fill:currentColor;" d="M 12.6875 25.117188 C 13.308594 25.117188 13.808594 24.613281 13.808594 23.996094 L 13.808594 11.4375 C 13.808594 10.820312 13.308594 10.316406 12.6875 10.316406 L 11.53125 10.316406 C 10.914062 10.316406 10.410156 10.820312 10.410156 11.4375 L 10.410156 23.996094 C 10.410156 24.613281 10.914062 25.117188 11.53125 25.117188 Z M 10.832031 13.328125 L 13.386719 13.328125 L 13.386719 13.597656 L 10.832031 13.597656 Z M 10.832031 13.328125 "/>
    <path style=" fill-rule:evenodd;clip-rule=evenodd;fill:currentColor;" d="M 16.566406 25.117188 C 17.183594 25.117188 17.6875 24.613281 17.6875 23.996094 L 17.6875 11.4375 C 17.6875 10.820312 17.183594 10.316406 16.566406 10.316406 L 15.410156 10.316406 C 14.789062 10.316406 14.289062 10.820312 14.289062 11.4375 L 14.289062 23.996094 C 14.289062 24.613281 14.789062 25.117188 15.410156 25.117188 Z M 14.710938 13.328125 L 17.265625 13.328125 L 17.265625 13.597656 L 14.710938 13.597656 Z M 14.710938 13.328125 "/>
    <path style=" fill-rule:evenodd;clip-rule=evenodd;fill:currentColor;" d="M 20.445312 25.117188 C 21.0625 25.117188 21.566406 24.613281 21.566406 23.996094 L 21.566406 11.4375 C 21.566406 10.820312 21.0625 10.316406 20.445312 10.316406 L 19.289062 10.316406 C 18.667969 10.316406 18.167969 10.820312 18.167969 11.4375 L 18.167969 23.996094 C 18.167969 24.613281 18.667969 25.117188 19.289062 25.117188 Z M 18.589844 13.328125 L 21.144531 13.328125 L 21.144531 13.597656 L 18.589844 13.597656 Z M 18.589844 13.328125 "/>
    <path style=" fill-rule:evenodd;clip-rule=evenodd;fill:currentColor;" d="M 8.476562 25.507812 L 23.5 25.507812 C 23.964844 25.507812 24.34375 25.882812 24.34375 26.351562 C 24.34375 26.816406 23.964844 27.195312 23.5 27.195312 L 8.476562 27.195312 C 8.007812 27.195312 7.632812 26.816406 7.632812 26.351562 C 7.632812 25.882812 8.007812 25.507812 8.476562 25.507812 Z M 8.476562 25.507812 "/>
    </g>
    </svg>
    </div>`,
  }); /* For loadAudiobookshelf */

  logseq.provideModel({
    async loadAudiobookshelf() {
      await fetchAudiobookshelf();
    },
  });

  console.info(`#${pluginId}: loaded`);
}; /* end_main */

async function createPage(
  title: string,
  blocks: Array<IBatchBlock>,
  properties?: {}
) {
  const page = await logseq.Editor.createPage(title, properties, {
    createFirstBlock: false,
    redirect: false,
  });
  await new Promise((r) => setTimeout(r, 500));
  const pageBlocksTree = await logseq.Editor.getPageBlocksTree(page!.name);
  if (pageBlocksTree !== null && pageBlocksTree.length === 0) {
    // the correct flow because we are using createFirstBlock: false
    const firstBlock = await logseq.Editor.insertBlock(
      page!.originalName,
      blocks[0].content,
      {
        before: false,
        isPageBlock: true,
        sibling: false,
      }
    );

    updateStatus("Created page: " + title);
    return true;
  } else if (pageBlocksTree !== null && pageBlocksTree.length === 1) {
    // createFirstBlock: false creates a block to title if the name contains invalid characters
    const _first = pageBlocksTree[0];
    await logseq.Editor.updateBlock(
      _first!.uuid,
      _first.content + "\n" + blocks[0].content
    );

    updateStatus("Updated page: " + title);
    return true;
  }
  logseq.UI.showMsg(`Error creating "${title}", page not created`, "warning");
  return false;
}

async function updatePage(page: PageEntity, blocks: Array<IBatchBlock>) {
  const pageBlocksTree = await logseq.Editor.getPageBlocksTree(
    page.originalName
  );
  // uuid isn't working: https://github.com/logseq/logseq/issues/4920
  await new Promise((r) => setTimeout(r, 500));
  if (pageBlocksTree.length === 0) {
    const firstBlock = await logseq.Editor.insertBlock(
      page!.originalName,
      blocks[0].content,
      {
        before: false,
        isPageBlock: true,
      }
    );
    //await logseq.Editor.insertBatchBlock(firstBlock!.uuid, blocks.slice(1), {sibling: true})
  } else if (pageBlocksTree.length > 0) {
    const _first = pageBlocksTree[0];

    const updateBlock = await logseq.Editor.getBlockProperty(
      _first!.uuid,
      "audiobookshelfupdateenabled"
    );

    // Update only if update property is set to true or is not set at all
    if (updateBlock || updateBlock === null) {
      // Update only if content is different
      const currentBlock = await logseq.Editor.getBlock(_first!.uuid);
      if (currentBlock?.content !== blocks[0].content.trim()) {
        if (currentBlock) {
          abLog("index", currentBlock.content.toString());
        }
        abLog("index", blocks[0].content.toString());
        await logseq.Editor.updateBlock(_first!.uuid, blocks[0].content);
        updateStatus("Updated page: " + page.originalName);
      }
    }
  } else {
    logseq.UI.showMsg(
      `Error updating "${page.originalName}", page not loaded`,
      "error"
    );

    return false;
  }
  return true;
}

const fetchAudiobookshelf = async (inBackground = false) => {
  const fnName = "fetchAudiobookshelf";

  if (loading) return;

  const {
    serverUrl,
    serverToken,
    libraryNameList,
    importProgressFilters,
    singlePageModeEnabled,
    singlePageItemTemplate,
    multiPageItemTemplate,
    createPages,
    updatePages,
    pageTitlePrefix,
    pageTitlePostfix,
    pageName,
  } = logseq.settings as Settings;

  const preferredDateFormat = (await logseq.App.getUserConfigs())
    .preferredDateFormat;

  // Ensure required variables are set
  if (!serverToken || !serverUrl) {
    await logseq.App.showMsg(
      "Missing Audiobookshelf URL or api token",
      "warning"
    );

    return;
  }

  const blockTitle = "## 📚 Books";
  const fetchingTitle = "💫 Fetching books ...";
  const singlePageImportStateTitle = "Audiobookshelf Import";

  loading = true;
  let singlePageImportTargetBlock: BlockEntity | null = null;
  let singlePageStateTargetBlock: BlockEntity | null = null;

  try {
    !inBackground && updateStatus(fetchingTitle);

    // SinglePage prep
    if (singlePageModeEnabled) {
      !inBackground && logseq.App.pushState("page", { name: pageName });

      await delay(300);

      let audiobookshelfPage = await logseq.Editor.getPage(pageName);
      if (!audiobookshelfPage) {
        audiobookshelfPage = await logseq.Editor.createPage(pageName);
      }
      if (!audiobookshelfPage) {
        throw new Error("Failed to create page");
      }

      const pageBlocksTree = await logseq.Editor.getPageBlocksTree(pageName);
      singlePageImportTargetBlock =
        pageBlocksTree.length > 0 ? pageBlocksTree[0] : null;
      singlePageStateTargetBlock =
        pageBlocksTree.length > 1 ? pageBlocksTree[1] : null;

      // Import Block
      if (singlePageImportTargetBlock) {
        await logseq.Editor.updateBlock(
          singlePageImportTargetBlock.uuid,
          fetchingTitle
        );
      } else {
        // On new page create first block
        singlePageImportTargetBlock = await logseq.Editor.appendBlockInPage(
          pageName,
          fetchingTitle
        );
      }

      // State Block
      if (singlePageStateTargetBlock) {
        await logseq.Editor.updateBlock(
          singlePageStateTargetBlock.uuid,
          singlePageImportStateTitle
        );
      } else {
        // On new page create second block
        singlePageStateTargetBlock = await logseq.Editor.appendBlockInPage(
          pageName,
          singlePageImportStateTitle
        );
      }

      if (!singlePageImportTargetBlock) {
        throw new Error("Audiobookshelf Single Page Mode import block error");
      }

      if (!singlePageStateTargetBlock) {
        throw new Error("Audiobookshelf Single Page Mode state block error");
      } else {
        // Collapse state block
        await logseq.Editor.setBlockCollapsed(
          singlePageStateTargetBlock.uuid,
          true
        );
      }
    } // END SinglePage prep

    let libraries: Library[] = [];
    let booksFilters: string[] = [];
    let books: Book[] = [];

    // Creafe list of filters
    for (let filterName of importProgressFilters) {
      abLog(fnName, "Setting filter name " + filterName);
      booksFilters.push(createFilter("progress", filterName));
    }

    // Variable to collect all books before writing to Logseq
    let booksBatch: IBatchBlock[] = [];
    let singlePageStateBatch: IBatchBlock[] = [];

    // Create library names to filter
    let libraryNameListSanitized = libraryNameList.replace(
      /^[,\s]+|[,\s]+$/g,
      ""
    ); //remove spaces after commas if entered
    libraryNameListSanitized = libraryNameList.replace(/\s*,\s*/g, ",");

    let libraryFilter: Array<string> = libraryNameListSanitized
      .split(",")
      .filter((e) => String(e).trim()); //create list of library names

    //console.info("Using libraries "+libraryFilter)
    libraries = await loadLibraries(serverUrl, serverToken, libraryFilter);

    // Iterate over libraries
    for (let i = 0; i < libraries.length; i++) {
      // Iterate over filters
      for (let booksFilter of booksFilters) {
        // Iterate over pages
        for (
          let libraryPage = 0, libraryItemsTotal = 0, libraryPages = 0;
          libraryPage <= libraryPages;
          libraryPage++
        ) {
          [books, libraryItemsTotal] = await loadBooks(
            serverUrl,
            serverToken,
            libraryPage,
            100,
            libraries[i].id,
            booksFilter
          );

          libraryPages = Math.ceil(libraryItemsTotal / 100);

          for (const book of books) {
            // Get Item Progress
            // TODO handle podcasts
            const itemProgress = await loadProgress(
              serverUrl,
              serverToken,
              book.id
            );
            const itemStartedDate = format(
              new Date(itemProgress.startedAt),
              preferredDateFormat
            );
            const itemFinishedDate = format(
              new Date(itemProgress.finishedAt),
              preferredDateFormat
            );

            abLog(
              "index",
              book.media.metadata.title + " started " + itemStartedDate
            );
            const singlePageRenderedTemplate = render(singlePageItemTemplate, {
              audiobookshelfUrl: `${serverUrl}/item/${book.id}`,
              asin: book.media.metadata.asin,
              authors: book.media.metadata.authors,
              description: book.media.metadata.description,
              duration: seconds_human_readable(itemProgress.duration),
              currentTime: seconds_human_readable(itemProgress.currentTime),
              isFinished: itemProgress.isFinished,
              explicit: book.media.metadata.explicit,
              genres: book.media.metadata.genres,
              isbn: book.media.metadata.isbn,
              startedDate: itemProgress.startedAt,
              startedDateParsed: itemStartedDate,
              finishedDate: itemProgress.finishedAt,
              finishedDateParsed: itemFinishedDate,
              language: book.media.metadata.language,
              narrators: book.media.metadata.narrators,
              progress:
                (itemProgress.progress * 100).toFixed(
                  itemProgress.progress == 1 ? 0 : 2
                ) + "%",
              publishedDate: book.media.metadata.publishedDate,
              publishedYear: book.media.metadata.publishedYear,
              publisher: book.media.metadata.publisher,
              series: book.media.metadata.series,
              subtitle: book.media.metadata.subtitle,
              tags: book.media.tags,
              title: book.media.metadata.title,
            });

            const multiPageRenderedTemplate = render(multiPageItemTemplate, {
              audiobookshelfUrl: `${serverUrl}/item/${book.id}`,
              asin: book.media.metadata.asin,
              authors: book.media.metadata.authors,
              description: book.media.metadata.description,
              duration: seconds_human_readable(itemProgress.duration),
              currentTime: seconds_human_readable(itemProgress.currentTime),
              isFinished: itemProgress.isFinished,
              explicit: book.media.metadata.explicit,
              genres: book.media.metadata.genres,
              isbn: book.media.metadata.isbn,
              startedDate: itemProgress.startedAt,
              startedDateParsed: itemStartedDate,
              finishedDate: itemProgress.finishedAt,
              finishedDateParsed: itemFinishedDate,
              language: book.media.metadata.language,
              narrators: book.media.metadata.narrators,
              progress:
                (itemProgress.progress * 100).toFixed(
                  itemProgress.progress == 1 ? 0 : 2
                ) + "%",
              publishedDate: book.media.metadata.publishedDate,
              publishedYear: book.media.metadata.publishedYear,
              publisher: book.media.metadata.publisher,
              series: book.media.metadata.series,
              subtitle: book.media.metadata.subtitle,
              tags: book.media.tags,
              title: book.media.metadata.title,
            });

            //console.log(content)

            if (singlePageModeEnabled && singlePageStateTargetBlock) {
              // update existing block if book is already in the state block
              const existingBlocks = (
                await logseq.DB.datascriptQuery<BlockEntity[]>(
                  `[:find (pull ?b [*])
                    :where
                      [?b :block/page ?p]
                      [?p :block/original-name "${pageName}"]
                      [?b :block/parent ?parent]
                      [?parent :block/uuid ?u]
                      [(str ?u) ?s]
                      [(= ?s "${singlePageStateTargetBlock.uuid}")]
                      [?b :block/content ?c]
                      [(clojure.string/includes? ?c "${book.id}")]]`
                )
              ).flat();

              /*
              if (existingBlocks.length > 0) {
                isNewBook = false
                const existingBlock = existingBlocks[0]
                // update existing block
                if (existingBlock.content !== renderedTemplate) {
                  // check if update property is set
                  const updateBlock = await logseq.Editor.getBlockProperty(existingBlock.uuid, 'audiobookshelfupdateenabled')
                  // console.info("update enabled for " + book.media.metadata.title + " " + updateBlock)
                  if (updateBlock || updateBlock === null) {
                    console.info("Updating block for " + book.media.metadata.title)
                    await logseq.Editor.updateBlock(existingBlock.uuid, renderedTemplate)
                  }
                }
              }
              */

              // If item wasn't imported
              if (existingBlocks.length == 0) {
                // Add to books block
                booksBatch.unshift({
                  content: singlePageRenderedTemplate,
                });

                // Add to state block
                singlePageStateBatch.unshift({
                  content: book.id + "." + book.media.metadata.title,
                });
              }
            }

            // Compute Audiobookshelf item page title
            const pageTitle =
              pageTitlePrefix + book.media.metadata.title + pageTitlePostfix;
            // Process template if any
            const renderedTitle = render(pageTitle, {
              mediaType: book.mediaType,
            });

            // Test on one page
            if (createPages == true) {
              const page = await logseq.Editor.getPage(renderedTitle);

              const block: IBatchBlock = {
                content: multiPageRenderedTemplate,
              };

              // Check if page exists
              if (page !== null && updatePages) {
                abLog("index", "Updating page " + renderedTitle);
                const updated = await updatePage(page, [block]);

                if (updated) {
                  abLog(
                    "index",
                    "Updating page " + renderedTitle + " completed"
                  );
                } else {
                  console.info("Error updating page " + renderedTitle);
                }
              } else {
                // new page
                abLog("index", "Creating page " + renderedTitle);

                const created = await createPage(renderedTitle, [block]);
                if (created) {
                  console.info("Creating " + renderedTitle + " completed");
                } else {
                  console.info("Error creating page " + renderedTitle);
                }
              } // END New Page
            } // END Page logic
          } // END Books
        } //END Pagination
      } // END Filters
    } // END Libraries

    // Save books to single mode page
    if (
      singlePageModeEnabled &&
      singlePageImportTargetBlock &&
      singlePageStateTargetBlock
    ) {
      if (singlePageStateBatch.length > 0) {
        await logseq.Editor.insertBatchBlock(
          singlePageStateTargetBlock.uuid,
          singlePageStateBatch,
          {
            before: true,
            sibling: false,
          }
        );
        await logseq.Editor.setBlockCollapsed(
          singlePageStateTargetBlock.uuid,
          true
        );
      }

      booksBatch.length > 0 &&
        (await logseq.Editor.insertBatchBlock(
          singlePageImportTargetBlock.uuid,
          booksBatch,
          {
            before: true,
            sibling: false,
          }
        ));
    }
  } finally {
    loading = false;
    singlePageImportTargetBlock &&
      (await logseq.Editor.updateBlock(
        singlePageImportTargetBlock.uuid,
        blockTitle
      ));
      updateStatus("Audiobookshelf Import complete")
  }
};

// bootstrap
logseq.ready(main).catch(console.error);
