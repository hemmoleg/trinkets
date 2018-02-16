var centerXY;
var bigSixths;
var smallSixths;
var timePerSixth;
var DecoShape = {"SquareAngelL":1, "SquareAngelR":2, "Bar":3, "Triangle":4}

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

window.onload = function () {
    /*createCircle2(3,50,50,94);

    testCircle3(3,0,0,194);*/
    var r = Raphael("holder", 800, 800);
    centerXY = 400;
    var R = 120;
    var param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.6};
    
    // Custom Attribute
    r.customAttributes.arc = function (value, R)
    {
        //var centerXY = 400;
        
        var alpha = 360 / 360 * value
        var a = (90 - alpha) * Math.PI / 180
        var x = centerXY + R * Math.cos(a)
        var y = centerXY - R * Math.sin(a)
        var path = [["M", centerXY, centerXY - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        
        path = [["M", centerXY, centerXY - R], ["A", R, R, 0, +(alpha > 180), 1, x, y]];
        
        return {path: path};
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
    
    drawDeco(r, 280, 3, 128, DecoShape.SquareAngelL, 0, true);
    drawDeco(r, 280, 3, 128, DecoShape.SquareAngelR, 8, true);
    drawDeco(r, 272, 3, 128, DecoShape.Bar, 0, false);
    drawDeco(r, 370, 4, 128, DecoShape.Triangle, 0, false);
    
    //lineRectsThin
    var lineRectsThin = r.path().attr(param).attr({arc: [180, 300, 2]});//.attr({opacity: 0.4});
    
    //lineRectsBig
    param = {stroke: "#F36B00", "stroke-width": 4, opacity: 0.6};
    var lineRectsBig = r.path().attr(param).attr({arc: [180, 300, 4]});
    lineRectsBig.rotate(180, centerXY, centerXY);
    
    //outerThirds
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.3};
    let outerThirds = createCirlce(r, 250, 3, 113, param, true);
    
    //innerThirds
    radius = 180;
    param = {stroke: "#F36B00", "stroke-width": 30, opacity: 0.2};
    let innerThirds = createCirlce(r, 180, 3, 113, param, true);

    //innerThirdsLine1
    param = {stroke: "#F36B00", "stroke-width": 3, opacity: 0.6};
    let innerThirdsLine1 = createCirlce(r, 199, 3, 113, param, true);
    let innerThirdsLine2 = createCirlce(r, 161, 3, 113, param, true);
    
    //ring
    r.circle(centerXY, centerXY, 130).attr({stroke: "#F36B00", "stroke-width": 3, opacity: 0.3});
    
    var runner = r.rect(centerXY -12, 173, 25, 3).attr({'fill': '#ffffff', stroke: 0});
    animRunner(r, runner);
    
    timePerSixth = 220;
    var alpha = 59;
    var gap = (360 - 6*alpha)/6;
    var radius = 180;
    
    bigSixths = [];
    params = {stroke: "#F36B00", "stroke-width": 27, opacity: 0.2};
    for(let i = 0; i < 6; i++)
    {
        let newSixth = r.path().attr({arc: [0, radius]}).attr(params);
        newSixth.rotate( bigSixths.length * (alpha + gap), centerXY, centerXY);
        bigSixths.push(newSixth);
    }
    
    
    smallSixths = [];
    params = {stroke: "#F36B00", "stroke-width": 5, opacity: 0.4};
    for(let i = 0; i < 6; i++)
    {
        let newSixth = r.path().attr({arc: [0, radius]}).attr(params);
        newSixth.rotate( smallSixths.length * (alpha + gap), centerXY, centerXY);
        smallSixths.push(newSixth);
    }

    let coreSixths = new CoreSixth(r);
    coreSixths.Anim1(58);
    
    //animSixths(alpha, radius, gap)
    //highlightSmallSixth(0);
    //animQuarters(r, null);
    //animWidth( 58);


}

class CoreSixth
{
    constructor(r)
    {
        this.angle = 58;
        this.startR = 20;
        this.maxWidth = 32;
        this.params = {stroke: "#F36B00", "stroke-width": 0, opacity: 0};
        this.coreSixths = createCirlce(r, this.startR, 6, this.angle, this.params, true);
        this.params = {stroke: "#F36B00", "stroke-width": 5, opacity: 0};
        this.coreSixths2 = createCirlce(r, this.startR-8, 6, this.angle, this.params, true);
    }

    Anim1()
    {   
        for(let sixth of this.coreSixths)
        {
            //this.startR + this.maxWidth/2 +20
            if(this.coreSixths.indexOf(sixth) == this.coreSixths.length-1)
            {
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth +30]}, 1100, "linear"); 
                sixth.animate({"stroke-width": this.maxWidth}, 600, "linear", this.Anim2.bind(this)); 
            }
            else
            {
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth +30]}, 1100, "linear"); 
                sixth.animate({"stroke-width": this.maxWidth}, 600, "linear"); 
            }
            sixth.animate({opacity: 0.4}, 200, "linear"); 
        }
        
        for(let sixth of this.coreSixths2)
        {
            /*if(this.coreSixths2.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth/4 + 25]}, 600, "linear", this.Anim2.bind(this));
            else
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth/4 + 25]}, 600, "linear");*/ 
        
            sixth.animate({opacity: 0.4}, 200, "linear"); 
        }
        
        for(let sixth of this.coreSixths2)
        {
            if(this.coreSixths2.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth +  10]}, 1100, "easeOut", this.Anim3.bind(this));
            else
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth +  10]}, 1100, "easeOut"); 
        }
    }
    
    Anim2()
    {
        for(let sixth of this.coreSixths)
        {
            /*if(this.coreSixths.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth +30], "stroke-width":0}, 500, "linear", this.Reset.bind(this));
            else*/
                sixth.animate({"stroke-width":0}, 500, "linear");
        }
        
        /*for(let sixth of this.coreSixths2)
        {
            if(this.coreSixths2.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth * 1.1 +  30]}, 500, "easeOut", this.Anim3.bind(this));
            else
                sixth.animate({arc: [this.angle, this.startR + this.maxWidth * 1.1 +  30]}, 500, "easeOut"); 
        }*/
    }
    
    Anim3()
    {
        for(let sixth of this.coreSixths2)
        {
            if(this.coreSixths2.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({opacity: 0}, 300, "linear", this.Reset.bind(this));
            else
                sixth.animate({opacity: 0}, 300, "linear"); 
        }
    }
    
    Reset()
    {
        for(let sixth of this.coreSixths)
        {
            /*if(this.coreSixths.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({arc: [this.angle, this.startR], opacity: 0}, 10, "linear", this.AnimStart.bind(this));
            else*/
                sixth.animate({arc: [this.angle, this.startR], opacity: 0}, 10, "linear");
        }
        
        for(let sixth of this.coreSixths2)
        {
            if(this.coreSixths2.indexOf(sixth) == this.coreSixths.length-1)
                sixth.animate({arc: [this.angle, this.startR-8], opacity: 0}, 10, "linear", this.Anim1.bind(this));
            else
                sixth.animate({arc: [this.angle, this.startR-8], opacity: 0}, 10, "linear"); 
        }
    }
}

function highlightSmallSixth(i)
{
    if(i == smallSixths.length)
        i = 0;
    if(i == 0)
        smallSixths[smallSixths.length-1].attr({opacity:0.4});
    else
        smallSixths[i-1].attr({opacity:0.4});
    
    smallSixths[i].attr({opacity:1});
    //console.log(i);
    i++;
    
    setTimeout(highlightSmallSixth.bind(null, i), 800);
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

function animSixths(alpha, radius, gap)
{
    let angle;
    for(let i=0; i<bigSixths.length; i++)
    {
        angle = i * (alpha + gap);
        bigSixths[i].attr({transform: "r" + angle + "," + centerXY + "," + centerXY});
        smallSixths[i].attr({transform: "r" + angle + "," + centerXY + "," + centerXY});
    }
    
    animSixthUp(smallSixths, alpha, gap, radius, 0);
   
}

function animSixthUp(sixths, alpha, gap, radius, i)
{
    if(i == sixths.length) return;
    
    if(i < sixths.length-1)
    {
        sixths[i].animate({arc: [alpha, radius]}, timePerSixth, "linear", function(){animSixthUp( sixths, alpha, gap, radius, i+1)});
    }
    else if(sixths == bigSixths)
    {
        sixths[i].animate({arc: [alpha, radius]}, timePerSixth, "linear", function(){ animSixthDown(sixths, alpha, gap, radius, 0)});
        return;
    }
    else
    {
        sixths[i].animate({arc: [alpha, radius]}, timePerSixth, "linear", function(){ animSixthUp(bigSixths, alpha, gap, radius, 0)});
        return;
    }
}

function animSixthDown(sixths, alpha, gap, radius, i)
{
    if(i == sixths.length) return;
    
    let angle = (i+1) * alpha + i * gap;
    sixths[i].animate({arc: [0, radius]}, timePerSixth, "linear");
    
    if(i < sixths.length - 1)
    {
        sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, timePerSixth, "linear", function(){animSixthDown(sixths, alpha, gap, radius, i+1)});
    }
    else if(sixths == smallSixths)
    {
        sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, timePerSixth, "linear", function(){ animSixths(alpha, radius, gap)});
        return;
    }
    else
    {
        sixths[i].animate({transform: "r" +angle + "," + centerXY + "," + centerXY}, timePerSixth, "linear", function(){ animSixthDown(smallSixths, alpha, gap, radius, 0)});
        return;
    } 
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

function animRunner(r, runner)
{
    runner.attr({transform: "r0" + "," + centerXY + "," + centerXY});
    runner.animate({transform: "r360" + "," + centerXY + "," + centerXY}, 2000);
    setTimeout(animRunner.bind(null, r, runner), 2000);
}