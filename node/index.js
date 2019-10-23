
var express = require('express')
var cors = require('cors')
var app = express()
var chalk = require('chalk');
var cron = require('node-cron');
var uuidshort = require('short-uuid');
var bodyParser = require('body-parser');
var fs = require('fs');
var yaml = require('js-yaml');
let fetch = require('node-fetch');
var axios = require('axios');
var date = require('date-and-time');


var time = 0;
var lines = { heading: 'Server Backend', lines: [] };
var functions = [];

var uuidgen = uuidshort();


/* #region onLoad   */
//Loaded Functions

function loadFunctionsFromFolder() {
    fs.readdir('./functions', function (err, items) {
        for (var i = 0; i < items.length; i++) {
            fs.readFile('./functions/' + items[i], 'utf8', function (err, data) {
                var rawFunction = yaml.safeLoad(data);
                var newFunction = {};
                newFunction.name = rawFunction.name;
                if (rawFunction.frequency) {
                    newFunction.frequency = rawFunction.frequency;
                    newFunction.cooldown = rawFunction.frequency;
                }

                newFunction.URL = rawFunction.URL;
                newFunction.uuid = rawFunction.uuid;
                newFunction.function = rawFunction.function;
                newFunction.body = rawFunction.body;

                functions.push(newFunction);
            });
        }
    });
}




function onLoad() {
    loadFunctionsFromFolder();
}



/* #endregion */





/* #region  mainFunctions */
//Main Functions

function mainFunc() {
    //Run These Functions first
    console.log('Starting Server');
    lineToLog("Server Started");
    onLoad();
    lineToLog("onLoad() Completed");
    startExpressFunctions();




    cron.schedule("*/1 * * * * *", () => {
        time = time + 1;
        writeScreen();
        updateFunction();



    });
    lineToLog("Scheduling Service Started");


}
/* #endregion */






/* #region  Express Functions */
//Express Functions

function startExpressFunctions()
{
    app.use(cors());
    testRunningService();
    app.listen(3005, function () { writeLine("Web-Server Being Started", 1); lineToLog("Web Service Started") });
}


function testRunningService()
{
    app.get('/serviceRunning', function (req, res, next) {
        if (req.query.uuid) {
            res.send(req.query.uuid + ":Service Running")
        }
        else {
            res.send('Service Up');
        }
    })
}
/* #endregion */






/* #region Update Functions   */
//Update Functions
function updateFunction() {
    var i = 0;

    for (i = lines.lines.length - 1; i >= 0; i--) {
        lines.lines[i].cooldown = lines.lines[i].cooldown - 1;
        if (lines.lines[i].cooldown <= 0) {
            lines.lines.splice(i, 1);
        }

    }


    for (var i = functions.length - 1; i >= 0; i--) {
        if (functions[i].cooldown <= time) {
            //Log Job Creation
            var newJobUUID = uuidgen.new();
            writeLine("Job ID : " + newJobUUID + "-" + functions[i].uuid + " Running", 2, '', '#0000a0');
            lineToLog("  Job ID: " + newJobUUID + "-" + functions[i].uuid + " Started");


            //Check Various Commands to interact with application itself
            switch (functions[i].function.split("#")[0]) {
                        
                        case "Write":
                         writeLine('', '#60f542', functions[i].function.split("#")[2], functions[i].function.split("#")[1]);
                         break;

                        default:
                         break;
            }

            //Run URL Functions if needed.
            if (functions[i].URL) {
                axios.get(functions[i].URL + "?uuid=" + newJobUUID + "-" + functions[i].uuid)
                    .then(response => {
                        writeLine(" Response:  " + JSON.stringify(response.data), 1);
                        lineToLog(`  Job: ${response.data.split(":")[0]} Response:    ${response.data.split(":")[1]}`);
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }

            functions[i].cooldown = functions[i].frequency + time;
        }

        
    }
}

/* #endregion */






















/* #region  Utility Functions */
//Utility Functions


function writeScreen() {
    //process.stdout.write("\u001b[2J\u001b[0;0H");
    process.stdout.write('\033c')
    console.log(chalk.bgGreen(chalk.black.underline(lines.heading)))
    console.log("Uptime: " + time + " Seconds")
    var i = 0;
    //console.log(lines.lines.length);
    for (i = 0; i < lines.lines.length; i++) {
        var line = lines.lines[i];
        console.log(chalk.hex(line.hex)(line.data));
    }


}

function lineToLog(data) {
    const now = new Date();
    var dtstring = date.format(now, 'YYYY/MM/DD HH:mm:ss', true);

    fs.appendFile('log.txt', dtstring + "   " + data + '\r\n', (err) => { if (err) { writeLine('Error Writing to Log', 3) } });
}

function writeLine(data, cooldown, uuid, hex) {

    if (!uuid || uuid == '') {
        uuid = uuidgen.new();
    }
    if (!hex || hex == '') {
        hex = '#c0c0c0'
    }
    lines.lines.push({ uuid: uuid, hex: hex, data: data, cooldown: cooldown })

}

/* #endregion */



mainFunc();


