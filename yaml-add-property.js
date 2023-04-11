#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import logger from 'cli-logger';
var log = logger();
const APP_NAME = '\nYAML Add Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const YAML_PATTERN = /(?<=---[\r\n]).*?(?=[\r\n]---)/s;
var fileList = [];
function compareFunction(a, b) {
    if (a.category < b.category) {
        return -1;
    }
    if (a.category > b.category) {
        return 1;
    }
    return 0;
}
function getAllFiles(dirPath, arrayOfFiles) {
    var files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        }
        else {
            arrayOfFiles.push(path.join(process.cwd(), dirPath, file));
        }
    });
    return arrayOfFiles;
}
function getFileList(filePath, debugMode) {
    if (debugMode)
        console.log();
    log.info('Building file list...');
    log.debug(`filePath: ${filePath}`);
    return getAllFiles(filePath, []);
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
function findFilePath(endPath, thePaths) {
    let resStr = path.join(thePaths[thePaths.length - 1], endPath);
    for (var tmpPath of thePaths) {
        let destPath = path.join(tmpPath, endPath);
        log.debug(`Checking ${destPath}`);
        if (directoryExists(destPath)) {
            resStr = destPath;
            break;
        }
    }
    return resStr;
}
console.log(APP_NAME);
console.log(APP_AUTHOR);
const myArgs = process.argv.slice(2);
const debugMode = myArgs.includes('-d');
log.level(debugMode ? log.DEBUG : log.INFO);
log.debug('Debug mode enabled\n');
log.debug(`cwd: ${process.cwd()}`);
let sourceFolder = 'posts';
let propName = 'newProperty';
let propValue = 'newValue';
fileList = getFileList(sourceFolder, debugMode);
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
    let frontmatter = JSON.parse(JSON.stringify(tempDoc))[0];
    if (!frontmatter[propName]) {
        frontmatter[propName] = propValue;
        let tmpFrontmatter = YAML.stringify(frontmatter, { logLevel: 'silent' });
        tempFile = tempFile.replace(YAML_PATTERN, tmpFrontmatter);
        log.info(`Writing changes to ${theFile}`);
        fs.writeFileSync(theFile, tempFile);
    }
    else {
        log.warn(`'${propName}' already exists in ${theFile}`);
    }
});
