class Requester
{
    requester: XMLHttpRequest;
    address: string;
    parameter = "";

    constructor(public addressParam: string)
    {
        this.requester = new XMLHttpRequest();
        this.address = addressParam;
    }

    send()
    {
        this.requester.open('GET', this.address.concat(this.parameter));
        this.requester.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        this.requester.send(null);
    }
}