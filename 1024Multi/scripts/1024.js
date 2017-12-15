var tables = [];
var slotsUnordered = [];
var slots = [];
var pieces = [];
var prevPieces;
var dragSrcElement = null;
var hasMovedOrMerged = false;
var hiscore = 0;
var moving = false;
var minDistance  ;
var colorStart = 120;
var animDurationGameOverIn;
var animDurationGameOverOut = '1s';
var animDelayGameOver;
var firstGame = false;
var isAutoplay = false;
var randomPieceCount = 0;
var mergingPieceCount = 0;

Direction = {UP:'up', DOWN:'down', LEFT:'left', RIGHT:'right'}

function Piece(tableID, x, y, initVal)
{
    var Div = "";
    var tableID;
    var x;
    var y;
    var value = initVal;
    var canMerge = true;
    var moving;
    var tmpLeft;
    var tmpTop;
    
    Div = document.createElement('div');
    //Div.innerHTML = "<b>" + initVal + "</b>";
    Div.classList.add('piece');
    Div.classList.add('newPieceAnim');
    Div.addEventListener("transitionend", finishMove);
    Div.addEventListener("animationend", finishedNewPieceAnim);
    
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
        var color = "hsla("+mainValue+", 100%, 60%, 0.6)";
        Div.style.backgroundColor = color;
        color = hslToRgba(mainValue, 100, 30, 1);
        Div.style.borderColor = color;
        Div.style.boxShadow = " 0px 0px 15px " + color;
    }
    this.tableID = tableID;
    
    this.x = x;
    this.y = y;
    
    this.tmpLeft = 0;
    this.tmpTop = 0;
    
    this.GetTableID = function() {return tableID;}
    
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
        //Div.innerHTML = "<b>" + value + "</b>";
        this.SetColor(value);
    }

    //initialy set color
    this.SetColor(initVal);
}

window.onload = function ()
{
    for(var i = 1; i <= $('.row').length; i++)
    {
        //console.log("i " + i);
        for(var j = 1; j <= $('div:nth-child('+i+') table').length; j++)
        {
            //console.log("table " + i + j);
            slotsUnordered = $('div:nth-child('+i+') table:nth-child('+j+') tr div');  
     
            var col0 = []; 
            var col1 = [];
            var col2 = [];
            var col3 = [];
            slots = [col0, col1, col2, col3];
            for (var k = 0; k < slotsUnordered.length; k++)
            {
                slots[k % 4][slots[k%4].length] = slotsUnordered[k];
            }
            tables[tables.length] = slots;
            pieces[pieces.length] = [];
        }
    }
    
    //increase .scaleDiv height to fit #tutorial scaled to 1.8
    $('.scaleDiv').height($('.scaleDiv').height() * 1.8);
    
    //.overlay layout stuff
    $( window ).resize(resizeWithoutMargin);
    resizeWithoutMargin();
    
    //animDurationGameOverIn = parseFloat(getComputedStyle($('#gameOver')[0])['transitionDuration']) + 's';
    //animDelayGameOver = parseFloat(getComputedStyle($('#gameOver')[0])['transitionDelay']) + 's';
    
    /////////////////////////////
    //use CDN to get jQuery and hammer.js
    /////////////////////////////
    //proper reset animation
    /////////////////////////////
    //table 11 starts late
    /////////////////////////////
    //remove numbers on autoplay
    /////////////////////////////
    //on window resize -> start all over
    
    //keys input
    document.body.addEventListener("keydown", onKeyDown);

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
    
    initDebugingSetup(0);
    for(var i = 1; i < 11; i++)
    {
        initDefaultSetup(i);
    }
    
    //updateScore();
}

//currently not used
function resizeWithMargin()
{   
    $('#gameOver').css('top', $('table').offset().top + parseFloat( $('table').css('margin-top')) +                 $('table').height()/2 - $('#gameOver').height()/2);
    $('#gameOver').css('left', parseFloat( $('table').css('margin-left')) + $('table').width()/2 -                 $('#gameOver').width() / 2)
}

function resizeWithoutMargin()
{   
    //minimum travel distance = slot height - slot margin 
    minDistance = $(tables[11][1][0]).outerHeight() - Math.abs(parseInt($(tables[7][1]
                  [0]).css('margin-right')));
    
    //$('.row').css('top', -$(tables[11][1][0]).outerHeight()*2);
    //$('.row').css('left', -$(tables[11][1][0]).outerHeight()*2);
    
    $('#gameOver').css('top', $('table').offset().top + $('table').height()/2 -                                     $('#gameOver').height()/2);
    $('#gameOver').css('left', parseFloat( $('table').css('margin-left')) + $('table').width()/2 -                 $('#gameOver').width() / 2)
    
    $('.scaleDiv').css('top', $('table').offset().top + $('table').height()/2 -                                     $('.scaleDiv').height()/2);
    $('.scaleDiv').css('left', parseFloat( $('table').css('margin-left')) + $('table').width()/2 -                 $('.scaleDiv').width() / 2)
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

function initDefaultSetup(tableID)
{
    for (var i = 0; i < 2; i++) {
        addRandomPiece(tableID);
    }
    
    //save(false);
}

function initDebugingSetup(tableID)
{
    createNewPiece(tableID, 0, 0, 4);
    createNewPiece(tableID, 1, 0, 4);
    createNewPiece(tableID, 2, 0, 4);
    createNewPiece(tableID, 3, 0, 4);
    createNewPiece(tableID, 0, 1, 4);
    createNewPiece(tableID, 1, 1, 8);
    createNewPiece(tableID, 2, 1, 16);
    createNewPiece(tableID, 3, 1, 8);
    createNewPiece(tableID, 0, 2, 8);
    createNewPiece(tableID, 1, 2, 16);
    createNewPiece(tableID, 2, 2, 64);
    createNewPiece(tableID, 3, 2, 16);
    createNewPiece(tableID, 0, 3, 512);
    createNewPiece(tableID, 1, 3, 1024);
    createNewPiece(tableID, 2, 3, 128);
    createNewPiece(tableID, 3, 3, 256);
    
    //mergingPieceCount = 16;
    randomPieceCount = 16;
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
        e.keyCode !== 40 && e.keyCode !== 68 && e.keyCode !== 65 &&
        e.keyCode !== 87 && e.keyCode !== 83)
        return;

    if (e.keyCode === 39  || e.keyCode === 68)
        moveAndMerge(Direction.RIGHT)
    
    if (e.keyCode === 37  || e.keyCode === 65)
        moveAndMerge(Direction.LEFT)
    
    if (e.keyCode === 38 || e.keyCode === 87)
        moveAndMerge(Direction.UP)
    
    if (e.keyCode === 40   || e.keyCode === 83)
        moveAndMerge(Direction.DOWN)
}

function moveAndMerge(direction)
{
    if (firstGame)
    {
        startFirstGame();
        return;
    }

    if(moving)return;
    //set by calculateMove and mergePieces
    hasMovedOrMerged = false;

    console.log("%c Move " + direction, 'background: #222; color: #bada55');
    for(var i = 0; i < tables.length; i++)
    {
        calculateMoves(i, direction);
    }
    //calculateMoves(tableID, direction);
}

function calculateMoves(tableID, direction)
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
                    var piece = getPieceByCoords(tableID, x, y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(tableID, x, y+1);
                    if(tempPiece === null ||
                       (piece.GetValue() === tempPiece.GetValue() && !tables[tableID][x][y+1].markedForMerge))
                    {
                        calculateMove(tableID, piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() + 1);
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
                    var piece = getPieceByCoords(tableID, x,y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(tableID, x, y-1);
                    if(tempPiece === null ||
                       (piece.GetValue() === tempPiece.GetValue() && !tables[tableID][x][y-1].markedForMerge))
                    {
                        calculateMove(tableID, piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() - 1);
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
                    var piece = getPieceByCoords(tableID, x, y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(tableID, x-1, y);
                    if(tempPiece === null ||
                       (piece.GetValue() === tempPiece.GetValue()  && !tables[tableID][x-1][y].markedForMerge))
                    {
                        calculateMove(tableID, piece.GetX(), piece.GetY(), piece.GetX() - 1, piece.GetY());
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
                    var piece = getPieceByCoords(tableID, x, y);
                    if(piece == null) continue;
                    
                    tempPiece = getPieceByCoords(tableID, x+1, y);
                    if(tempPiece === null ||
                       (piece.GetValue() === tempPiece.GetValue() && !tables[tableID][x+1][y].markedForMerge))
                    {
                        calculateMove(tableID, piece.GetX(), piece.GetY(), piece.GetX() + 1, piece.GetY());
                        pieceMoved = true;
                    }
                }
            }
        }
    }
    applyMove(tableID);
}

function calculateMove(tableID, x1, y1, x2, y2)
{
    var piece = getPieceByCoords(tableID, x1, y1);
    //at this point its enough to check if theres a piece or not
    if(getPieceByCoords(tableID, x2,y2) !== null )
    {
        //console.log("mark for merge " + x2 + "/" + y2);
        tables[tableID][x2][y2].markedForMerge = true;
    }
    
    //useful for debuging
    //slots[x2][y2].innerHTML = piece.GetValue();
    //slots[x1][y1].innerHTML = 0;

    piece.SetX(x2);
    piece.SetY(y2);

    //console.log("going to: " + x2 + " " + y2); 

    piece.tmpLeft += (x2 - x1) * minDistance;
    piece.tmpTop += (y2 - y1) * minDistance;
    
    piece.SetMoving(true);
   
    moving = true;
    hasMovedOrMerged = true;

}

function applyMove(tableID)
{
    for(var i = 0; i < pieces[tableID].length; i++)
    {
        pieces[tableID][i].GetDiv().style.left = pieces[tableID][i].tmpLeft.toString() + 'px';
        pieces[tableID][i].GetDiv().style.top = pieces[tableID][i].tmpTop.toString() + 'px';
    }
    if(isAutoplay && !hasMovedOrMerged)
        autoplay();
}

function finishMove(e)
{
    piece = getPieceByDiv(e.target);
    
    piece.SetMoving(false);
    
    prevX = piece.GetX() - Math.round(piece.tmpLeft / minDistance);
    prevY = piece.GetY() - Math.round(piece.tmpTop / minDistance);
    
    //console.log("tempLeft " + piece.tmpLeft + " tempTop " + piece.tmpTop); 
    //console.log("done moving, origin was: " + piece.GetTableID() + " " + prevX + " " + prevY);
    
    piece.tmpLeft = 0;
    piece.tmpTop = 0;
    
    piece.GetDiv().style.left = '0px';
    piece.GetDiv().style.top = '0px';
    
    tables[piece.GetTableID()][prevX][prevY].removeChild(piece.GetDiv());
    tables[piece.GetTableID()][piece.GetX()][piece.GetY()].appendChild(piece.GetDiv());
    
    checkMerge(piece);
}

//executed when piece is done moving visualy
function checkMerge(piece) 
{
    //console.log("checkMerge");
    var tableID = piece.GetTableID();
    
    for(var i = 0; i < pieces[tableID].length; i++)
    {
        if(pieces[tableID][i].GetX() === piece.GetX() && pieces[tableID][i].GetY() === piece.GetY() &&
           pieces[tableID][i] !== piece && !piece.IsMoving() && !pieces[tableID][i].IsMoving())
            {
                mergePieces(piece.GetTableID(), piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY());
                break;
            }
    }
    //console.log(piece.GetX() + " " + piece.GetY() + " arrived -> check others moving");
   
    for(var i = 0; i < pieces.length; i++)
    {
        for(var j = 0; j < pieces[i].length; j++)
        {
            if(pieces[i][j].IsMoving())
            {
                return;
            }
        }
    }
    //console.log("none moving");
    allPiecesDoneMoving();
}

//last call for current turn
function allPiecesDoneMoving()
{
    moving = false;
    if(randomPieceCount == 0)
        autoplay();
}

//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(tableID, x1, y1, x2, y2)
{
    //console.log("MERGE");
    deletePiece(tableID, x1, y1);
    
    try{
        getPieceByCoords(tableID, x2, y2).DoubleValue();
        tables[tableID][x2][y2].markedForMerge = false;
        var div = getPieceByCoords(tableID, x2, y2).GetDiv(); 
        div.classList.remove('newPieceAnim');
        div.classList.remove('animMerge');
        div.offsetWidth; // Holy Shit!
        div.classList.add('animMerge');
        randomPieceCount++;
    }
    catch(err) {
        console.log("could not get piece at " + tableID + " " + x2 + " " + y2);
        console.log("Pieces are:");
        for(var i = 0; i < pieces[tableID].length; i++)
        {
            console.log("Piece: " + i + " x: " + pieces[tableID][i].GetX() + " y: " + pieces[tableID][i].GetY());
        }
        console.log(err);
        return;
    }

    hasMovedOrMerged = true;
}

function addRandomPiece(tableID)
{
    console.log("addrandompiece" + tableID);
    do
    {
        var x = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        var y = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    } while (getPieceByCoords(tableID, x, y) != null);
    
    createNewPiece(tableID, x, y, 2);
    
    randomPieceCount++;
}

function finishedNewPieceAnim(e)
{
    e.target.classList.remove('newPieceAnim');
    e.target.classList.remove('animMerge');

    //if(getPieceByDiv(e.target).GetValue() == 2)
    //{
        randomPieceCount--;
    //}
    /*else
    {
        mergingPieceCount--;
    }*/
    console.log("randomPieceCount " + randomPieceCount + " mergingPieceCount " + mergingPieceCount);
    
    //seperate function for this
    var reset = false;
    if(mergingPieceCount == 0 && randomPieceCount == 0)
    {
        for(var i = 0; i < tables.length; i++)
        {
            //if(isGameOver(i))
            if(pieces[i].length == 16)
            {
                resetTable(i);
                reset = true;
            }
        }
        //wait till all reset animations are done
        if(reset) return;
    
        for(var i = 0; i < tables.length; i++)
        {
    
            if(hasMovedOrMerged)
            {    
                addRandomPiece(i);
            }
            else{
                autoplay();
                return;
            }
        }
        hasMovedOrMerged = false;
    }
}

function autoplay()
{
    var rand = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    switch(rand)
    {
        case 0: moveAndMerge(Direction.UP);
                break;
        case 1: moveAndMerge(Direction.DOWN);
                break;
        case 2: moveAndMerge(Direction.LEFT);
                break;
        case 3: moveAndMerge(Direction.RIGHT);
                break;
    }
}

function resetTable(tableID)
{
    console.log("RESET");
    
    for(var i = 0; i < pieces[tableID].length; i++)
    {
        pieces[tableID][i].GetDiv().removeEventListener("animationend", finishedNewPieceAnim);
        pieces[tableID][i].GetDiv().addEventListener("animationend", finishedAnimDelete);
        pieces[tableID][i].GetDiv().classList.toggle("animDelete");
    }
}

function deletePiece(tableID, x, y)
{
    for (var i = 0; i < pieces[tableID].length; i++) 
    {
        if (pieces[tableID][i].GetX() === x && pieces[tableID][i].GetY() === y) 
        {
            try{
                tables[tableID][x][y].removeChild(pieces[tableID][i].GetDiv());
            }
            catch(err)
            {
                console.log("%c Could not DELETE child tabledID:" + tableID + " x:" + x + " y:" + y, "background: #f33; color: #aaa");
                //find div
                for(var a = 0; a < tables.length; a++)
                {
                    for(var b = 0; b < tables[a].length; b++)
                    {
                        for(var c = 0; c < tables[a][b].length; c++)
                        {
                            //console.log("testing " + a + b + c);
                            if($(tables[a][b][c]) == $(pieces[tableID][i].GetDiv()).parent())
                            {
                                console.log("Fount parent at " + a + " " + b + " " + c);
                            }
                        }
                    }    
                }
            }
            pieces[tableID][i].GetDiv().removeEventListener("transitionend", checkMerge);
            pieces[tableID].splice(i, 1);
            return;
        }
    }
}

function finishedAnimDelete(e)
{
    var piece = getPieceByDiv(e.target);
    
    deletePiece(piece.GetTableID(), piece.GetX(), piece.GetY());

    if(pieces[piece.GetTableID()].length === 0)
        initDefaultSetup(piece.GetTableID());
}

function getPieceByCoords(tableID, x, y)
{
    for (var i = 0; i < pieces[tableID].length; i++) {
        if (pieces[tableID][i].GetX() === x && pieces[tableID][i].GetY() === y) {
            return pieces[tableID][i];
        }
    }
    
    return null;
}

function getPieceByDiv(div)
{
    for(var i = 0; i < pieces.length; i++)
    {
        for (var j = 0; j < pieces[i].length; j++)
        {
            if(pieces[i][j].GetDiv() === div)
                return pieces[i][j];
        }
    }
}

function getValueByCoords(x,y)
{
    var piece = getPieceByCoords(x,y);
    return piece != null ? piece.GetValue() : 0;
}

function checkAllTablesForGameOver()
{
    var gameOver = false;
    for(var i = 0; i < tables.length; i++)
    {
        if(pieces[i].length >= 16)
        {
            reset(i);
            gameOver = true;
            continue;
        }
    }
    return gameOver;
}

function createNewPiece(tableID, x,y,val)
{
    var newPiece = new Piece(tableID, x, y, val);
    pieces[tableID][pieces[tableID].length] = newPiece;
    tables[tableID][x][y].appendChild(newPiece.GetDiv());
    
    var divWidth = $(pieces[tableID][pieces[tableID].length-1])[0].GetDiv().offsetWidth;
    var text = $(pieces[tableID][pieces[tableID].length-1])[0].GetDiv().children[0];
    var fontSize = 8;

    //fit text in slot
    /*while (text.offsetWidth + 6 > divWidth)
    {
        $(text).css("font-size", [(fontSize -= 0.5) + "vmin"])
        //console.log(text.offsetWidth, divWidth);
    }*/
}

function isGameOver(tableID)
{
    if(pieces[tableID].length < 16)
        return false;
    
    var value;
    for(var x = 0; x < 4; x++)
    {
        for(var y = 0; y < 4; y++)
        {
            value = getPieceByCoords(tableID, x, y).GetValue();
            
            //check left
            if(x > 0 && value == getPieceByCoords(tableID, x-1, y).GetValue())
                return false;
        
            //check right
            if(x < 3 && value == getPieceByCoords(tableID, x+1, y).GetValue())
                return false;
            
            //check up
            if(y > 0 && value == getPieceByCoords(tableID, x, y-1).GetValue())
                return false;
            
            //check down
            if(y < 3 && value == getPieceByCoords(tableID, x, y+1).GetValue())
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

function btnPlayAgainClicked()
{
    $('table').css('transition-delay', '0s');
    $('table').css('transition-duration',animDurationGameOverOut);
    $('table').toggleClass('blurred');
    
    $('#gameOver').css('transition-duration',animDurationGameOverOut);
    $('#gameOver').css('transition-delay','0s');
    $('#gameOver').toggleClass('big');
    $('#gameOver').toggleClass('visible');
    
    reset();
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
            deletePiece(x,y);
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

function setAutoplay(value)
{
    isAutoplay = value;
    if(isAutoplay) autoplay();
}