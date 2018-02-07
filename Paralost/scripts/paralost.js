var meteorMaster;
var docWidth;
var docHeight;
var meteorHeight;
var keepAddingMeteors = true;

window.onload = function() {
    
    meteorMaster = $('.meteor').first().clone(false);   
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

    newMeteor.css('transform', 'rotate(-10deg) ' + 'translate3d('+xPos+'px,'+yPos+'px, -100px)');
    $('body').append(newMeteor);

    console.log('new meteor ' + xPos + ' ' + yPos);

    let targetX = xPos + docHeight * Math.tan(12 * Math.PI/180);
    TweenMax.to(newMeteor, 2, { x: targetX, y: docHeight, ease: Power0.easeNone, onComplete: removeMeteor, onCompleteParams:[newMeteor]});
    
    particles(newMeteor);
    
    setTimeout(function(){placeMeteor();}, 1000);
}

function particles(meteor)
{
    if($(meteor).parent().length == 0)
        return;
    
    let particle = $(meteor).clone();
    particle.addClass('particle');
    $('body').append(particle);
    
    let targetY = $(meteor).position().top + 100;
    let targetX = $(meteor).position().left + 100 * Math.tan(12 * Math.PI/180);
    
    TweenMax.to(particle, 2, { x: targetX, y: targetY, ease: Power0.easeNone, onComplete: removeMeteor, onCompleteParams:[particle]});
    
    setTimeout(function(){particles(meteor);}, 100);
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