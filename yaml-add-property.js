#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import logger from 'cli-logger';
var log = logger();
const APP_NAME = '\nYAML Add/Update Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const APP_VERSION = '0.0.1';
const program = new Command();
const YAML_PATTERN = /(?<=---[\r\n]).*?(?=[\r\n]---)/s;
var fileList = [];
function getAllFilesDeep(dirPath, fileArray) {
    fileArray = fileArray || [];
    var files = fs.readdirSync(dirPath);
    files.forEach(function (file) {
        let theFilePath = path.join(dirPath, file);
        if (fs.statSync(theFilePath).isDirectory()) {
            fileArray = getAllFilesDeep(theFilePath, fileArray);
        }
        else {
            fileArray.push(path.join(process.cwd(), dirPath, file));
        }
    });
    return fileArray;
}
function getAllFilesFlat(dirPath) {
    let fileArray = [];
    let filePath = path.join(process.cwd(), dirPath);
    var files = fs.readdirSync(filePath);
    files.forEach(function (file) {
        let theFilePath = path.join(filePath, file);
        log.debug(`Checking ${theFilePath}`);
        if (!fs.statSync(theFilePath).isDirectory()) {
            fileArray.push(theFilePath);
        }
        else {
            log.debug(`Skipping ${theFilePath} (directory)`);
        }
    });
    return fileArray;
}
function generateFileList(filePath, flatMode) {
    log.info('Building file list...');
    if (flatMode) {
        log.debug('Skipping directory recursion');
        return getAllFilesFlat(filePath);
    }
    else {
        log.debug('Recursing directories');
        return getAllFilesDeep(filePath, []);
    }
}
function directoryExists(filePath) {
    if (fs.existsSync(filePath)) {
        try {
            return fs.lstatSync(filePath).isDirectory();
        }
        catch (err) {
            log.error(`checkDirectory error: ${err}`);
            return false;
        }
    }
    return false;
}
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
    log.level(debugMode ? log.DEBUG : log.INFO);
    log.debug('Option: Debug mode enabled');
    if (overrideMode)
        log.info('Option: Override mode enabled');
    if (flatMode)
        log.info('Option: Flat mode enabled');
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
    if (debugMode)
        console.dir(fileList);
    fileList.forEach(function (theFile) {
        log.debug(`Reading ${theFile}`);
        let tempFile = fs.readFileSync(theFile, 'utf8');
        let tempDoc = YAML.parseAllDocuments(tempFile, { logLevel: 'silent' });
        if (tempDoc.length > 0) {
            let frontmatter = JSON.parse(JSON.stringify(tempDoc))[0];
            if (!frontmatter[propertyName] || (overrideMode && frontmatter[propertyName])) {
                log.debug(`Adding ${propertyName}: ${propertyValue}`);
                frontmatter[propertyName] = propertyValue;
                let tmpFrontmatter = YAML.stringify(frontmatter, { logLevel: 'silent' });
                tmpFrontmatter = tmpFrontmatter.replace(/\n$/, '');
                tempFile = tempFile.replace(YAML_PATTERN, tmpFrontmatter);
                log.info(`Writing changes to ${theFile}`);
                fs.writeFileSync(theFile, tempFile);
            }
            else {
                log.warn(`Skipping ${theFile}, '${propertyName}' already exists`);
            }
        }
        else {
            log.warn(`Skipping ${theFile}, No YAML frontmatter found.`);
        }
    });
});
program.parse();
