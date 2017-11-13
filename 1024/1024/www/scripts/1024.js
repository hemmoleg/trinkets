var slotsUnordered = [];
var slots = [];
var pieces = [];
var prevPieces;
var dragSrcElement = null;
var hasMovedOrMerged = false;
var hiscore = 0;
var moving = false;


var cols = ["col0", "col1", "col2", "col3"];
var rows = ["row0", "row1", "row2", "row3"]

Direction = {UP:"up", DOWN:"down", LEFT:"left", RIGHT:"right"}

function Piece(x, y, initVal)
{
    var Div = "";
    var x;
    var y;
    var value = initVal;
    var canMerge = true;
    var moving;
    
    Div = document.createElement('div');
    Div.innerHTML = "<b>" + initVal + "</b>";
    Div.classList.add('piece');
    //Div.classList.add('newPieceAnim');
    Div.addEventListener("transitionend", checkMerge);
    
    Div.onclick = function(){
        Div.classList.remove('animMerge');
        Div.offsetWidth; // Holy Shit!
        Div.classList.add('animMerge');
    }
    
    this.x = x;
    this.y = y;
    Div.classList.add(cols[x]);
    Div.classList.add(rows[y]);
    
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
    }
}

window.onload = function ()
{
    slotsUnordered = document.querySelectorAll('.slot');

    //var row = [];
    var col0 = []; 
    var col1 = [];
    var col2 = [];
    var col3 = [];
    slots = [col0, col1, col2, col3];
    for (var i = 0; i < slotsUnordered.length; i++)
    {
        slots[i % 4][slots[i%4].length] = slotsUnordered[i];
    }

    document.getElementById("btnReset").onclick = reset;

    hiscore = parseInt(window.localStorage.getItem('hiscore'));
    if(!isNaN(hiscore))
        document.getElementById("hiscore").innerHTML = window.localStorage.getItem('hiscore');
    else
        hiscore = 0;
    
    //add autopaly-mode
    
    if(window.localStorage.getItem('debugSetup') == "true")
        initDebugingSetup();
    else
        load(false);
    
    //keys input
    document.body.addEventListener("keydown", onKeyDown);

    //touch input
    var hammertime = new Hammer(document.getElementById("table"));
    
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
}

function initDefaultSetup()
{
    for (var i = 0; i < 2; i++) {
        addRandomPiece();
    }
}

function initDebugingSetup()
{
    createNewPiece(0, 0, 8);
    createNewPiece(1, 0, 2);
    createNewPiece(2, 0, 8);
    createNewPiece(3, 0, 2);
    createNewPiece(0, 1, 8);
    createNewPiece(1, 1, 2);
    createNewPiece(2, 1, 8);
    createNewPiece(3, 1, 2);
    createNewPiece(0, 2, 8);
    createNewPiece(1, 2, 2);
    createNewPiece(2, 2, 8);
    createNewPiece(3, 2, 2);
    createNewPiece(0, 3, 8);
    createNewPiece(1, 3, 2);
    createNewPiece(2, 3, 8);
    createNewPiece(3, 3, 2);
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
    console.log(moving);
    if(moving)return;
    //set by movePiece and mergePieces
    hasMovedOrMerged = false;

    movePieces(direction);
}

function movePieces(direction)
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
                        movePiece(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() + 1);
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
                        movePiece(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() - 1);
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
                        movePiece(piece.GetX(), piece.GetY(), piece.GetX() - 1, piece.GetY());
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
                        movePiece(piece.GetX(), piece.GetY(), piece.GetX() + 1, piece.GetY());
                        pieceMoved = true;
                    }
                }
            }
        }
    }
}

function movePiece(x1, y1, x2, y2)
{
    var piece = getPieceByCoords(x1, y1);
    //at this point its enough to check if theres a piece or not
    if(getPieceByCoords(x2,y2) !== null )//&& piece.GetValue() === getPieceByCoords(x2,y2).GetValue())
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

    piece.GetDiv().classList.toggle(cols[x1]);
    piece.GetDiv().classList.toggle(rows[y1]);
    
    piece.GetDiv().classList.toggle(cols[x2]);
    piece.GetDiv().classList.toggle(rows[y2]);
    
    piece.SetMoving(true);
    if( document.getElementById("chkBoxShowMoving").checked )
    {
        piece.GetDiv().classList.add("moving");
    }
    moving = true;
    hasMovedOrMerged = true;

}

//executed when piece is done moving visualy
function checkMerge(e) 
{
    piece = getPieceByDiv(e.target);
    piece.SetMoving(false);
    if( document.getElementById("chkBoxShowMoving").checked )
    {
        piece.GetDiv().classList.remove("moving");
    }
    
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].GetX() === piece.GetX() && pieces[i].GetY() === piece.GetY() &&
           pieces[i] !== piece)
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

function allPiecesDoneMoving()
{
    moving = false;
    
    if (hasMovedOrMerged && pieces.length < 16 && document.getElementById("chkBoxAddRandom").checked)
        addRandomPiece();
    
    updateScore();
    
    save(false);
}


//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(x1, y1, x2, y2)
{
    removePieceByCoords(x1, y1);
    
    try{
        getPieceByCoords(x2, y2).DoubleValue();
        slots[x2][y2].markedForMerge = false;
        //getPieceByCoords(x2, y2).GetDiv().classList.toggle('animMerge');
        // getPieceByCoords(x2, y2).GetDiv().classList.toggle('newPieceAnim');
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
            document.getElementById('pieceContainer').removeChild(pieces[i].GetDiv());
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
    document.getElementById("score").innerHTML = score;
    
    if(score > hiscore)
    {
        document.getElementById("hiscore").innerHTML = score;
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
    
    var newPiece = new Piece(x, y, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
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
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
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
}

function undo()
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
    
    document.getElementById("btnUndo").onclick = undo;

}