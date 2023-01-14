import { SettingSchemaDesc } from "@logseq/libs/dist/LSPlugin";

/* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
export const settingsSchema: SettingSchemaDesc[] = [
  {
    key: "generalSettingsHeading",
    title: "⚙️ General Settings",
    description: "",
    type: "heading",
    default: null,
  },
  {
    key: "serverUrl",
    type: "string",
    default: logseq.settings?.["server url"] as string,
    title: "Audiobookshelf Server URL",
    description: "Example: https://audiobookshelf.example.com",
  },
  {
    key: "serverToken",
    type: "string",
    default: logseq.settings?.["server token"] as string,
    title: "API Token",
    description:
      "Audiobookshelf uses a users API token as a Bearer token for requests. You can find your API token by logging into the Audiobookshelf web app as an admin, go to the config → users page, and click on your account.",
  },
  {
    key: "libraryNameList",
    type: "string",
    default: "",
    title: "Library names",
    description:
      "Enter comma separated library names to import. Default empty will import all. If you have 2 libraries named Audiobooks and Podcasts you can select them with following match 'Audiobooks,Podcasts'",
  },
  {
    key: "importProgressFilters",
    type: "enum",
    default: ["finished"],
    title: "Import progress filters (Default: )",
    enumChoices: ["finished", "in-progress"],
    enumPicker: "checkbox",
    description: "Select item filters to import.",
  },
  {
    key: "singlePageSettingsHeading",
    title: "📄 Single Page Mode Settings",
    description: "",
    type: "heading",
    default: null,
  },
  {
    key: "singlePageModeEnabled",
    type: "boolean",
    default: true,
    title: "Single Page Mode",
    description: "Imports Audiobookshelf items to a single page",
  },
  {
    key: "pageName",
    type: "string",
    default: "Audiobookshelf Import",
    title: "Enter the page name ",
    description: "Page name to import Audiobookshelf items.",
  },
  {
    key: "singlePageItemTemplate",
    type: "string",
    inputAs: "textarea",
    title: "Fill out template",
    description:
      "Enter the template to use for both new and updated items. Single Page items are never updated. To update items remove item ID from Audiobooskelf Import block located at the bottom of import page.",
    default: `### books/{{{title}}}
      collapsed:: false
      subtitle:: {{subtitle}}
      progress:: {{{progress}}}
      isFinished:: {{{isFinished}}}
      duration:: {{{duration}}}
      currentTime:: {{{currentTime}}}
      {{!_______________________________}}
      {{#authors.length}}
      authors:: {{#authors}}[[{{{name}}}]]{{/authors}}
      {{/authors.length}}
      {{!_______________________________}}
      {{#narrators.length}}
      narrators:: {{#narrators}}[[{{{.}}}]]{{/narrators}}
      {{/narrators.length}}
      {{!_______________________________}}
      {{#genres.length}}
      genres:: {{#genres}}[[{{{.}}}]]{{/genres}}
      {{/genres.length}}
      {{!_______________________________}}
      source:: [Open in Audiobookshelf]({{{audiobookshelfUrl}}})
      asin:: {{{asin}}}
      isbn:: {{{isbn}}}
      {{!_______________________________}}
      {{#tags.length}}
      tags:: {{#tags}}[[{{{.}}}]] {{/tags}}
      {{/tags.length}}
      {{!_______________________________}}
      {{#startedDate}}
      startedDate:: [[{{{startedDateParsed}}}]]
      {{/startedDate}}
      {{!_______________________________}}
      {{#finishedDate}}
      finishedDate:: [[{{{finishedDateParsed}}}]]
      {{/finishedDate}}
      `,
  },
  {
    key: "multiPageSettingsHeading",
    title: "📖 Multi Page Mode Settings",
    description: "",
    type: "heading",
    default: null,
  },
  {
    key: "createPages",
    type: "boolean",
    default: false,
    title: "Create pages",
    description:
      "Enables page creation for each Audiobookshelf item. Page title prefix and postfix can be configured to customize page titles.",
  },
  {
    key: "updatePages",
    type: "boolean",
    default: false,
    title: "Update pages",
    description:
      "If enabled it will update first block of existing pages. Warning: existing data in first block of the page will be lost.",
  },
  {
    key: "pageTitlePrefix",
    type: "string",
    default: "{{{mediaType}}}/",
    title: "Page title prefix",
    description:
      "Prefix to add to item title. Allowed variables: {{{mediaType}}} - Audiobookshelf item type (book or podcast). This can be used to add namespace (hardcoded) eg. 'books/' or use variable to dynamically assign namespace '{{{mediaType}}}/'.\nWarning: Changing values on pages already created will create new pages and old pages will need to be deleted manually.",
  },
  {
    key: "pageTitlePostfix",
    type: "string",
    default: "",
    title: "Page title postfix",
    description:
      "Postfix to add to item title. This can be used to add additional data to ensure uniquess eg. ' (Audiobookshelf)' \nWarning: Changing values on pages already created will create new pages and old pages will need to be deleted manually.",
  },
  {
    key: "multiPageItemTemplate",
    type: "string",
    inputAs: "textarea",
    title: "Fill out template",
    description:
      "Enter the template to use for both new and updated items. Setting audiobookshelfUpdateEnabled to false property may be intentional to act as granular one time import functionality.",
    default: `### books/{{{title}}}
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
        
        {{{description}}}`,
  },
  {
    key: "advancedSettingsHeading",
    title: "🛠️ Advanced Settings",
    description: "",
    type: "heading",
    default: null,
  },
  {
    key: "debug",
    type: "enum",
    default: [],
    title: "Enable debugging? (Default: None)",
    enumChoices: ["fetchAudiobookshelf", "utils"],
    enumPicker: "checkbox",
    description: "Select the files to enable debugging for.",
  },
];
