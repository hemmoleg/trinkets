var days = [];
var htmlList;
var timeTable;
var currentHours = currentMinutes = [];
var misses = []; //in minutes

window.onload = function()
{
    $('textarea').on('paste', function () {
                            setTimeout(readTimes, 100);
                                        });
    htmlList = $('#dayList');
    timeTable = $('#timeTable');
    extractDays();
    
    calcTime("08:24-13:03");
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
            processDay(m[0]);
        }
    } while (m);
    
    console.log(days);
}

function processDay(day)
{
    var regexTimes = /\d\w:\d\w-\d\w:\d\w(?= Uhr)/g;
    var timeList;
    
    regexTimes.lastIndex = 0;

    var newRow = $('<tr/>').appendTo(timeTable);
    var td1 = $('<td/>').appendTo(newRow);
    $('<li/>').text(getDateString(day)).appendTo(td1);

    timeList = $('<ul/>').appendTo(td1);

    var td2 = $('<td/>').attr("valign", "bottom").appendTo(newRow);
    var timeResults = $('<ul/>')
                      .attr("id","timeResults")
                      .appendTo(td2);

    currentHours = [];
    currentMinutes = [];

    if(day.includes("Unentschuldigt"))
    {
        var li = $('<li/>')
                    .text("Unentschuldigt")
                    .appendTo(timeList);
    }

    if(day.includes("Krank"))
    {
        var li = $('<li/>')
                 .text("Krank")
                 .appendTo(timeList);
    }

    do {
        time = regexTimes.exec(day);
        if (time) 
        {
            console.log(time[0]);

            var li = $('<li/>')
                    .text(time[0])
                    .appendTo(timeList);

            li = $('<li/>')
                    .text(calcTime(time[0]))
                    .appendTo(timeResults);
        }
    } while (time);

    
    var td3 = $('<td/>')
              .text(calcCurrentMisses())
              .attr("valign", "bottom")
              .appendTo(newRow);

    //list layout
    /*$('<li/>').text(tmp).appendTo(htmlList);

    timeList = $('<ul/>');
    if(days[i].includes("Unentschuldigt"))
    {
        var li = $('<li/>')
                    .text("Unentschuldigt")
                    .appendTo(timeList);
    }

    if(days[i].includes("Krank"))
    {
        var li = $('<li/>')
                    .text("Krank")
                    .appendTo(timeList);
    }

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

    timeList.appendTo(htmlList);*/
    
}

function calcTime(timeString)
{
    var regexTime = /([0-9])\w/g;
    var numbers = [];
    var hour1 = hour2 = minute1 = minute2 = hourResult = minuteResult = 0;
    var m;
    
    do {
        m = regexTime.exec(timeString);
        if (m) 
        {
            numbers[numbers.length] = m[0];
        }
    } while (m);
    
    hour1 = numbers[0];
    minute1 = numbers[1];
    hour2 = numbers[2];
    minute2 = numbers[3];
    
    hourResult = parseInt(hour2) - parseInt(hour1) - 1;
    minuteResult = 60 - parseInt(minute1) + parseInt(minute2);
    if(minuteResult > 60)
    {
        hourResult++;
        minuteResult -= 60;
    }
    
    currentHours[currentHours.length] = hourResult;
    currentMinutes[currentMinutes.length] = minuteResult;
     
    if(minuteResult < 10)
        return hourResult.toString().concat(":").concat('0').concat(minuteResult);
    else
        return hourResult.toString().concat(":").concat(minuteResult);
}

//based of current hours and minutes
function calcCurrentMisses()
{
    var totalCurrentHours = 0;
    var totalCurrentMinutes = 0;
    var minuteMisses = 0;
    
    for(var i = 0; i < currentHours.length; i++)
    {
        totalCurrentHours += currentHours[i];
    }
    
    for(var i = 0; i < currentMinutes.length; i++)
    {
        totalCurrentMinutes += currentMinutes[i];
    }
    
    minuteMisses = (8 * 60) - (totalCurrentHours * 60 + totalCurrentMinutes);
    
    misses[misses.length] = minuteMisses < 0 ? 0 : minuteMisses;
    
    if(minuteMisses < 0)
    {
        return "0:00";
    }
    else
    {
        var h = Math.floor(minuteMisses / 60);
        var m = minuteMisses % 60;
        m = m < 10 ? '0' + m : m;
        return h + ':' + m;
    }
}

function getDateString(day)
{
    var regexDate1 = /[0-9](.*):/g;
    var regexDate2 = /[^:]*/g;
    var tmp;
    
    tmp = regexDate1.exec(day);
    tmp = regexDate2.exec(tmp);
    
    return tmp;
}

function readTimes(timeString)
{
    console.log($('textarea').val());
    var text = $('textarea').val();
    var regexTimes = /\d\w:\d\w-\d\w:\d\w(?= Uhr)/g;
    var regexDays = /<abbr title="/g;
    //console.log(regex.exec(text));

    do {
        m = regexTimes.exec(timeString);
        if (m) 
        {
            console.log(m[0]);
        }
    } while (m);
   
    
    $('#countDays').text(text.match(regexDays).length);

    
    
    //var daysFound
}