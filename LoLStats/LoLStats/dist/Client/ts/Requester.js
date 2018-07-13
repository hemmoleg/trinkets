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
    Requester.prototype.sendPut = function () {
        this.requester.open('PUT', this.address.concat(this.parameter));
        this.requester.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        this.requester.send(null);
    };
    return Requester;
}());
export { Requester };
//# sourceMappingURL=Requester.js.map