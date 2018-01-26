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

function Piece(x, y, initVal)
{
    var Div = "";
    var x;
    var y;
    var value = initVal;
    var canMerge = true;
    var moving;
    var tmpLeft;
    var tmpTop;
    
    Div = document.createElement('div');
    Div.innerHTML = "<b>" + initVal + "</b>";
    Div.classList.add('piece');
    Div.classList.add('newPieceAnim');
    Div.addEventListener("transitionend", finishMove);
    Div.addEventListener("animationend", finishAnimation);
    
    /*Div.onclick = function(e)
    {
        var html = window.getComputedStyle(e.target, null).getPropertyValue("background-color");
        var hex = retardHtmlToHex(html)
        var hsl = hexToHSL(hex)
        //console.log("hex: " + hex );
        console.log("hsl: " + hsl );
        //console.log("hex: " + hslToHex(hsl[0], hsl[1], hsl[2]) )
        e.target.style.backgroundColor = hslToHex(hsl[0] - 10, hsl[1], hsl[2]);
    }*/

    this.SetColor = function(val)
    {
        var i = 0;
        while(val != 2)
        {
            val = val/2;
            i++;
        }

        //way too complex formula for calculating color
        var mainValue = (360/(2*Math.PI)) * (((2*Math.PI)/360)*colorStart - (i * 0.3));
        var color = "hsla("+mainValue+", 100%, 60%, .6)";
        Div.style.backgroundColor = color;
        color = hslToRgba(mainValue, 100, 30, 1);
        Div.style.borderColor = color;
        Div.style.boxShadow = " 0px 0px 15px " + color;
    }
    
    this.x = x;
    this.y = y;
    
    this.tmpLeft = 0;
    this.tmpTop = 0;
    
    this.GetX = function () { return x; }
    this.SetX = function (val) { x = val; }

    this.GetY = function () { return y; }
    this.SetY = function (val) { y = val; }
    
    this.GetDiv = function () { return Div; }

    this.GetCanMerge = function () { return canMerge; }
    this.SetCanMerge = function (val) { canMerge = val; }
    
    this.IsMoving = function () { return moving; }
    this.SetMoving = function (val) { moving = val; }
    
    this.GetValue = function () { return value; }
    this.SetValue = function (val) { value = val; }
    this.DoubleValue = function ()
    {
        value = parseInt(value) + parseInt(value);
        Div.innerHTML = "<b>" + value + "</b>";
        this.SetColor(value);
    }

    //initialy set color
    this.SetColor(initVal);
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
    
    let newTable = $('table').clone(false);
    $(newTable).css('display', 'block');
    $(newTable).css('height', '0px');
    $(newTable).css('left', document.documentElement.clientWidth/2 - $(newTable).outerWidth/2);
    
    
    $('#tableContainer').append( newTable );
    
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
    
    ////////////////////////////
    //properly position new tables
    /////////////////////////////
    //test several tables behind each other (increase transparency, paralaxe)
    //displayed on new game started, one after another
    /////////////////////////////
    //remove frame on button click
    /////////////////////////////
    //reload page on client resize
    
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
        moveAndMerge(Direction.RIGHT)
    
    if(e.keyCode === 37 || e.keyCode === 65)
        moveAndMerge(Direction.LEFT)
    
    if(e.keyCode === 38 || e.keyCode === 87)
        moveAndMerge(Direction.UP)
    
    if(e.keyCode === 40 || e.keyCode === 83)
        moveAndMerge(Direction.DOWN)
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
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
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
                       (piece.GetValue() === tempPiece.GetValue() && !slots[x][y+1].markedForMerge))
                    {
                        calculateMove(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() + 1);
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
                       (piece.GetValue() === tempPiece.GetValue() && !slots[x][y-1].markedForMerge))
                    {
                        calculateMove(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() - 1);
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
                       (piece.GetValue() === tempPiece.GetValue()  && !slots[x-1][y].markedForMerge))
                    {
                        calculateMove(piece.GetX(), piece.GetY(), piece.GetX() - 1, piece.GetY());
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
                       (piece.GetValue() === tempPiece.GetValue() && !slots[x+1][y].markedForMerge))
                    {
                        calculateMove(piece.GetX(), piece.GetY(), piece.GetX() + 1, piece.GetY());
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
    //slots[x2][y2].innerHTML = piece.GetValue();
    //slots[x1][y1].innerHTML = 0;

    piece.SetX(x2);
    piece.SetY(y2);

    piece.tmpLeft += (x2 - x1) * minDistance;
    piece.tmpTop += (y2 - y1) * minDistance;
    
    piece.SetMoving(true);
    if( document.getElementById("chkBoxShowMoving").checked )
    {
        piece.GetDiv().classList.add("moving");
    }
    moving = true;
    hasMovedOrMerged = true;

}

function applyMove()
{
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].tmpLeft != 0 || pieces[i].tmpTop != 0)
        {
            pieces[i].GetDiv().style.transform = 'translate(' + pieces[i].tmpLeft + 'px,'  + pieces[i].tmpTop + 'px)';
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
    
    piece.SetMoving(false);
    if( $('#chkBoxShowMoving').prop('checked') )
    {
        piece.GetDiv().classList.remove("moving");
    }
    
    prevX = piece.GetX() - (piece.tmpLeft / minDistance);
    prevY = piece.GetY() - (piece.tmpTop / minDistance);
    
    piece.tmpLeft = 0;
    piece.tmpTop = 0;
    
    slots[prevX][prevY].removeChild(piece.GetDiv());
    slots[piece.GetX()][piece.GetY()].appendChild(piece.GetDiv());
    
    piece.GetDiv().style.transform = 'translate( 0px )';
    
    checkMerge(piece);
}

//executed when piece is done moving visualy
function checkMerge(piece) 
{
    console.log("checkMerge");
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].GetX() === piece.GetX() && pieces[i].GetY() === piece.GetY() &&
           pieces[i] !== piece && !piece.IsMoving() && !pieces[i].IsMoving())
            {
                mergePieces(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY());
                break;
            }
    }
    
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].IsMoving())
        {
            //console.log(pieces[i].GetX() + " " + pieces[i].GetY() + " " + pieces[i].GetValue() + " still moving");
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
        var div = getPieceByCoords(x2, y2).GetDiv(); 
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
            console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
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
        if (pieces[i].GetX() === x && pieces[i].GetY() === y) 
        {
            //document.getElementById('pieceContainer').removeChild(pieces[i].GetDiv());
            
            slots[x][y].removeChild(pieces[i].GetDiv());
            
            pieces[i].GetDiv().removeEventListener("transitionend", finishMove);
            pieces.splice(i, 1);
            return;
        }
    }
}

function getPieceByCoords(x, y)
{
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].GetX() === x && pieces[i].GetY() === y) {
            return pieces[i];
        }
    }
    
    return null;
}

function getPieceByDiv(div)
{
    for (var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].GetDiv() === div)
            return pieces[i];
    }
}

function updateScore()
{
    var score = 0;
    for(var i = 0; i < pieces.length; i++)
    {
        score += pieces[i].GetValue();
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
            value = getPieceByCoords(x,y).GetValue();
            
            //check left
            if(x > 0 && value == getPieceByCoords(x-1,y).GetValue())
                return false;
        
            //check right
            if(x < 3 && value == getPieceByCoords(x+1,y).GetValue())
                return false;
            
            //check up
            if(y > 0 && value == getPieceByCoords(x,y-1).GetValue())
                return false;
            
            //check down
            if(y < 3 && value == getPieceByCoords(x,y+1).GetValue())
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
    return piece != null ? piece.GetValue() : 0;
}

function createNewPiece(x,y,val)
{
    var newPiece = new Piece(x, y, val);
    pieces[pieces.length] = newPiece;
    slots[x][y].appendChild(newPiece.GetDiv());

    var divWidth = $(pieces[pieces.length-1])[0].GetDiv().offsetWidth;
    var text = $(pieces[pieces.length-1])[0].GetDiv().children[0];
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