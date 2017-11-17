var monthDivs = [];
var timeTable;
var presentHours = presentMinutes = [];
var target = []; //in minutes
var present = []; //in minutes
var monthStrings = [];
var missing = []; //in minutes

window.onload = function()
{
    $('textarea').on('paste', function () {
        setTimeout(doIt, 100);
    });
    
    for(var i = 0; i < 12; i++)
    {
        monthDivs[monthDivs.length] = $('.divMonth').clone();
    }
    
    //monthDivs = $('.divMonth');
    
    doIt();

    $('.divMonth').on('click', function(e){
        e.currentTarget.classList.toggle('divMonthHidden');
        e.currentTarget.childNodes[1].classList.toggle('hMonthHidden');
        e.currentTarget.childNodes[3].classList.toggle('timeTableHidden');
        //console.log($(e.target));
    })
}

function doIt()
{
    var text = $('textarea').val();
    var lastFound = 0;
    var days = [];
    
    text = text.substr(text.indexOf('<td colspan="32" class="section">'));
    monthStrings = text.split('NE/UZ');
    console.log(monthStrings);
    
    for(var i = 0; i < monthStrings.length; i++)
    {
        days = extractDays(monthStrings[i]);
        if(i > 0)
        {
            //add new divMonth
            $('#divMonths').append(monthDivs[i]);
        }
        
        timeTable = $('div>div:last-Child>table');
        
        for(var j = 0; j < days.length; j++)
        {
            processDay(days[j]);
        }
        calcTotals();
    }
}

function extractDays(text)
{
    var regexDay = /abbr title=(.*)abbr/g;
    var days = [];
    target = [];
    present = [];
    missing = []; //in minutes
    presentHours = [];
    presentMinutes = [];
    
    do {
        m = regexDay.exec(text);
        if (m) 
        {
            days[days.length] = m[0];
        }
    } while (m);
    
    return days;
}

function processDay(day)
{
    var regexTimes = /\d\w:\d\w-\d\w:\d\w(?= Uhr)/g;
    var targetTimeList;
    
    if(day.includes("Kein Unterrichtstag"))
    {
        return;
    }
    
    var newRow = $('<tr/>').appendTo(timeTable);
    var tdDate = $('<td/>').appendTo(newRow);
    $('<li/>').text(getDateString(day)).appendTo(tdDate);

    targetTimeList = $('<ul/>').appendTo(tdDate);

    var td2 = $('<td/>').attr("valign", "bottom").appendTo(newRow);
    var presentTimeList = $('<ul/>')
                      .attr("id","presentTimeList")
                      .appendTo(td2);

    if(day.includes("Unentschuldigt"))
    {
        var li = $('<li/>')
                    .text("Unentschuldigt")
                    .appendTo(targetTimeList);
    }

    if(day.includes("Krank"))
    {
        var li = $('<li/>')
                 .text("Krank")
                 .appendTo(targetTimeList);
    }

    if(day.includes("Anwesend") && null == regexTimes.exec(day) )
    {
        /*var li = $('<li/>')
                 .text("ANWESEND!!!")
                 .appendTo(targetTimeList);*/
        
        day = day.concat('08:00-16:00 Uhr');
    }
    
    presentHours = [];
    presentMinutes = [];
    
    regexTimes.lastIndex = 0;
    do {
        time = regexTimes.exec(day);
        if (time) 
        {
            //Target times
            var li = $('<li/>')
                    .text(time[0])
                    .appendTo(targetTimeList);

            //present times
            li = $('<li/>')
                 .text(calcTime(time[0]))
                 .appendTo(presentTimeList);
        }
    } while (time);

    
    var td3 = $('<td/>')
              .text(calcDayMissing())
              .attr("valign", "bottom")
              .addClass('missingTime')
              .appendTo(newRow);
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
    if(minuteResult >= 60)
    {
        hourResult++;
        minuteResult -= 60;
    }
    
    presentHours[presentHours.length] = hourResult;
    presentMinutes[presentMinutes.length] = minuteResult;
     
    if(minuteResult < 10)
        return hourResult.toString().concat(":").concat('0').concat(minuteResult);
    else
        return hourResult.toString().concat(":").concat(minuteResult);
}

//based of current hours and minutes
function calcDayMissing()
{
    var totalpresentHours = 0;
    var totalpresentMinutes = 0;
    var minutemissing = 0;
    
    for(var i = 0; i < presentHours.length; i++)
    {
        totalpresentHours += presentHours[i];
    }
    
    for(var i = 0; i < presentMinutes.length; i++)
    {
        totalpresentMinutes += presentMinutes[i];
    }
    
    minutemissing = (8 * 60) - (totalpresentHours * 60 + totalpresentMinutes);
    
    missing[missing.length] = minutemissing < 0 ? 0 : minutemissing;
    present[present.length] = totalpresentHours * 60 + totalpresentMinutes;
    target[target.length] = 8 * 60;
    
    if(minutemissing < 0)
    {
        return "0:00";
    }
    else
    {
        return getHourMinuteString(minutemissing)
    }
}

function calcTotals()
{
    var totalTarget = 0;
    for(var i = 0; i < target.length; i++)
    {
        totalTarget += target[i];
    }
    
    var totalPresent = 0;
    for(var i = 0; i < present.length; i++)
    {
        totalPresent += present[i];
    }
    
    var totalMissing = 0;
    for(var i = 0; i < present.length; i++)
    {
        totalMissing += missing[i];
    }
    
    var rowTotals = $('<tr/>').appendTo(timeTable);
    //insert empty cell
    rowTotals.append($('<td/>').text(getHourMinuteString(totalTarget)));
    rowTotals.append($('<td/>').text(getHourMinuteString(totalPresent)));
    rowTotals.append($('<td/>').text(getHourMinuteString(totalMissing)));
    
    rowTotals.append($('<td/>').text(round((100/totalTarget) * (totalMissing), 1) + '%'));
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

function getHourMinuteString(minutes)
{
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    m = m < 10 ? '0' + m : m;
    return h + ':' + m;
}

function round(x, n) {
  if (n < 1 || n > 14) return false;
  var e = Math.pow(10, n);
  var k = (Math.round(x * e) / e).toString();
  if (k.indexOf('.') == -1) k += '.';
  k += e.toString().substring(1);
  return k.substring(0, k.indexOf('.') + n+1);
}