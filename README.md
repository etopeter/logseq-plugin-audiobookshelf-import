# Audiobokshelf Import
Logseq Audiobookshelf import plugin. **This plugin never deletes imported data**. Plugin can update pages. Plugin always uses first block of the page to insert/update blocks. 

**Updates can overwrite your data** so please familiarize yourself with settings before proceeding. You can disable updates by toggle switch, or setting property in first block to `audiobookshelfUpdateEnabled:: false`

There are 2 modes that can be used with this plugin. You can enable one or both of them.

## Single Page Mode
Single page is made to keep all imported items in one place. You can use it as initial place to import items and then move blocks to other pages or create dedicated pages out of them as part as your workflow.

Page name is configurable in settings and defaults to `Audiobookshelf Import`. Single page mode consists of 2 blocks: `Books` and `Audiobooks Import`. Books block is used to import Audiobookshelf items and Audiobooks Import block (collapsed) is used to store Audiobookshelf `item ID`. Once item is imported it will remain untouched. If you want to re-sync items you can delete item ID from Audbiobooks Import block.

Note if you're importing  in-progress items some metadata will not be updated (eg. progress) until you delete item ID from Audiobooks Import block. Arguably you may choose to update them manually. See Multi page mode if you want those values to be updated. 

## Multi Page Mode
Items are imported to separate page per item. Important factor in this mode is Page name which is unique identifier for each Audiobookshelf item. During import plugin is searching for existing pages that matches page title. To ensure uniqueness, page title can be configured with 2 options `pageTitlePrefix` and `pageTitlePostfix`. Page name is Audiobookshelf item title surrounded with prefix and postfix (configurable in plugin settings page). 

Additionally page prefix have `{{{mediaType}}}` variable template available that can be used. Example `{{{mediaType}}}/` that will create namespace for book/ or podcast/ respectively.

### IMPORTANT
> Once you import items any changes to `pageTitlePrefix` or `pageTitlePostfix` os items title (Audiobookshelf item metadata change), will result in creating new page. Previous page will need to be deleted manually. Because of that  **Namespaces** are recommended. This will ensure page uniqueness and help you maintain pages if titles duplicate.

Recommended use of this plugin is to ensure that synced items pages are unique and are not touching existing pages. For that there are 2 settings that can be leveraged: `Page Title Prefix` and `Page Title Postfix`.
You can use prefix setting to add namespace to the page if you choose to go that path. You can use Postfix setting to add more unique name and allow easier searches/filters in the future.

Page subsequent blocks or child blocks are not being updated and can be used to add content.


Changing page prefix/postfix will create new pages and existing pages will need to be deleted manually.

## Features
- Import to a single page. Page name is configurable.
- Information can be templatized with mustache syntax, allowing flexibility in what is beinng imported and how. Template is limited to a single block (no child blocks will be rendered). Separate templates for Single and Multi page mode for greater flexibility.
- Import and update separate pages.
- Choose items to import based on progress filter (eg. finished, in progress)
- Update existing items. Toggle update wtih audiobookshelfUpdateEnabled property per item to disable.


### API

[![npm version](https://badge.fury.io/js/%40logseq%2Flibs.svg)](https://badge.fury.io/js/%40logseq%2Flibs)



### Running the Plugin

- `Load unpacked plugin` in Logseq Desktop client.
