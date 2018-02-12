window.onload = function () {
    /*createCircle2(3,50,50,94);

    testCircle3(3,0,0,194);*/
    var r = Raphael("holder", 600, 600);
    var R = 120;
    var init = true;
    var param = {
            stroke: "#fff"
            , "stroke-width": 30
        };
    var hash = document.location.hash;
    var marksAttr = {
            fill: hash || "#444"
            , stroke: "none"
        };
    var html = [
                    document.getElementById("h")
                    , document.getElementById("m")
                    , document.getElementById("s")
                    , document.getElementById("d")
                    , document.getElementById("mnth")
                    , document.getElementById("ampm")
                ];
    
    //set custom start date/time
    //with hundred3 OR centerXY at 200 the hands freak out
    
    var centerXY = 200;
    
    // Custom Attribute
    r.customAttributes.arc = function (value, total, R, centerXY)
    {
        var hundred3 = 300;
        
        var alpha = 360 / total * value
        var a = (90 - alpha) * Math.PI / 180
        var x = hundred3 + R * Math.cos(a)
        var y = hundred3 - R * Math.sin(a)
        var color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)")
        var path;
        
        if (total == value) 
        {
            path = [["M", hundred3, hundred3 - R], ["A", R, R, 0, 1, 1, 299.99, 300 - R]];
        }
        else 
        {
            path = [["M", hundred3, hundred3 - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        }
        return {path: path, stroke: color};
    };
    
    drawMarks(R, 60); //draw seconds marks
    var sec = r.path().attr(param).attr({
        arc: [0, 60, R]
    });
    
    R -= 40; //lower radius
    drawMarks(R, 60); //draw minute marks
    var min = r.path().attr(param).attr({
        arc: [0, 60, R]
    });
    
    R -= 40; //lower radius
    drawMarks(R, 12); //draw hour marks
    var hor = r.path().attr(param).attr({
        arc: [0, 12, R]
    });
    
    var pm = r.circle(300, 300, 16).attr({
        stroke: "none", fill: Raphael.hsb2rgb(15 / 200, 1, .75).hex
    });
    
    html[5].style.color = Raphael.hsb2rgb(15 / 200, 1, .75).hex;

    function drawMarks(R, total) 
    {
        if (total == 31) { // month
            var d = new Date;
            d.setDate(1);
            d.setMonth(d.getMonth() + 1);
            d.setDate(-1);
            total = d.getDate();
        }
        var color = "hsb(".concat(Math.round(R) / 200, ", 1, .75)")
            , out = r.set();
        for (var value = 0; value < total; value++) {
            var alpha = 360 / total * value
                , a = (90 - alpha) * Math.PI / 180
                , x = 300 + R * Math.cos(a)
                , y = 300 - R * Math.sin(a);
            out.push(r.circle(x, y, 2).attr(marksAttr));
        }
        return out;
    }
    
    
    updateClock(sec, min, hor, html, init, pm);
}

function updateClock(sec, min, hor, html, init, pm)
{
    var d = new Date; 
    var am = (d.getHours() < 12); 
    var h = d.getHours() % 12 || 12;

    //update seconds
    updateVal(d.getSeconds(), 60, 120, sec, 2, init, html);

    //update minutes
    updateVal(d.getMinutes(), 60, 80, min, 1, init, html);

    //update hours
    updateVal(h             , 12, 40, hor, 0, init, html);

    //update days
    //updateVal(d.getDate(), 31, 80, day, 3, init, html);

    //update month
    //updateVal(d.getMonth() + 1, 12, 40, mon, 4, init, html);

    init = false;
    pm[(am ? "hide" : "show")]();
    html[5].innerHTML = am ? "AM" : "PM";
    setTimeout(updateClock.bind(null, sec, min, hor, html, init, pm), 1000);
}

function updateVal(value, total, R, hand, id, init, html) 
{
    var color = "hsb(".concat(Math.round(R) / 200, ",", value / total, ", .75)");
    if (init) 
    {
        hand.animate({
            arc: [value, total, R]
        }, 900, ">");
    }
    else
    {
        if (!value || value == total) 
        {
            value = total;
            hand.animate({
                arc: [value, total, R]
            }, 750, "bounce", function () {
                hand.attr({
                    arc: [0, total, R]
                });
            });
        }
        else 
        {
            hand.animate({
                arc: [value, total, R]
            }, 750, "elastic");
        }
    }
    html[id].innerHTML = (value < 10 ? "0" : "") + value;
    html[id].style.color = Raphael.getRGB(color).hex;
}



function createCircle2(step, posX, posY, radius) {
    var paper = Raphael("circle2", 500, 300);
    for (var i = 0; i < 360; i = i + step) {
        //var transformString = 'r'+i.toString + ' 100,100';
        var currentRect = paper.rect(posX + radius, posY, 2, 20);
        currentRect.attr({
            'fill': '#ffffff'
            , stroke: 0
        });
        currentRect.rotate(i, posX + radius, posY + radius);
    }
}

function testCircle3(step, posX, posY, radius) {
    var paper = Raphael("circle3", 500, 400);
    for (var i = 0; i < 90; i = i + step) {
        //var transformString = 'r'+i.toString + ' 100,100';
        var currentRect = paper.rect(posX + radius, posY, 11, 20);
        currentRect.attr({
            'fill': '#ffffff'
            , stroke: 0
        });
        currentRect.rotate(i, posX + radius, posY + radius);
    }
}