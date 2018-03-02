var currentVideo;
var video;
var source;
var tl;
var tween;

window.onload = function()
{
    video = $('#fullscreenBGVideo' )[0];
	source = $('video source')[0];
    
    currentVideo = 1; 
    
    video.addEventListener('timeupdate', curtainFall);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    
    currentVideo = 0;
    //loadNextVideo();
}


function curtainFall()
{
    //console.log(video.currentTime);
    if(tween == null && (video.duration - video.currentTime) <= 1.5)
    {
        tween = TweenMax.to($('#curtain'),1.5,{height:"250%", onComplete: loadNextVideo});
        TweenMax.set($('#curtain'), {height:"10%", top:"-40%", left:"-55%"})
    }
}

function loadNextVideo()
{
    currentVideo++;
    if ( currentVideo > $('.playlist').children().length ) 
        currentVideo = 1;

    source.src = $('.playlist a:nth-child('+currentVideo+')').attr('href');  
    video.load();
}

function onCanPlayThrough()
{
    video.play();
    //video.pause();
    TweenMax.to($('#curtain'),1.5,{height:"10%", top:"200%", left:"80%"});
    tween = null;
}