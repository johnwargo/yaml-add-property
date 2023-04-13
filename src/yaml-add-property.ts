#!/usr/bin/env node

/** 
 * Add/Update YAML Property in a file's frontmatter
 * by John M. Wargo (https://johnwargo.com)
 * Created April 2021
 */

// TODO: Fix issue with a second run corrupting the frontmatter

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml'
//@ts-ignore
import logger from 'cli-logger';
var log = logger();

const APP_NAME = '\nYAML Add/Update Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const APP_VERSION = '0.0.1';
const program = new Command();
// get CR and/or LF, accommodates DOS and Unix file formats
// const YAML_PATTERN = /---[\r\n].*?[\r\n]---/s
const YAML_PATTERN = /(?<=---[\r\n]).*?(?=[\r\n]---)/s
// https://stackoverflow.com/questions/75845110/javascript-regex-to-replace-yaml-frontmatter/75845227#75845227

var fileList: String[] = [];

// ====================================
// Functions
// ====================================

function getAllFilesDeep(dirPath: string, fileArray: string[]) {
  // initialize the file array if it's not already set
  fileArray = fileArray || []
  // get all of the files in the directory
  var files = fs.readdirSync(dirPath)
  // process the results
  files.forEach(function (file: string) {
    let theFilePath = path.join(dirPath, file);
    if (fs.statSync(theFilePath).isDirectory()) {
      fileArray = getAllFilesDeep(theFilePath, fileArray)
    } else {
      fileArray.push(path.join(process.cwd(), dirPath, file));
    }
  });
  return fileArray
}

function getAllFilesFlat(dirPath: string): string[] {
  let fileArray: string[] = [];
  // build a full path pointing to the directory
  let filePath = path.join(process.cwd(), dirPath);
  // get all the files in the directory
  var files = fs.readdirSync(filePath)
  // loop through each file building the file list
  files.forEach(function (file: string) {
    let theFilePath = path.join(filePath, file);
    log.debug(`Checking ${theFilePath}`);
    if (!fs.statSync(theFilePath).isDirectory()) {
      fileArray.push(theFilePath);
    } else {
      log.debug(`Skipping ${theFilePath} (directory)`);
    }
  });
  return fileArray;
}

function generateFileList(filePath: string, flatMode: boolean): String[] {
  // this function kicks off the process of building the file list
  // the call to `getAllFiles` is separate because that function is recursive
  log.info('Building file list...');
  if (flatMode) {
    log.debug('Skipping directory recursion');
    return getAllFilesFlat(filePath);
  } else {
    log.debug('Recursing directories');
    return getAllFilesDeep(filePath, []);
  }
}

function directoryExists(filePath: string): boolean {
  if (fs.existsSync(filePath)) {
    try {
      return fs.lstatSync(filePath).isDirectory();
    } catch (err) {
      log.error(`checkDirectory error: ${err}`);
      return false;
    }
  }
  return false;
}

// ====================================
// Start Here
// ====================================

console.log(APP_NAME);
console.log(APP_AUTHOR);
console.log();

program
  .version(APP_VERSION)
  .argument('<sourcePath>', 'Root folder location for source files')
  .argument('<propertyName>', 'Property name to add to the Frontmatter')
  .argument('[propertyValue]', 'Property value for the provided propertyName', '')
  .option('-d, --debug', 'Debug mode')
  .option('-o, --override', 'Override existing property')
  .option('-f, --flat', 'Disable directory recursion')
  .action((sourcePath, propertyName, propertyValue) => {

    const options = program.opts();
    const debugMode = options.debug;
    const overrideMode = options.override;
    const flatMode = options.flat;

    // set the logger log level
    log.level(debugMode ? log.DEBUG : log.INFO);
    log.debug('Option: Debug mode enabled');
    if (overrideMode) log.info('Option: Override mode enabled');
    if (flatMode) log.info('Option: Flat mode enabled');
    log.debug(`cwd: ${process.cwd()}`);

    if (!directoryExists(path.join(process.cwd(), sourcePath))) {
      log.error(`\nSource path '${sourcePath}' does not exist, exiting`);
      process.exit(1);
    }

    log.info(`\nSource path: ${sourcePath}`);
    fileList = generateFileList(sourcePath, flatMode);
    if (fileList.length < 1) {
      log.error('\nNo files found in the target folder, exiting');
      process.exit(0);
    }

    log.info(`Located ${fileList.length} files`);
    if (debugMode) console.dir(fileList);

    fileList.forEach(function (theFile: any) {
      log.debug(`\nReading ${theFile}`);
      let tempFile = fs.readFileSync(theFile, 'utf8');
      // remove all of the carriage returns from the file
      tempFile = tempFile.replace(/\r/g, '');

      // get the YAML frontmatter
      let tempDoc = YAML.parseAllDocuments(tempFile, { logLevel: 'silent' });
      if (tempDoc.length > 0) {
        // convert the YAML frontmatter to a JSON object        
        let frontmatter = JSON.parse(JSON.stringify(tempDoc))[0];
        // if (debugMode) console.dir(frontmatter);
        if (!frontmatter[propertyName] || (overrideMode && frontmatter[propertyName])) {
          console.log();
          log.debug(`Adding ${propertyName}: ${propertyValue}`);

          // Add our property and value to the frontmatter
          frontmatter[propertyName] = propertyValue;
          // convert the JSON frontmatter to YAML format
          let tmpFrontmatter = YAML.stringify(frontmatter, { logLevel: 'silent' });
          // remove the extra carriage return from the end of the frontmatter
          tmpFrontmatter = tmpFrontmatter.replace(/\n$/, '');
          // replace the YAML frontmatter in the file
          tempFile = tempFile.replace(YAML_PATTERN, tmpFrontmatter);
          log.info(`Writing changes to ${theFile}`);
          fs.writeFileSync(theFile, tempFile);
        } else {
          log.warn(`Skipping ${theFile}, '${propertyName}' already exists`);
        }
      } else {
        log.warn(`Skipping ${theFile}, No YAML frontmatter found.`);
      }
    });
  });

program.parse();
