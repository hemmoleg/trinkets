var slotsUnordered = [];
var slots = [];
var pieces = [];
var prevPieces;
var dragSrcElement = null;
var hasMovedOrMerged = false;
var hiscore = 0;
var moving = false;
var minDistance = 19.3;
var colorStart = 120;
var animDurationGameOverIn;
var animDurationGameOverOut = '1s';
var animDelayGameOver;
var firstGame = false;
var isAutoplay = false;

Direction = {UP:0, DOWN:1, LEFT:2, RIGHT:3}

class Piece
{
    constructor(x, y, initVal)
    {
        this.Div = "";
        this.X = x;
        this.Y = y;
        this.Value = initVal;
        this.CanMerge = true;
        this.Moving;
        this.TmpLeft = 0;
        this.TmpTop = 0;    
        
        
        this.Div = document.createElement('div');
        this.Div.innerHTML = "<b>" + initVal + "</b>";
        this.Div.classList.add('piece');
        this.Div.classList.add('newPieceAnim');
        this.Div.addEventListener("transitionend", finishMove);
        this.Div.addEventListener("animationend", finishAnimation);
        
        //initialy set color
        this.SetColor(initVal);
    }

    SetColor(val)
    {
        var i = 0;
        while(val != 2)
        {
            val = val/2;
            i++;
        }

        //way too complex formula for calculating color
        var mainValue = (360/(2*Math.PI)) * (((2*Math.PI)/360)*colorStart - (i * 0.3));
        var color = "hsla("+mainValue+", 100%, 60%, .8)";
        this.Div.style.backgroundColor = color;
        color = hslToRgba(mainValue, 100, 30, 1);
        this.Div.style.borderColor = color;
        this.Div.style.boxShadow = " 0px 0px 15px " + color;
    }
    
    
    DoubleValue()
    {
        this.Value = parseInt(this.Value) + parseInt(this.Value);
        this.Div.innerHTML = "<b>" + this.Value + "</b>";
        this.SetColor(this.Value);
    }
}

class TablePerspective
{
    
    ChangePerspective(direction)
    {
        var p = $('body').css('perspective-origin');
        var regex = /-?[0-9]\d*(\.?[0-9]\d*)?/g;
        let currentPerspectiveLeft = regex.exec(p)[0];
        let currentPerspectiveTop = regex.exec(p)[0];
        
        let distance = 380;
        
        console.log($('#tableContainer').css('perspective-origin'));
        if(direction === Direction.LEFT)
        {
            //left
            let left = parseInt(currentPerspectiveLeft) - parseInt(distance); //$('#master').offset().left - 50;
            $('body').css('perspective-origin', left +'px '+ currentPerspectiveTop +'px');
        }
        else if(direction === Direction.UP)
        {
            //top
            let top = parseInt(currentPerspectiveTop) - parseInt(distance);// -50;
            $('body').css('perspective-origin', currentPerspectiveLeft +'px '+ top +'px');
        }
        else if(direction === Direction.RIGHT)
        {
            //right
            let left = parseInt(currentPerspectiveLeft) + parseInt(distance); //$('#master').offset().left + $('#master').outerWidth() + 50;
            $('body').css('perspective-origin', left +'px '+ currentPerspectiveTop +'px');
        }
        else if(direction === Direction.DOWN)
        {
            //bottom
            let top = parseInt(currentPerspectiveTop) + parseInt(distance); //$('#master').outerHeight() + 50;
            let left = currentPerspectiveLeft //$('#master').offset().left + $('#master').outerWidth();
            $('body').css('perspective-origin', left +'px '+ top +'px');
        }
        this.Clicks++;
    }
}

window.onload = function ()
{
    slotsUnordered = $('table tr td');
    
    var col0 = []; 
    var col1 = [];
    var col2 = [];
    var col3 = [];
    slots = [col0, col1, col2, col3];
    for (var i = 0; i < slotsUnordered.length; i++)
    {
        slots[i % 4][slots[i%4].length] = slotsUnordered[i];
    }

    minDistance = $(slots[0]).outerHeight();
    
    //setup tables
    for(var i = 1; i < 6; i++)
    {
        let newTable = $('#master').clone(false);
        newTable.attr('id', '');
        newTable.css('display', 'block');
        newTable.css('height', '0px');
        newTable.css('left', document.documentElement.clientWidth/2 - $('#master').outerWidth()/2);
        newTable.css('opacity', '0');
        newTable.css('transform', 'translateZ(-' + i * 35 + 'px) translateY(-300px)')

        $('table:first-child').before( newTable );
        //$('#master').before( newTable );
    }
    
    window.TP = new TablePerspective();
    /*$('#master').click(function(){
        window.TP.ChangePerspective();
    });*/
    
    $('#btnUndo').click(btnUndoLastTurnClicked);
    $('#btnNewGame').one("click", reset);
    
    hiscore = parseInt(window.localStorage.getItem('hiscore'));
    if(!isNaN(hiscore))
        document.getElementById("hiscore").innerHTML = window.localStorage.getItem('hiscore');
    else
        hiscore = 0;
    
    //increase .scaleDiv height to fit #tutorial scaled to 1.8
    $('.scaleDiv').height($('.scaleDiv').height() * 1.8);
    
    //.overlay layout stuff
    $( window ).resize(resizeWithoutMargin);
    resizeWithoutMargin();
    
    animDurationGameOverIn = parseFloat(getComputedStyle($('#gameOver')[0])['transitionDuration']) + 's';
    animDelayGameOver = parseFloat(getComputedStyle($('#gameOver')[0])['transitionDelay']) + 's';
    
    $('#tutorial').css('top', $('.scaleDiv').height()/2 - $('#tutorial').height()/2);
    
    /////////////////////////////
    //displayed on new game started, one after another
    /////////////////////////////
    //remove frame on button click
    /////////////////////////////
    //reload page on client resize
    /////////////////////////////
    //previous state on other tables(every state -> new table)
    
    //keys input
    document.body.addEventListener("keydown", onKeyDown);

    //touch input
    //var hammertime = new Hammer(document.getElementsByTagName("table")[0]);
    //var hammertime = new Hammer($('table')[0]);
    // great on desktop, unusable on phone
    //var hammertime = new Hammer(document);
    var hammertime = new Hammer(document.getElementsByTagName("body")[0]);
    
    hammertime.get("swipe").set({ direction: Hammer.DIRECTION_ALL });
    
    hammertime.on("swipeleft swiperight swipeup swipedown", function (ev) {

        if (ev.type === "swipeleft")
        {
            moveAndMerge(Direction.LEFT);
            console.log("swipe left");
        }
        
        if (ev.type === "swiperight")
        {
            moveAndMerge(Direction.RIGHT);
            console.log("swipe right");
        }
       
        if (ev.type === "swipeup")
        {
            moveAndMerge(Direction.UP);
            console.log("swipe up");
        }
        
        if (ev.type === "swipedown")
        {
            moveAndMerge(Direction.DOWN);
            console.log("swipe down");
        }
    });
    
    //debug
    //localStorage.clear();
    
    if(localStorage.length === 0)
    {
        console.log("new game");
        setupFirstGame();
    }
    else
    {
        if(window.localStorage.getItem('debugSetup') == "true")
            initDebugingSetup();
        else
            load(false);
    }
    
    debugElements();
    updateScore();
}

function resizeWithoutMargin()
{   
    $('#gameOver').css('top', $('table').offset().top + $('table').height()/2 -                                     $('#gameOver').height()/2);
    $('#gameOver').css('left', parseFloat( $('table').css('margin-left')) + $('table').width()/2 -                 $('#gameOver').width() / 2)
    
    $('.scaleDiv').css('top', $('table').offset().top + $('table').height()/2 -                                     $('.scaleDiv').height()/2);
    $('.scaleDiv').css('left', parseFloat( $('table').css('margin-left')) + $('table').width()/2 -                 $('.scaleDiv').width() / 2)
}

function setupFirstGame()
{
    firstGame = true;
    
    $('table').css('transition-delay', '0s'); 
    $('table').css('transition-duration', '0s'); 
    $('table').toggleClass('blurred');
    
    $('#tutorial').css('transition-duration', '0s'); 
    $('#tutorial').toggleClass('visible');
}

function startFirstGame() 
{
    firstGame = false;

    $('table').css('transition-duration', animDurationGameOverOut);
    $('table').toggleClass('blurred');

    $('#tutorial').one('transitionend webkitTransitionEnd oTransitionEnd', animFirstGameFinished);

    $('#tutorial').css('transition-duration', animDurationGameOverOut);
    $('#tutorial').toggleClass('visible');
    $('#tutorial').toggleClass('big');
}

function animFirstGameFinished()
{
    console.log('done');
    initDefaultSetup();
    $('table').css('transition-duration', animDurationGameOverIn); 
    $(this).off('webkitTransitionEnd transitionend oTransitionEnd');
}

function initDefaultSetup()
{
    for (var i = 0; i < 2; i++) {
        addRandomPiece();
    }
    
    save(false);
}

function initDebugingSetup()
{
    createNewPiece(0, 0, 2);
    createNewPiece(2, 0, 4);
    //createNewPiece(0, 1, 8);
    //createNewPiece(3, 1, 2);
    //createNewPiece(3, 2, 2);
    //createNewPiece(1, 3, 2);
    //createNewPiece(2, 3, 4);
    //createNewPiece(3, 3, 8);
   
}

/*
    <- 37
    ^  38
    -> 39
    v  40
*/

function onKeyDown(e)
{
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) 
        e.preventDefault();
    
    console.log(String.fromCharCode(e.keyCode) + " --> " + e.keyCode);

    if(e.keyCode !== 37 && e.keyCode !== 38 && e.keyCode !== 39 &&
        e.keyCode !== 40 && e.keyCode !== 68 && e.keyCode !== 65 &&
        e.keyCode !== 87 && e.keyCode !== 83)
        return;

    if(e.keyCode === 39 || e.keyCode === 68)
    {
        moveAndMerge(Direction.RIGHT)
        window.TP.ChangePerspective(Direction.RIGHT);
    }
    
    if(e.keyCode === 37 || e.keyCode === 65)
    {
        moveAndMerge(Direction.LEFT)
        window.TP.ChangePerspective(Direction.LEFT);
    }
    
    if(e.keyCode === 38 || e.keyCode === 87)
    {
        moveAndMerge(Direction.UP)
        window.TP.ChangePerspective(Direction.UP);
    }
    
    if(e.keyCode === 40 || e.keyCode === 83)
    {
        moveAndMerge(Direction.DOWN)
        window.TP.ChangePerspective(Direction.DOWN);
    }
}

function moveAndMerge(direction)
{
    if(firstGame)
    {
        startFirstGame();
        return;
    }

    if(moving)return;
    //set by calculateMove and mergePieces
    hasMovedOrMerged = false;

    calculateMoves(direction);
}

function calculateMoves(direction)
{
    save(true);
    /*for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].X + " y: " + pieces[i].Y);
    }*/

    var pieceMoved = true;
    var tempPiece;
    
    if (direction === Direction.DOWN)
    {
        while (pieceMoved)
        {
            pieceMoved = false;
            
            for(var x = 0; x < 4; x++)
            {
                for(var y = 2; y >= 0; y--)
                {
                    var piece = getPieceByCoords(x,y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(x, y+1);
                    if(tempPiece === null ||
                       (piece.Value === tempPiece.Value && !slots[x][y+1].markedForMerge))
                    {
                        calculateMove(piece.X, piece.Y, piece.X, piece.Y + 1);
                        pieceMoved = true;
                        break;
                    }
                }
            }
        }
    }
    
    if (direction === Direction.UP)
    {
        while (pieceMoved)
        {
            pieceMoved = false;
            
            for(var x = 0; x < 4; x++)
            {
                for(var y = 1; y < 4; y++)
                {
                    var piece = getPieceByCoords(x,y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(x, y-1);
                    if(tempPiece === null ||
                       (piece.Value === tempPiece.Value && !slots[x][y-1].markedForMerge))
                    {
                        calculateMove(piece.X, piece.Y, piece.X, piece.Y - 1);
                        pieceMoved = true;
                        break;
                    }
                }
            }
        }
    }

    if (direction === Direction.LEFT)
    {
        while (pieceMoved)
        {
            pieceMoved = false;
            
            for(var x = 1; x < 4; x++)
            {
                for(var y = 0; y < 4; y++)
                {
                    var piece = getPieceByCoords(x,y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(x-1, y);
                    if(tempPiece === null ||
                       (piece.Value === tempPiece.Value  && !slots[x-1][y].markedForMerge))
                    {
                        calculateMove(piece.X, piece.Y, piece.X - 1, piece.Y);
                        pieceMoved = true;
                    }
                }
            }
        }
    }

    if (direction === Direction.RIGHT)
    {
        while (pieceMoved)
        {
            pieceMoved = false;
            
            for(var x = 2; x >= 0; x--)
            {
                for(var y = 0; y < 4; y++)
                {
                    var piece = getPieceByCoords(x,y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(x+1, y);
                    if(tempPiece === null ||
                       (piece.Value === tempPiece.Value && !slots[x+1][y].markedForMerge))
                    {
                        calculateMove(piece.X, piece.Y, piece.X + 1, piece.Y);
                        pieceMoved = true;
                    }
                }
            }
        }
    }
    applyMove();
}

function calculateMove(x1, y1, x2, y2)
{
    var piece = getPieceByCoords(x1, y1);
    //at this point its enough to check if theres a piece or not
    if(getPieceByCoords(x2,y2) !== null )
    {
        console.log("mark for merge " + x2 + "/" + y2);
        slots[x2][y2].markedForMerge = true;
        if(document.getElementById("chkBoxShowMerge").checked)
            slots[x2][y2].classList.toggle("markedForMerge");
    }
    
    //useful for debuging
    //slots[x2][y2].innerHTML = piece.Value;
    //slots[x1][y1].innerHTML = 0;

    piece.X = x2;
    piece.Y = y2;

    piece.TmpLeft += (x2 - x1) * minDistance;
    piece.TmpTop += (y2 - y1) * minDistance;
    
    piece.Moving = true;
    if( document.getElementById("chkBoxShowMoving").checked )
    {
        piece.Div.classList.add("moving");
    }
    moving = true;
    hasMovedOrMerged = true;

}

function applyMove()
{
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].TmpLeft != 0 || pieces[i].TmpTop != 0)
        {
            pieces[i].Div.style.transform = 'translate(' + pieces[i].TmpLeft + 'px,'  + pieces[i].TmpTop + 'px)';
        }
    }
    if(isAutoplay && !hasMovedOrMerged)
        autoplay();
}

function finishMove(event)
{
    piece = getPieceByDiv(event.target);
    
    if(piece == undefined)
    {
        console.log("Piece undefined " + event);
    }
    
    piece.Moving = false;
    if( $('#chkBoxShowMoving').prop('checked') )
    {
        piece.Div.classList.remove("moving");
    }
    
    prevX = piece.X - (piece.TmpLeft / minDistance);
    prevY = piece.Y - (piece.TmpTop / minDistance);
    
    piece.TmpLeft = 0;
    piece.TmpTop = 0;
    
    slots[prevX][prevY].removeChild(piece.Div);
    slots[piece.X][piece.Y].appendChild(piece.Div);
    
    piece.Div.style.transform = 'translate( 0px )';
    
    checkMerge(piece);
}

//executed when piece is done moving visualy
function checkMerge(piece) 
{
    console.log("checkMerge");
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].X === piece.X && pieces[i].Y === piece.Y &&
           pieces[i] !== piece && !piece.Moving && !pieces[i].Moving)
            {
                mergePieces(piece.X, piece.Y, piece.X, piece.Y);
                break;
            }
    }
    
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].Moving)
        {
            //console.log(pieces[i].X + " " + pieces[i].Y + " " + pieces[i].Value + " still moving");
            return;
        }
    }
    
    allPiecesDoneMoving();
}

//last call for current turn
function allPiecesDoneMoving()
{
    console.log("allPiecesDoneMoving");
    if (hasMovedOrMerged && pieces.length < 16 && $('#chkBoxAddRandom').prop('checked'))
        addRandomPiece();
    
    updateScore();
    
    save(false);
    
    if(isGameOver())
    {
        gameOver();
    }
    else if(isAutoplay)
    {
        autoplay();
    }
}

//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(x1, y1, x2, y2)
{
    console.log("MERGE");
    removePieceByCoords(x1, y1);
    
    try{
        getPieceByCoords(x2, y2).DoubleValue();
        slots[x2][y2].markedForMerge = false;
        var div = getPieceByCoords(x2, y2).Div; 
        div.classList.remove('newPieceAnim');
        div.classList.remove('animMerge');
        div.offsetWidth; // Holy Shit!
        div.classList.add('animMerge');
    
        if(document.getElementById("chkBoxShowMerge").checked)
            slots[x2][y2].classList.toggle("markedForMerge");
    }
    catch(err) {
        console.log("could not get piece at " + x2 + " " + y2);
        console.log("Pieces are:");
        for(var i = 0; i < pieces.length; i++)
        {
            console.log("Piece: " + i + " x: " + pieces[i].X + " y: " + pieces[i].Y);
        }
        console.log(err);
        return;
    }

    hasMovedOrMerged = true;
}

function removePieceByCoords(x, y)
{
    for (var i = 0; i < pieces.length; i++) 
    {
        if (pieces[i].X === x && pieces[i].Y === y) 
        {
            //document.getElementById('pieceContainer').removeChild(pieces[i].Div);
            
            slots[x][y].removeChild(pieces[i].Div);
            
            pieces[i].Div.removeEventListener("transitionend", finishMove);
            pieces.splice(i, 1);
            return;
        }
    }
}

function getPieceByCoords(x, y)
{
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].X === x && pieces[i].Y === y) {
            return pieces[i];
        }
    }
    
    return null;
}

function getPieceByDiv(div)
{
    for (var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].Div === div)
            return pieces[i];
    }
}

function updateScore()
{
    var score = 0;
    for(var i = 0; i < pieces.length; i++)
    {
        score += pieces[i].Value;
    }
    $('#score').text(score);
}

function addRandomPiece()
{
    do
    {
        var x = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        var y = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    } while (getPieceByCoords(x, y) != null);
    
   createNewPiece(x,y,2);
}

function isGameOver()
{
    if(pieces.length < 16)
        return false;
    
    var value;
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            value = getPieceByCoords(x,y).Value;
            
            //check left
            if(x > 0 && value == getPieceByCoords(x-1,y).Value)
                return false;
        
            //check right
            if(x < 3 && value == getPieceByCoords(x+1,y).Value)
                return false;
            
            //check up
            if(y > 0 && value == getPieceByCoords(x,y-1).Value)
                return false;
            
            //check down
            if(y < 3 && value == getPieceByCoords(x,y+1).Value)
                return false;
        }
    }
    
    return true;
}

function save(savePreviousState)
{
    var storage = window.localStorage;
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            storage.setItem(x.toString().concat(y.toString()) + savePreviousState, getValueByCoords(x,y));
        }
    }
}

function load(loadPreviousState)
{
    var storage = window.localStorage;
    var val = 0;
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            val = parseInt(storage.getItem(x.toString().concat(y.toString()).concat(loadPreviousState)));
            if(!isNaN(val) && val !== 0)
            {
                createNewPiece(x,y,val);
            }
        }
    }
    
    if(pieces.length == 0)
        initDefaultSetup();
}

function getValueByCoords(x,y)
{
    var piece = getPieceByCoords(x,y);
    return piece != null ? piece.Value : 0;
}

function createNewPiece(x,y,val)
{
    var newPiece = new Piece(x, y, val);
    pieces[pieces.length] = newPiece;
    slots[x][y].appendChild(newPiece.Div);

    var divWidth = $(pieces[pieces.length-1])[0].Div.offsetWidth;
    var text = $(pieces[pieces.length-1])[0].Div.children[0];
    var fontSize = 8;

    while (text.offsetWidth + 6 > divWidth)
    {
        $(text).css("font-size", [(fontSize -= 0.5) + "vmin"])
    }
}

function gameOver()
{
    console.log('gameOver');
    
    $('#btnPlayAgain').one("click", btnPlayAgainClicked);
    $('#btnNewGame').one("click", btnPlayAgainClicked);
    
    $('table').css('transition-duration',animDurationGameOverIn);
    $('table').css('transition-delay',animDelayGameOver);
    $('table').addClass('blurred');
    
    $('#gameOver').css('display','block');
    
    setTimeout( function(){
        $('#gameOver').css('transition-duration',animDurationGameOverIn);
        $('#gameOver').css('transition-delay',animDelayGameOver);
        $('#gameOver').removeClass('big');
        $('#gameOver').addClass('visible');
       },100);
    
    $('#scoreGameOver').text($('#score').text());
    
    if($('#score').text() >= window.localStorage.getItem('hiscore'))
    {
        $('#hiscore').text($('#score').text());
        window.localStorage.setItem('hiscore', $('#score').text() );
    }
    $('#btnUndoDebug').prop('disabled', true);
}

function btnPlayAgainClicked()
{ 
    $('table').css('transition-delay', '0s');
    $('table').css('transition-duration',animDurationGameOverOut);
    $('table').removeClass('blurred');
    
    $('#gameOver').css('transition-duration',animDurationGameOverOut);
    $('#gameOver').css('transition-delay','0s');
    $('#gameOver').addClass('big');
    $('#gameOver').removeClass('visible');
    
    setTimeout(function(){
        $('#gameOver').css('display','none');
    }, 1000);
    
    reset();
}

function reset()
{
    console.log("RESET");
    
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            removePieceByCoords(x,y);
        }
    }
    
    pieces = [];
    document.getElementById("score").innerHTML = 0;
    
    if(document.getElementById("chkBoxDebugSetup").checked)
        initDebugingSetup();
    else
        initDefaultSetup();
    
    $('#btnUndoDebug').prop('disabled', true);
    $('#btnNewGame').one("click", reset);
}

function btnUndoLastTurnClicked()
{
    $('table').css('transition-delay', '0s');
    $('table').css('transition-duration',animDurationGameOverOut);
    $('table').toggleClass('blurred');
    
    $('.overlay').css('transition-delay', '0s');
    $('.overlay').css('transition-duration',animDurationGameOverOut);
    $('.overlay').toggleClass('animGameOver');
    
    undoLastTurnDebug();
}

function undoLastTurnDebug()
{
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            removePieceByCoords(x,y);
        }
    }
    
    for(var i = 0; i < slotsUnordered.length; i++)
    {
        if(slotsUnordered[i].markedForMerge)
        {
            slotsUnordered[i].markedForMerge = false;
            if(document.getElementById("chkBoxShowMerge").checked)
                slotsUnordered[i].classList.toggle("markedForMerge");
        }
    }
    
    load(true);
}

function finishAnimation(e)
{   
    moving = false;
    e.target.classList.remove('newPieceAnim');
    e.target.classList.remove('animMerge');
    
    if(pieces.length > 2)
    {
        $('#btnUndoDebug').prop('disabled', false);
        $('#btnNewGame').prop('disabled', false);
    }
}

function setAutoplay(value)
{
    isAutoplay = value;
    if(isAutoplay) autoplay();
}

function autoplay()
{
    moveAndMerge(Math.floor(Math.random() * (3 - 0 + 1)) + 0);
}

function debugElements()
{
    $('#chkBoxDebugSetup').change(function()
    {
        window.localStorage.setItem('debugSetup', $('#chkBoxDebugSetup').is(':checked'));
        reset();
    });
    $('#chkBoxDebugSetup').prop('checked', window.localStorage.getItem('debugSetup') == "true");
    
    $('#chkBoxShowMerge').change(function()
    {
        window.localStorage.setItem('showMerge', $('#chkBoxShowMerge').is(':checked'));
    });
    $('#chkBoxShowMerge').prop('checked', window.localStorage.getItem('showMerge') == "true");
    
    if(window.localStorage.getItem('addRandom') == null)
        window.localStorage.setItem('addRandom', 'true');
        
    $('#chkBoxAddRandom').change(function()
    {
        window.localStorage.setItem('addRandom', $('#chkBoxAddRandom').is(':checked'));
    });
    $('#chkBoxAddRandom').prop('checked', window.localStorage.getItem('addRandom') == "true");
    
    $('#chkBoxShowMoving').change(function()
    {
        window.localStorage.setItem('showMoving', $('#chkBoxShowMoving').is(':checked'));
    });
    $('#chkBoxShowMoving').prop('checked', window.localStorage.getItem('showMoving') == "true");
    
    $('#chkBoxAutoplay').change(function()
    {
        setAutoplay($('#chkBoxAutoplay').is(':checked'))
    });
    
    
    
    $('#btnUndoDebug').click(undoLastTurnDebug);
    
    if(pieces.length < 3)
    {
        $('#btnUndoDebug').prop('disabled', true);
        $('#btnNewGame').prop('disabled', true);
    }
    $('#btnGameOver').click(gameOver);
    
    if(window.localStorage.getItem('hiscore') == null)
    {
        window.localStorage.setItem('hiscore', '0');
        $('#hiscore').text("0");
    }
}