---
title: Module Config
---

The module config loop retrieve module config informations
`{loop type="moduleconfig" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#area-arguments}

| Argument       | Description        | Default | Example                     |
|----------------|:-------------------|:-------:|:----------------------------|
| default_value  | The default value  | null    |                             |
| locale         | The locale         | null    | locale="en_US"              |
| module*        | The module         | null    | module="bestseller"         |
| variable*      | The variable       | null    | variable="rewriting_enable" |

Plus the [global arguments](./global_arguments)

## Outputs {#area-outputs}

| Variable        | Value                     |
|:----------------|:--------------------------|
| $VALUE          | The value of the variable |
| $VARIABLE       | The variable name         |

Plus the [global outputs](./global_outputs)
