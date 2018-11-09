export class Requester
{
    requester: XMLHttpRequest;
    address: string;
    parameter = "";
    array : any[] = [];

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

    sendPut()
    {
        this.requester.open('PUT', this.address.concat(this.parameter));
        this.requester.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        this.requester.send(null);
    }

    post()
    {
        this.requester.open('POST', this.address);
        this.requester.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        this.requester.send(JSON.stringify(this.array));
    }
}