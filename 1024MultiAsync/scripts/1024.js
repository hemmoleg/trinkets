﻿var tables = [];
var slotsUnordered = [];
var slots = [];
var pieces = [];
var prevPieces;

var hiscore = 0;
var moving = false;
var minDistance  ;
var colorStart = 120;
var animDurationGameOverIn;
var animDurationGameOverOut = '1s';
var animDelayGameOver;


Direction = {UP:'up', DOWN:'down', LEFT:'left', RIGHT:'right'}

class Piece
{
    constructor(tableIndex, x, y, initVal)
    {
        this.Div = "";
        this.X = x;
        this.Y = y;
        this.Value = initVal;
        this.CanMerge = true;
        this.Moving;
        this.TmpLeft = 0;
        this.TmpTop = 0;    
        this.TableIndex = tableIndex;
        
        this.Div = document.createElement('div');
        this.Div.innerHTML = "<b>" + initVal + "</b>";
        this.Div.classList.add('piece');
        this.Div.classList.add('newPieceAnim');
        this.Div.addEventListener("transitionend", this.FinishMove);
        this.Div.addEventListener("animationend", tables[tableIndex].FinishedNewPieceAnim);
        this.Div.TableIndex = tableIndex;
        
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
        var color = "hsla("+mainValue+", 100%, 60%, 0.6)";
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
    
    FinishMove(e)
    {
        //'this' points to the Div, not the piece!
        var piece = getPieceByDiv(this);
        var prevX = piece.X - Math.round(piece.TmpLeft / minDistance);
        var prevY = piece.Y - Math.round(piece.TmpTop / minDistance);

        piece.TmpLeft = 0;
        piece.TmpTop = 0;
        piece.Moving = false;
        
        this.style.left = '0px';
        this.style.top = '0px';

        var table = getTableByPiece(piece);
        
        table.Slots[prevX][prevY].removeChild(this);
        table.Slots[piece.X][piece.Y].appendChild(this);
        
        table.CheckMerge(piece);
    
        //check of any piece is still moving
        for(var i = 0; i < table.Pieces.length; i++)
        {
            if(table.Pieces[i].Moving)
                return;  
        }
        
        table.AllPiecesDoneMoving();
    }
}

class Table
{
    constructor(slots, id)
    {
        this.ID = id;
        this.Slots = slots;
        this.Pieces = [];
        this.HasMovedOrMerged = false;
        this.PiecesTransitioning = 0;
        
        //this.CreateNewPiece(0,0,2);
        //this.InitDefaultSetup();
    }
    
    InitDefaultSetup()
    {
        for (var i = 0; i < 2; i++) {
            this.AddRandomPiece();
        }
    }
    
    MoveAndMerge(direction)
    {
        //set by calculateMove and mergePieces
        this.HasMovedOrMerged = false;

        console.log("%c Move " + direction + " " + this.ID, 'background: #222; color: #bada55');
        this.CalculateMoves(direction);
    }
    
    CalculateMoves(direction)
    {
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
                        var piece = this.GetPieceByCoords(x, y);
                        if(piece == null) continue;

                        tempPiece = this.GetPieceByCoords(x, y+1);
                        if(tempPiece === null ||
                           (piece.Value === tempPiece.Value && !slots[x][y+1].markedForMerge))
                        {
                            this.CalculateMove( piece.X, piece.Y, piece.X, piece.Y + 1);
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
                        var piece = this.GetPieceByCoords(x,y);
                        if(piece == null) continue;

                        tempPiece = this.GetPieceByCoords(x, y-1);
                        if(tempPiece === null ||
                           (piece.Value === tempPiece.Value && !slots[x][y-1].markedForMerge))
                        {
                            this.CalculateMove(piece.X, piece.Y, piece.X, piece.Y - 1);
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
                        var piece = this.GetPieceByCoords(x, y);
                        if(piece == null) continue;

                        tempPiece = this.GetPieceByCoords(x-1, y);
                        if(tempPiece === null ||
                           (piece.Value === tempPiece.Value && !slots[x-1][y].markedForMerge))
                        {
                            this.CalculateMove(piece.X, piece.Y, piece.X - 1, piece.Y);
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
                        var piece = this.GetPieceByCoords(x, y);
                        if(piece == null) continue;

                        tempPiece = this.GetPieceByCoords(x+1, y);
                        if(tempPiece === null ||
                           (piece.Value === tempPiece.Value && !slots[x+1][y].markedForMerge))
                        {
                            this.CalculateMove(piece.X, piece.Y, piece.X + 1, piece.Y);
                            pieceMoved = true;
                        }
                    }
                }
            }
        }
        this.ApplyMove();
    }
    
    CalculateMove(x1, y1, x2, y2)
    {
        var piece = this.GetPieceByCoords(x1, y1);
        //at this point its enough to check if theres a piece or not
        if(this.GetPieceByCoords(x2,y2) !== null )
        {
            //console.log("mark for merge " + x2 + "/" + y2);
            slots[x2][y2].markedForMerge = true;
        }

        //useful for debuging
        //slots[x2][y2].innerHTML = piece.GetValue();
        //slots[x1][y1].innerHTML = 0;

        piece.X = x2;
        piece.Y = y2;

        //console.log("going to: " + x2 + " " + y2); 

        piece.TmpLeft += (x2 - x1) * minDistance;
        piece.TmpTop += (y2 - y1) * minDistance;

        piece.Moving = true;

        this.HasMovedOrMerged = true;

    }
    
    ApplyMove()
    {
        for(var i = 0; i < this.Pieces.length; i++)
        {
            this.Pieces[i].Div.style.left = this.Pieces[i].TmpLeft.toString() + 'px';
            this.Pieces[i].Div.style.top = this.Pieces[i].TmpTop.toString() + 'px';
        }
        if(!this.HasMovedOrMerged)
            autoplay(this.ID);
    }
    
    //Piece.FinishMove
    
    //called when piece is done moving visualy
    CheckMerge(piece) 
    {

        for(var i = 0; i < this.Pieces.length; i++)
        {
            if(this.Pieces[i].X === piece.X && this.Pieces[i].Y === piece.Y &&
               this.Pieces[i] !== piece && !piece.Moving && !this.Pieces[i].Moving)
                {
                    this.MergePieces(this.Pieces[i], piece);
                    break;
                }
        }
    }
    
    //xy1 = coords for piece to remove
    //xy2 = coords for resulting piece
    MergePieces(pieceToRemove, resultingPiece)
    {
        //console.log("MERGE");
        this.DeletePiece(pieceToRemove);

        
        resultingPiece.DoubleValue();
        resultingPiece.Div.markedForMerge = false;

        resultingPiece.Div.classList.remove('newPieceAnim');
        resultingPiece.Div.classList.remove('animMerge');
        resultingPiece.Div.offsetWidth; // Holy Shit!
        resultingPiece.Div.classList.add('animMerge');

        this.PiecesTransitioning++;
    }        
           
    FinishedNewPieceAnim(e)
    {
        e.target.classList.remove('newPieceAnim');
        e.target.classList.remove('animMerge');
        
        var table = getTableByPiece(getPieceByDiv(e.target));
        
        table.PiecesTransitioning--;
        
        console.log("-PiecesTransitioning: " + table.PiecesTransitioning);
        
        
        if(table.PiecesTransitioning != 0)
            return;
        
        //seperate function for this
        if(table.Pieces.length == 16)
        {
            table.Reset();
            return;
        }

        if(table.HasMovedOrMerged)
        {    
            table.HasMovedOrMerged = false;
            table.AddRandomPiece();
        }
        else
        {
            autoplay(table.ID);
        }
    }
    
    //last call for current turn
    AllPiecesDoneMoving()
    {
        if(this.PiecesTransitioning == 0)
        {
            this.HasMovedOrMerged = false;
            this.AddRandomPiece();    
        }
    }
    
    /////////UTILITY/////////////////////
    
    AddRandomPiece()
    {
        do
        {
            var x = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
            var y = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        } while (this.GetPieceByCoords(x, y) != null);

        this.CreateNewPiece(x, y, 2);
    }
    
    GetPieceByCoords(x, y)
    {
        for (var i = 0; i < this.Pieces.length; i++) 
        {
            if (this.Pieces[i].X === x && this.Pieces[i].Y === y) 
            {
                return this.Pieces[i];
            }
        }

        return null;
    }

    CreateNewPiece (x, y, val)
    {
        var newPiece = new Piece(this.ID, x, y, val);
        this.Pieces[this.Pieces.length] = newPiece;
        this.Slots[x][y].appendChild(newPiece.Div);
        
        this.PiecesTransitioning++;
        console.log("+PiecesTransitioning: " + this.PiecesTransitioning);
    }
    
    Reset()
    {
        console.log("RESET");

        for(var i = 0; i < this.Pieces.length; i++)
        {
            this.Pieces[i].Div.removeEventListener("animationend", this.FinishedNewPieceAnim);
            this.Pieces[i].Div.addEventListener("animationend", this.FinishedAnimDelete);
            this.Pieces[i].Div.classList.toggle("animDelete");
        }
    }

    FinishedAnimDelete(e)
    {
        var piece = getPieceByDiv(e.target);
        var table = getTableByPiece(piece);
        table.DeletePiece(piece);

        if(table.Pieces.length === 0)
            table.InitDefaultSetup();
    }
    
    DeletePiece(piece)
    {
        this.Slots[piece.X][piece.Y].removeChild(piece.Div);
        piece.Div.removeEventListener("transitionend", piece.FinishMove);
        this.Pieces.splice(this.Pieces.indexOf(piece), 1);        
    }
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
            //tables[tables.length] = slots;
            //pieces[pieces.length] = [];
        
            tables[tables.length] = new Table(slots, j-1);
        }
    }
    
    tables[0].InitDefaultSetup();
    /*for(var i = 0; i < tables.length; i++)
    {
        tables[i].InitDefaultSetup();
    }*/
    
    //increase .scaleDiv height to fit #tutorial scaled to 1.8
    $('.scaleDiv').height($('.scaleDiv').height() * 1.8);
    
    //.overlay layout stuff
    $( window ).resize(resizeWithoutMargin);
    resizeWithoutMargin();
    
    //animDurationGameOverIn = parseFloat(getComputedStyle($('#gameOver')[0])['transitionDuration']) + 's';
    //animDelayGameOver = parseFloat(getComputedStyle($('#gameOver')[0])['transitionDelay']) + 's';
    
    /////////////////////////////
    //pieces not merging!
    /////////////////////////////
    //use CDN to get jQuery and hammer.js
    /////////////////////////////
    //proper reset check
    /////////////////////////////
    //proper reset animation
    /////////////////////////////
    //table 11 starts late
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
    
    //initDebugingSetup(0);
    //for(var i = 1; i < 11; i++)
    //{
    //    initDefaultSetup(i);
    //}
    
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
    minDistance = $(tables[0].Slots[1][0]).outerHeight() - Math.abs(parseInt($(tables[0].Slots[1]
                  [0]).css('margin-right')));
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

function autoplay(tableIndex)
{
    console.log("autoplay called with tableIndex " + tableIndex);
    var rand = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    switch(rand)
    {
        case 0: tables[tableIndex].MoveAndMerge(Direction.UP);
                break;
        case 1: tables[tableIndex].MoveAndMerge(Direction.DOWN);
                break;
        case 2: tables[tableIndex].MoveAndMerge(Direction.LEFT);
                break;
        case 3: tables[tableIndex].MoveAndMerge(Direction.RIGHT);
                break;
    }
}

function getPieceByDiv(div)
{
    var table = tables[div.TableIndex];
    for (var i = 0; i < table.Pieces.length; i++)
    {
        if(table.Pieces[i].Div === div)
            return table.Pieces[i];
    }
}

function getValueByCoords(x,y)
{
    var piece = getPieceByCoords(x,y);
    return piece != null ? piece.GetValue() : 0;
}

function getTableByPiece(piece)
{
    for(var i = 0; i < tables.length; i++)
    {
        if( tables[i].Pieces.indexOf(piece) != -1)
            return tables[i];
    }
    console.log("ERROR: could not find table by piece: " + piece);
    return null;
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