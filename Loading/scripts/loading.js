var centerXY;
var DecoShape = {"SquareAngelL":1, "SquareAngelR":2, "Bar":3, "Triangle":4}
var PaperSize = 670;

var papers = [];
//rects, runner, sixths, coreSixths, whiteThirds
var rects = [];
var runner;
var innerThirdsLine1;
var innerThirdsLine2;
var sixths;
var coreSixths;
var whiteThirds;

var ringAnimTime = 1.25;

var tweenBezir1;
var tweenBezir2;

var sixhtsRunning = false;

function resize()
{
    var clientHeight = $(window).height();
    var clientWidth = $(window).width();
    var newScale;
    
    if(clientHeight/$('.stage').height() < clientWidth/$('.stage').width())
    {
        newScale = clientHeight/$('.stage').height();
    }
    else
    {
        newScale = clientWidth/$('.stage').width();
    }
    newScale = newScale-0.1;
    
    
    if( $('.stage')[0].style.transform != "")
    {
        $('.stage')[0].style.transform = $('.stage')[0].style.transform.replace(/scale\(.+?\)/, 'scale(' + newScale + ')');
    }
    else
    {
        $('.stage')[0].style.transform = 'scale(' + newScale + ')';
    }
}

window.onload = function () 
{
    /////////////////////////////
    //coverThirds!!!
    /////////////////////////////
    //restart button

    let customAttributes = function (value, R)
    {
        var alpha = 360 / 360 * value
        var a = (90 - alpha) * Math.PI / 180
        var x = centerXY + R * Math.cos(a)
        var y = centerXY - R * Math.sin(a)
        var path = [["M", centerXY, centerXY - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        
        path = [["M", centerXY, centerXY - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        
        return {path: path};
    };
    
    for(let i = 0; i < $('.overlapping').length; i++)
    {
        papers.push( Raphael($('.overlapping')[i], PaperSize, PaperSize) );
        $('.overlapping').width(PaperSize);
        $('.overlapping').height(PaperSize);
        papers[papers.length-1].customAttributes.arc = customAttributes;
    }
    
    $('.stage').css('transform', 'translate(-50%, -50%) scale(1)');
    resize();
    $( window ).resize(resize);
    
    /////////////draw stuff
    // https://steamuserimages-a.akamaihd.net/ugc/80342118768853730/E698567DFD278F74F96C12336E641041964E5C9F/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside%7C637%3A358&composite-to=*,*%7C637%3A358&background-color=black
    
    centerXY = 335;
    var R = 120;
    var param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.6};
    
    //helpers
    //papers[0].rect(centerXY , 0, 1, 800).attr({'fill': '#ffffff', stroke: 0});
    //papers[0].rect(0, centerXY, 800, 1).attr({'fill': '#ffffff', stroke: 0});
    
    //outline
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.2};
    createCirlce(papers[0], 310, 1, 0, param, false);
    
    //rects
    let radius = 275;
    let posY = centerXY - radius;
    for (let i = 0; i < 360; i = i + 2) 
    {
        let currentRect = papers[1].rect(centerXY , posY, 4, 10);
        currentRect.attr({'fill': '#F36B00', stroke: 0, opacity: 0.35});
        currentRect.rotate(i, centerXY, posY + radius);
        rects.push(currentRect);
    }
    
    //lineRectsThin
    param = {stroke: "#F36B00", "stroke-width": 2, opacity: 0.6};
    var lineRectsThin = papers[1].path().attr(param).attr({arc: [180, 260, 2]});//.attr({opacity: 0.4});
    
    //lineRectsBig
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.6};
    var lineRectsBig = papers[1].path().attr(param).attr({arc: [180, 260, 4]});
    lineRectsBig.rotate(180, centerXY, centerXY);
    
    drawDeco(papers[2], 230, 3, 128, DecoShape.SquareAngelL, 0, true);
    drawDeco(papers[2], 230, 3, 128, DecoShape.SquareAngelR, 8, true);
    drawDeco(papers[0], 320, 4, 128, DecoShape.Triangle, 0, false);
    
    //whiteThirds
    param = {stroke: "#FFFFFF", "stroke-width": 3, opacity: 1};
    whiteThirds = createCirlce(papers[2], 222, 3, 95, param, true);
    
    //outerThirds
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.3};
    let outerThirds = createCirlce(papers[2], 200, 3, 113, param, true);
    
    //innerThirds
    let innerThirdsRadius = 130;
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.2};
    let innerThirds = createCirlce(papers[3], innerThirdsRadius, 3, 113, param, true);

    //innerThirdsLines
    param = {stroke: "#F36B00", "stroke-width": 3, opacity: 0.6};
    innerThirdsLine1 = createCirlce(papers[3], 120, 3, 113, param, true); //159
    innerThirdsLine2 = createCirlce(papers[3], 120, 3, 113, param, true); //121
    
    sixths = new Sixths(papers[4], innerThirdsRadius);
    
    //ring
    papers[5].circle(centerXY, centerXY, 85).attr({stroke: "#F36B00", "stroke-width": 3, opacity: 0.3});
    animQuarters(papers[5], null);
    
    coreSixths = new CoreSixth(papers[5]);
    
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 1};
    createCirlce(papers[6], innerThirdsRadius, 3, 118, param, true);
    
    TweenMax.set('#ring0', {scale:"0.45"});
    TweenMax.set('#ring1', {scale:"0.50"});
    TweenMax.set('#ring2', {scale:"0.68"});
    
    setTimeout(this.initalAnimation.bind(this), 2000);
    //initalAnimation();
}

function initalAnimation()
{
    var rule = CSSRulePlugin.getRule("#btnReset:after"); //get the rule
    TweenLite.to(rule, 1, {cssRule: { scale: 1, opacity: 1}, ease: Power1.easeOut }, 0);
    TweenLite.to('#btnReset', 1, {opacity: 1});
    $('#btnReset').one("click", reset);
    
    TweenMax.to("#container", ringAnimTime, {rotationX: 12, rotationY: 7, ease: Power2.easeOut, onComplete: containerAnim});
     
    TweenMax.to('#ring0', ringAnimTime, {z: -40, scale:"1", ease: Power2.easeOut});
    TweenMax.to('#ring1', ringAnimTime, {z: -20, scale:"1", ease: Power2.easeOut});
    TweenMax.to('#ring2', ringAnimTime, {z: 5, scale:"1", ease: Power2.easeOut});
    TweenMax.to('#ring3', ringAnimTime, {z: 20, scale:"1", ease: Power2.easeOut});
    TweenMax.to('#ring4', ringAnimTime, {z: 40, scale:"1", ease: Power2.easeOut});
    
    TweenMax.to('#ring5', ringAnimTime, {rotationX: -12, rotationY: -7, ease: Power2.easeOut});
    
    TweenMax.to('#ring6', ringAnimTime, { z: -150, opacity:"0", rotationX:45, ease: Power2.easeOut});
    
    innerThirdsLine1.forEach(function(element) {
        element.animate({arc: [113, 149]}, 700, "easeOut");
    });
    innerThirdsLine2.forEach(function(element) {
        element.animate({arc: [113, 111]}, 700, "easeOut");
    });

    animWhiteThirds();
    animRunner();
    if(!sixhtsRunning)
    {
        sixths.AnimSixthDown(sixths.BigSixths, 0);
        sixths.HighlightSmallSixth(0);
        animRects(0);
    }
    sixhtsRunning = true;
    coreSixths.Anim1();
}

function containerAnim()
{
    let minX = 0;
    let rotationX = 7;
    let maxX = 20;
    
    let minY = -15;
    let rotationY = 12;
    let maxY = 15;
    
    let minAngle = 5;
    let anchors = [];
    let anchors2 = [];
    
    anchors.push({rotationX: 12, rotationY: 7});
    anchors2.push({rotationX: -12, rotationY: -7});
    for(let i = 0; i < 10; i++)
    {
        var canShiftUp = rotationX - minAngle >= minX;
        var canShiftDown = rotationX + minAngle <= maxX;

        //fallback
        if(!canShiftUp && !canShiftDown)
        {
            console.log("Cant shift left AND cant shift right!");
        }
        else if((Math.random() > 0.5 && canShiftUp) || !canShiftDown)
        {
            //shift left
            var max = rotationX;
            var distance = Math.random() * (max - minAngle) + minAngle;
            rotationX = rotationX - distance;
        }
        else
        {
            //shift right
            var max = maxX - rotationX;
            var distance = Math.random() * (max - minAngle) + minAngle;
            rotationX = rotationX + distance;
        }
        
        
        var canShiftLeft = rotationY - minAngle >= minY;
        var canShiftRight = rotationY + minAngle <= maxY;

        //fallback
        if(!canShiftLeft && !canShiftRight)
        {
            console.log("Cant shift left AND cant shift right!");
        }
        else if((Math.random() > 0.5 && canShiftLeft) || !canShiftRight)
        {
            //shift left
            var max = rotationY - minY;
            var distance = Math.random() * (max - minAngle) + minAngle;
            rotationY = rotationY - distance;
        }
        else
        {
            //shift right
            var max = maxY - rotationY;
            var distance = Math.random() * (max - minAngle) + minAngle;
            rotationY = rotationY + distance;
        }
        //console.log(rotationY);
    
        anchors.push({rotationX: rotationX, rotationY: rotationY});
        anchors2.push({rotationX: -rotationX, rotationY: -rotationY});
    }
    anchors.push({rotationX: 12, rotationY: 7});
    anchors2.push({rotationX: -12, rotationY: -7});
    
    tweenBezir1 = TweenMax.to('#container', 45, {bezier:{curviness:1.2, values:anchors}, ease:Power0.easeInOut, repeat: -1});
    tweenBezir2 = TweenMax.to('#ring5', 45, {bezier:{curviness:1.2, values:anchors2}, ease:Power0.easeInOut, repeat: -1});
    
}

function reset()
{
    var rule = CSSRulePlugin.getRule("#btnReset:after"); //get the rule
    TweenLite.to(rule, 1, {cssRule: {scale: 1.5, opacity: 0}, ease: Power1.easeIn});
    TweenLite.to('#btnReset', 1, {opacity: 0.4});
    
    tweenBezir1.pause();
    tweenBezir2.pause();

    coreSixths.Reset(false);
    
    TweenMax.to("#container", ringAnimTime, {rotationX: 0, rotationY: 0, ease: Power2.easeOut});
    TweenMax.to('#ring0', ringAnimTime, {z: 0, scale:"0.45", ease: Power2.easeOut});
    TweenMax.to('#ring1', ringAnimTime, {z: 0, scale:"0.50", ease: Power2.easeOut});
    TweenMax.to('#ring2', ringAnimTime, {z: 0, scale:"0.68", ease: Power2.easeOut});
    TweenMax.to('#ring3', ringAnimTime, {z: 0, scale:"1", ease: Power2.easeOut});
    TweenMax.to('#ring4', ringAnimTime, { z: 0, scale:"1", ease: Power2.easeOut});
    TweenMax.to('#ring5', ringAnimTime, {rotationX: 0, rotationY: 0, ease: Power2.easeOut});
    TweenMax.to('#ring6', ringAnimTime, { z: 0, opacity:"1", rotationX:0, ease: Power2.easeOut});

    runner.stop();
    runner.attr({transform: "r0" + "," + centerXY + "," + centerXY});
    
    resetWhiteThirds();
    
    innerThirdsLine1.forEach(function(element) {
        element.animate({arc: [113, 120]}, 700, "easeOut");
    });
    innerThirdsLine2.forEach(function(element) {
        element.animate({arc: [113, 120]}, 700, "easeOut");
    });
    
    setTimeout(initalAnimation.bind(this), ringAnimTime + 3000);
}

function animRects(i)
{
    if(i-1 >= 0)
        rects[i-1].attr({opacity: 0.35});
    else
        rects[rects.length-1].attr({opacity: 0.35});
    
    rects[i].attr({opacity: 0.9});
    if(i+1 == rects.length) i = -1;
    setTimeout(this.animRects.bind(null, i+1), 1000);
}

class CoreSixth
{
    constructor(r)
    {
        this.Angle = 58;
        this.StartR = 15;
        this.maxWidth = 30;
        this.Params = {stroke: "#F36B00", "stroke-width": 0, opacity: 0};
        this.CoreSixths1 = createCirlce(r, this.StartR, 6, this.Angle, this.Params, true);
        this.Params = {stroke: "#F36B00", "stroke-width": 5, opacity: 0};
        this.CoreSixths2 = createCirlce(r, this.StartR-8, 6, this.Angle, this.Params, true);
        this.AnimCoreSixths1;
        this.AnimCoreSixths2;
    }

    Anim1()
    {   
        for(let sixth of this.CoreSixths1)
        {
            //this.StartR + this.maxWidth/2 +20
            if(this.CoreSixths1.indexOf(sixth) == this.CoreSixths1.length-1)
            {
                sixth.animate({arc: [this.Angle, this.StartR + this.maxWidth +25]}, 770, "easeInOut"); 
                sixth.animate({"stroke-width": this.maxWidth}, 400, "linear", this.Six1StrokeTo0.bind(this)); 
            }
            else
            {
                sixth.animate({arc: [this.Angle, this.StartR + this.maxWidth +25]}, 770, "easeInOut"); 
                sixth.animate({"stroke-width": this.maxWidth}, 400, "linear"); 
            }
            sixth.animate({opacity: 0.3}, 200, "linear"); 
        }
        
        for(let sixth of this.CoreSixths2)
        {
            //radius and fade in for Six2
            if(this.CoreSixths2.indexOf(sixth) == this.CoreSixths2.length-1)
                sixth.animate({arc: [this.Angle, this.StartR + this.maxWidth +  25]}, 770, "easeInOut", this.Six2FadeOut.bind(this));
            else
                sixth.animate({arc: [this.Angle, this.StartR + this.maxWidth +  25]}, 770, "easeInOut");
            sixth.animate({opacity: 0.4}, 100, "linear"); 
        }
    }
    
    Six1StrokeTo0()
    {
        //stroke hide for Six1
        for(let sixth of this.CoreSixths1)
        {
            if(this.CoreSixths1.indexOf(sixth) == this.CoreSixths1.length-1)
                sixth.animate({"stroke-width":0}, 300, "linear", this.Six2StrokeTo0.bind(this));
            else
                sixth.animate({"stroke-width":0}, 300, "linear");
        }
    }
    
    Six2StrokeTo0()
    {
        //stroke hide for Six1
        for(let sixth of this.CoreSixths2)
        {
            sixth.animate({"stroke-width":0}, 150, "linear");
        }
    }
    
    Six2FadeOut()
    {
        for(let sixth of this.CoreSixths2)
        {
            if(this.CoreSixths2.indexOf(sixth) == this.CoreSixths2.length-1)
                sixth.animate({opacity: 0}, 150, "linear", this.Reset.bind(this, true));
            else
                sixth.animate({opacity: 0}, 150, "linear"); 
        }
    }
    
    Reset(restart)
    {
        for(let sixth of coreSixths.CoreSixths1)
        {
            sixth.stop();
        }
        for(let sixth of coreSixths.CoreSixths2)
        {
            sixth.stop();
        }
        
        for(let sixth of this.CoreSixths1)
        {
            sixth.animate({arc: [this.Angle, this.StartR], opacity: 0}, 10, "linear");
        }
        
        for(let sixth of this.CoreSixths2)
        {
            if(this.CoreSixths2.indexOf(sixth) == this.CoreSixths2.length-1 && restart)
                sixth.animate({arc: [this.Angle, this.StartR-8], opacity: 0, "stroke-width":5}, 10, "linear", this.Anim1.bind(this));
            else
                sixth.animate({arc: [this.Angle, this.StartR-8], opacity: 0, "stroke-width":5 }, 10, "linear"); 
        }
    }
}

class Sixths
{
    constructor(r, innerThirdsRadius)
    {
        this.TimePerSixth = 250;
        this.Alpha = 59;
        this.Gap = (360 - 6*this.Alpha)/6;
        this.Radius = innerThirdsRadius;
        
        this.Params = {stroke: "#F36B00", "stroke-width": 27, opacity: 0.4};
        this.BigSixths = createCirlce(r, innerThirdsRadius, 6, this.Alpha, this.Params, false);
        /*for(let i = 0; i < 6; i++)
        {
            let newSixth = r.path().attr({arc: [this.Alpha, this.Radius]}).attr(this.Params);
            this.BigSixths.push(newSixth);
        }*/
        
        this.Params = {stroke: "#F36B00", "stroke-width": 5, opacity: 0.6};
        this.SmallSixths = createCirlce(r, innerThirdsRadius, 6, this.Alpha, this.Params, false);
        /*for(let i = 0; i < 6; i++)
        {
            let newSixth = r.path().attr({arc: [this.Alpha, this.Radius]}).attr(this.Params);
            this.SmallSixths.push(newSixth);
        }*/
    }
    
    ResetSixthsAngles()
    {
        let angle;
        for(let i=0; i<this.BigSixths.length; i++)
        {
            angle = i * (this.Alpha + this.Gap);
            this.BigSixths[i].attr({transform: "r" + angle + "," + centerXY + "," + centerXY});
            this.SmallSixths[i].attr({transform: "r" + angle + "," + centerXY + "," + centerXY});
        }

        this.AnimSixthUp(this.SmallSixths, 0);
    }

    AnimSixthUp(sixths, i)
    {
        if(i == sixths.length) return;
        
        if(i < sixths.length-1)
        {
            sixths[i].animate({arc: [this.Alpha, this.Radius]}, this.TimePerSixth, "linear", this.AnimSixthUp.bind(this, sixths, i+1));
        }
        else if(sixths == this.BigSixths)
        {
            sixths[i].animate({arc: [this.Alpha, this.Radius]}, this.TimePerSixth, "linear", this.AnimSixthDown.bind(this, sixths, 0));
            return;
        }
        else
        {
            sixths[i].animate({arc: [this.Alpha, this.Radius]}, this.TimePerSixth, "linear", this.AnimSixthUp.bind(this, this.BigSixths, 0));
            return;
        }
    }

    AnimSixthDown(sixths, i)
    {
        if(i == sixths.length) return;

        let angle = (i+1) * this.Alpha + i * this.Gap;
        sixths[i].animate({arc: [0, this.Radius]}, this.TimePerSixth, "linear");

        if(i < sixths.length - 1)
        {
            sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, this.TimePerSixth, "linear", this.AnimSixthDown.bind(this, sixths, i+1));
        }
        else if(sixths == this.SmallSixths)
        {
            sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, this.TimePerSixth, "linear", this.ResetSixthsAngles.bind(this));
            return;
        }
        else
        {
            sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, this.TimePerSixth, "linear", this.AnimSixthDown.bind(this, this.SmallSixths, 0));
            return;
        } 
    }
    
    HighlightSmallSixth(i)
    {
        if(i == this.SmallSixths.length)
            i = 0;
        if(i == 0)
            this.SmallSixths[this.SmallSixths.length-1].attr({opacity:0.4});
        else
            this.SmallSixths[i-1].attr({opacity:0.4});

        this.SmallSixths[i].attr({opacity:1});
        //console.log(i);
        i++;

        setTimeout(this.HighlightSmallSixth.bind(this, i), 800);
    }
    
    Reset()
    {
        for(let sixth of this.BigSixths)
        {
            sixth.stop();
        }
        for(let sixth of this.SmallSixths)
        {
            sixth.stop();
        }
        this.AnimSixthUp(this.BigSixths, 0);
        this.AnimSixthUp(this.SmallSixths, 0);
    }
}

function animQuarters(r, quarters)
{
    let alpha = 50;
    let gap = (360 - 4*alpha)/4;
    
    if(quarters == null)
    {
        //initially create quarters
        let finalAngle;
        let param = {stroke: "#F36B00", "stroke-width": 8, opacity: 0.5};
        quarters = createCirlce(r, 88, 4, alpha, param, false);
    }
    else
    {
        //reset quarter angle
        for(let i = 0; i < quarters.length; i++)
        {
            let angle = (alpha + gap)*i;
            quarters[i].attr({transform: "r" + angle + "," + centerXY + "," + centerXY});
        }
    }
    
    for(let i = 0; i < quarters.length; i++)
    {
        finalAngle = -(360 -(alpha + gap)*i);
        quarters[i].animate({transform: "r" +finalAngle + "," + centerXY + "," + centerXY}, 16000, "linear");
    }
     
    setTimeout(animQuarters.bind(null, r, quarters), 16000);
}

function animWhiteThirds()
{
    alpha = 7;
    gap = (360 - 3*alpha) / 3;
    let angle;
    
    for(let i = 0; i < whiteThirds.length; i++)
    {
        angle = i * (alpha + gap) - (alpha/2);
        whiteThirds[i].animate({arc: [alpha, 232], transform: "r" + angle + "," + centerXY + "," + centerXY}, 700, "easeOut");
    }
}

function resetWhiteThirds()
{
    alpha = 95;
    gap = (360 - 3*alpha) / 3;
    let angle;
    
    for(let i = 0; i < whiteThirds.length; i++)
    {
        angle = i * (alpha + gap) - (alpha/2);
        whiteThirds[i].animate({arc: [alpha, 222], transform: "r" + angle + "," + centerXY + "," + centerXY}, 700, "easeOut");
    }
}

function animRunner()
{
    if(runner == null)
        runner = papers[2].rect(centerXY -12, centerXY - 178, 25, 3).attr({'fill': '#ffffff', stroke: 0});
    
    runner.attr({transform: "r0" + "," + centerXY + "," + centerXY});
    runner.animate({transform: "r-360" + "," + centerXY + "," + centerXY}, 2000, this.animRunner.bind(this));
}

function drawDeco(r, radius, decoCount, alpha, shape, angleOffset, rotated)
{
    let param = {stroke:"#fff", "stroke-width":3};
    let yOrigin = centerXY - radius;
    let gap = (360 - decoCount*alpha)/decoCount;
    let angle;
    for(let i=0; i < decoCount; i++)
    {
        switch(shape)
        {
            case 1: deco = r.path("M" + centerXY + " " + yOrigin + " l 0 8 l -12 0").attr(param);
                    break;
            case 2: deco = r.path("M" + centerXY + " " + yOrigin + " l 0 8 l 12 0").attr(param);
                    break;
            case 3: deco = r.path("M" + centerXY + " " + yOrigin + " l -13 0 l 26 0").attr(param);
                    break;
            case 4: deco = r.path("M" + centerXY + " " + yOrigin + " l 5 5 l -10 0 z").attr(param);
                    deco.attr({fill: "white"});
                    break;
        }
        if(rotated)
            angle = -alpha/2 + i*(alpha+gap) + angleOffset;
        else    
            angle = i*(alpha+gap);

       deco.rotate(angle, centerXY, centerXY);
    }
}

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
            slices.push( r.path().attr({arc: [alpha, radius]}).attr(params) );
            if(rotated)
                angle = -alpha/2 + i*(alpha+gap);
            else    
                angle = i*(alpha+gap);
            
            slices[slices.length-1].rotate(angle, centerXY, centerXY);
        }
        return slices;
    }
}