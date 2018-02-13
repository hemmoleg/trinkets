var centerXY;

window.onload = function () {
    /*createCircle2(3,50,50,94);

    testCircle3(3,0,0,194);*/
    var r = Raphael("holder", 800, 800);
    centerXY = 400;
    var R = 120;
    var init = true;
    var param = {
            stroke: "#F36B00"
            , "stroke-width": 30
        };
    var hash = document.location.hash;
    var marksAttr = {
            fill: hash || "#444"
            , stroke: "none"
        };
    
    //figure thirds out
    
    // Custom Attribute
    r.customAttributes.arc = function (value, R, width)
    {
        //var centerXY = 400;
        
        var alpha = 360 / 360 * value
        var a = (90 - alpha) * Math.PI / 180
        var x = centerXY + R * Math.cos(a)
        var y = centerXY - R * Math.sin(a)
        var path = [["M", centerXY, centerXY - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        
        path = [["M", centerXY, centerXY - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        
        return {path: path, "stroke-width": width};
    };
    
    /////////////draw stuff
    // https://steamuserimages-a.akamaihd.net/ugc/80342118768853730/E698567DFD278F74F96C12336E641041964E5C9F/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside%7C637%3A358&composite-to=*,*%7C637%3A358&background-color=black
    
    //helpers
    r.rect(centerXY , 0, 1, 800).attr({'fill': '#ffffff', stroke: 0});
    
    //outline
    r.circle(400, 400, 350).attr({stroke: "#F36B00", "stroke-width": 4, opacity: 0.3});
    
    //rects
    var posY = 85;
    var radius = 315;
    for (var i = 0; i < 360; i = i + 2) 
    {
        var currentRect = r.rect(centerXY , posY, 2, 10);
        currentRect.attr({'fill': '#ffffff', stroke: 0});
        currentRect.rotate(i, centerXY, posY + radius);
    }
    
    
    //lineRectsBig
    var lineRectsBig = r.path().attr(param).attr({arc: [180, 300, 4]}).attr({opacity: 0.6});
    lineRectsBig.rotate(180, centerXY, centerXY);
    
    //lineRectsThin
    var lineRectsThin = r.path().attr(param).attr({arc: [180, 300, 2]}).attr({opacity: 0.4});
    
    
    drawMarks(R, 60); //draw seconds marks
    
    animWidth(r, param);
    
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
                , x = centerXY + R * Math.cos(a)
                , y = centerXY - R * Math.sin(a);
            out.push(r.circle(x, y, 2).attr(marksAttr));
        }
        return out;
    }
    
    //outerThird1
    var alpha = 115;
    var gap = (360 - 3*alpha)/3;
    var offset = +0;
    var outerThird1 = r.path().attr(param).attr({arc: [alpha, 250, 30]}).attr({opacity: 0.3});
    outerThird1.rotate(-alpha/2 + offset , centerXY, centerXY);
    
    //outerThird1
    var outerThird2 = r.path().attr(param).attr({arc: [alpha, 250, 30]}).attr({opacity: 0.3});
    outerThird2.rotate( (alpha/2) + gap + offset, centerXY, centerXY);
    
    //outerThird1
    var outerThird3 = r.path().attr(param).attr({arc: [alpha, 250, 30]}).attr({opacity: 0.3});
    outerThird3.rotate( 1.5*alpha + 2*gap + offset , centerXY, centerXY);
    
    //updateClock(sec, min, hor, init, 58);
}

function animWidth(r, param)
{
    var startR = 90;
    var maxWidth = 40;
    
    //value, R, width
    var hand = r.path().attr(param).attr({
        arc: [180, startR, 0]
    });
    
    //value, R, stroke-width
    hand.animate({arc: [180, startR + maxWidth/2, maxWidth]}, 1000, "easeInOut", 
        function(){hand.animate({arc: [180, startR + maxWidth, 0]}, 1000, "easeInOut")});
    
    setTimeout(animWidth.bind(null, r, param), 2100);
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