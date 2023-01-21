# Standard Book template
Example template that can be used to render Audiobookshelf Book item. Only single block will be created from this template.

NOTE
> Description field may contain a lot of text.

```
### books/{{{title}}}
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

{{{description}}}
```


## Available variables

| Variable Name | Type | Description |
|---------------|------|-------------|
| audiobookshelfUrl | string | URL to Audiobookshelf instance with item |
| asin | string | ASIN |
| authors | list[id, name] | Authors |
| description | string | Description |
| duration | string | Duration human readable format|
| currentTime | string | Progress time human readable format|
| isFinished | boolean | Is it finished |
| explicit | boolean | Explicit |
| genres | list[string] | Genres |
| isbn | string | ISBN |
| startedDate | string | Date started|
| startedDateParsed | string| Parsed started date|
| finishedDate | string | Date finished |
| finishedDateParsed | string | Parsed fineshed date|
| language | string | Language |
| narrators | list[string] | List of narrators |
| progress | string | Progress percentage |
| publishedDate | string | Date published |
| publishedYear | string | Year published|
| publisher | string | Publisher |
| series | object{id, name, sequence} | Series |
| subtitle | string | Subtitle ||
| tags | list[string] | Tags |
| title | string | Item Title |

# Standard Podcast template
Example template that can be used to render Audiobookshelf *Podcast* item. Only single block will be created from this template.

```
### podcasts/{{{title}}}/{{{episodeTitle}}}
collapsed:: false
subtitle:: {{subtitle}}
progress:: {{{progress}}}
isFinished:: {{{isFinished}}}
duration:: {{{duration}}}
currentTime:: {{{currentTime}}}
author:: [[{{{author}}}]]
{{!===== Genres =====}}
{{#genres.length}}
genres:: {{#genres}}[[{{{.}}}]]{{/genres}}
{{/genres.length}}
source:: [Open in Audiobookshelf]({{{audiobookshelfUrl}}})
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

{{{description}}}
```

## Available variables

| Variable Name | Type | Description |
|---------------|------|-------------|
| audiobookshelfUrl | string | URL to Audiobookshelf instance with item |
| author | string | Author |
| description | string | Podcast Description |
| duration | string | Duration human readable format|
| currentTime | string | Progress time human readable format|
| isFinished | boolean | Is it finished |
| explicit | boolean | Explicit |
| genres | list[string] | Genres |
| startedDate | string | Date started|
| startedDateParsed | string| Parsed started date|
| finishedDate | string | Date finished |
| finishedDateParsed | string | Parsed fineshed date|
| language | string | Language |
| progress | string | Progress percentage |
| releaseDate | string | Date released |
| tags | list[string] | Tags |
| title | string | Podcast Title |
| episodeTitle | string | Episode Title |
| episodeSubtitle| string | The subtitle of the podcast episode.|
| index | string | Episode Index |
| season | string | The season of the podcast episode, if known. |
| episode | string | The episode of the season of the podcast, if known.|
| episodeType | string | The type of episode that the podcast episode is. |
| episodeDescription | string | Episode Description |
| episodePubDate | string | When the podcast episode was published. |
| episodePublishedAt | number | The time (in ms since POSIX epoch) when the podcast episode was published.|
| episodeAddedAt | number | The time (in ms since POSIX epoch) when the podcast episode was added to the library. |
| episodeUpdatedAt | number | The time (in ms since POSIX epoch) when the podcast episode was last updated.|
