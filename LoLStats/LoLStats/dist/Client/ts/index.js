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
var ddChampion;
var requesterWinrate;
var requesterUpdateDB;
var requesterChampionIconString;
var channelServerMsg;
var flexContainer;
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
    ddChampion = $("#ddChampion");
    flexContainer = document.getElementsByClassName("flexContainer")[0];
    btnUpdateDB.click(onClickBtnUpdateDB)
        .toggleClass("AnimUpdateDB")
        .text("looking for new games...")
        .prop("disabled", true);
    inputApiKey.on("transitionend", function () {
        if ($("#topContainer").hasClass("topContainerOnNoRiotConnection"))
            inputApiKey.css("zIndex", 0);
        else
            inputApiKey.css("zIndex", -1);
    });
    ddChampion.on("change", onDdChampionSelect);
    requesterWinrate = new Requester("https://localhost:5001/Main/GetWinrateByChampID/");
    requesterWinrate.requester.onreadystatechange = setWinrateInfo;
    requesterUpdateDB = new Requester("https://localhost:5001/Main/GetAllPlayedChampions");
    requesterUpdateDB.requester.onreadystatechange = setAllPlayedChampions;
    requesterUpdateDB.send();
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
        if (message === "No new Matches") {
            btnUpdateDB.text("No new Matches");
            btnUpdateDB.prop("disabled", true);
        }
        if (message === "No connection to Riot Servers") {
            btnUpdateDB.text(message);
            btnUpdateDB.prop("disabled", true);
            $("#topContainer").addClass("topContainerOnNoRiotConnection");
            inputApiKey.on("keypress", onKeypressInputApiKey);
        }
        else if ($("#topContainer").hasClass("topContainerOnNoRiotConnection")) {
            inputApiKey.css("zIndex", -1);
            $("#topContainer").toggleClass("topContainerOnNoRiotConnection");
        }
    });
    channelServerMsg.on("AddMessageToConsole", function (user, message) {
        addMessageToConsole(message);
        console.log(user, message);
    });
    channelServerMsg.start().catch(function (err) { return console.error(err.toString()); });
    $("#btnTest").click(function () {
        var x = new Requester("https://localhost:5001/Main/Main/");
        x.send();
    });
    var requesterMain = new Requester("https://localhost:5001/Main/Main/");
    requesterMain.send();
    i = 0;
    $("#btnAddMessage").click(onBtnAddMessageClick);
    $("#btnUpdateStaticChampionData").click(onBtnUpdateStaticChampionDataClick);
}
function onKeypressInputApiKey(e) {
    var key = e.which;
    if (key == 13) {
        var requester = new Requester("https://localhost:5001/Main/UpdateApiKey/");
        requester.parameter = inputApiKey.val().toString();
        requester.send();
        btnUpdateDB.text("looking for new games...");
        btnUpdateDB.toggleClass("AnimUpdateDB");
        inputApiKey.off("keypress");
    }
}
function addMessageToConsole(message) {
    $("#updates").append('<label>' + message + '</label><br/>');
    var scrollPos = $("#updates > label:last").height() * $("#updates").children().length / 2;
    $("#updates").animate({ scrollTop: scrollPos }, 0, "", function () { });
}
var i;
function onBtnAddMessageClick() {
    addMessageToConsole("test " + i);
    i++;
}
function onDdChampionSelect(e) {
    var select = document.getElementById("ddChampion");
    requesterWinrate.parameter = select.options[select.selectedIndex].value.toString();
    //requesterChampionIconString = new Requester("https://localhost:5001/Main/GetChampionIconStringByIDAsync/");
    //requesterChampionIconString.parameter = select.options[select.selectedIndex].value.toString();
    //requesterChampionIconString.requester.onreadystatechange = setIconString;
    //requesterChampionIconString.send();
    requesterWinrate.send();
    setBackgroundString();
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
function setIconString() {
    if (requesterChampionIconString.requester.readyState === 4) {
        var response = requesterChampionIconString.requester.responseText;
        $("#iconChampion").attr("src", "https://ddragon.leagueoflegends.com/cdn/7.10.1/img/champion/" + response);
        $("#iconChampion").addClass("gray");
        $("#iconChampion").on("load", function () {
            $("#iconChampion").removeClass("gray");
        });
        console.log("icon address: " + "https://ddragon.leagueoflegends.com/cdn/7.10.1/img/champion/" + response);
    }
}
function setBackgroundString() {
    var t = document.getElementById("ddChampion");
    var bg = document.getElementById("imgBG");
    bg.src = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + t.selectedOptions[0].text + "_0.jpg";
    bg.classList.add("gray");
    bg.onload = function () { bg.classList.remove("gray"); };
    console.log("bg address: " + "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + t.selectedOptions[0].text + "_0.jpg");
}
function setAllPlayedChampions(e) {
    if (requesterUpdateDB.requester.readyState === 4) {
        var response_1 = JSON.parse(requesterUpdateDB.requester.responseText);
        console.log(response_1);
        response_1.forEach(function (champion) {
            $.each(response_1, function (i, item) {
                var img = document.createElement("img");
                img.src = "https://ddragon.leagueoflegends.com/cdn/7.10.1/img/champion/" + item.name + ".png";
                console.log("https://ddragon.leagueoflegends.com/cdn/7.10.1/img/champion/" + item.name);
                flexContainer.appendChild(img);
                ddChampion.append($('<option>', { value: item.id, text: item.name }));
            });
        });
        onDdChampionSelect(new Event(null));
    }
}
function onClickBtnUpdateDB() {
    //channelServerMsg.invoke("SendMessage", "onClickUpdateDB", "onClickUpdateDBMsg").catch(err => console.error(err.toString()));
    requesterUpdateDB = new Requester("https://localhost:5001/Main/UpdateDB");
    requesterUpdateDB.send();
    requesterUpdateDB.requester.onload = onUpdateDBSuccess;
    btnUpdateDB.toggleClass("AnimUpdateDB");
    $("#veil").css("display", "block");
    $("#consoleContainer").toggleClass("scale1");
}
function onUpdateDBSuccess() {
    console.log("UpdateDB done");
    $("#veil").css("display", "none");
    $("#consoleContainer").toggleClass("scale1");
    btnUpdateDB.text("DB is up to date");
    btnUpdateDB.prop("disabled", true);
    btnUpdateDB.toggleClass("AnimUpdateDB");
}
function convertSecondsToTime(seconds) {
    if (seconds === 0)
        return "--:--";
    var minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds - minutes * 60);
    var secsS = secs < 10 ? "0" + secs : secs;
    return minutes + ":" + secsS;
}
function onBtnUpdateStaticChampionDataClick() {
    var requesterUpdateStaticChampionData = new Requester("https://localhost:5001/Main/UpdateStaticChampionData");
    requesterUpdateStaticChampionData.send();
    requesterUpdateStaticChampionData.requester.onload = onUpdateStaticChampionDataSuccess;
    btnUpdateDB.toggleClass("AnimUpdateDB");
}
function onUpdateStaticChampionDataSuccess() {
    //console.log("Update static champion data done");
    btnUpdateDB.text("Updated static champion data");
    btnUpdateDB.prop("disabled", true);
    btnUpdateDB.toggleClass("AnimUpdateDB");
}
//# sourceMappingURL=index.js.map