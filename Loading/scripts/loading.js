var centerXY;

window.onload = function () {
    /*createCircle2(3,50,50,94);

    testCircle3(3,0,0,194);*/
    var r = Raphael("holder", 800, 800);
    centerXY = 400;
    var R = 120;
    var init = true;
    var param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.6};
    
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
    
    ///////////////////////
    //animate quarters
    
    /////////////draw stuff
    // https://steamuserimages-a.akamaihd.net/ugc/80342118768853730/E698567DFD278F74F96C12336E641041964E5C9F/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside%7C637%3A358&composite-to=*,*%7C637%3A358&background-color=black
    
    //helpers
    r.rect(centerXY , 0, 1, 800).attr({'fill': '#ffffff', stroke: 0});
    
    //outline
    r.circle(centerXY, centerXY, 350).attr({stroke: "#F36B00", "stroke-width": 4, opacity: 0.3});
    
    //rects
    var posY = 87;
    var radius = 314;
    for (var i = 0; i < 360; i = i + 2) 
    {
        var currentRect = r.rect(centerXY , posY, 2, 9);
        currentRect.attr({'fill': '#ffffff', stroke: 0});
        currentRect.rotate(i, centerXY, posY + radius);
    }
    
    
    //lineRectsBig
    var lineRectsBig = r.path().attr(param).attr({arc: [180, 300, 4]});
    lineRectsBig.rotate(180, centerXY, centerXY);
    
    //lineRectsThin
    var lineRectsThin = r.path().attr(param).attr({arc: [180, 300, 2]}).attr({opacity: 0.4});
    
    //outerThird1
    var alpha = 113;
    var gap = (360 - 3*alpha)/3;
    var radius = 250;
    var offset = +0;
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.3};
    var outerThird1 = r.path().attr(param).attr({arc: [alpha, radius, 30]});
    outerThird1.rotate(-alpha/2 + offset , centerXY, centerXY);
    
    //outerThird2
    var outerThird2 = r.path().attr(param).attr({arc: [alpha, radius, 30]});
    outerThird2.rotate( (alpha/2) + gap + offset, centerXY, centerXY);
    
    //outerThird3
    var outerThird3 = r.path().attr(param).attr({arc: [alpha, radius, 30]});
    outerThird3.rotate( 1.5*alpha + 2*gap + offset , centerXY, centerXY);
    
    
    //innerThird1
    radius = 180;
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.4};
    var innerThird1 = r.path().attr(param).attr({arc: [alpha, radius, 30]});
    innerThird1.rotate(-alpha/2 + offset , centerXY, centerXY);
    
    //innerThird2
    var innerThird2 = r.path().attr(param).attr({arc: [alpha, radius, 30]});
    innerThird2.rotate( (alpha/2) + gap + offset, centerXY, centerXY);
    
    //innerThird3
    var innerThird3 = r.path().attr(param).attr({arc: [alpha, radius, 30]});
    innerThird3.rotate( 1.5*alpha + 2*gap + offset , centerXY, centerXY);
    
    
    
    //innerThirdLine
    radius = 199;
    param = {stroke: "#F36B00", "stroke-width": 3, opacity: 0.6};
    var innerThirdLine1 = r.path().attr({arc: [alpha, radius, 30]}).attr(param);
    innerThirdLine1.rotate(-alpha/2 , centerXY, centerXY);
    
    //innerThird2
    var innerThirdLine2 = r.path().attr({arc: [alpha, radius, 30]}).attr(param);
    innerThirdLine2.rotate( (alpha/2) + gap + offset, centerXY, centerXY);
    
    //innerThird3
    var innerThirdLine3 = r.path().attr({arc: [alpha, radius, 30]}).attr(param);
    innerThirdLine3.rotate( 1.5*alpha + 2*gap + offset , centerXY, centerXY);
    
    //inner innerThirds
    radius = 161;
    var innerThirdLine4 = r.path().attr({arc: [alpha, radius, 30]}).attr(param);
    innerThirdLine4.rotate(-alpha/2 , centerXY, centerXY);
    
    //innerThird2
    var innerThirdLine5 = r.path().attr({arc: [alpha, radius, 30]}).attr(param);
    innerThirdLine5.rotate( (alpha/2) + gap + offset, centerXY, centerXY);
    
    //innerThird3
    let innerThirdLine6 = r.path().attr({arc: [alpha, radius, 30]}).attr(param);
    innerThirdLine6.rotate( 1.5*alpha + 2*gap + offset , centerXY, centerXY);
 
    
    //ring
    r.circle(centerXY, centerXY, 130).attr({stroke: "#F36B00", "stroke-width": 3, opacity: 0.3});
    
    
    animRunner(r, null);
    animQuarters(r, null, false);
    animWidth(r, param, null);
}

function animQuarters(r, quartersBefore, playSecondPart)
{
    let alpha = 50;
    let gap = (360 - 4*alpha)/4;
    
    if(quartersBefore != null && !playSecondPart)
    {
        //reset
        for(let i = quartersBefore.length-1; i >= 0; i--)
            quartersBefore[i].remove();
        
        quartersBefore = null;
    }
    
    if(quartersBefore == null)
    {
        //outerThird1
        let radius = 133;
        let quarters = [];
        param = {stroke: "#F36B00", "stroke-width": 8, opacity: 0.5};

        quarters.push( r.path().attr({arc: [alpha, radius, 30]}).attr(param) );
        quarters[0].rotate(0, centerXY, centerXY);

        quarters.push( r.path().attr({arc: [alpha, radius, 30]}).attr(param) );
        quarters[1].rotate( alpha + gap, centerXY, centerXY);

        quarters.push( r.path().attr({arc: [alpha, radius, 30]}).attr(param) );
        quarters[2].rotate( (alpha + gap)*2, centerXY, centerXY);

        quarters.push( r.path().attr({arc: [alpha, radius, 30]}).attr(param) );
        quarters[3].rotate( (alpha + gap)*3, centerXY, centerXY);

        for(let quarter of quarters)
            quarter.animate({transform: "r360" + "," + centerXY + "," + centerXY}, 2000);
    
        setTimeout(animQuarters.bind(null, r, quarters, true), 2000, "easeInOut");
    }
    else
    {
        let finalAngle;
        for(let i = 0; i < quartersBefore.length; i++)
        {
            finalAngle = 360 +(alpha + gap)*i;
            quartersBefore[i].animate({transform: "r" +finalAngle + "," + centerXY + "," + centerXY}, 2000, "easeInOut");
        }
        //setTimeout(animQuarters.bind(null, r, quartersBefore, false), 2000);
    }
}

function animWidth(r, param, handBefore)
{   
    if(handBefore != null) handBefore.remove();
    
    var startR = 60;
    var maxWidth = 30;
    var hand = r.path().attr(param).attr({arc: [180, startR, 0]});
    
    //value, R, stroke-width
    hand.animate({arc: [180, startR + maxWidth/2, maxWidth]}, 1000, "easeInOut", 
        function(){hand.animate({arc: [180, startR + maxWidth, 0]}, 1000, "easeInOut")});
    
    setTimeout(animWidth.bind(null, r, param, hand), 2100);
}

function animRunner(r, runnerBefore)
{
    if(runnerBefore != null) runnerBefore.remove();
    
    var runner = r.rect(centerXY -12, 173, 25, 3);
    runner.attr({'fill': '#ffffff', stroke: 0});
    
    runner.animate({transform: "r360" + "," + centerXY + "," + centerXY}, 2000);
    setTimeout(animRunner.bind(null, r, runner), 2000);
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