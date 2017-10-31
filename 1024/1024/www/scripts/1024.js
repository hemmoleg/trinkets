var slotsUnordered = [];
var slots = [];
var pieces = [];
var dragSrcElement = null;
var hasMovedOrMerged = false;

Direction = {UP:"up", DOWN:"down", LEFT:"left", RIGHT:"right"}

function Piece(initVal)
{
    var Div = "";
    var x;
    var y;
    var value = initVal;

    this.GetX = function () { return x; }
    this.SetX = function (val) { x = val; }

    this.GetY = function () { return y; }
    this.SetY = function (val) { y = val; }

    this.GetDivInit = function () { Div = "<div class='piece newPieceAnim'><b>" + initVal + "</b></div>";
                                return Div;}
    this.GetDiv = function () { return Div; }

    this.GetValue = function () { return value; }
    this.SetValue = function (val) { value = val; }
    this.SquareValue = function ()
    {
        value = parseInt(value) + parseInt(value);
        Div = "<div class='piece'><b>" + value + "</b></div>";
    }
}

window.onload = function ()
{
    slotsUnordered = document.querySelectorAll('.slot');

    var row = [];
    for (var i = 0; i < slotsUnordered.length; i++)
    {
        row[i % 4] = slotsUnordered[i];
        slotsUnordered[i].innerHTML = "";

        //slotsUnordered[i].addEventListener("click", debugAddPiece); 
        
        if (i % 4 === 3 && i !== 0)
        {
            slots[slots.length] = row;
            row = [];
        }
    }

    document.getElementById("btnReset").onclick = reset;

    initDefaultSetup();

    //initDebugingSetup();

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

function debugAddPiece(e)
{
    e.target.innerHTML = new Piece(2).GetDiv();
}

function initDefaultSetup()
{
    for (var i = 0; i < 2; i++) {
        addRandomPiece();
    }
}

function initDebugingSetup()
{
    var newPiece = new Piece(2);
    pieces[pieces.length] = newPiece;
    slots[1][0].innerHTML = newPiece.GetDiv();
    newPiece.SetX(1);
    newPiece.SetY(0);

    newPiece = new Piece(2);
    pieces[pieces.length] = newPiece;
    slots[1][3].innerHTML = newPiece.GetDiv();
    newPiece.SetX(1);
    newPiece.SetY(3);

    newPiece = new Piece(4);
    pieces[pieces.length] = newPiece;
    slots[3][3].innerHTML = newPiece.GetDiv();
    newPiece.SetX(3);
    newPiece.SetY(3);

    newPiece = new Piece(8);
    pieces[pieces.length] = newPiece;
    slots[0][3].innerHTML = newPiece.GetDiv();
    newPiece.SetX(0);
    newPiece.SetY(3);
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

    do
    {
        movePieces(direction);
    } while (checkMerge(direction))

    if (hasMovedOrMerged && pieces.length < 16)
        addRandomPiece();
}

function movePieces(direction)
{
    for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
    }

    var pieceMoved = true;

    // right
    if (direction === Direction.RIGHT)
    {
        console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetY() + 1 <= 3 &&
                    slots[piece.GetX()][piece.GetY() + 1].innerHTML == "") {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() + 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    // left
    if (direction === Direction.LEFT)
    {
        console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetY() - 1 >= 0 &&
                    slots[piece.GetX()][piece.GetY() - 1].innerHTML == "") {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() - 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    // up
    if (direction === Direction.UP)
    {
        console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetX() - 1 >= 0 &&
                    slots[piece.GetX() - 1][piece.GetY()].innerHTML == "") {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX() - 1, piece.GetY());
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    // down
    if (direction === Direction.DOWN)
    {
        console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetX() + 1 <= 3 &&
                    slots[piece.GetX() + 1][piece.GetY()].innerHTML == "") {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX() + 1, piece.GetY());
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    //checkMerge(e);

    for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
    }
}

function checkMerge(direction) 
{
    var keepMoving = false;
    //check piece left
    if (direction === Direction.RIGHT) {
        for (var i = 0; i < pieces.length; i++) {
            var piece = pieces[i];

            if (piece.GetY() - 1 >= 0 &&
                slots[piece.GetX()][piece.GetY() - 1].innerHTML !== "" &&
                getPieceByCoords(piece.GetX(), piece.GetY() - 1).GetValue() === piece.GetValue()
            ) {
                mergePieces(piece.GetX(), piece.GetY() - 1, piece.GetX(), piece.GetY());
                keepMoving = true;
            }
        }
    }

    //check piece right
    if (direction === Direction.LEFT) {
        for (var i = 0; i < pieces.length; i++) {
            var piece = pieces[i];

            if (piece.GetY() + 1 <= 3 &&
                slots[piece.GetX()][piece.GetY() + 1].innerHTML !== "" &&
                getPieceByCoords(piece.GetX(), piece.GetY() + 1).GetValue() === piece.GetValue()
            ) {
                mergePieces(piece.GetX(), piece.GetY() + 1, piece.GetX(), piece.GetY());
                keepMoving = true;
            }
        }
    }

    // check piece down
    if (direction === Direction.UP) {
        for (var i = 0; i < pieces.length; i++) {
            var piece = pieces[i];

            if (piece.GetX() + 1 <= 3 &&
                slots[piece.GetX() + 1][piece.GetY()].innerHTML !== "" &&
                getPieceByCoords(piece.GetX() + 1, piece.GetY()).GetValue() === piece.GetValue()
            ) {
                mergePieces(piece.GetX() + 1, piece.GetY(), piece.GetX(), piece.GetY());
                keepMoving = true;
            }
        }
    }

    // check piece up
    if (direction === Direction.DOWN)
    {
        for (var i = 0; i < pieces.length; i++)
        {
            var piece = pieces[i];

            if (piece.GetX() - 1 >= 0 &&
                slots[piece.GetX() - 1][piece.GetY()].innerHTML !== "" &&
                getPieceByCoords(piece.GetX() - 1, piece.GetY()).GetValue() === piece.GetValue()
            ) {
                mergePieces(piece.GetX() - 1, piece.GetY(), piece.GetX(), piece.GetY());
                keepMoving = true;
            }
        }
    }

    return keepMoving;
}

function addRandomPiece()
{
    do
    {
        var x = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        var y = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    } while (getPieceByCoords(x, y) != null);

    var newPiece = new Piece(1);
    pieces[pieces.length] = newPiece;
    slots[x][y].innerHTML = newPiece.GetDivInit();
    newPiece.SetX(x);
    newPiece.SetY(y);
}

function movePiece(x1, y1, x2, y2)
{
    var piece = getPieceByCoords(x1, y1);
    slots[x2][y2].innerHTML = piece.GetDiv();
    slots[x1][y1].innerHTML = "";

    piece.SetX(x2);
    piece.SetY(y2);

    hasMovedOrMerged = true;
}

//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(x1, y1, x2, y2)
{
    removePieceByCoords(x1, y1);
    slots[x1][y1].innerHTML = "";
    getPieceByCoords(x2, y2).SquareValue();
    slots[x2][y2].innerHTML = getPieceByCoords(x2, y2).GetDiv();

    hasMovedOrMerged = true;
}

function removePieceByCoords(x, y)
{
    for (var i = 0; i < pieces.length; i++) {
        if (pieces[i].GetX() === x && pieces[i].GetY() === y) {
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
}

function reset()
{
    for (var i = 0; i < slotsUnordered.length; i++) {
        slotsUnordered[i].innerHTML = "";
    }
    pieces = [];
    initDefaultSetup();
}