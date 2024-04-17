---
title: Tax Rule Country
---

Taxes by country loop.
`{loop type="tax_rule_country" name="the-loop-name" [argument="value"], [...]}`

## Arguments {#tax-arguments}

| Argument    | Description                                                                | Default | Example             |
|-------------|:---------------------------------------------------------------------------|:-------:|:--------------------|
| ask         | to choose the [function provided by te loop](#ask-expected-value)          | taxes   | ask="countries"     |
| country     | the country where the tax applies                                          | null    | country="14"        |
| state       | the state where the tax applies                                            |         | state="45"          |
| tax_rule    | the tax rule                                                               | null    | tax_rule="2"        |

Plus the [global arguments](./global_arguments) and [global arguments I18n](./global_arguments_I18n)  

## Outputs

| Variable             | Value                                   |
|:---------------------|:----------------------------------------|
| $COUNTRY             | the country                             |
| $POSITION            | the tax rule position                   |
| $STATE               | the state                               |
| $TAX                 | the tax id                              |
| $TAX_DESCRIPTION     | the description of the tax              |
| $TAX_TITLE           | the title of the tax                    |
| $TAX_RULE            | the tax rule                            |

Plus the [global outputs](./global_outputs)

## Ask expected values {#ask-expected-value}

[Arguments](#tax-arguments)

| Value         | Description                                                                                        |
|:--------------|----------------------------------------------------------------------------------------------------|
| countries     | list all country/state having the same taxes configuration (same tax rule, same taxes, same order) |
| taxes         | list taxes for this tax rule and country/state                                                     |
