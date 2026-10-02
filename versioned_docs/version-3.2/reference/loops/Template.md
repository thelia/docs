---
title: Template
---

Template loop, to get available back-office or front-office templates.  
`{loop type="template" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#template-arguments}

| Argument            | Description                                                 | Default | Example             |
|---------------------|:------------------------------------------------------------|:-------:|:--------------------|
| template-type       | the type of the template you want                           |         | template-type="pdf" |

Plus the [global arguments](./global_arguments)  

## Outputs

| Variable             | Value                                   |
|:---------------------|:----------------------------------------|
| $ABSOLUTE_PATH       | absolute template path                  |
| $NAME                | template name                           |
| $RELATIVE_PATH       | relative template path                  |

Plus the [global outputs](./global_outputs)

## Template-type expected values

[Arguments](#template-arguments)

| Value                     | Description               |
|:--------------------------|---------------------------|
| admin , back-office       | back-office template      |
| email , mail              | email template            |
| front , front-office      | front-office template     |
| pdf                       | pdf template              |
