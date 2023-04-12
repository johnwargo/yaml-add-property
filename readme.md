# Add YAML Property

A command-line utility for adding or modifying a YAML frontmatter property in all files in a particular directory (and all subdirectories therein). Created to enable batch updates of content files with YAML frontmatter. 

I created the package to enable me to add a `description` property (with no value) to all of the Post markdown files in an [Eleventy](https://www.11ty.dev/) site, but it works for any file with YAML frontmatter. You can easily use it to add a property and value as well.

**Note:** The utility only modifies top-level YAML properties. It does not support nested properties at this time (but could at some time)

## Installation

To install the package, open a terminal window or command prompt and execute the following command:

```shell
npm install -g yaml-add-property
```

This adds a `yaml-add-prop` command you can use to batch add a YAML property and, optionally, a property value to all of the files with YAML frontmatter in a particular folder and all subfolders.

## Usage

The package supports two required and one optional command-line arguments:

| Argument        | Status      | Description |
| --------------- | ----------- | ----------- | 
| `sourcePath`    | Required    | The folder name, relative to the execution folder, for the source files. |
| `propertyName`  | Required    | The property name added to the YAML frontmatter.                         |
| `propertyValue` | Optional    | The value assigned to the property added to the frontmatter. When omitted from the command-line, defaults to a blank string (`''`) |
