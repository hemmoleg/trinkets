//import * as signalR from "signalr.js";
//import signalR = require("./signalr.js");
import '../css/style.less';
import { HubConnectionBuilder } from "@aspnet/signalr";
import { Requester } from "./Requester";
//import { module } from "../../webpack.config";
/*function testQuery()
{
    xhr.open('POST', "Function/GetSummonerInfo", true);
    xhr.onreadystatechange = processRequest;

    let endpoint = "euw1";
    let name = "hemmoleg";
    let key = "RGAPI-1d119a28-2a71-4b6c-a026-35605540f684";

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ "endpoint": endpoint, "name": name, "key": key}));
}*/
/*function processRequest(e :Event)
{
    switch(xhr.readyState)
    {
        case 1: console.log("channelServerMsg open, request not sent");
                break;
        case 2: console.log("request sent, status is " + xhr.status + " " + xhr.statusText);
                break;
        case 3: console.log("downloading...");
                break;
        case 4: var response = JSON.parse(xhr.responseText);
            let testMatchesInfo = response as DBMatch[];
            console.log(response);
            console.log(testMatchesInfo.length);
                /*let testWinRate = response as WinrateInfo;
                console.log(response);
                console.log(testWinRate.WinRate);
                break;
    }
}*/
var btnUpdateDB;
var inputApiKey;
var requesterWinrate;
var tester;
var channelServerMsg;
if (module.hot) {
    module.hot.accept(); /*[],
        function()
        {
            console.log('Accepting the updated printMe module!');
        });*/
}
window.onload = onLoad;
function onLoad() {
    channelServerMsg = new HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();
    btnUpdateDB = $("#btnUpdateDB");
    inputApiKey = $("#inputApiKey");
    btnUpdateDB.click(onClickBtnUpdateDB)
        .toggleClass("AnimUpdateDB")
        .text("looking for new games...")
        .prop("disabled", true);
    inputApiKey.keypress(function (e) {
        var key = e.which;
        if (key == 13) {
            var requester = new Requester("https://localhost:5001/Main/UpdateApiKey/");
            requester.parameter = inputApiKey.val().toString();
            requester.send();
            btnUpdateDB.text("looking for new games...");
            btnUpdateDB.toggleClass("AnimUpdateDB");
        }
    });
    inputApiKey.on("transitionend", function () {
        if ($("#topContainer").hasClass("topContainerOnNoRiotConnection"))
            inputApiKey.css("zIndex", 0);
        else
            inputApiKey.css("zIndex", -1);
    });
    document.getElementById("ddChampion").onchange = onDdChampionSelect;
    requesterWinrate = new Requester("https://localhost:5001/Main/GetWinrateByChampID/");
    requesterWinrate.requester.onreadystatechange = setWinrateInfo;
    requesterWinrate.parameter = "202";
    requesterWinrate.send();
    tester = new Requester("https://localhost:5001/Main/GetAllPlayedChampions");
    tester.requester.onreadystatechange = setAllPlayedChampions;
    tester.send();
    channelServerMsg.on("ReceiveMessage", function (user, message) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var encodedMsg = user + " says " + msg;
        var li = document.createElement("li");
        li.textContent = encodedMsg;
        console.log(encodedMsg);
    });
    channelServerMsg.on("UpdateBtnUpdateDBText", function (user, message) {
        btnUpdateDB.text("Update DB (" + message + ")")
            .prop("disabled", false)
            .toggleClass("AnimUpdateDB");
        console.log(user, message);
        if (message === "No connection to Riot Servers") {
            btnUpdateDB.prop("disabled", true);
            $("#topContainer").toggleClass("topContainerOnNoRiotConnection");
        }
        else if ($("#topContainer").hasClass("topContainerOnNoRiotConnection")) {
            inputApiKey.css("zIndex", -1);
            $("#topContainer").toggleClass("topContainerOnNoRiotConnection");
        }
    });
    channelServerMsg.start().catch(function (err) { return console.error(err.toString()); });
    var requesterMain = new Requester("https://localhost:5001/Main/Main/");
    requesterMain.send();
}
function setWinrateInfo(e) {
    if (requesterWinrate.requester.readyState === 4) {
        var response = JSON.parse(requesterWinrate.requester.responseText);
        console.log(response);
        //check NaN's
        if (response.WinRate2Weeks.toString() === "NaN")
            response.WinRate2Weeks = "-";
        if (response.WinRate3Months.toString() === "NaN")
            response.WinRate3Months = "-";
        if (response.WinRate.toString() === "NaN")
            response.WinRate = "-";
        document.getElementById("lblWinRate2Weeks").innerText = response.WinRate2Weeks.toString() + "%";
        document.getElementById("lblGamesPlayed2Weeks").innerText = response.GameCount2Weeks.toString();
        document.getElementById("lblAvgGameTime2Weeks").innerText = convertSecondsToTime(response.AvgGameTime2Weeks);
        document.getElementById("lblWinRate3Months").innerText = response.WinRate3Months.toString() + "%";
        document.getElementById("lblGamesPlayed3Months").innerText = response.GameCount3Months.toString();
        document.getElementById("lblAvgGameTime3Months").innerText = convertSecondsToTime(response.AvgGameTime3Months);
        document.getElementById("lblWinRate").innerText = response.WinRate.toString() + "%";
        document.getElementById("lblGamesPlayed").innerText = response.GameCount.toString();
        document.getElementById("lblAvgGameTime").innerText = convertSecondsToTime(response.AvgGameTime);
    }
}
function setAllPlayedChampions(e) {
    if (tester.requester.readyState === 4) {
        var response = JSON.parse(tester.requester.responseText);
        console.log(response);
        response.forEach(function (champion) {
            var newoption = document.createElement("option");
            newoption.text = champion.name;
            newoption.value = champion.id;
            document.getElementById("ddChampion").appendChild(newoption);
        });
    }
}
function onDdChampionSelect(e) {
    var select = document.getElementById("ddChampion");
    requesterWinrate.parameter = select.options[select.selectedIndex].value.toString();
    requesterWinrate.send();
}
function onClickBtnUpdateDB() {
    channelServerMsg.invoke("SendMessage", "onClickUpdateDB", "onClickUpdateDBMsg").catch(function (err) { return console.error(err.toString()); });
    tester = new Requester("https://localhost:5001/Main/UpdateDB");
    //requesterAllPlayedChampions.requester.onreadystatechange = setAllPlayedChampions;
    tester.send();
    btnUpdateDB.toggleClass("AnimUpdateDB");
    console.log("TEST3");
}
function convertSecondsToTime(seconds) {
    if (seconds === 0)
        return "--:--";
    var minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds - minutes * 60);
    var secsS = secs < 10 ? "0" + secs : secs;
    return minutes + ":" + secsS;
}
//# sourceMappingURL=index.js.map