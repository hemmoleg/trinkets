var slotsUnordered = [];
var slots = [];
var pieces = [];
var prevPieces;
var dragSrcElement = null;
var hasMovedOrMerged = false;
var hiscore = 0;
var moving = false;
var minDistance = 20.8;
var colorStart = 120;
var animGameOverDurationIn;
var animGameOverDurationOut = '1s';

Direction = {UP:"up", DOWN:"down", LEFT:"left", RIGHT:"right"}

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
        var color = hslToHex(mainValue, 100, 60);
        Div.style.backgroundColor = color;
        color = hslToHex(colorStart - ( i * 20), 100, 30);
        Div.style.borderColor = color;
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
    slotsUnordered = $('table tr div');

    var col0 = []; 
    var col1 = [];
    var col2 = [];
    var col3 = [];
    slots = [col0, col1, col2, col3];
    for (var i = 0; i < slotsUnordered.length; i++)
    {
        slots[i % 4][slots[i%4].length] = slotsUnordered[i];
    }

    $('#btnReset').click(reset);
    $('#btnPlayAgain').click(btnPlayAgainClicked);
    $('#btnUndo').click(undoLastTurn);

    hiscore = parseInt(window.localStorage.getItem('hiscore'));
    if(!isNaN(hiscore))
        document.getElementById("hiscore").innerHTML = window.localStorage.getItem('hiscore');
    else
        hiscore = 0;
    
    animGameOverDurationIn = parseFloat(getComputedStyle($('.gameOver')[0])['transitionDuration']) + 's';
    var gameOverScaleX = parseFloat($('.gameOver').css('transform').split(',')[3]);
    var topOffset = $('table').offset().top + $('table').height() / 2 - ($('.gameOver').height() * gameOverScaleX) / 2;
    $('.gameOver').offset({ top:topOffset, left:$('.gameOver').offset().left });
    //$('.gameOver').css('display','none');
    
    //make .gameOver take no space
    //1024 piece
    
    /////////////////////////////
    //add autopaly-mode
    /////////////////////////////
    
    $( 'table' ).click(gameOver);
    
    if(window.localStorage.getItem('debugSetup') == "true")
        initDebugingSetup();
    else
        load(false);
    
    //keys input
    document.body.addEventListener("keydown", onKeyDown);

    //touch input
    var hammertime = new Hammer(document.getElementsByTagName("table")[0]);
    
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
    
    debugElements();
    updateScore();
}

function initDefaultSetup()
{
    for (var i = 0; i < 2; i++) {
        addRandomPiece();
    }
}

function initDebugingSetup()
{
    createNewPiece(0, 0, 2);
    createNewPiece(1, 0, 4);
    createNewPiece(2, 0, 8);
    createNewPiece(3, 0, 2);
    createNewPiece(0, 1, 2);
    createNewPiece(1, 1, 8);
    createNewPiece(2, 1, 16);
    createNewPiece(3, 1, 4);
    createNewPiece(0, 2, 8);
    createNewPiece(1, 2, 16);
    createNewPiece(2, 2, 64);
    createNewPiece(3, 2, 16);
    createNewPiece(0, 3, 512);
    createNewPiece(1, 3, 64);
    createNewPiece(2, 3, 128);
    createNewPiece(3, 3, 256);
}

/*
    <- 37
    ^  38
    -> 39
    v  40
*/

function onKeyDown(e)
{
    console.log(String.fromCharCode(e.keyCode) + " --> " + e.keyCode);

    if (e.keyCode !== 37 && e.keyCode !== 38 && e.keyCode !== 39 &&
        e.keyCode !== 40)
        return;

    if (e.keyCode === 39)
        moveAndMerge(Direction.RIGHT)
    
    if (e.keyCode === 37)
        moveAndMerge(Direction.LEFT)
    
    if (e.keyCode === 38)
        moveAndMerge(Direction.UP)
    
    if (e.keyCode === 40)
        moveAndMerge(Direction.DOWN)
}

function moveAndMerge(direction)
{
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

    console.log("going to: " + x2 + " " + y2); 

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
        pieces[i].GetDiv().style.left = pieces[i].tmpLeft.toString() + 'vmin';
        pieces[i].GetDiv().style.top = pieces[i].tmpTop.toString() + 'vmin';
    }
}

function finishMove(e)
{
    piece = getPieceByDiv(e.target);
    
    piece.SetMoving(false);
    if( $('#chkBoxShowMoving').prop('checked') )
    {
        piece.GetDiv().classList.remove("moving");
    }
    
    prevX = piece.GetX() - (piece.tmpLeft / minDistance);
    prevY = piece.GetY() - (piece.tmpTop / minDistance);
    
    console.log("done moving, origin was: " + prevX + " " + prevY);
    
    piece.tmpLeft = 0;
    piece.tmpTop = 0;
    
    piece.GetDiv().style.left = '0px';
    piece.GetDiv().style.top = '0px';
    
    slots[prevX][prevY].removeChild(piece.GetDiv());
    slots[piece.GetX()][piece.GetY()].appendChild(piece.GetDiv());
    
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
    console.log(piece.GetX() + " " + piece.GetY() + " arrived -> check others moving");
   
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].IsMoving())
        {
            //console.log(pieces[i].GetX() + " " + pieces[i].GetY() + " " + pieces[i].GetValue() + " still moving");
            return;
        }
    }
    console.log("none moving");
    allPiecesDoneMoving();
}

//last call for current turn
function allPiecesDoneMoving()
{
    moving = false;
    
    if (hasMovedOrMerged && pieces.length < 16 && $('#chkBoxAddRandom').prop('checked'))
        addRandomPiece();
    
    updateScore();
    
    save(false);
    
    if(isGameOver())
    {
        gameOver();
    }
}

//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(x1, y1, x2, y2)
{
    console.log("MERGE");
    recalculateMoveByCoords(x1, y1);
    
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

function recalculateMoveByCoords(x, y)
{
    for (var i = 0; i < pieces.length; i++) 
    {
        if (pieces[i].GetX() === x && pieces[i].GetY() === y) 
        {
            //document.getElementById('pieceContainer').removeChild(pieces[i].GetDiv());
            
            slots[x][y].removeChild(pieces[i].GetDiv());
            
            pieces[i].GetDiv().removeEventListener("transitionend", checkMerge);
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
    
    if(score > hiscore)
    {
        $('#hiscore').text(score);
        window.localStorage.setItem('hiscore', score);
    }
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
            //storage.setItem(x.toString().concat(y.toString()), getValueByCoords(x,y));
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
}

function gameOver()
{
    $('table').css('transition-duration',animGameOverDurationIn);
    $('table').toggleClass('blurred');
    $('.gameOver').css('display','block');
    $('.gameOver').css('transition-duration',animGameOverDurationIn);
    $('.gameOver').toggleClass('animGameOver');
    $('#scoreGameOver').text($('#score').text());
}

function btnPlayAgainClicked()
{
    $('table').css('transition-duration',animGameOverDurationOut);
    $('table').toggleClass('blurred');
    $('.gameOver').css('transition-duration',animGameOverDurationOut);
    $('.gameOver').toggleClass('animGameOver');
    reset();
}

function reset()
{
    console.log("RESET");
    
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            recalculateMoveByCoords(x,y);
        }
    }
    
    pieces = [];
    document.getElementById("score").innerHTML = 0;
    
    if(document.getElementById("chkBoxDebugSetup").checked)
        initDebugingSetup();
    else
        initDefaultSetup();
}

function undoLastTurn()
{
    $('table').css('transition-duration',animGameOverDurationOut);
    $('table').toggleClass('blurred');
    $('.gameOver').css('transition-duration',animGameOverDurationOut);
    $('.gameOver').toggleClass('animGameOver');
    
    undoLastTurnDebug();
}

function undoLastTurnDebug()
{
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            recalculateMoveByCoords(x,y);
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
    e.target.classList.remove('newPieceAnim');
    e.target.classList.remove('animMerge');
}

function debugElements()
{
    document.getElementById("chkBoxDebugSetup").onchange = function()
    {
        if(document.getElementById("chkBoxDebugSetup").checked)
            window.localStorage.setItem('debugSetup', 'true');
        else
            window.localStorage.setItem('debugSetup', 'false');
        
        reset();
    }
    
    if(window.localStorage.getItem('debugSetup') == "true")
        document.getElementById("chkBoxDebugSetup").checked = true;
    else
        document.getElementById("chkBoxDebugSetup").checked = false;
    
    
    document.getElementById("chkBoxShowMerge").onchange = function()
    {
        if(document.getElementById("chkBoxShowMerge").checked)
            window.localStorage.setItem('showMerge', 'true');
        else
            window.localStorage.setItem('showMerge', 'false');
    }
    
    if(window.localStorage.getItem('showMerge') == "true")
        document.getElementById("chkBoxShowMerge").checked = true;
    else
        document.getElementById("chkBoxShowMerge").checked = false;
    
    
    document.getElementById("chkBoxAddRandom").onchange = function()
    {
        if(document.getElementById("chkBoxAddRandom").checked)
            window.localStorage.setItem('addRandom', 'true');
        else
            window.localStorage.setItem('addRandom', 'false');
    }
    
    if(window.localStorage.getItem('addRandom') == "true")
        document.getElementById("chkBoxAddRandom").checked = true;
    else
        document.getElementById("chkBoxAddRandom").checked = false;
    
    
    document.getElementById("chkBoxShowMoving").onchange = function()
    {
        if(document.getElementById("chkBoxShowMoving").checked)
            window.localStorage.setItem('showMoving', 'true');
        else
            window.localStorage.setItem('showMoving', 'false');
    }
    
    if(window.localStorage.getItem('showMoving') == "true")
        document.getElementById("chkBoxShowMoving").checked = true;
    else
        document.getElementById("chkBoxShowMoving").checked = false;
    
    $('#btnUndoDebug').click(undoLastTurnDebug);
}