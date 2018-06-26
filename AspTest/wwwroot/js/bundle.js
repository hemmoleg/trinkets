var Requester = /** @class */ (function () {
    function Requester(addressParam) {
        this.addressParam = addressParam;
        this.parameter = "";
        this.requester = new XMLHttpRequest();
        this.address = addressParam;
    }
    Requester.prototype.send = function () {
        this.requester.open('GET', this.address.concat(this.parameter));
        this.requester.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        this.requester.send(null);
    };
    return Requester;
}());
//import $ from "jquery";
var Student = /** @class */ (function () {
    function Student(firstName, middleName, lastName) {
        this.firstName = firstName;
        this.middleName = middleName;
        this.lastName = lastName;
        this.fullName = this.firstName + " " + this.middleName + " " + this.lastName;
    }
    return Student;
}());
function greeter(person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}
var xhr = new XMLHttpRequest();
function testQuery() {
    xhr.open('POST', "Function/GetSummonerInfo", true);
    xhr.onreadystatechange = processRequest;
    var endpoint = "euw1";
    var name = "hemmoleg";
    var key = "RGAPI-1d119a28-2a71-4b6c-a026-35605540f684";
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ "endpoint": endpoint, "name": name, "key": key }));
}
function processRequest(e) {
    switch (xhr.readyState) {
        case 1:
            console.log("connection open, request not sent");
            break;
        case 2:
            console.log("request sent, status is " + xhr.status + " " + xhr.statusText);
            break;
        case 3:
            console.log("downloading...");
            break;
        case 4:
            var response = JSON.parse(xhr.responseText);
            var testMatchesInfo = response;
            console.log(response);
            console.log(testMatchesInfo.length);
            /*let testWinRate = response as WinrateInfo;
            console.log(response);
            console.log(testWinRate.WinRate);*/
            break;
    }
}
var requesterWinrate;
var tester;
window.onload = function () {
    document.getElementById("btnUpdateDB").onclick = onClickBtnUpdateDB;
    document.getElementById("lblWinRate").innerText = "blubb3";
    document.getElementById("ddChampion").onchange = onDdChampionSelect;
    requesterWinrate = new Requester("http://localhost:5001/Main/GetWinrateByChampID/");
    requesterWinrate.requester.onreadystatechange = setWinrateInfo;
    requesterWinrate.parameter = "202";
    requesterWinrate.send();
    tester = new Requester("http://localhost:5001/Main/GetAllPlayedChampions");
    tester.requester.onreadystatechange = setAllPlayedChampions;
    tester.send();
};
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
function convertSecondsToTime(seconds) {
    if (seconds === 0)
        return "--:--";
    var minutes = Math.floor(seconds / 60);
    var secs = Math.floor(seconds - minutes * 60);
    var secsS = secs < 10 ? "0" + secs : secs;
    return minutes + ":" + secsS;
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
    tester = new Requester("http://localhost:5001/Main/UpdateDB");
    //requesterAllPlayedChampions.requester.onreadystatechange = setAllPlayedChampions;
    tester.send();
    if (document.getElementById("btnUpdateDB").classList.contains("AnimUpdateDB"))
        document.getElementById("btnUpdateDB").classList.remove("AnimUpdateDB");
    else
        document.getElementById("btnUpdateDB").classList.add("AnimUpdateDB");
}
//# sourceMappingURL=bundle.js.map