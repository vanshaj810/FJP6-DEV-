const request = require("request");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const fs = require('fs');
let xlsx = require("json-as-xlsx");

const link = "https://www.espncricinfo.com/series/ipl-2021-1249214/match-results";
let counter = 0;
request(link, cb);
let leaderboard = [];
function cb(error, response, body) {
    if (error) {
        console.error("error:", error); // Print the error if one occurred
    } else {
        const dom = new JSDOM(body);
        const document = dom.window.document;
        let scorecardlink = document.querySelectorAll('.ds-border-b.ds-border-line');
        for (let i = 0; i < 60; i++) {
            let anchorTagAll = scorecardlink[i].querySelectorAll("a");
            let link = anchorTagAll[2].href;
            let completelink = "https://www.espncricinfo.com" + link;
            request(completelink, cb2);
            counter++;
        }
    }
}
function cb2(error, response, body) {
    if (error) {
        console.log(error);
    } else {
        const dom = new JSDOM(body);
        const document = dom.window.document;
        let batsmanRow = document.querySelectorAll('tbody [class="ds-border-b ds-border-line ds-text-tight-s"]');
        for (let i = 0; i < batsmanRow.length; i++) {
            let cells = batsmanRow[i].querySelectorAll("td");
            if (cells.length == 8) {
                let name = cells[0].textContent;
                let runs = cells[2].textContent;
                let ball = cells[3].textContent;
                let four = cells[5].textContent;
                let six = cells[6].textContent;
                // console.log("Name : ", name, "\t", "Runs : ", runs, "\t", "Balls : ", ball, "\t", "Fours : ", four, "\t", "Sixes : ", six);
                processPlayer(name, runs, ball, four, six);
            }

        }
        counter--;
        if (counter == 0) {
            console.log(leaderboard);
            let data= JSON.stringify(leaderboard);
            fs.writeFileSync('BatsmanStats.json',data);
            let dataExcel = [
                {
                  sheet: "IPL 2021",
                  columns: [
                    { label: "Name", value: "Name" }, // Top level data
                    { label: "Innings", value: "Innings" },
                    { label: "Runs", value: "Runs" }, // Custom format
                    { label: "Balls", value: "Balls" },
                    { label: "Fours", value: "Fours" },
                    { label: "Sixes", value: "Sixes" }, // Run functions
                  ],
                  content: leaderboard
                },
              ]
              
              let settings = {
                fileName: "Batsman_Details", // Name of the resulting spreadsheet
                extraLength: 3, // A bigger number means that columns will be wider
                writeOptions: {}, // Style options from https://github.com/SheetJS/sheetjs#writing-options
              }
              
              xlsx(dataExcel, settings)
        }
    }

}
// processPlayer('Rohit', '15', '4', '2', '4');
// processPlayer('Virat', '50', '20', '4', '3')
// processPlayer('Rohit', '40', '20', '1', '2');
// console.log(leaderboard);
function processPlayer(name, runs, balls, fours, sixes) {
    runs = Number(runs);
    balls = Number(balls);
    fours = Number(fours);
    sixes = Number(sixes);
    for (let i = 0; i < leaderboard.length; i++) {
        let playerObj = leaderboard[i];
        if (playerObj.Name == name) {
            //will do some work here
            playerObj.Runs += runs;
            playerObj.Innings+=1;
            playerObj.Balls += balls;
            playerObj.Fours += fours;
            playerObj.Sixes += sixes;
            return;
        }
    }
    // code coming here means we did not find our player inside leaderboard
    let obj = {
        Name: name,
        Innings:1,
        Runs: runs,
        Balls: balls,
        Fours: fours,
        Sixes: sixes
    }
    leaderboard.push(obj);
}