var currentVideo;
var video;
var source;

window.onload = function()
{
    video = $('#fullscreenBGVideo' )[0];
	source = $('video source')[0];
    
    currentVideo = 1; 
    
    video.addEventListener( 'ended', onVideoEnded);
    video.addEventListener('timeupdate', curtainFall)
    
}

function curtainFall()
{
    console.log(video.currentTime);
    if(video.duration - video.currentTime <= 0.5)
    {
        TweenMax.to($('#curtain'), 0.5, {opacity:1, onComplete:curtainRaise});
    }
}

function curtainRaise()
{
    TweenMax.to($('#curtain'), 0.5, {opacity:0, onComplete:curtainRaise});
}

function onVideoEnded()
{
    currentVideo++;
    if ( currentVideo > $('.playlist').children().length ) 
        currentVideo = 1;

    playVideo(currentVideo);
}

function playVideo(index) 
{
    currentVideo = index;
    
    source.src = $('.playlist a:nth-child('+index+')').attr('href');
    
    video.load();
    video.play();
}