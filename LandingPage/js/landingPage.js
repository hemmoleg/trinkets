var currentVideo;
var video;
var source;
var tween;

var i = 0;
var target;
var angle;
var scale;

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
   
    target = (c / $(window).height()) * 100 + '%';

    //TweenMax.set('.border', {rotationX:-15});
    //TweenMax.set('.link',{z:-150, rotationX:-15});

    //TweenMax.set('.link:nth-child(2)',{z:10});
    //TweenMax.set('.border:nth-child(2)',{z:-10});
}

//////////////////////////////
//resize?
//////////////////////////////
//three divs in one stretchcontainer, each div containing one link and one border

window.onload = function()
{
    video = $('#fullscreenBGVideo' )[0];
	source = $('video source')[0];
    
    currentVideo = 1; 
    
    initCurtain();
return;
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('timeupdate', curtainFall);

    currentVideo = 0;
    loadNextVideo();
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