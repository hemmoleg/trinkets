//import $ from "jquery";

class Student
{
    fullName:string;
    constructor(public firstName: string, public middleName: string, public lastName: string)
    {
        this.fullName = this.firstName + " " + this.middleName + " " + this.lastName;
    }
}

interface Person
{
    firstName: string;
    lastName: string;
}


interface WinrateInfo {
    Wins: number;
    WinRate: number;
    GameCount: number;

}

interface IDBStaticChampion
{
    
}

interface MatchesInfo {
    Matches: DBMatch[];
}

interface DBMatch {
    gameId: number;
}

function greeter(person: Person) 
{
    return "Hello, " + person.firstName + " " + person.lastName;
}

var xhr = new XMLHttpRequest();

function testQuery()
{
    xhr.open('POST', "Function/GetSummonerInfo", true);
    xhr.onreadystatechange = processRequest;
    
    let endpoint = "euw1";
    let name = "hemmoleg";
    let key = "RGAPI-1d119a28-2a71-4b6c-a026-35605540f684";

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify({ "endpoint": endpoint, "name": name, "key": key}));
}

function processRequest(e :Event)
{
    switch(xhr.readyState)
    {
        case 1: console.log("connection open, request not sent");
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
                console.log(testWinRate.WinRate);*/
                break;
    }    
}

var requesterWinrate: Requester;
var requesterAllPlayedChampions: Requester;

window.onload = function () 
{
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
}

function setWinrateInfo(e: Event)
{
    if (requesterWinrate.requester.readyState === 4)
    {
        var response = JSON.parse(requesterWinrate.requester.responseText);
        //let winRateInfo = response as WinrateInfo;
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
        document.getElementById("lblWinRate3Months").innerText = response.WinRate3Months.toString() + "%";
        document.getElementById("lblGamesPlayed3Months").innerText = response.GameCount3Months.toString();
        document.getElementById("lblWinRate").innerText = response.WinRate.toString() + "%";
        document.getElementById("lblGamesPlayed").innerText = response.GameCount.toString();
    }
}

function setAllPlayedChampions(e: Event)
{
    if (requesterAllPlayedChampions.requester.readyState === 4)
    {
        const response = JSON.parse(requesterAllPlayedChampions.requester.responseText);
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