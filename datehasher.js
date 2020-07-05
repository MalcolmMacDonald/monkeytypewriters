const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

exports.getPassageInfo = function (allPlays, date, callback) {
    var hours = date.getUTCHours();
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    var seed = (hours * 24) * (day * 365) * year;

    var playIndex = seed % allPlays.length;

    var playPath = allPlays[playIndex];
    var totalLines = execSync('wc -l ' + "\"" + playPath + "\"").toString().split(' ')[0];
    var initialLine = seed % totalLines;
    var readInterface = readline.createInterface({
        input: fs.createReadStream(playPath),
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
                callback(null, {
                    playIndex: playIndex,
                    lineIndex: initialLine
                });
            }
        }

        currentLine++;
    });
}