var currentVideo;
var video;
var source;
var tl;

window.onload = function()
{
    video = $('#fullscreenBGVideo' )[0];
	source = $('video source')[0];
    
    currentVideo = 1; 
    
    video.addEventListener('ended', onVideoEnded);
    //video.addEventListener('timeupdate', curtainFall)
    
    tl = new TimelineLite();
    tl.add(TweenMax.to($('#curtain'), 0.5, {opacity:1}));
    tl.add(TweenMax.to($('#curtain'), 0.5, {opacity:0}));
    tl.pause();

    //testPlay();
}

/*function testPlay()
{
    tl.play(0);

    setTimeout(testPlay, 500);
}*/

function curtainFall()
{
    //console.log(video.currentTime);
    if(tl.paused() && video.duration - video.currentTime <= 0.5)
    {
        console.log("play");
        tl.play(0);
    }
}

function pauseTl()
{
    tl.pause();
}

function onVideoEnded()
{
    tl.play(0);
console.log('play');
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