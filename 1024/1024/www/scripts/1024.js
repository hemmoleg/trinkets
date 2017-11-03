﻿var slotsUnordered = [];
var slots = [];
var pieces = [];
var dragSrcElement = null;
var hasMovedOrMerged = false;
var merging = false;

var cols = ["col0", "col1", "col2", "col3"];
var rows = ["row0", "row1", "row2", "row3"]

Direction = {UP:"up", DOWN:"down", LEFT:"left", RIGHT:"right"}

function Piece(x, y, initVal)
{
    var Div = "";
    var x;
    var y;
    var value = initVal;

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

    this.GetValue = function () { return value; }
    this.SetValue = function (val) { value = val; }
    this.SquareValue = function ()
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
    //FIX THIS
    
    var newPiece = new Piece(0, 0, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
    
    newPiece = new Piece(0, 1, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());
    
    newPiece = new Piece(0, 3, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());

    /*newPiece = new Piece(1, 3, 2);
    pieces[pieces.length] = newPiece;
    document.getElementById('pieceContainer').appendChild(newPiece.GetDiv());*/
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
    
    /*do
    {
        movePieces(direction);
    } while (checkMerge(direction))
*/
    //if (hasMovedOrMerged && pieces.length < 16)
    //    addRandomPiece();
}

function movePieces(direction)
{
    /*for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
    }*/

    var pieceMoved = true;

    // right
    if (direction === Direction.DOWN)
    {
        //console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetY() + 1 <= 3 &&
                    (slots[piece.GetX()][piece.GetY() + 1].value == 0 ||
                     piece.GetValue() === slots[piece.GetX()][piece.GetY() + 1].value)) 
                {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() + 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    // left
    if (direction === Direction.UP)
    {
        //console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetY() - 1 >= 0 &&
                    (slots[piece.GetX()][piece.GetY() - 1].value == 0 || 
                     piece.GetValue() === slots[piece.GetX()][piece.GetY() - 1].value))   
                {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX(), piece.GetY() - 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    // up
    if (direction === Direction.LEFT)
    {
        //console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetX() - 1 >= 0 &&
                    (slots[piece.GetX() - 1][piece.GetY()].value == 0 ||
                     piece.GetValue() === slots[piece.GetX() - 1][piece.GetY()].value)) 
                {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX() - 1, piece.GetY());
                    pieceMoved = true;
                    break;
                }
            }
        }
    }

    // down
    if (direction === Direction.RIGHT)
    {
        //console.log("Pieces: " + pieces.length);

        while (pieceMoved)
        {
            pieceMoved = false;
            for (var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if (piece.GetX() + 1 <= 3 &&
                    (slots[piece.GetX() + 1][piece.GetY()].value == 0 ||
                     piece.GetValue() === slots[piece.GetX() + 1][piece.GetY()].value)) 
                {
                    movePiece(piece.GetX(), piece.GetY(), piece.GetX() + 1, piece.GetY());
                    pieceMoved = true;
                    break;
                }
            }
        }
    }
    
    for (var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());
    }
}

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
    
    /*if(merging) return;
    merging = true;
    var merged;
    do{ 
        merged = false;
        for(var i = 0; i < pieces.length; i++)
        {
            if(getPieceByCoords(pieces[i].GetX(), pieces[i].GetY()) !== null && 
               pieces[i].GetValue() === getPieceByCoords(pieces[i].GetX(), pieces[i].GetY()).GetValue())
            {
                mergePieces(pieces[i].GetX(), pieces[i].GetY(), pieces[i].GetX(), pieces[i].GetY());
                console.log("merged");
                merged = true;
                break;
            }
        }
    }while(merged)
    merging = false;*/
    
    /*var keepMoving = false;
    //check piece left
    if (direction === Direction.UP) {
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
    if (direction === Direction.DOWN) {
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
    if (direction === Direction.RIGHT) {
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
    if (direction === Direction.LEFT)
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

    return keepMoving;*/
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

function movePiece(x1, y1, x2, y2)
{
    var piece = getPieceByCoords(x1, y1);
    slots[x2][y2].value = piece.GetValue();
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
        getPieceByCoords(x2, y2).SquareValue();
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
    slots[x2][y2].value = getPieceByCoords(x2, y2).GetValue();

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

function reset()
{
    console.log("RESET");
    for (var i = 0; i < slotsUnordered.length; i++) {
        slotsUnordered[i].innerHTML = "";
    }
    pieces = [];
    initDefaultSetup();
}