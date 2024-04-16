---
title: Search arguments
sidebar_position: 3
---

These arguments can be set on all loops that are searchable

| Argument | Description | Default | Example |
| ------------- |:-------------:|-------------:|-------------:|
| search_in  | A comma separated list of fields in which the search is performed. Possible values : ref, title, chapo, description, postscriptum. | | search_in="title" |
| search_mode  | The search mode : `any_word` (search any word separeted by a space), `sentence` (the sentence, anywhere in the field) or `strict_sentence` (the exact sentence). | strict_sentence | search_mode="strict_sentence" |
| search_term  | The term to search. | 0 | search_term="my product" |
