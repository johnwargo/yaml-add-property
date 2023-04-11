#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import YAML from 'yaml';
import logger from 'cli-logger';
var log = logger();
const APP_NAME = '\nYAML Add Property';
const APP_AUTHOR = 'by John M. Wargo (https://johnwargo.com)';
const APP_VERSION = '0.0.1';
const program = new Command();
const YAML_PATTERN = /(?<=---[\r\n]).*?(?=[\r\n]---)/s;
var fileList = [];
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
console.log(APP_NAME);
console.log(APP_AUTHOR);
program
    .version(APP_VERSION)
    .argument('<sourcePath>', 'Root folder for source files.')
    .argument('<propertyName>', 'Property name to add to the Frontmatter.')
    .argument('<propertyValue>', 'Property value for the provided propertyName.')
    .option('-d, --debug', 'Debug mode')
    .option('-o, --override', 'Override existing property')
    .action((sourcePath, propertyName, propertyValue) => {
    const options = program.opts();
    const debugMode = options.debug;
    const overrideMode = options.override;
    log.level(debugMode ? log.DEBUG : log.INFO);
    log.debug('\nDebug mode enabled');
    if (overrideMode)
        log.info('Override mode enabled');
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
                let tmpFrontmatter = YAML.stringify(frontmatter, { logLevel: 'silent' }).trim();
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
