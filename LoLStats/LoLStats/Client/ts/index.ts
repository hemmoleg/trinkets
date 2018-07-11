//import * as signalR from "signalr.js";
//import signalR = require("./signalr.js");

import '../css/style.less';
import { HubConnectionBuilder, HubConnection } from "@aspnet/signalr";
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

var btnUpdateDB: JQuery<HTMLElement>;
var inputApiKey: JQuery<HTMLElement>;

var requesterWinrate: Requester;
var requesterUpdateDB: Requester;
var channelServerMsg: HubConnection;

if (module.hot)
{
    module.hot.accept();/*[],
        function()
        {
            console.log('Accepting the updated printMe module!');
        });*/
}

window.onload = onLoad;

function onLoad()
{
    channelServerMsg = new HubConnectionBuilder()
        .withUrl("/chatHub")
        .build();

    btnUpdateDB = $("#btnUpdateDB");
    inputApiKey = $("#inputApiKey");

    btnUpdateDB.click(onClickBtnUpdateDB)
        .toggleClass("AnimUpdateDB")
        .text("looking for new games...")
        .prop("disabled", true);

    inputApiKey.on("transitionend",function()
    {
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

    requesterUpdateDB = new Requester("https://localhost:5001/Main/GetAllPlayedChampions");
    requesterUpdateDB.requester.onreadystatechange = setAllPlayedChampions;
    requesterUpdateDB.send();


    channelServerMsg.on("ReceiveMessage",
        (user, message) =>
        {
            const msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const encodedMsg = user + " says " + msg;
            const li = document.createElement("li");
            li.textContent = encodedMsg;
            console.log(encodedMsg);
        }
    );

    channelServerMsg.on("UpdateBtnUpdateDBText",
        (user, message) =>
        {
            btnUpdateDB.text("Update DB (" + message + ")")
                .prop("disabled", false)
                .toggleClass("AnimUpdateDB");

            console.log(user, message);

            if (message === "No new Matches")
            {
                btnUpdateDB.text("No new Matches");
                btnUpdateDB.prop("disabled", true);
            }
            if (message === "No connection to Riot Servers") {
                btnUpdateDB.prop("disabled", true);
                $("#topContainer").addClass("topContainerOnNoRiotConnection");
                inputApiKey.on("keypress", onKeypressInputApiKey);
            }
            else if ($("#topContainer").hasClass("topContainerOnNoRiotConnection"))
            {
                inputApiKey.css("zIndex", -1);
                $("#topContainer").toggleClass("topContainerOnNoRiotConnection");
            }
        }
    );

    channelServerMsg.on("AddMessageToConsole",
        (user, message) => {
            addMessageToConsole(message);
            console.log(user, message);
        }
    );

    channelServerMsg.start().catch(err => console.error(err.toString()));

    $("#btnTest").click(function()
    {
        var x = new Requester("https://localhost:5001/Main/Main/");
        x.send();
    });

    var requesterMain = new Requester("https://localhost:5001/Main/Main/");
    requesterMain.send();

    i = 0;
    $("#btnAddMessage").click(onBtnAddMessageClick);
}

function onKeypressInputApiKey(e : any)
{
    var key = e.which;
    if (key == 13)
    {
        var requester = new Requester("https://localhost:5001/Main/UpdateApiKey/");
        requester.parameter = inputApiKey.val().toString();
        requester.send();
        btnUpdateDB.text("looking for new games...");
        btnUpdateDB.toggleClass("AnimUpdateDB");
        inputApiKey.off("keypress");
    }
}

function addMessageToConsole(message: string)
{
    $("#updates").append('<label>' + message + '</label><br/>');
    
    var scrollPos = $("#updates > label:last").height() * $("#updates").children().length / 2;
    $("#updates").animate({ scrollTop: scrollPos }, 0, "", () => { });
}

var i : number;
function onBtnAddMessageClick()
{
    addMessageToConsole("test " + i);
    i++;
}

function setWinrateInfo(e: Event)
{
    if (requesterWinrate.requester.readyState === 4)
    {
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
        document.getElementById("lblAvgGameTime2Weeks").innerText = convertSecondsToTime( response.AvgGameTime2Weeks );
        document.getElementById("lblWinRate3Months").innerText = response.WinRate3Months.toString() + "%";
        document.getElementById("lblGamesPlayed3Months").innerText = response.GameCount3Months.toString();
        document.getElementById("lblAvgGameTime3Months").innerText = convertSecondsToTime( response.AvgGameTime3Months );
        document.getElementById("lblWinRate").innerText = response.WinRate.toString() + "%";
        document.getElementById("lblGamesPlayed").innerText = response.GameCount.toString();
        document.getElementById("lblAvgGameTime").innerText = convertSecondsToTime( response.AvgGameTime );
    }
}

function setAllPlayedChampions(e: Event)
{
    if (requesterUpdateDB.requester.readyState === 4)
    {
        const response = JSON.parse(requesterUpdateDB.requester.responseText);
        console.log(response);

        response.forEach((champion: any) =>
        {
            var newoption = document.createElement("option");
            newoption.text = champion.name;
            newoption.value = champion.id;
            document.getElementById("ddChampion").appendChild(newoption);
        });
    }
}

function onDdChampionSelect(e: Event)
{
    var select = document.getElementById("ddChampion") as HTMLSelectElement;
    requesterWinrate.parameter = select.options[select.selectedIndex].value.toString();
    requesterWinrate.send();
}

function onClickBtnUpdateDB()
{
    //channelServerMsg.invoke("SendMessage", "onClickUpdateDB", "onClickUpdateDBMsg").catch(err => console.error(err.toString()));

    requesterUpdateDB = new Requester("https://localhost:5001/Main/UpdateDB");
    requesterUpdateDB.send();

    requesterUpdateDB.requester.onload = onUpdateDBSuccess;

    btnUpdateDB.toggleClass("AnimUpdateDB");
    $("#veil").css("display", "block");
    $("#consoleContainer").toggleClass("scale1");
}

function onUpdateDBSuccess()
{
    console.log("UpdateDB done");
    $("#veil").css("display", "none");
    $("#consoleContainer").toggleClass("scale1");
    btnUpdateDB.text("DB is up to date");
    btnUpdateDB.prop("disabled", true);
    btnUpdateDB.toggleClass("AnimUpdateDB");
}

function convertSecondsToTime(seconds : number)
{
    if (seconds === 0)
        return "--:--";

    let minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds - minutes * 60);
    let secsS = secs < 10 ? `0${secs}` : secs;
    return minutes + ":" + secsS;
}