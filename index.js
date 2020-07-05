// shakespeare dataset from https://github.com/ravexina/shakespeare-plays-dataset-scraper
// common english words dataset from https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears-short.txt
var fs = require('fs');
var path = require('path');
var readline = require('readline');
const { execSync, spawnSync } = require('child_process');
const { relative } = require('path');
var exec = require('child_process').exec;
var twitterInterface = require('./twitterInterface');
var wordReplacer = require('./wordreplacer');
var allPlayPaths = [];

function callback(err, data) {
    if (err) {
        console.log(err);
        return;
    }
    console.log(data);
}

GetPlayPaths();

ConstructTweet();


function ConstructTweet() {
    var currentPlayPath = GetRandomPlayPath();
    GetRandomStartingLineIndex(currentPlayPath, function (startingIndex) {
        GetPassage(currentPlayPath, startingIndex, function (passage) {
            console.log(passage);
            wordReplacer.ReplaceWordInPassage(passage, function (err, replacedPassage) {
                if (err) {
                    ConstructTweet();
                    return;
                }
                console.log(replacedPassage);
                twitterInterface.tweet(replacedPassage);
            });
        });

    });
}


function GetPlayPaths() {
    var playsDirPathName = path.join(__dirname, 'shakespeare-db');
    var playsDir = fs.opendirSync(playsDirPathName);
    var dirEntry;
    while ((dirEntry = playsDir.readSync()) !== null) {
        allPlayPaths.push(playsDirPathName + "\\" + dirEntry.name);
    }
    playsDir.closeSync();
}


function GetRandomPlayPath() {
    var index = Math.floor(Math.random() * (allPlayPaths.length - 1));
    var fileName = allPlayPaths[index];
    console.log(fileName);
    return fileName;

}


function GetRandomStartingLineIndex(filePath, callback) {

    var totalLines = execSync('wc -l ' + "\"" + filePath + "\"").toString().split(' ')[0];

    var initialLine = Math.floor(Math.random() * (totalLines - 1));
    var readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        termal: false
    });
    var currentLine = 1;
    readInterface.on('line', function (line) {

        if (currentLine == initialLine) {
            if (line.startsWith(' ')) {
                initialLine++;
            }
            else {
                //console.log(initialLine);
                //console.log(line);
                readInterface.removeAllListeners();
                readInterface.close();
                callback(initialLine);
            }
        }

        currentLine++;
    });
}
function GetPassage(filePath, startingLineIndex, callback) {
    var readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        termal: false
    });
    var currentLine = 1;
    var tweetText = "";
    readInterface.on('line', function (line) {

        if (currentLine >= startingLineIndex) {
            if ((line.length + tweetText.length) > 240 || (currentLine > startingLineIndex && !line.startsWith(' '))) {
                readInterface.removeAllListeners();
                readInterface.close();
                callback(tweetText);
            }
            tweetText = tweetText.concat(line + "\n");
        }
        currentLine++;
    });
}
