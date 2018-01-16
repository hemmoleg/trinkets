﻿var tables = [];
var isAutoplay = true;
var colorStart = 120;
var tableTween;
var zoomTween;
var docHeight = document.documentElement.clientHeight;
var docWidth = document.documentElement.clientWidth;
var tableHeight;
var tableWidth;
var tablesHeight;
var tablesWidth;


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
        var mainValue = (360/(2*Math.PI)) * (((2*Math.PI)/360)*colorStart - (i * 0.5));
        var color = "hsla("+ mainValue +", 100%, 60%, 0.6)";
        this.Div.style.backgroundColor = color;
        color = "hsla("+ (mainValue+90) +", 50%, 50%, 1)";
        //this.Div.style.borderColor = color;
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
        this.IsVisible;
    }
    
    InitDefaultSetup()
    {
        for (var i = 0; i < 2; i++) {
            this.AddRandomPiece();
        }
    }
    InitDebugingSetup()
    {
        this.CreateNewPiece(0, 0, 2);
        this.CreateNewPiece(1, 0, 2);
        this.CreateNewPiece(2, 0, 8);
        this.CreateNewPiece(3, 0, 16);
        this.CreateNewPiece(0, 1, 32);
        this.CreateNewPiece(1, 1, 64);
        this.CreateNewPiece(2, 1, 128);
        this.CreateNewPiece(3, 1, 256);
        this.CreateNewPiece(0, 2, 2);
        this.CreateNewPiece(1, 2, 2);
        this.CreateNewPiece(2, 2, 8);
        this.CreateNewPiece(3, 2, 16);
        this.CreateNewPiece(0, 3, 32);
        this.CreateNewPiece(1, 3, 64);
        this.CreateNewPiece(2, 3, 128);
        //this.CreateNewPiece(3, 3, 256);
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
        
            TweenMax.to($(this.Pieces[i].Div), 1, {x: this.Pieces[i].TmpLeft, y: this.Pieces[i].TmpTop, ease:  Power1.easeInOut, onComplete: this.Pieces[i].FinishMove, onCompleteParams:[this.Pieces[i].Div]});
        }
        //happens when move-direction is the same two times in a row and no merging occured
        if(!this.HasMovedOrMerged)
            CheckVisibilityAndAutoplay(this.ID);
    }
    
    //called when piece is done moving visualy
    CheckMerge(piece) 
    {

        for(var i = 0; i < this.Pieces.length; i++)
        {
            if(this.Pieces[i].X === piece.X && this.Pieces[i].Y === piece.Y &&
               this.Pieces[i] !== piece && !piece.Moving && !this.Pieces[i].Moving)
                {
                    this.StartMergePieces(this.Pieces[i], piece);
                    break;
                }
        }
    }
    
    StartMergePieces(pieceToRemove, resultingPiece)
    {
        //console.log("MERGE");
        this.DeletePiece(pieceToRemove);

        this.Slots[resultingPiece.X][resultingPiece.Y].markedForMerge = false;

        resultingPiece.Div.classList.remove('newPieceAnim');
        
        TweenMax.to(resultingPiece.Div, 0.5, {rotationY: 90, ease: Power1.easeIn, onComplete:this.FinishMergePieces, onCompleteParams:[ resultingPiece.Div]});
        
        this.PiecesTransitioning++;
    }        
         
    FinishMergePieces(div)
    {
        var piece = getPieceByDiv(div);
        piece.DoubleValue();
        var table = getTableByPiece(piece)
        TweenMax.to(div, 0.5, {rotationY: 180, ease: Power1.easeOut, onComplete:table.FinishedNewPieceAnim, onCompleteParams:[div]});
    }
    
    FinishedNewPieceAnim(e)
    {
        if(e.animationName == null)
        {
            var div = e;
            e = {};
            e.target = div;
        }
        e.target.classList.remove('newPieceAnim');
        TweenMax.set(e.target, {rotationY: 0});
        
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
            CheckVisibilityAndAutoplay(table.ID);
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

    CreateNewPiece(x, y, val)
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
        this.MinMoveX = 100;
        this.MinMoveY = 150;
        this.Safety = $('.row:first-child table:first-child td').outerHeight();
        this.Anchors;
        
        if(tableHeight - this.DocHeight < this.MinMoveY + this.Safety)
            return;
        
        this.CalculateAnchors();
    }
    
    CalculateAnchors()
    {
        var left = parseInt($('#tableContainer').css('transform').split(',')[4]);
        var top = parseInt($('#tableContainer').css('transform').split(',')[5]);
        var anchors = [{x: left, y: top}];
            
        for(var i = 0; i < 10; i++)
        {
            var currentLeft = left;
            
            var canShiftLeft = tablesWidth - docWidth - Math.abs(currentLeft) - this.Safety > this.MinMoveX;
            var canShiftRight = currentLeft + this.Safety < -this.MinMoveX;
            
            //fallback
            if(!canShiftLeft && !canShiftRight)
            {
                console.log("Cant shift left AND cant shift right!");
            }
            else if(!canShiftLeft)
            {
                //shift right
                var min = this.MinMoveX;
                var max = Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left + distance;
                
            } else if(!canShiftRight)
            {
                //shift left
                var min = this.MinMoveX;
                var max = tablesWidth - docWidth - Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left - distance;
            }
            else if(Math.random() > 0.5)
            {
                //shift left
                var min = this.MinMoveX;
                var max = tablesWidth - docWidth - Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left - distance;
            }
            else
            {
                //shift right
                var min = this.MinMoveX;
                var max = Math.abs(currentLeft) - this.Safety;
                
                var distance = Math.random() * (max - min) + min;
                left = left + distance;
            }
            //console.log("canShiftLeft " + canShiftLeft + " canShiftRight " + canShiftRight)
            //console.log("result left: " + left);
            
            
            
            var currentTop = top;
            
            var canShiftUp = tablesHeight - docHeight - Math.abs(currentTop) - this.Safety > this.MinMoveY;
            //var canShiftDown = Math.abs(currentTop) - this.Safety > this.MinMoveY;
            var canShiftDown = currentTop + this.Safety < -this.MinMoveY;
            
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
                var max = tablesHeight - docHeight - Math.abs(currentTop) - this.Safety;
                //var max = Math.abs(currentTop + this.Safety);
                
                var distance = Math.random() * (max - min) + min;
                top = top - distance;
            }
            else if(Math.random() > 0.5)
            {
                //shift up
                var min = this.MinMoveY;
                var max = tablesHeight - docHeight - Math.abs(currentTop) - this.Safety;
                
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
        
        //this.OuputAnchors(anchors);
        //this.ShowOverflow(anchors);
        
        this.CheckAnchorsForSafety(anchors);
    }
    
    StartMoving(anchors)
    {
        tableTween = TweenMax.to($('#tableContainer'), 45, {bezier:{curviness:1.2, values:anchors}, ease:Power0.easeInOut,onUpdate:this.Update, repeat: -1});
        tableTween.pause();
    }
    
    Update()
    {
        //console.log("adsf" + window.TableMover.DocHeight);
        var left = parseInt($('#tableContainer').css('transform').split(',')[4]);
        var top = parseInt($('#tableContainer').css('transform').split(',')[5]);
        $('#tableContainer').css('perspective-origin', (docWidth/2 + Math.abs(left)) + 'px ' + (docHeight/2 + Math.abs(top)) + 'px');
    }
    
    Zoom()
    {
        var zoom = Math.round((Math.random() * (1.5 - 1) + 1) * 10) / 10;
        //var zoom = Math.round(Math.random() * 10 ) / 10 + 1;
        console.log("zoom " + zoom);
        
        zoomTween = TweenMax.to($('#tableContainer'), 8, {scale: zoom, ease:Power2.easeInOut, onComplete:window.TableMover.Zoom});
    }
    
    OuputAnchors(anchors)
    {
        for(var i = 0; i < anchors.length-1; i++)
        {
            var a = Math.abs( anchors[i].x - anchors[i+1].x );
            var b = Math.abs( anchors[i].y - anchors[i+1].y );
            
            //console.log(i + " " + Math.sqrt(a*a + b*b));
            console.log(i + " " + anchors[i].x); 
        }
    }
    
    CheckAnchorsForSafety(anchors)
    {
        for(var i  = 0; i < anchors.length; i++)
        {
            if(anchors[i].x > -this.Safety)
            {
                console.log("%ctoo far right moved " + anchors[i].x, 'background: #ff5555; color: #000000');
            }
            if(tablesWidth - Math.abs(anchors[i].x) - docWidth < this.Safety)  
            {
                console.log("%ctoo far left moved " + anchors[i].x, 'background: #ff5555; color: #000000');
            }
            
            if(anchors[i].y > -this.Safety)
            {
                console.log("%ctoo far down moved " + anchors[i].y, 'background: #ff5555; color: #000000');
            }
            if(tablesHeight - Math.abs(anchors[i].y) - docHeight < this.Safety)  
            {
                console.log("%ctoo far up moved " + anchors[i].y, 'background: #ff5555; color: #000000');
            }
        }
    }
    
    ShowOverflow(anchors)
    {
        for(var i  = 0; i < anchors.length; i++)
        {
            var overflowLeft = Math.abs(anchors[i].x);
            var overflowRight = tablesWidth - overflowLeft - docWidth;
            console.log("Horizontal " + overflowLeft + "  " + overflowRight);
            
            var overflowTop = Math.abs(anchors[i].y);
            var overflowBottom = tablesHeight - overflowTop - docHeight;
            console.log("Vertical " + overflowTop + "  " + overflowBottom);
        }
    }
}

window.onload = function ()
{
    docHeight = document.documentElement.clientHeight;
    docWidth = document.documentElement.clientWidth;
    
    tableHeight = $('table').outerHeight();
    tableWidth = $('table').outerWidth();
    
    createDocument();
    
    tablesHeight = $('.row').length * $('.row:first-child table:first-child').outerHeight();
    tablesWidth = $('.row:first-child').children().length * $('.row:first-child table:first-child').outerWidth();
    
    var slots = [];
    for(var i = 1; i <= $('.row').length; i++)
    {
        //console.log("i " + i);
        for(var j = 1; j <= $('div div:nth-child('+i+') table').length; j++)
        {
            //console.log("table " + i + j);
            slotsUnordered = $('div div:nth-child('+i+') table:nth-child('+j+') tr td');  
     
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
    
    setBackgroundColors();
    
    //tables[0].InitDefaultSetup();
    for(var i = 0; i < tables.length; i++)
    {
        tables[i].InitDefaultSetup();
        //tables[i].InitDebugingSetup();
    }
    
    window.TableMover = new TableMover();
    window.TableMover.StartMoving(window.TableMover.Anchors);
    window.TableMover.Zoom();
    zoomTween.pause();
    
    $( window ).resize(function(){location.reload()});
    
    //minimum travel distance = slot height - slot margin 
    minDistance = $(tables[0].Slots[1][0]).outerHeight();
    $('#settings').height($('#settings').height());
    $('#settings').toggleClass('scaled');
    $('#scaleWrapper').toggleClass('hidden')
    
    setTimeout(function(){
      $('#settings').toggleClass('transitionSettings');
      $('#scaleWrapper').toggleClass('transitionScaleWrapper');
    }, 100)
    
    $('#restart button').on('click', restartAll);
    
    ///////////////////////
    //piece on end of move still snapping!
    ///////////////////////
    //fps anzeigen
    ///////////////////////
    //random horizontal and vertical flip on merge
    ///////////////////////
    //set perspective once on doc load
    
    //debug
    //localStorage.clear();
    
    initSettings();

}

function createDocument()
{
    var tablesPerRow = Math.ceil(docWidth / tableWidth) + 1;
    var rowsNeeded = Math.ceil(docHeight / tableHeight) + 1;
    
    while($('.row').children().length < tablesPerRow)
    {
        var table = $('table').first().clone();
        $('.row').append(table);
    }
    
    while($('.row').length < rowsNeeded)
    {
        var row = $('.row').first().clone();
        $('#tableContainer').append(row);
    }
    console.log("table count: " + tablesPerRow * rowsNeeded);
}

function setBackgroundColors()
{
    var rows = $('.row').length;
    var cols = $('.row:first-child table').length;
    
    var colIncrease = (180 / (cols*4));
    var rowIncrease = (180 / (rows*4));
    
    
    for(var i = 0; i < tables.length; i++)
    {
        for(var j = 0; j < 4; j++)
        {
            for(var k = 0; k < 4; k++)
            {
                //var colorVal = colIncrease * (j + ((i % cols) *4)) + rowIncrease * (k + ((i % rows) *4));
                var colorVal = colIncrease * (j + ((i % cols) *4)) + rowIncrease * (k + (Math.floor(i / cols) *4));
                
                //var colorVal = 180 / 4 * j + 180 / 4 * k;
                tables[i].Slots[j][k].style.backgroundColor = "hsla("+ colorVal +", 100%, 60%, 0.6)";
            }
        }
    }
}

function CheckVisibilityAndAutoplay(id)
{
    if(isVisible(id))
    {
        tables[id].IsVisible = true;
        autoplay(id);
    }
    else
    {
        //console.log("table was not visible " + id)
        //setTimeout( this.CheckVisibilityAndAutoplay.call(this), 10000);
        tables[id].IsVisible = false;
        setTimeout( function(){
            CheckVisibilityAndAutoplay(id)
        }, 1000 );
    }

}

function isVisible(tableID)
{
    return true;
    //if table is right of viewport
    if($(tables[tableID].Slots[2][2]).offset().left > docWidth)
        return false;
        
    //if table is left of viewport
    if($(tables[tableID].Slots[2][2]).offset().left < 0)
        return false;

    //if table is below of viewport
    if($(tables[tableID].Slots[2][2]).offset().top > docHeight)
        return false;
        
    //if table is above of viewport
    if($(tables[tableID].Slots[2][2]).offset().top < 0)
        return false;
    
    return true;
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
    
    
    if(localStorage.getItem('IsAutoplay') == null)
    {
        localStorage.setItem('IsAutoplay', true);
    }
    
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
    
    if(localStorage.getItem('IsZoom') == null)
    {
        localStorage.setItem('IsZoom', false);
    }
    
    $('#chkBoxZoom').prop('checked', localStorage.getItem('IsZoom') === "true");
    
    if($('#chkBoxZoom').prop('checked'))
        zoomTween.play();
    
    $('#chkBoxZoom').on('click', function(){
        localStorage.setItem('IsZoom', $('#chkBoxZoom').prop('checked'));
        
        if($('#chkBoxZoom').prop('checked'))
        {
            zoomTween.play();
        }
        else
            zoomTween.pause();
    })
    
    
    if(localStorage.getItem('ShowAll') == null)
    {
        localStorage.setItem('ShowAll', false);
    }
    
    $('#chkBoxShowAll').prop('checked', localStorage.getItem('ShowAll') === "true");
    
    if($('#chkBoxShowAll').prop('checked'))
    {
        $('.row').css('transform', 'translate(0px, 0px)');
        $('.slot').css('width', '6vmin');
        $('.slot').css('height', '6vmin');
        //resize();
    }
    
    
    $('#chkBoxShowAll').on('click', function(){
        localStorage.setItem('ShowAll', $('#chkBoxShowAll').prop('checked'));
        if($('#chkBoxShowAll').prop('checked'))
        {
            isAutoplay = false;
            tableTween.pause();
            $('.row').css('transform', 'translate(0px, 0px)');
            $('.slot').css('width', '6vmin');
            $('.slot').css('height', '6vmin');
        }
        else
        {
            isAutoplay = true;
            $('.slot').css('width', '15vmin');
            $('.slot').css('height', '15vmin');
            restartAll();
        }
    })
}