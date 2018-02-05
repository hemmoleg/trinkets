var meteorMaster;
var docWidth;
var docHeight;
var meteorHeight;
var keepAddingMeteors = true;

window.onload = function() {
    meteorMaster = $('.meteor').clone(false);   
    docHeight = document.documentElement.clientHeight;
    docWidth = document.documentElement.clientWidth;

    //$('#skyline1').css('top', '500px');
    $('#skyline1').css('top', parseInt(docHeight - $('#skyline1').outerHeight()) + 'px');
    
    placeMeteor();

    $('body').click(startStopAddingMeteors);
}

function placeMeteor()
{
    if(!keepAddingMeteors)
        return;
   
    meteorHeight = $('.meteor').first().height();
    let newMeteor = $(meteorMaster).clone(false);
    
    /*var min = this.MinMoveX;
    var max = Math.abs(currentLeft) - this.Safety;
    var distance = Math.random() * (max - min) + min;*/
    
    let xPos = Math.floor(Math.random() * (docWidth - 0) + 0);
    let yPos = - meteorHeight;

    newMeteor.css('transform', 'skewX(10deg) ' + 'translate3d('+xPos+'px,'+yPos+'px, -100px)');
    $('body').append(newMeteor);

    console.log('new meteor ' + xPos + ' ' + yPos);

    let targetX = xPos + docHeight * Math.tan(10 * Math.PI/180);
    TweenMax.to(newMeteor, 5, { x: targetX, y: docHeight, ease: Power1.easeInOut, onComplete: removeMeteor, onCompleteParams:[newMeteor]});
    
    setTimeout(function(){placeMeteor();}, 5000);
}

function startStopAddingMeteors()
{
    keepAddingMeteors = !keepAddingMeteors;
    console.log(keepAddingMeteors);
    placeMeteor();
}

function removeMeteor(e)
{
    $(e).remove();
}