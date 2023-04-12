#!/usr/bin/env node

/** 
 * Add YAML Property to a file
 * by John M. Wargo (https://johnwargo.com)
 * Created Aptil 2021
 */

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml'
//@ts-ignore
import logger from 'cli-logger';
var log = logger();

const APP_NAME = '\nYAML Add Property';
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

// ====================================
// Start Here!
// ====================================

console.log(APP_NAME);
console.log(APP_AUTHOR);

program
  .version(APP_VERSION)
  .argument('<sourcePath>', 'Root folder location for source files')
  .argument('<propertyName>', 'Property name to add to the Frontmatter')
  .argument('[propertyValue]', 'Property value for the provided propertyName', '')
  .option('-d, --debug', 'Debug mode')
  .option('-o, --override', 'Override existing property')
  .action((sourcePath, propertyName, propertyValue) => {

    const options = program.opts();
    const debugMode = options.debug;
    const overrideMode = options.override;

    // set the logger log level
    log.level(debugMode ? log.DEBUG : log.INFO);
    log.debug('\nDebug mode enabled');
    if (overrideMode) log.info('Override mode enabled');
    log.debug(`cwd: ${process.cwd()}`);

    if (!directoryExists(path.join(process.cwd(), sourcePath))) {
      log.error(`\nSource path '${sourcePath}' does not exist, exiting`);
      process.exit(1);
    }

    fileList = getFileList(sourcePath, debugMode);
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
      if (tempDoc.length > 0) {
        // convert the YAML frontmatter to a JSON object        
        let frontmatter: any = JSON.parse(JSON.stringify(tempDoc))[0];        

        if (!frontmatter[propertyName] || (overrideMode && frontmatter[propertyName])) {
          log.debug(`Adding ${propertyName}: ${propertyValue}`);
          // Add our property and value to the frontmatter
          frontmatter[propertyName] = propertyValue;
          // convert the JSON frontmatter to YAML format
          let tmpFrontmatter = YAML.stringify(frontmatter, { logLevel: 'silent' });
          // tmpFrontmatter = tmpFrontmatter.replace(/\n$/, '');
          
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
