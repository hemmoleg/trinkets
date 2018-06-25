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
var tester: Requester;

window.onload = function () 
{
    

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
        document.getElementById("lblWinRate3Months").innerText = response.WinRate3Months.toString() + "%";
        document.getElementById("lblGamesPlayed3Months").innerText = response.GameCount3Months.toString();
        document.getElementById("lblWinRate").innerText = response.WinRate.toString() + "%";
        document.getElementById("lblGamesPlayed").innerText = response.GameCount.toString();
    }
}

function setAllPlayedChampions(e: Event)
{
    if (tester.requester.readyState === 4)
    {
        const response = JSON.parse(tester.requester.responseText);
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
    tester = new Requester("http://localhost:5001/Main/UpdateDB");
    //requesterAllPlayedChampions.requester.onreadystatechange = setAllPlayedChampions;
    tester.send();

    if(document.getElementById("btnUpdateDB").classList.contains("AnimUpdateDB"))
        document.getElementById("btnUpdateDB").classList.remove("AnimUpdateDB");
    else
        document.getElementById("btnUpdateDB").classList.add("AnimUpdateDB");
}