var days = [];
var htmlList;

window.onload = function()
{
    $('textarea').on('paste', function () {
                            setTimeout(readTimes, 100);
                                        });
    htmlList = $('#dayList');
    extractDays();
}

function extractDays()
{
    var text = $('textarea').val();
    var regexDay = /title=(.*)abbr/g;
    
    do {
        m = regexDay.exec(text);
        if (m) 
        {
            days[days.length] = m[0];
        }
    } while (m);
    
    //console.log(days);
    
/////////////extract date and times from days
    
    var regexDate1 = /[0-9](.*):/g;
    var regexDate2 = /[^:]*/g;
    var regexTimes = /\d\w:\d\w-\d\w:\d\w(?= Uhr)/g;
    var tmp;
    var timeList;
    
    for(i = 0; i < days.length; i++)
    {
        regexDate1.lastIndex = 0;
        regexDate2.lastIndex = 0;
        regexTimes.lastIndex = 0;
        
        tmp = regexDate1.exec(days[i]);
        tmp = regexDate2.exec(tmp);
    
        //day entry
        $('<li/>').text(tmp).appendTo(htmlList);
        
        timeList = $('<ul/>');
        
        do {
            time = regexTimes.exec(days[i]);
            if (time) 
            {
                console.log(time[0]);
                
                var li = $('<li/>')
                        .text(time[0])
                        .appendTo(timeList);
            }
        } while (time);
        
        timeList.appendTo(htmlList);
    }
}

function readTimes()
{
    console.log($('textarea').val());
    var text = $('textarea').val();
    var regexTimes = /\d\w:\d\w-\d\w:\d\w(?= Uhr)/g;
    var regexDays = /<abbr title="/g;
    //console.log(regex.exec(text));

    do {
        m = regexTimes.exec(text);
        if (m) 
        {
            console.log(m[0]);
        }
    } while (m);
   
    
    $('#countDays').text(text.match(regexDays).length);

    
    
    //var daysFound
}