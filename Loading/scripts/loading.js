var centerXY;

function createCirlce(r, radius, sliceCount, alpha , params, rotated)
{
    if(sliceCount == 1)
    {
        return r.circle(centerXY, centerXY, radius).attr(params);
    }
    else
    {
        let slices = [];
        let gap = (360 - sliceCount*alpha)/sliceCount;
        let angle;
        for(let i=0; i < sliceCount; i++)
        {
            slices.push( r.path().attr({arc: [alpha, radius, 30]}).attr(params) );
            if(rotated)
                angle = -alpha/2 + i*(alpha+gap);
            else    
                angle = i*(alpha+gap);
            
            slices[slices.length-1].rotate(angle, centerXY, centerXY);
        }
        return slices;
    }
}

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
    
    /////////////draw stuff
    // https://steamuserimages-a.akamaihd.net/ugc/80342118768853730/E698567DFD278F74F96C12336E641041964E5C9F/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside%7C637%3A358&composite-to=*,*%7C637%3A358&background-color=black
    
    //helpers
    r.rect(centerXY , 0, 1, 800).attr({'fill': '#ffffff', stroke: 0});
    
    //outline
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.3};
    createCirlce(r, 350, 1, 0, param, false);
    
    //rects
    var posY = 87;
    var radius = 314;
    for (var i = 0; i < 360; i = i + 2) 
    {
        var currentRect = r.rect(centerXY , posY, 2, 9);
        currentRect.attr({'fill': '#ffffff', stroke: 0});
        currentRect.rotate(i, centerXY, posY + radius);
    }
    
    //lineRectsThin
    var lineRectsThin = r.path().attr(param).attr({arc: [180, 300, 2]});//.attr({opacity: 0.4});
    
    //lineRectsBig
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.6};
    var lineRectsBig = r.path().attr(param).attr({arc: [180, 300, 4]});
    lineRectsBig.rotate(180, centerXY, centerXY);
    
    //outerThirds
    //createCirlce(r, radius, slices, alpha , params, rotated)
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.3};
    let outerThirds = createCirlce(r, 250, 3, 113, param, true);
    
    //innerThirds
    radius = 180;
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.3};
    let innerThirds = createCirlce(r, 180, 3, 113, param, true);

    //innerThirdsLine1
    param = {stroke: "#F36B00", "stroke-width": 3, opacity: 0.6};
    let innerThirdsLine1 = createCirlce(r, 199, 3, 113, param, true);
    let innerThirdsLine2 = createCirlce(r, 161, 3, 113, param, true);
    
    //ring
    r.circle(centerXY, centerXY, 130).attr({stroke: "#F36B00", "stroke-width": 3, opacity: 0.3});
    
    
    animRunner(r, null);
    animQuarters(r, null);
    animWidth(r, param, null);
    animBigSixs(r, null, 0);
}

function animBigSixs(r, bigSixths, i)
{
    var alpha = 59;
    var gap = (360 - 6*alpha)/6;
    var radius = 180;
    var timePerSixt = 300;
    param = {stroke: "#F36B00", "stroke-width": 27, opacity: 0.4};
    if(bigSixths == null) bigSixths = [];
    if(i == 6)
    {
        //FULL cycle finished -> reset
        for(let j = bigSixths.length-1; j >= 0; j--)
            bigSixths[j].remove();
        
        bigSixths = [];
        i = 0;
    }
    
    if(bigSixths.length < 6)
    {
        newSixth = r.path().attr(param).attr({arc: [0, radius, 27]});
        newSixth.rotate( bigSixths.length * (alpha + gap), centerXY, centerXY);
        newSixth.animate({arc: [alpha, radius, 27]}, timePerSixt, "linear");
        bigSixths.push(newSixth);
    }
    else
    {
        let angle = (i+1) * alpha + i * gap;
        bigSixths[i].animate({arc: [0, radius, 27]}, timePerSixt, "linear");
        bigSixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, timePerSixt, "linear");
        i++;
    }
    setTimeout(animBigSixs.bind(null, r, bigSixths, i), timePerSixt);
    
    
}

function animQuarters(r, quartersBefore)
{
    if(quartersBefore != null)
    {
        //reset
        for(let i = quartersBefore.length-1; i >= 0; i--)
            quartersBefore[i].remove();
        
        quartersBefore = null;
    }
    
    if(quartersBefore == null)
    {
        let finalAngle;
        let alpha = 50;
        let gap = (360 - 4*alpha)/4;
        let param = {stroke: "#F36B00", "stroke-width": 8, opacity: 0.5};
        let quarters = createCirlce(r, 133, 4, 50, param, false);
        
        for(let i = 0; i < quarters.length; i++)
        {
            finalAngle = -(360 -(alpha + gap)*i);
            quarters[i].animate({transform: "r" +finalAngle + "," + centerXY + "," + centerXY}, 6000, "linear");
        }
        setTimeout(animQuarters.bind(null, r, quarters), 6000);
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