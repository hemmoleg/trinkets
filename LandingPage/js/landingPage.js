var currentVideo;
var video;
var source;
var tween;

var i = 0;
var target;
var angle;
var scale;

var VPWidth;
var VPHeight;

function initCurtain()
{
    let a2 = $(window).height() * $(window).height() + ($(window).width() * $(window).width());
    let c = Math.sqrt(a2);
    
    angle = (360 / (2*Math.PI)) * (Math.atan( $(window).height() / $(window).width() ));

    if($(window).height() > $(window).width())
    {
        scale = c / ($('#curtain').width());
    }
    else
    {
        scale = c / ($('#curtain').height());
    }
    scale = scale + 0.7;
    $('#curtain').css('transform', 'rotate('+ angle +'deg) scale('+scale+')');
   
    target = (c / $(window).width()) * 100 + 50 + '%';

    saveDimensions();
    console.log("target: " + target);
}

//////////////////////////////
//initCurtain on device landscape

window.onload = function()
{
    video = $('#fullscreenBGVideo' )[0];
	source = $('video source')[0];
    
    currentVideo = 1; 
    
    initCurtain();

    $( window ).resize(saveDimensions);

    $('.linkContainer').mouseenter(onEnterLinkContainer);
    $('.linkContainer').mouseleave(onLeaveLinkContainer);
    $('body').mousemove(onMouseMove);

    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('timeupdate', curtainFall);

    currentVideo = 0;
    loadNextVideo();
}

function saveDimensions()
{
    VPWidth = $(window).width();
    VPHeight = $(window).height();
}

function onEnterLinkContainer(e)
{
    TweenMax.to($(e.target.parentElement).find('.link'), 0.2, {z:-20, ease: Power1.easeInOut});
    //TweenMax.to($(e.target.parentElement).find('p'), 1, {opacity:1, ease:RoughEase.ease.config({points:15, strength:2, clamp:true})});
    TweenMax.to($(e.target.parentElement).find('p'), 0.7, {opacity:1, ease:Power1.easeInOut});
}

function onLeaveLinkContainer(e)
{
    TweenMax.to($(e.target.parentElement).find('.link'), 0.2, {z:-50, ease: Power1.easeInOut});
    //TweenMax.to($(e.target.parentElement).find('p'), 1, {opacity:0, ease:RoughEase.ease.config({points:25, strength:2, clamp:true})});
    TweenMax.to($(e.target.parentElement).find('p'), 0.7, {opacity:0, ease:Power1.easeInOut});
}

function onMouseMove(e)
{
    let x = (VPWidth/2) - (VPWidth/2 - e.clientX)/3;
    $('#stage').css('perspective-origin', x + "px " + e.clientY/2 + "px");
}

function loadNextVideo()
{
    currentVideo++;
    if ( currentVideo > $('.playlist').children().length ) 
        currentVideo = 1;

    source.src = $('.playlist a:nth-child('+currentVideo+')').attr('href');  
    video.load();
}

//curtain rise
function onCanPlayThrough()
{
    //return;
    video.play();
    video.playbackRate = 0.6;
    //video.pause();
    if(i % 2 == 0)
    {
        //to bot right
        TweenMax.to($('#curtain'),0.5,{top: target, left: target, ease: Power0.easeNone});
    }
    else
    {
        //to top right
        TweenMax.to($('#curtain'),0.5,{top:"-" + target, left: target, ease: Power0.easeNone});
    }
    tween = null;
}

function curtainFall()
{
    if(tween == null && (video.duration - video.currentTime) <= 1.5)
    {   
        i++;
        if(i % 2 == 0)
        {
            $('#curtain').css('transform', 'rotate('+ angle +'deg) scale('+scale+')');
            TweenMax.set($('#curtain'), {top:"-" + target, left:"-" + target});
        }
        else
        {
            $('#curtain').css('transform', 'rotate(-'+ angle +'deg) scale('+scale+')');
            TweenMax.set($('#curtain'), {top: target, left:"-" + target});
        }
        tween = TweenMax.to($('#curtain'),0.5,{top:"0%", left:"0%", ease: Power0.easeNone, onComplete: loadNextVideo});
    }
}