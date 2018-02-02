var meteorMaster;
var docWidth;
var docHeight;
var meteorHeight;
var keepAddingMeteors = true;

window.onload = function() {
    meteorMaster = $('.meteor').clone(false);   
    docHeight = document.documentElement.clientHeight;
    docWidth = document.documentElement.clientWidth;
    
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
    let yPos = Math.floor(Math.random() * (docHeight*0.3 - meteorHeight/2));

    newMeteor.css('transform', 'skewX(10deg) ' + 'translate('+xPos+'px,'+yPos+'px)');
    $('body').append(newMeteor);

    console.log('new meteor ' + xPos + ' ' + yPos);

    let targetX = xPos + docHeight * Math.tan(10); // Math.tan(10) = 0.64???
    TweenMax.to(newMeteor, 5, { x: targetX, y: docHeight, ease: Power1.easeInOut});
    
    setTimeout(function(){placeMeteor();}, 5000);
}

function startStopAddingMeteors()
{
    keepAddingMeteors = !keepAddingMeteors;
    console.log(keepAddingMeteors);
    placeMeteor();
}