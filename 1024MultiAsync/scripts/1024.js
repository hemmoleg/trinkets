var tables = [];
var isAutoplay = true;
var hiscore = 0;
var colorStart = 120;
var animDurationGameOverIn;
var animDurationGameOverOut = '1s';
var animDelayGameOver;
var regExDuration = /([0-9]+\.?([0-9]+)?)/g;
var tableTween;


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
        //this.Div.innerHTML = "<b>" + initVal + "</b>";
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
        //this.Div.innerHTML = "<b>" + this.Value + "</b>";
        this.SetColor(this.Value);
    }
    
    FinishMove(div)
    {
        var piece = getPieceByDiv(div);
        var prevX = piece.X - Math.round(piece.TmpLeft / minDistance);
        var prevY = piece.Y - Math.round(piece.TmpTop / minDistance);

        piece.TmpLeft = 0;
        piece.TmpTop = 0;
        piece.Moving = false;
        
        TweenMax.set(div, {x: 0, y: 0});
       
        var table = getTableByPiece(piece);
        
        table.Slots[prevX][prevY].removeChild(div);
        table.Slots[piece.X][piece.Y].appendChild(div);

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
    InitDebugingSetup()
    {
        this.CreateNewPiece(0, 0, 4);
        this.CreateNewPiece(0, 3, 4);
    }
        
    MoveAndMerge(direction)
    {
        //set by calculateMove and mergePieces
        this.HasMovedOrMerged = false;

        //console.log("%c Move " + direction + " " + this.ID, 'background: #222; color: #bada55');
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
                           (piece.Value === tempPiece.Value && !this.Slots[x][y+1].markedForMerge))
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
                           (piece.Value === tempPiece.Value && !this.Slots[x][y-1].markedForMerge))
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
                           (piece.Value === tempPiece.Value && !this.Slots[x-1][y].markedForMerge))
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
                           (piece.Value === tempPiece.Value && !this.Slots[x+1][y].markedForMerge))
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
            this.Slots[x2][y2].markedForMerge = true;
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
            if(this.Pieces[i].TmpLeft === 0 && this.Pieces[i].TmpTop === 0)
                continue;
            
            this.Pieces[i].Div.offsetHeight;
            //$(this.Pieces[i].Div).css('transform', 'translate(' + this.Pieces[i].TmpLeft + 'px, ' + this.Pieces[i].TmpTop + 'px)');
        
            TweenMax.to($(this.Pieces[i].Div), 1, {x: this.Pieces[i].TmpLeft, y: this.Pieces[i].TmpTop, ease:  Power1.easeInOut, onComplete: this.Pieces[i].FinishMove, onCompleteParams:[this.Pieces[i].Div],
            onUpdate: this.blub, onUpdateParams:[this.Pieces[i].Div]});
        }
        if(!this.HasMovedOrMerged)
            autoplay(this.ID);
    }
    
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
        this.Slots[resultingPiece.X][resultingPiece.Y].markedForMerge = false;

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
        //console.log("+PiecesTransitioning: " + this.PiecesTransitioning);
    }
    
    Reset()
    {
        //console.log("RESET");

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

class TableMover
{
    constructor()
    {
        window.scrollTo(0,0); 
    
        this.THeight = $('.row').length * $('.row:first-child table:first-child').outerHeight();
        this.TWidth = $('.row:first-child').children().length *                                                     $('.row:first-child table:first-child').outerWidth();
        this.DocHeight = document.documentElement.clientHeight;
        this.DocWidth = document.documentElement.clientWidth;
        
        this.MinMoveX = 350;
        this.MinMoveY = 100;
        this.Safety = $('.row:first-child table:first-child div').outerHeight();
        this.Anchors;
        
        if(this.THeight - this.DocHeight < this.MinMoveY + this.Safety)
            return;
        
        this.CalculateAnchors();
    }
    
    CalculateAnchors()
    {
        var left = parseInt($('.row').css('transform').split(',')[4]);
        var top = parseInt($('.row').css('transform').split(',')[5]);
        var anchors = [{x: left, y: top}];
            
        for(var i = 0; i < 10; i++)
        {
            var currentLeft = left;
            
            var canShiftLeft = this.TWidth - this.DocWidth - Math.abs(currentLeft) - this.Safety >                              this.MinMoveX;
            var canShiftRight = Math.abs(currentLeft) - this.Safety > this.MinMoveX;

            if(!canShiftLeft)
            {
                //shift down        
                var min = this.MinMoveX;
                var max = Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left + distance;
                
            } else if(!canShiftRight)
            {
                //shift up
                var min = this.MinMoveX;
                var max = this.TWidth - this.DocWidth - Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left - distance;
            }
            else if(Math.random() > 0.5)
            {
                //shift up
                var min = this.MinMoveX;
                var max = this.TWidth - this.DocWidth - Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left - distance;
            }
            else
            {
                //shift down
                var min = this.MinMoveX;
                var max = Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left + distance;
            }
            
            
            
            
            
            
            var currentTop = top;
            
            var canShiftUp = this.THeight - this.DocHeight - Math.abs(currentTop) - this.Safety >                              this.MinMoveY;
            var canShiftDown = Math.abs(currentTop) - this.Safety > this.MinMoveY;

            if(!canShiftUp)
            {
                //shift down        
                var min = this.MinMoveY;
                var max = Math.abs(currentTop) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                top = top + distance;
                
            } else if(!canShiftDown)
            {
                //shift up
                var min = this.MinMoveY;
                var max = this.THeight - this.DocHeight - Math.abs(currentTop) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                top = top - distance;
            }
            else if(Math.random() > 0.5)
            {
                //shift up
                var min = this.MinMoveY;
                var max = this.THeight - this.DocHeight - Math.abs(currentTop) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                top = top - distance;
            }
            else
            {
                //shift down
                var min = this.MinMoveY;
                var max = Math.abs(currentTop) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                top = top + distance;
            }
            
            
            anchors[anchors.length] = {x: left, y: top};
        }
        anchors[anchors.length] = anchors[0];
        
        this.Anchors = anchors;
        
        this.OuputAnchors(anchors);
        
        //ZOOM stuff
        //var zoom = Math.random() + 0.5;
        //console.log("zoom " + zoom);
        
        //$('.row').css('transform', 'translate(' + left + 'px, ' + top + 'px)' + 
        //              'scale(' + zoom + ')' );
    }
    
    StartMoving(anchors)
    {
        tableTween = TweenMax.to($('.row'), 30, {bezier:{curviness:1.2, values:anchors}, ease:Power0.easeInOut, repeat: -1});
        tableTween.pause();
        
        //TweenLite.to(window, 2, {scrollTo:{x:Math.abs(anchors[i].x), y:Math.abs(anchors[i].y)}, onComplete:window.TableMover.StartMoving, onCompleteParams:[anchors, i+1]});
        
         //TweenMax.to($('.row'), 2, {x:anchors[i].x, y:anchors[i].y, onComplete:window.TableMover.StartMoving, onCompleteParams:[anchors, i+1]});
        
        //TweenLite.to(window, 5, {scrollTo:{x:100, y:100}});
    }
    
    OuputAnchors(anchors)
    {
        for(var i = 0; i < anchors.length-1; i++)
        {
            var a = Math.abs( anchors[i].x - anchors[i+1].x );
            var b = Math.abs( anchors[i].y - anchors[i+1].y );
            
            console.log(i + " " + Math.sqrt(a*a + b*b));
            //console.log(i + " " + anchors[i].x); 
        }
    }
}

window.onload = function ()
//$( document ).ready(function()
{
    window.scrollTo(0,0); 
    var slots = [];
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
        
            tables[tables.length] = new Table(slots, tables.length);
        }
    }
    
    //tables[0].InitDefaultSetup();
    for(var i = 0; i < tables.length; i++)
    {
        tables[i].InitDefaultSetup();
        //tables[i].InitDebugingSetup();
    }
    
    window.TableMover = new TableMover();
    window.TableMover.StartMoving(window.TableMover.Anchors);
    
    /*setTimeout(function(){
        window.TableMover = new TableMover();
        window.TableMover.StartMoving(window.TableMover.Anchors, 1);
    }, 10)*/
   
    
    $( window ).resize(resize);
    resize();
    
    $('#settings').toggleClass('scaled');
    $('#scaleWrapper').toggleClass('hidden')
    
    setTimeout(function(){
      $('#settings').toggleClass('transitionSettings');
      $('#scaleWrapper').toggleClass('transitionScaleWrapper');
    }, 100)
    
    $('#restart button').on('click', restartAll);
    
    /////////////////////////////
    //re-implement zoom
    /////////////////////////////
    //use CDN to get jQuery and hammer.js
    
    //debug
    //localStorage.clear();
    
    initSettings();

}

function resize(e)
{   
    //minimum travel distance = slot height - slot margin 
    minDistance = $(tables[0].Slots[1][0]).outerHeight() - Math.abs(parseInt($(tables[0].Slots[1]
                  [0]).css('margin-right')));

    
    
    
    if(e != null)
    {
        isAutoplay = false;
        $('#restart').css('display', 'block');
        tableTween.pause();
    }
    else
        {
            $('#settings').height($('#settings').height());
        }
}

function restartAll()
{
    $('#restart').css('display', 'none');
    
    $( tables ).each(function( index ) 
        {tables[index].Reset();});
   
    if($('#chkBoxAutoplay').prop('checked'))
        isAutoplay = true;
    
    window.TableMover = new TableMover();
    window.TableMover.StartMoving(window.TableMover.Anchors);
    if($('#chkBoxMovingTables').prop('checked'))
        tableTween.play();
}

function initDebugingSetup(tableID)
{
    createNewPiece(tableID, 0, 0, 4);
    createNewPiece(tableID, 0, 3, 4);
    /*createNewPiece(tableID, 2, 0, 4);
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
    createNewPiece(tableID, 3, 3, 256);*/
    
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
    if(!isAutoplay) return;
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
    
    $('#lblTotalPieceCount').text($('.piece').length);
}

function getPieceByDiv(div)
{
    var table = tables[div.TableIndex];
    for (var i = 0; i < table.Pieces.length; i++)
    {
        if(table.Pieces[i].Div === div)
            return table.Pieces[i];
    }
    console.log("ERROR: could not find piece by div: " + div);
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

function initSettings()
{
    $('#settings').on('click', function() {
        $(this).toggleClass('scaled');
        $('#scaleWrapper').toggleClass('hidden')
    })
    
    if(localStorage.getItem('MovingTables') == null)
    {
        localStorage.setItem('MovingTables', true);
    }
    
    $('#chkBoxMovingTables').prop('checked', localStorage.getItem('MovingTables') === "true");
    
    if($('#chkBoxMovingTables').prop('checked'))
        tableTween.play();
    
    $('#chkBoxMovingTables').on('click', function(){
        localStorage.setItem('MovingTables', $('#chkBoxMovingTables').prop('checked'));
        
        if($('#chkBoxMovingTables').prop('checked'))
            tableTween.play();
        else
            tableTween.pause();
    })
    
    
    $('#chkBoxAutoplay').prop('checked', localStorage.getItem('IsAutoplay') === "true");
    
    isAutoplay = $('#chkBoxAutoplay').prop('checked');
        
    
    $('#chkBoxAutoplay').on('click', function(){
        localStorage.setItem('IsAutoplay', $('#chkBoxAutoplay').prop('checked'));
        
        if($('#chkBoxAutoplay').prop('checked'))
        {
            isAutoplay = true;
            for(var i = 0; i < tables.length; i++)
            {
                autoplay(tables[i].ID);
            }
        }
        else
            isAutoplay = false;
    })
    
    
    if(localStorage.getItem('ShowAll') == null)
    {
        localStorage.setItem('ShowAll', true);
    }
    
    $('#chkBoxShowAll').prop('checked', localStorage.getItem('ShowAll') === "true");
    
    if($('#chkBoxShowAll').prop('checked'))
    {
        $('.row').css('transform', 'translate(0px, 0px)');
        $('.slot').css('width', '8vmin');
        $('.slot').css('height', '8vmin');
        resize();
    }
    
    
    $('#chkBoxShowAll').on('click', function(){
        localStorage.setItem('ShowAll', $('#chkBoxShowAll').prop('checked'));
        if($('#chkBoxShowAll').prop('checked'))
        {
            isAutoplay = false;
            tweenTables.pause();
            $('.row').css('transform', 'translate(0px, 0px)');
            $('.slot').css('width', '8vmin');
            $('.slot').css('height', '8vmin');
            resize();
        }
        else
        {
            isAutoplay = true;
            $('.slot').css('width', '15vmin');
            $('.slot').css('height', '15vmin');
            resize();
            restartAll();
        }
    })
}