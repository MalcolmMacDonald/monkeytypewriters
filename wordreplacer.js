var https = require('https');
var commonWords = require('fs').readFileSync(__dirname + "/CommonEnglishWords.txt").toString();
const { Console } = require('console');

const uncommonWord = (value, index, self) => {
    return !commonWords.includes(singleWord(value).toLowerCase());
}

const singleWord = (value, index, self) => {
    return value.replace(/([ .,;:\n]+)/, '');
}

const toLower = (value, index, self) => {
    return value.toLowerCase();
}

const distinct = (value, index, self) => {
    return self.map(toLower).map(singleWord).indexOf(value.toLowerCase().replace(/([ .,;:\n]+)/, '')) === index;
}

exports.ReplaceWordInPassage = function (passage, callback) {
    var words = passage.replace(/([ .,;-]+)/g, '$1§sep§').split('§sep§');
    words = words.filter(word => word.split('').some(character => character.trim() !== ''));
    words = words.filter(distinct);
    words = words.filter(uncommonWord);


    if (words.length == 0) {
        callback(new Error("No suitable words found in passage"));
    }

    var randomWordIndex = Math.floor(Math.random() * (words.length - 1));
    var randomWord = words[randomWordIndex];
    var aloneWord = randomWord.replace(/([ .,;:\n]+)/, '').toLowerCase();
    GetRhymingWord(aloneWord, function (err, result) {
        if (err) {
            callback(err);
        }
        if (result) {

            console.log("Replaced " + aloneWord + " with " + result);
            var passageWithRyme = caseReplace(passage, aloneWord, result);

            callback(null, passageWithRyme);
        }
    });

}


function GetRhymingWord(word, callback) {
    if (word == "") {
        callback(new Error("Attempted to find rhyme for empty word"));
        return;
    }
    if (word.split('').every(char => char.toUpperCase() == char.toLowerCase())) {
        callback(new Error("Attempted to find rhyme for word with no letters characters"));
        return;
    }
    https.get("https://api.datamuse.com/words?sl=" + word, (res) => {
        var data = "";
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            var dataObject = JSON.parse(data);
            if (dataObject.length == 0) {
                callback(new Error("Found no rhyming words"));
            }
            var elegibleWord = dataObject.find((element) => element.word != word).word;
            callback(null, elegibleWord);
        });
        res.on('error', () => {
            callback(new Error("Unable to access datamuse API"));
        });
    });
}
function caseWord(word, upper) {
    return String.prototype[upper ? "toUpperCase" : "toLowerCase"].apply(word[0]) + word.slice(1);
}
function caseReplace(s, fromWord, toWord) {
    return s
        .replace(caseWord(fromWord), caseWord(toWord))
        .replace(caseWord(fromWord, true), caseWord(toWord, true))
        .replace(fromWord.toUpperCase(), toWord.toUpperCase());
}