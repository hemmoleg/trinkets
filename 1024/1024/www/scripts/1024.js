var slotsUnordered = [];
var slots = [];
var pieces = [];
var dragSrcElement = null;
var hasMovedOrMerged = false;
var debuging = false;


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
    
    Div = document.createElement('div');
    Div.innerHTML = "<b>" + initVal + "</b>";
    Div.classList.add('piece');
    Div.classList.add('newPieceAnim');
    Div.addEventListener("transitionend", checkMerge);
    this.x = x;
    this.y = y;
    Div.classList.add(cols[x]);
    Div.classList.add(rows[y]);
    slots[x][y].value = initVal;
    
    this.GetX = function () { return x; }
    this.SetX = function (val) { x = val; }

    this.GetY = function () { return y; }
    this.SetY = function (val) { y = val; }
    
    this.GetDiv = function () { return Div; }

    this.GetCanMerge = function () { return canMerge; }
    this.SetCanMerge = function (val) { canMerge = val; }
    
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
        slotsUnordered[i].value = 0;
    }

    document.getElementById("btnReset").onclick = reset;

    
    //initDefaultSetup();

    initDebugingSetup();
    
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
}

function initDefaultSetup()
{
    for (var i = 0; i < 2; i++) {
        addRandomPiece();
    }
}

function initDebugingSetup()
{
    var newPiece = new Piece(0, 0, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
    
    newPiece = new Piece(1, 0, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
    
    newPiece = new Piece(2, 0, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());

    newPiece = new Piece(3, 0, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
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
    //set by movePiece and mergePieces
    hasMovedOrMerged = false;

    movePieces(direction);
    
    if (hasMovedOrMerged && pieces.length < 16 && document.getElementById("chkBoxAddRandom").checked)
        addRandomPiece();
}

function movePieces(direction)
{
    /*for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
    }*/

    var pieceMoved = true;

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
                    
                    if(slots[x][y+1].value == 0 ||
                       (piece.GetValue() === slots[x][y+1].value && !slots[x][y+1].markedForMerge))
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
                    
                    if(slots[x][y-1].value == 0 ||
                       (piece.GetValue() === slots[x][y-1].value && !slots[x][y-1].markedForMerge))
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
                    
                    if(slots[x-1][y].value == 0 ||
                       (piece.GetValue() === slots[x-1][y].value  && !slots[x-1][y].markedForMerge))
                    {
                        movePiece(piece.GetX(), piece.GetY(), piece.GetX() - 1, piece.GetY());
                        pieceMoved = true;
                        break;
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
                    
                    if(slots[x+1][y].value == 0 ||
                       (piece.GetValue() === slots[x+1][y].value && !slots[x+1][y].markedForMerge))
                    {
                        movePiece(piece.GetX(), piece.GetY(), piece.GetX() + 1, piece.GetY());
                        pieceMoved = true;
                        break;
                    }
                }
            }
        }
    }
    
    for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
    }
}

//executed when piece is done moving visualy
function checkMerge(e) 
{
    piece = getPieceByDiv(e.target);
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].GetX() === piece.GetX() && pieces[i].GetY() === piece.GetY() &&
           pieces[i] !== piece)
            {
                mergePieces(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY());

                return;
            }
    }
}

function movePiece(x1, y1, x2, y2)
{
    var piece = getPieceByCoords(x1, y1);
    if(slots[x1][y1].value === slots[x2][y2].value)
    {
        console.log("dasfasdf");
        slots[x2][y2].value = slots[x2][y2].value * 2;
        slots[x2][y2].markedForMerge = true;
        if(document.getElementById("chkBoxShowMerge").checked)
            slots[x2][y2].classList.toggle("markedForMerge");
    }
    else
    {
        slots[x2][y2].value = piece.GetValue();
    }
    slots[x1][y1].value = 0;
    
    //useful for debuging
    slots[x2][y2].innerHTML = piece.GetValue();
    slots[x1][y1].innerHTML = 0;

    piece.SetX(x2);
    piece.SetY(y2);

    piece.GetDiv().classList.toggle(cols[x1]);
    piece.GetDiv().classList.toggle(rows[y1]);
    
    piece.GetDiv().classList.toggle(cols[x2]);
    piece.GetDiv().classList.toggle(rows[y2]);
    
    hasMovedOrMerged = true;

}

//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(x1, y1, x2, y2)
{
    removePieceByCoords(x1, y1);
    slots[x1][y1].value = 0;
    try{
        getPieceByCoords(x2, y2).DoubleValue();
        slots[x2][y2].value = getPieceByCoords(x2, y2).GetValue();
        slots[x2][y2].markedForMerge = false;
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
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].GetX() === x && pieces[i].GetY() === y) {
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
    var x;
    var y;
    
    if(div.classList.contains("col0")) x = 0;
    if(div.classList.contains("col1")) x = 1;
    if(div.classList.contains("col2")) x = 2;
    if(div.classList.contains("col3")) x = 3;
    
    if(div.classList.contains("row0")) y = 0;
    if(div.classList.contains("row1")) y = 1;
    if(div.classList.contains("row2")) y = 2;
    if(div.classList.contains("row3")) y = 3;
    
    return getPieceByCoords(x,y);
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

function reset()
{
    console.log("RESET");
    for (var i = 0; i < slotsUnordered.length; i++) {
        slotsUnordered[i].innerHTML = "";
    }
    pieces = [];
    initDefaultSetup();
}