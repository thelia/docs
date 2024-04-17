---
title: Profile
---
 
`{loop type="profile" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#profile-arguments}

| Argument | Description                                                             |          Default           | Example             |
|----------|:------------------------------------------------------------------------|:--------------------------:|:--------------------|
| id       | A single or a list of sale ids.                                         |                            | id="2", id="1,4,7"  |

Plus the [global arguments](./global_arguments)

## Outputs

| Variable               | Value                                                                         |
|:-----------------------|:------------------------------------------------------------------------------|
| $CHAPO                 | the chapo                                                                     |
| $CODE                  |                                                                               |
| $DESCRIPTION           |                                                                               |
| $ID                    | the content id                                                                |
| $IS_TRANSLATED         | check if the content is translated                                            |
| $LOCALE                | the locale (e.g. fr_FR) of the returned data                                  |
| $POSTSCTIPTUM          | the postscriptum                                                              |
| $TITLE                 | the title                                                                     |

Plus the [global outputs](./global_outputs)
