export class YesNoPopUp
{
    popup: JQuery<HTMLElement>;
    btnOK: JQuery<HTMLElement>;
    btnAbort: JQuery<HTMLElement>;

    constructor()
    {
        this.btnOK = $("#ynBtnOK");
        this.btnAbort = $("#ynBtnAbort");
        this.popup = $("#YesNoPopUp");

        this.btnAbort.click(() => this.Hide());
    }

    Show()
    {
        $("#veil").css("display", "block");
        this.popup.addClass("scale1");
    }

    Hide()
    {
        $("#veil").css("display", "none");
        this.popup.removeClass("scale1");
    }

    OnOkClick(callback : () => void)
    {
        this.btnOK.click(callback);
    }
}