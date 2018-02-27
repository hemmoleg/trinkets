var allLinks;
var currentVideo;
var video;

window.onload = function()
{
	/* Variables */
    var videoContainer = document.getElementById( 'videoContainer' );
    video = videoContainer.getElementsByClassName( 'fullscreenBGVideo' )[0];
	var	playlist = videoContainer.getElementsByClassName( 'fullscreenBGPlaylist' )[0],
		source = video.getElementsByTagName( 'source' ),
		linkList = [],
		videoDirectory = 'testGifs/',
        i, filename;
    
    
    currentVideo = 0;
    allLinks = playlist.children;

	// Save all video sources from playlist
	for ( i = 0; i < allLinks.length; i++ ) {
		filename = allLinks[i].href;
		linkList[i] = filename.match( /([^\/]+)(?=\.\w+$)/ )[0];
    }
    

	/*video.addEventListener( 'ended', function () {
        allLinks[currentVideo].classList.remove( 'currentVideo' );
        
		nextVideo = currentVideo + 1;
		if ( nextVideo >= allLinks.length ) {
			nextVideo = 0;
        }
        
		playVideo( nextVideo );
    } );*/
    
}

function playVideo( index ) {
    allLinks[currentVideo].classList.remove( 'currentVideo' );
    allLinks[index].classList.add( 'currentVideo' );
    currentVideo = index;
    
    /*sources[2].src = videoDirectory + linkList[index] + '.mp4';
    sources[1].src = videoDirectory + linkList[index] + '.mp4';
    sources[0].src = videoDirectory + linkList[index] + '.mp4';*/
    
    video.load();
    video.play();
}