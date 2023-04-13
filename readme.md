# Add YAML Property

A command-line utility for adding or modifying a YAML front matter property in all files in a particular directory (and all subdirectories therein). Created to enable batch updates of content files with YAML front matter. 

[yaml-add-property](https://www.npmjs.com/package/yaml-add-property) on npm.

I created the module to enable me to add a `description` property (with no value) to all of the Post markdown files in an [Eleventy](https://www.11ty.dev/) site, but it works for any file with YAML front matter. You can easily use it to add a property and value as well.

**Note:** The utility only modifies top-level YAML properties. It does not support nested properties at this time (but could at some time)

## Installation

To install the module, open a terminal window or command prompt and execute the following command:

```shell
npm install -g yaml-add-property
```

This adds a `yaml-add-prop` command you can use to batch add a YAML property and, optionally, a property value to all of the files with YAML front matter in a particular folder and all subfolders.

## Usage

To use the module, open a terminal window or command prompt, navigate to a folder near the files you want updated, and execute the following command:

```shell
yaml-add-prop <sourcePath> <propertyName> [propertyValue] [flags]
```

Arguments in angle brackets (< and >) are required. Arguments in square brackets ([ and ]) are optional.

The command supports two required and one optional command-line arguments:

| Argument        | Status      | Description                                                              |
| --------------- | ----------- | ------------------------------------------------------------------------ | 
| `sourcePath`    | Required    | The folder name, relative to the execution folder, for the source files. |
| `propertyName`  | Required    | The property name added to the YAML front matter.                         |
| `propertyValue` | Optional    | The value assigned to the property added to the front matter. When omitted from the command-line, defaults to a blank string (`''`) |

The command supports two optional flags:

| Option (or Flag) | Description|
| -------------------- | --------------------------------------------------------------------------------- |
| `-d` or `--debug`    | Debug Mode: Enables debug mode which causes additional output to the console during operation |
| `-o` or `--overwrite` | Overwrite Mode: By default, the command skips files that already contain the provided property in the file's front matter. With this option enabled, the command replaces the existing property value with the provided `propertyValue` argument |
| `-f` or `--flat`     | Flat Mode: Disables recursion when collecting files in `sourcePath`               |

**Note:** You can use any combination of none through all options on the command-line. 

For example, to add an empty `description` property to the YAML front matter in all of the files in the `posts` folder, use the following command:

```shell
yaml-add-prop posts description
```

When the module completes processing the file, each file's front matter will have a new empty `description` property as shown in the following example:

```yaml
---
tags: post
title: Ionic "Pipe not found"
categories:
  - Ionic Framework
date: 2021-02-13
description: ""
---

Chuck landjaeger andouille, burgdoggen tail beef shankle sausage tri-tip capicola strip steak bacon. 
```

**Note:** If the property already exists in a file's front matter, the module will skip updating the file. To overwrite existing values, use the `-o` or `--overwrite`

For example, to add a `example` property with a value of `testvalue` to the YAML front matter in all of the files in the `posts` folder, use the following command:

```shell
yaml-add-prop posts example testvalue
```

The resulting front matter will look like the following:

```yaml
---
tags: post
title: Ionic "Pipe not found"
categories:
  - Ionic Framework
date: 2021-02-13
description: ""
example: testvalue
---
```

If the `propertyValue` has one or more spaces in it, enclose it in quotes:

```shell
yaml-add-prop posts description "A Sample description"
```

To overwrite the existing contents of the `layout` property with the value `default` use the following:

```shell
yaml-add-prop posts layout default -o
```

or 

```shell
yaml-add-prop posts layout default --overwrite
```

To process only the files in the `sourcePath` directory and not recurse through any subdirectories, enable Flat Mode using `-f` or `--flat` as shown in the following examples:

```shell
yaml-add-prop posts example testvalue -f
```

or

```shell
yaml-add-prop posts example testvalue --flat
```

To enable debug mode while executing the previous example, add a `d` or `--debug` to the command-line arguments as shown in the following example:

```shell
yaml-add-prop posts example testvalue -d
```

or

```shell
yaml-add-prop posts example testvalue --debug
```

With these examples, the command will generate more output to the console as it executes.

### Getting Help Or Making Changes

Use [GitHub Issues](https://github.com/johnwargo/yaml-add-property/issues) to get help with this module.

Pull Requests gladly accepted, but only with complete documentation of what the change is, why you made it, and why you think its important to have in the module.

*** 

If this code helps you: <a href="https://www.buymeacoffee.com/johnwargo" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
