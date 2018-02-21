﻿var centerXY;
var bigSixths;
var smallSixths;
var DecoShape = {"SquareAngelL":1, "SquareAngelR":2, "Bar":3, "Triangle":4}
var holderOriginalTransform = "";

var papers = [];
var jqPapers;

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

function resize()
{
    var clientHeight = $(window).height();
    var clientWidth = $(window).width();
    var newScale;
    
    var svgDimesion = $('svg').height();
    
    if(clientHeight/svgDimesion < clientWidth/svgDimesion)
    {
        newScale = clientHeight/svgDimesion;
    }
    else
    {
        newScale = clientWidth/svgDimesion;
    }
    newScale = newScale-0.1;
    
    if(jqPapers[0].style.transform != "")
    {
        jqPapers.each(function(i, paper){
            paper.style.transform = paper.style.transform.replace(/scale\(.+?\)/, 'scale(' + newScale + ')');
        });
    }
    else
    {
        jqPapers.each(function(i, paper){
            paper.style.transform = 'scale(' + newScale + ')';
        });
    }
    
    
    let left;
    let top;
    
    //position div
    left = ($(window).width() - $('#outer')[0].getBoundingClientRect().width )/2;
    top = ($(window).height() - 670)/2;// $('div')[0].getBoundingClientRect().height )/2
    $('#outer').offset({ top: top, left: left });
    
    
    for(let i = 0; i < jqPapers.length; i++)
    {
        left = ($(window).width() - jqPapers[i].getBoundingClientRect().width )/2;
        top = ($(window).height() - jqPapers[i].getBoundingClientRect().height )/2;
        
        
        console.log(i + " new left: " + left);
        
        $(jqPapers[i]).offset({ top: top, left: left });
    }
    
    
}

window.onload = function () {

    /////////////////////////////
    //continue refactor of papers into seperate divs
    /////////////////////////////
    //on with the 3d conversion
    /////////////////////////////
    //figure out TweenMax translateZ

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
    
    for(let i = 1; i < $('.overlapping').length; i++)
    {
        papers.push( Raphael($('.overlapping')[i], 670, 670) );
        papers[papers.length-1].customAttributes.arc = customAttributes;
    }
    
     //container: div#ring1.overlapping, width: 670, height: 670} -->
    
    /*//proper paper order in html
    $('#outer').children().each(function(i,svg){$('#outer').prepend(svg)});
    
    jqPapers = $('#outer svg');
    
    
    //set default style for all papers
    jqPapers.each(function(i, paper){
        //paper.style.transform = "scale(1) rotateX(10deg) translateZ(0px)";
        paper.style.transform = "scale(1) rotateX(10deg) translateZ(0px)";
    });
    
    resize();
    */
    
    //z-Coordinates
    //jqPapers[1].style.transform = jqPapers[1].style.transform.replace(/translateZ\(.+?\)/, 'translateZ(40px)');
    
    //TweenMax.to(jqPapers[1], 5, {transform:"translateZ(0px)"});
    
    $( window ).resize(resize);
    
    /////////////draw stuff
    // https://steamuserimages-a.akamaihd.net/ugc/80342118768853730/E698567DFD278F74F96C12336E641041964E5C9F/?interpolation=lanczos-none&output-format=jpeg&output-quality=95&fit=inside%7C637%3A358&composite-to=*,*%7C637%3A358&background-color=black
    
    centerXY = 335;
    var R = 120;
    var param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.6};
    
    //helpers
    papers[0].rect(centerXY , 0, 1, 800).attr({'fill': '#ffffff', stroke: 0});
    
    //outline
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.3};
    createCirlce(papers[0], 310, 1, 0, param, false);
    
    //rects
    let radius = 285;
    let posY = centerXY - radius;
    let rects = [];
    for (let i = 0; i < 360; i = i + 2) 
    {
        let currentRect = papers[1].rect(centerXY , posY, 4, 10);
        currentRect.attr({'fill': '#F36B00', stroke: 0, opacity: 0.35});
        currentRect.rotate(i, centerXY, posY + radius);
        rects.push(currentRect);
    }
    
    //lineRectsThin
    param = {stroke: "#F36B00", "stroke-width": 2, opacity: 0.6};
    var lineRectsThin = papers[1].path().attr(param).attr({arc: [180, 270, 2]});//.attr({opacity: 0.4});
    
    //lineRectsBig
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.6};
    var lineRectsBig = papers[1].path().attr(param).attr({arc: [180, 270, 4]});
    lineRectsBig.rotate(180, centerXY, centerXY);
    
    drawDeco(papers[0], 240, 3, 128, DecoShape.SquareAngelL, 0, true);
    drawDeco(papers[0], 240, 3, 128, DecoShape.SquareAngelR, 8, true);
    drawDeco(papers[0], 232, 3, 128, DecoShape.Bar, 0, false);
    drawDeco(papers[0], 330, 4, 128, DecoShape.Triangle, 0, false);
    
    //outerThirds
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.3};
    let outerThirds = createCirlce(papers[0], 210, 3, 113, param, true);
    
    //innerThirds
    let innerThirdsRadius = 140;
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.2};
    let innerThirds = createCirlce(papers[0], innerThirdsRadius, 3, 113, param, true);

    //innerThirdsLines
    param = {stroke: "#F36B00", "stroke-width": 3, opacity: 0.6};
    let innerThirdsLine1 = createCirlce(papers[0], 159, 3, 113, param, true);
    let innerThirdsLine2 = createCirlce(papers[0], 121, 3, 113, param, true);
    
    //ring
    papers[1].circle(centerXY, centerXY, 90).attr({stroke: "#F36B00", "stroke-width": 3, opacity: 0.3});
    
    var runner = papers[0].rect(centerXY -12, centerXY - 188, 25, 3).attr({'fill': '#ffffff', stroke: 0});
    animRunner(papers[0], runner);
    
    

    let sixths = new Sixths(papers[0], innerThirdsRadius);
    sixths.AnimSixths();
    sixths.HighlightSmallSixth(0);
    
    let coreSixths = new CoreSixth(papers[0]);
    coreSixths.Anim1(58);
    
    animQuarters(papers[1], null);
    animRects(rects, 0);
}

function animRects(rects, i)
{
    if(i-1 >= 0)
        rects[i-1].attr({opacity: 0.35});
    else
        rects[rects.length-1].attr({opacity: 0.35});
    
    rects[i].attr({opacity: 0.9});
    if(i+1 == rects.length) i = -1;
    setTimeout(this.animRects.bind(null, rects, i+1), 1000);
}

class CoreSixth
{
    constructor(r)
    {
        this.Angle = 58;
        this.StartR = 20;
        this.maxWidth = 32;
        this.Params = {stroke: "#F36B00", "stroke-width": 0, opacity: 0};
        this.CoreSitxths = createCirlce(r, this.StartR, 6, this.Angle, this.Params, true);
        this.Params = {stroke: "#F36B00", "stroke-width": 5, opacity: 0};
        this.CoreSitxths2 = createCirlce(r, this.StartR-8, 6, this.Angle, this.Params, true);
    }

    Anim1()
    {   
        for(let sixth of this.CoreSitxths)
        {
            //this.StartR + this.maxWidth/2 +20
            if(this.CoreSitxths.indexOf(sixth) == this.CoreSitxths.length-1)
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
        
        for(let sixth of this.CoreSitxths2)
        {
            //radius and fade in for Six2
            if(this.CoreSitxths2.indexOf(sixth) == this.CoreSitxths.length-1)
                sixth.animate({arc: [this.Angle, this.StartR + this.maxWidth +  25]}, 770, "easeInOut", this.Six2FadeOut.bind(this));
            else
                sixth.animate({arc: [this.Angle, this.StartR + this.maxWidth +  25]}, 770, "easeInOut");
            sixth.animate({opacity: 0.4}, 100, "linear"); 
        }
    }
    
    Six1StrokeTo0()
    {
        //stroke hide for Six1
        for(let sixth of this.CoreSitxths)
        {
            if(this.CoreSitxths.indexOf(sixth) == this.CoreSitxths.length-1)
                sixth.animate({"stroke-width":0}, 300, "linear", this.Six2StrokeTo0.bind(this));
            else
                sixth.animate({"stroke-width":0}, 300, "linear");
        }
    }
    
    Six2StrokeTo0()
    {
        //stroke hide for Six1
        for(let sixth of this.CoreSitxths2)
        {
            sixth.animate({"stroke-width":0}, 150, "linear");
        }
    }
    
    Six2FadeOut()
    {
        for(let sixth of this.CoreSitxths2)
        {
            if(this.CoreSitxths2.indexOf(sixth) == this.CoreSitxths.length-1)
                sixth.animate({opacity: 0}, 150, "linear", this.Reset.bind(this));
            else
                sixth.animate({opacity: 0}, 150, "linear"); 
        }
    }
    
    Reset()
    {
        for(let sixth of this.CoreSitxths)
        {
            sixth.animate({arc: [this.Angle, this.StartR], opacity: 0}, 10, "linear");
        }
        
        for(let sixth of this.CoreSitxths2)
        {
            if(this.CoreSitxths2.indexOf(sixth) == this.CoreSitxths.length-1)
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
        this.Params = {stroke: "#F36B00", "stroke-width": 27, opacity: 0.2};
        this.BigSixths = [];
        for(let i = 0; i < 6; i++)
        {
            let newSixth = r.path().attr({arc: [0, this.Radius]}).attr(this.Params);
            this.BigSixths.push(newSixth);
        }
        
        this.SmallSixths = [];
        this.Params = {stroke: "#F36B00", "stroke-width": 5, opacity: 0.4};
        for(let i = 0; i < 6; i++)
        {
            let newSixth = r.path().attr({arc: [0, this.Radius]}).attr(this.Params);
            this.SmallSixths.push(newSixth);
        }
    }
    
    AnimSixths()
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
            sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, this.TimePerSixth, "linear", this.AnimSixths.bind(this));
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


function animQuarters(r, quarters)
{
    let alpha = 50;
    let gap = (360 - 4*alpha)/4;
    
    if(quarters == null)
    {
        //initially create quarters
        let finalAngle;
        let param = {stroke: "#F36B00", "stroke-width": 8, opacity: 0.5};
        quarters = createCirlce(r, 93, 4, alpha, param, false);
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
        quarters[i].animate({transform: "r" +finalAngle + "," + centerXY + "," + centerXY}, 6000, "linear");
    }
     
    setTimeout(animQuarters.bind(null, r, quarters), 6000);
}

function animRunner(r, runner)
{
    runner.attr({transform: "r0" + "," + centerXY + "," + centerXY});
    runner.animate({transform: "r-360" + "," + centerXY + "," + centerXY}, 2000);
    setTimeout(animRunner.bind(null, r, runner), 2000);
}