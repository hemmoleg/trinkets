var YesNoPopUp = /** @class */ (function () {
    function YesNoPopUp() {
        var _this = this;
        this.btnOK = $("#ynBtnOK");
        this.btnAbort = $("#ynBtnAbort");
        this.popup = $("#YesNoPopUp");
        this.btnAbort.click(function () { return _this.Hide(); });
    }
    YesNoPopUp.prototype.Show = function () {
        $("#veil").css("display", "block");
        this.popup.addClass("scale1");
    };
    YesNoPopUp.prototype.Hide = function () {
        $("#veil").css("display", "none");
        this.popup.removeClass("scale1");
    };
    YesNoPopUp.prototype.OnOkClick = function (callback) {
        this.btnOK.click(callback);
    };
    return YesNoPopUp;
}());
export { YesNoPopUp };
//# sourceMappingURL=YesNoPopUp.js.map