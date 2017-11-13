window.onload = function()
{
    $('textarea').on('paste', function () {
                            setTimeout(readTimes, 100);
                                        });
    
    readTimes();
}

function readTimes()
{
    console.log($('textarea').val());
    var text = $('textarea').val();
    var regex = /\d\w:\d\w-\d\w:\d\w(?= Uhr)/g;
    //console.log(regex.exec(text));

    do {
        m = regex.exec(text);
        if (m) 
        {
            console.log(m[0]);
        }
    } while (m);

}