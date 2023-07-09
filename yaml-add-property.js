#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import YAML from 'yaml';
import logger from 'cli-logger';
var log = logger();
const APP_NAME = '\nYAML Add/Update Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const APP_VERSION = '0.0.6';
const YAML_PATTERN = /(?<=---[\r\n]).*?(?=[\r\n]---)/s;
const questions = [
    {
        type: 'text',
        name: 'sourcePath',
        initial: 'src/posts',
        message: 'Source folder for posts?'
    }, {
        type: 'text',
        name: 'propertyName',
        message: 'Property to add to YAML front matter?',
        initial: ''
    }, {
        type: 'text',
        name: 'propertyValue',
        message: 'Property value?',
        initial: ''
    }, {
        type: 'confirm',
        name: 'override',
        initial: false,
        message: 'Override existing property values?'
    }, {
        type: 'confirm',
        name: 'recurseFolders',
        initial: true,
        message: 'Process subfolders??'
    }
];
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
function generateFileList(filePath, recurseFolders) {
    log.info('Building file list...');
    if (recurseFolders) {
        log.debug('Recursing directories');
        return getAllFilesDeep(filePath, []);
    }
    else {
        log.debug('Skipping directory recursion');
        return getAllFilesFlat(filePath);
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
const debugMode = process.argv.includes('-d');
log.level(debugMode ? log.DEBUG : log.INFO);
log.debug('Option: Debug mode enabled\n');
log.debug(`cwd: ${process.cwd()}`);
const response = await prompts(questions);
const sourcePath = response.sourcePath;
const propertyName = response.propertyName;
const propertyValue = response.propertyValue;
const overrideMode = response.override;
const recurseFolders = response.recurseFolders;
log.info('Option: Override mode ' + overrideMode ? 'enabled' : 'disabled');
log.info('Option: Folder recursion ' + recurseFolders ? 'enabled' : 'disabled');
if (!directoryExists(path.join(process.cwd(), sourcePath))) {
    log.error(`\nSource path '${sourcePath}' does not exist, exiting`);
    process.exit(1);
}
log.info(`\nSource path: ${sourcePath}`);
fileList = generateFileList(sourcePath, recurseFolders);
if (fileList.length < 1) {
    log.error('\nNo files found in the target folder, exiting');
    process.exit(0);
}
log.info(`Located ${fileList.length} files`);
if (debugMode)
    console.dir(fileList);
fileList.forEach(function (theFile) {
    log.debug(`\nReading ${theFile}`);
    let tempFile = fs.readFileSync(theFile, 'utf8');
    tempFile = tempFile.replace(/\r/g, '');
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
