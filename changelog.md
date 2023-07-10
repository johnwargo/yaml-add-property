# Changelog

# 20230710 0.0.7

I forgot to update the docs before I published the previous version.

## 20230710 0.0.6

* Made the GitHub project public
* Removed Commander which killed the command-line driven usage approach
* Added Prompts package, ask for all command parameters.
* Cleaned up issue where empty properties had double quotes or `NULL``.

## 20220413

* Added the Flat Mode option to disable recursing through subdirectories while building the file list.
* Fixed a bug on Windows where the first front matter property got a carriage return (`\r`) the second time the module processes the file.
* Renamed `override` flag to `overwrite`
