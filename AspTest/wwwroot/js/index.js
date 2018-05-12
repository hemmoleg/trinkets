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
            console.log(response);
            break;
    }
}
window.onload = function () {
    //test
    var user = new Student("Jane", "M.", "Doe");
    document.body.innerHTML = greeter(user);
    testQuery();
};
//# sourceMappingURL=index.js.map