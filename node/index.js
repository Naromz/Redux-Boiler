
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
const nodemailer = require("nodemailer");
var time = 0;
var lines = { heading: 'Server Backend', lines: [] };
var functions = [];

var uuidgen = uuidshort();
var bodyParser = require('body-parser')
app.use(bodyParser.json());




/* #region onLoad   */
//Loaded Functions

function loadFunctionsFromFolder() {
    fs.readdir('./functions', function (err, items) {
        for (var i = 0; i < items.length; i++) {
            fs.readFile('./functions/' + items[i], 'utf8', function (err, data) {
                var rawFunction = yaml.safeLoad(data);
                var newFunction = {};
                newFunction.name = rawFunction.name;
                if (rawFunction.frequency) 
                {
                    if(rawFunction.frequency.split(":")[0] == "S")
                    {
                        newFunction.frequency = parseInt(rawFunction.frequency.split(":")[1]);
                        newFunction.cooldown = parseInt(rawFunction.frequency.split(":")[1]);
                    }
                    else if (rawFunction.frequency.split(":")[0] == "M")
                    {
                        newFunction.frequency = parseInt(rawFunction.frequency.split(":")[1]) * 60;
                        newFunction.cooldown = parseInt(rawFunction.frequency.split(":")[1]) * 60;
                    }
                    
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
    createNewFunction();
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
    });
}

function createNewFunction()
{
    app.post('/createNewService', function (req, res, next) {
        
        //Get info from who created and also log it.
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var newuuidservice = uuidgen.new();
        const now = new Date();
        var dtstring = date.format(now, 'YYYY/MM/DD HH:mm:ss', true);
        fs.writeFile("./functions/" + newuuidservice + '.yaml',yaml.dump({creationDate:dtstring,name:req.body.name,frequency:req.body.frequency,URL:req.body.URL,email:req.body.email,uuid:newuuidservice, ...req.body}), (err) => {writeLine(`Function ${newuuidservice} Created`)});

        

        writeLine("Service " + req.body.name + " Created with uuid: " + newuuidservice + " from IP: " + ip,4,'',"#ffff00");
        lineToLog("Service " + req.body.name + " Created with uuid: " + newuuidservice + " from IP: " + ip);
        sendEmails(req.body.email, `<h3>Created Service ${req.body.name} with uuid ${newuuidservice} </h3>
        <h4>For the Node Server Service </h4>
        <h4>Please save this email as the UUID will be required to make changes.</h4>`);
        //Send Response to creator 
        res.send('Created Service ' + req.body.name + ' with uuid ' + newuuidservice + ' Please Write this uuid down.');
    });
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
        //console.log(JSON.stringify(lines.lines))

    }


    for (var i = functions.length - 1; i >= 0; i--) {
       
            if (functions[i].cooldown <= time) {
               
                //Log Job Creation
                var newJobUUID = uuidgen.new();
                writeLine("Job ID : " + newJobUUID + "-" + functions[i].uuid + " Running", 2, '', '#0000a0');
                lineToLog("  Job ID: " + newJobUUID + "-" + functions[i].uuid + " Started");

                if(functions[i].function)
                {
                    //Check Various Commands to interact with application itself
                    switch (functions[i].function.split("#")[0]) {
                                
                                case "Write":
                                writeLine(functions[i].function.split("#")[2], functions[i].function.split("#")[1],'','');
                                break;

                                case "Email":
                                break;

                                default:
                                break;
                    }
                }

                //Run URL Functions if needed.
                if (functions[i].URL) {
                    axios.get(functions[i].URL + "?uuid=" + newJobUUID + "-" + functions[i].uuid)
                        .then(response => {
                            writeLine(" Response:  " + JSON.stringify(response.data), 1);
                            lineToLog(`  Job: ${response.data.split(":")[0]} Response:    ${response.data.split(":")[1]}`);
                        })
                        .catch(err => {
                            writeLine(err + "  ", 2);
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

async function sendEmails(sendto,data) {

    var transporter = nodemailer.createTransport({
        host: `SERVER GOES HERE`,
        port: 587,
        secure: false,
        auth: {
            user: `EMAIL GOES HERE`,
            pass: `PASSWORD GOES HERE`

        },
        tls: {
            // ciphers: 'SSLv3'
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: `"Zach Moran" <Zachary.Dewitt-Moran@bemis.com>'`,
        to: sendto,
        subject: "Service Email from Node Server",
        html: data
    };

    let info = await transporter.sendMail(mailOptions)
    lineToLog("EMAIL SENT: " + JSON.stringify(info))
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


