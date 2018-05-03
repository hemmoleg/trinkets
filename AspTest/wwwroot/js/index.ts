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

function greeter(person: Person) 
{
    return "Hello, " + person.firstName + " " + person.lastName;
}

var xhr = new XMLHttpRequest();

function testQuery()
{
    xhr.open('POST', "https://dataretrival.azurewebsites.net/api/HttpTriggerJS1?code=Eaa0WOyz1zLfmHh3RU/UWJkreTt4XnUAaecsYOWXXWnovpdvYYDY3g==", true);
    xhr.onreadystatechange = processRequest;
    
    let endpoint = "euw1";
    let name = "hemmoleg";
    let key = "RGAPI-cfffb811-c408-4294-ab4a-95a22b8adeae";

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
                console.log(response);
                break;
    }    
}

window.onload = function () 
{
    //test
    let user = new Student("Jane", "M.", "Doe");
    document.body.innerHTML = greeter(user);
    testQuery();
}