var currentVideo;
var video;
var source;
var tl;
var tween;

var TEST_C;
var target;

function initCurtain()
{
    /* a2 + b2 = c2
            b2 = c2 - a2
      -c2 + b2 = -a2
       c2 - b2 = a2
       height2 - width2 = a2 */

    let a2 = $(window).height() * $(window).height() + ($(window).width() * $(window).width());
    TEST_C = Math.sqrt(a2);
    /*$('#curtain').width(TEST_C);
    $('#curtain').height(TEST_C);
    $('#curtain').css('top', -TEST_C);
    $('#curtain').css('left', -TEST_C/2);*/
    
    let angle = (360 / (2*Math.PI)) * (Math.atan( $(window).height() / $(window).width() ));

    let scale;
    if($(window).height() > $(window).width())
    {
        scale = TEST_C / ($('#curtain').width());
    }
    else
    {
        scale = TEST_C / ($('#curtain').height());
    }

    $('#curtain').css('transform', 'rotate('+ angle +'deg) scale('+scale+')');
    //$('#curtain').css('transform', 'scale('+scale+')');
    target = (TEST_C / $(window).height()) * 100 + '%';
    /*$('#curtain').css('top', '-' + target);
    $('#curtain').css('left', '-' + target);*/
}

window.onload = function()
{
    video = $('#fullscreenBGVideo' )[0];
	source = $('video source')[0];
    
    currentVideo = 1; 
    
    initCurtain();

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

function onCanPlayThrough()
{
    //return;
    video.play();
    //video.pause();
    TweenMax.to($('#curtain'),1.5,{top: target, left: target});
    tween = null;
}

function curtainFall()
{
    //console.log(video.currentTime);
    if(tween == null && (video.duration - video.currentTime) <= 1.5)
    {
        tween = TweenMax.to($('#curtain'),1.5,{top:"0%", left:"0%", onComplete: loadNextVideo});
        TweenMax.set($('#curtain'), {top:"-" + target, left:"-" + target})
    }
}