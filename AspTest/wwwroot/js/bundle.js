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
var requesterAllPlayedChampions;
window.onload = function () {
    //testQuery();
    console.log("TEST3");
    /*xhr.open('GET', "http://localhost:50528/Main/GetMatchByID/2976859413");
    xhr.onreadystatechange = processRequest;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(null);
    */
    /*xhr.open('GET', "http://localhost:50528/Main/GetMatchesByChampID/202");
    xhr.onreadystatechange = processRequest;
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(null);*/
    document.getElementById("lblWinRate").innerText = "blubb3";
    document.getElementById("ddChampion").onchange = onDdChampionSelect;
    requesterWinrate = new Requester("http://localhost:50528/Main/GetWinrateByChampID/");
    requesterWinrate.requester.onreadystatechange = setWinrateInfo;
    requesterWinrate.parameter = "202";
    requesterWinrate.send();
    requesterAllPlayedChampions = new Requester("http://localhost:50528/Main/GetAllPlayedChampions");
    requesterAllPlayedChampions.requester.onreadystatechange = setAllPlayedChampions;
    requesterAllPlayedChampions.send();
};
function setWinrateInfo(e) {
    if (requesterWinrate.requester.readyState === 4) {
        var response = JSON.parse(requesterWinrate.requester.responseText);
        var winRateInfo = response;
        document.getElementById("lblWinRate").innerText = winRateInfo.WinRate.toString() + "%";
        document.getElementById("lblGamesPlayed").innerText = winRateInfo.GameCount.toString();
    }
}
function setAllPlayedChampions(e) {
    if (requesterAllPlayedChampions.requester.readyState === 4) {
        var response = JSON.parse(requesterAllPlayedChampions.requester.responseText);
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
//# sourceMappingURL=bundle.js.map