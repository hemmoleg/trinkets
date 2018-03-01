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
    loadNextVideo();
}


function curtainFall()
{
    //console.log(video.currentTime);
    if(tween == null && (video.duration - video.currentTime) <= 1.5)
    {
        //tween = TweenMax.to($('#curtain'), 1.5, {opacity:1, ease: Power1.easeIn, onComplete: loadNextVideo});
        tween = TweenMax.to($('#boxShadow'), 1.5, {boxShadow:"0 0 350px 50vw #000 inset",
                                                    onComplete: loadNextVideo});
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
    //TweenMax.to($('#curtain'), 1.5, {opacity:0, ease: Power1.easeIn});
    tween = null;

    TweenMax.set($('#curtain'), {opacity:0, ease: Power1.easeIn});
    TweenMax.to($('#boxShadow'), 1.5, {boxShadow:"0 0 0px 0vw #000 inset"});
}