# Standard template
Example template that can be used to render Audiobookshelf item. Only single block will be created from this template.

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

