#!/usr/bin/env node

/** 
 * Add YAML Property to a file
 * by John M. Wargo (https://johnwargo.com)
 * Created Aptil 2021
 */

import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml'
//@ts-ignore
import logger from 'cli-logger';
var log = logger();

const APP_NAME = '\nYAML Add Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';

var fileList: String[] = [];

// ====================================
// Functions
// ====================================
function compareFunction(a: any, b: any) {
  if (a.category < b.category) {
    return -1;
  }
  if (a.category > b.category) {
    return 1;
  }
  return 0;
}

function getAllFiles(dirPath: string, arrayOfFiles: string[]) {
  var files = fs.readdirSync(dirPath)
  arrayOfFiles = arrayOfFiles || []
  files.forEach(function (file: string) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(path.join(process.cwd(), dirPath, file));
    }
  });
  return arrayOfFiles
}

function getFileList(filePath: string, debugMode: boolean): String[] {
  if (debugMode) console.log();
  log.info('Building file list...');
  log.debug(`filePath: ${filePath}`);
  return getAllFiles(filePath, []);
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

function findFilePath(endPath: string, thePaths: string[]): string {
  // set the default value, the last path in the array
  let resStr = path.join(thePaths[thePaths.length - 1], endPath);
  for (var tmpPath of thePaths) {
    let destPath: string = path.join(tmpPath, endPath);
    log.debug(`Checking ${destPath}`);
    if (directoryExists(destPath)) {
      resStr = destPath;
      break;
    }
  }
  return resStr;
}

// ====================================
// Start Here!
// ====================================

console.log(APP_NAME);
console.log(APP_AUTHOR);

// do we have command-line arguments?
const myArgs = process.argv.slice(2);
const debugMode = myArgs.includes('-d');

// set the logger log level
log.level(debugMode ? log.DEBUG : log.INFO);
log.debug('Debug mode enabled\n');
log.debug(`cwd: ${process.cwd()}`);

// TODO: Ask for the source folder
let sourceFolder = 'src';

fileList = getFileList(sourceFolder, debugMode);
if (fileList.length < 1) {
  log.error('\nNo files found in the target folder, exiting');
  process.exit(0);
}

log.info(`Located ${fileList.length} files`);
if (debugMode) console.dir(fileList);

fileList.forEach(function (item) {
  // TODO: Load the YAML frontmatter

  // TODO: Add our property to it


  // TODO: Write the Frontmatter back to the file

});
