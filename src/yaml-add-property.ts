#!/usr/bin/env node

/** 
 * Add YAML Property to a file
 * by John M. Wargo (https://johnwargo.com)
 * Created Aptil 2021
 */

// TODO: Add command-line arguments to specify the property name and value
// TODO: Add a command-line argument to specify the source folder
// TODO: add a command-line flag to overwrite exiting properties

import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml'
//@ts-ignore
import logger from 'cli-logger';
var log = logger();

const APP_NAME = '\nYAML Add Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
// get CR and/or LF, accommodates DOS and Unix file formats
// const YAML_PATTERN = /---[\r\n].*?[\r\n]---/s
const YAML_PATTERN = /(?<=---[\r\n]).*?(?=[\r\n]---)/s
// https://stackoverflow.com/questions/75845110/javascript-regex-to-replace-yaml-frontmatter/75845227#75845227

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
let sourceFolder = 'posts';
let propName = 'newProperty';
let propValue = 'newValue';

fileList = getFileList(sourceFolder, debugMode);
if (fileList.length < 1) {
  log.error('\nNo files found in the target folder, exiting');
  process.exit(0);
}

log.info(`Located ${fileList.length} files`);
if (debugMode) console.dir(fileList);

fileList.forEach(function (theFile: any) {

  log.debug(`Reading ${theFile}`);
  let tempFile = fs.readFileSync(theFile, 'utf8');
  // get the YAML frontmatter
  let tempDoc = YAML.parseAllDocuments(tempFile, { logLevel: 'silent' });
  // convert the YAML frontmatter to a JSON object
  let frontmatter = JSON.parse(JSON.stringify(tempDoc))[0];
  if (!frontmatter[propName]) {
    // Add our property and value to the frontmatter
    frontmatter[propName] = propValue;    
    // convert the JSON frontmatter to YAML format
    let tmpFrontmatter = YAML.stringify(frontmatter, { logLevel: 'silent' });
    // replace the YAML frontmatter in the file
    tempFile = tempFile.replace(YAML_PATTERN, tmpFrontmatter);

    log.info(`Writing changes to ${theFile}`);
    fs.writeFileSync(theFile, tempFile);
  } else {
    log.warn(`'${propName}' already exists in ${theFile}`);
  }

});
