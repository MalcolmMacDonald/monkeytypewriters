// shakespeare dataset from https://github.com/ravexina/shakespeare-plays-dataset-scraper
// common english words dataset from https://github.com/first20hours/google-10000-english/blob/master/google-10000-english-usa-no-swears-short.txt
var fs = require('fs');
var path = require('path');
var readline = require('readline');
const { execSync, spawnSync } = require('child_process');
var twitterInterface = require('./twitterInterface');
var wordReplacer = require('./wordreplacer');
var dateHasher = require('./datehasher');
var allPlayPaths = [];
var wordsToReplace;
var replacedWordCount;


GetPlayPaths();


ConstructTweet();


function ConstructTweet() {
    wordsToReplace = Math.ceil(Math.random() * 4.0);
    replacedWordCount = 0;
    dateHasher.getPassageInfo(allPlayPaths, new Date(), function (err, passageInfo) {

        GetPassage(passageInfo, function (passage) {
            console.log(passage);

            ReplaceMultipleWords(passage, function (err, replacedPassage) {
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
function ReplaceMultipleWords(passage, callback) {
    wordReplacer.ReplaceWordInPassage(passage, function (err, replacedPassage) {
        if (err) {
            callback(err);
            return;
        }
        replacedWordCount++;
        if (replacedWordCount >= wordsToReplace) {
            callback(null, replacedPassage);
            return
        }
        //console.log(replacedPassage);

        ReplaceMultipleWords(replacedPassage, callback);
    });
}


function GetPlayPaths() {
    var playsDirPathName = path.join(__dirname, 'shakespeare-db');
    var playsDir = fs.opendirSync(playsDirPathName);
    var dirEntry;
    while ((dirEntry = playsDir.readSync()) !== null) {
        allPlayPaths.push(playsDirPathName + "/" + dirEntry.name);
    }
    playsDir.closeSync();
}



function GetPassage(passageInfo, callback) {
    var filePath = allPlayPaths[passageInfo.playIndex];
    var readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        termal: false
    });
    var currentLine = 1;
    var tweetText = "";
    readInterface.on('line', function (line) {

        if (currentLine >= passageInfo.lineIndex) {
            if ((line.length + tweetText.length) > 240 || (currentLine > passageInfo.lineIndex && !line.startsWith(' '))) {
                readInterface.removeAllListeners();
                readInterface.close();
                callback(tweetText);
            }
            tweetText = tweetText.concat(line + "\n");
        }
        currentLine++;
    });
}
