var slotsUnordered = [];
var slots = [];
var pieces = [];
var dragSrcElement = null;

function Piece()
{
    var Div = "<div class='piece' draggable='true' data-value='2'>2</div>";
    var x;
    var y;
    
    this.GetX = function(){return x;}
    this.SetX = function(val){x = val;}
    
    this.GetY = function(){return y;}
    this.SetY = function(val){y = val;}
    
    this.GetDiv = function(){return Div;}
}

window.onload = function ()
{
    document.body.addEventListener("keydown", processKey);
    
    slotsUnordered = document.querySelectorAll('.slot');
    
    var row = [];
    for(var i = 0; i < slotsUnordered.length; i++)
    {
        console.log("slot " + i);
        row[i % 3] = slotsUnordered[i];
        slotsUnordered[i].innerHTML = "";
    
        if(i % 3 == 2 && i != 0)
        {
            slots[slots.length] = row;
            row = [];
            console.log("new row");
        }
    }
    
    for(var i = 0; i < pieces.length; i++)
    {
        pieces[i].addEventListener('dragstart', handleDragStart, false);
        //pieces[i].addEventListener('dragenter', handleDragEnter, false);
        //pieces[i].addEventListener('dragover', handleDragOver, false);
        //pieces[i].addEventListener('dragleave', handleDragLeave, false);
        pieces[i].addEventListener('drop', handleDrop, false);
        pieces[i].addEventListener('dragend', handleDragEnd, false);
    }
    
    for(var i = 0; i < slotsUnordered.length; i++)
    {
        //pieces[i].addEventListener('dragstart', handleDragStart, false);
        slotsUnordered[i].addEventListener('dragenter', handleDragEnter, false);
        slotsUnordered[i].addEventListener('dragover', handleDragOver, false);
        slotsUnordered[i].addEventListener('dragleave', handleDragLeave, false);
        //pieces[i].addEventListener('drop', handleDrop, false);
        slotsUnordered[i].addEventListener('dragend', handleDragEnd, false);
        //.classList.add('over');
    }
    
    var newPiece = new Piece();
    pieces[pieces.length] = newPiece;
    slots[1][0].innerHTML = newPiece.GetDiv();
    newPiece.SetX(1);
    newPiece.SetY(0);
    
    var newPiece = new Piece();
    pieces[pieces.length] = newPiece;
    slots[1][2].innerHTML = newPiece.GetDiv();
    newPiece.SetX(1);
    newPiece.SetY(2);
}

/*
    <- 37
    ^  38
    -> 39
    d  40
*/


function processKey(e)
{
    console.log(String.fromCharCode(e.keyCode)+" --> "+e.keyCode);
    
    for(var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());   
    }
    
    var pieceMoved = true;
    
    // right
    if(e.keyCode == 39)
    {
        console.log("Pieces: " + pieces.length);
        
        while(pieceMoved)
        {
            pieceMoved = false;
            for(var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if(piece.GetY()+1 <= 2 &&
                   slots[piece.GetX()][piece.GetY()+1].innerHTML == "")
                {
                    slots[piece.GetX()][piece.GetY()+1].innerHTML = piece.GetDiv();
                    slots[piece.GetX()][piece.GetY()].innerHTML = "";

                    piece.SetY(piece.GetY() + 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }
    
    // left
    if(e.keyCode == 37)
    {
        console.log("Pieces: " + pieces.length);
        
        while(pieceMoved)
        {
            pieceMoved = false;
            for(var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if(piece.GetY()-1 >= 0 &&
                   slots[piece.GetX()][piece.GetY()-1].innerHTML == "")
                {
                    slots[piece.GetX()][piece.GetY()-1].innerHTML = piece.GetDiv();
                    slots[piece.GetX()][piece.GetY()].innerHTML = "";

                    piece.SetY(piece.GetY() - 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }
    
    // up
    if(e.keyCode == 38)
    {
        console.log("Pieces: " + pieces.length);
        
        while(pieceMoved)
        {
            pieceMoved = false;
            for(var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if(piece.GetX()-1 >= 0 &&
                   slots[piece.GetX()-1][piece.GetY()].innerHTML == "")
                {
                    slots[piece.GetX()-1][piece.GetY()].innerHTML = piece.GetDiv();
                    slots[piece.GetX()][piece.GetY()].innerHTML = "";

                    piece.SetX(piece.GetX() - 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }
    
    // down
    if(e.keyCode == 40)
    {
        console.log("Pieces: " + pieces.length);
        
        while(pieceMoved)
        {
            pieceMoved = false;
            for(var i = 0; i < pieces.length; i++)
            {
                var piece = pieces[i];

                if(piece.GetX()+1 <= 2 &&
                   slots[piece.GetX()+1][piece.GetY()].innerHTML == "")
                {
                    slots[piece.GetX()+1][piece.GetY()].innerHTML = piece.GetDiv();
                    slots[piece.GetX()][piece.GetY()].innerHTML = "";

                    piece.SetX(piece.GetX() + 1);
                    pieceMoved = true;
                    break;
                }
            }
        }
    }
    
    for(var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());   
    }
}

function handleDragStart(e) 
{
    this.style.opacity = '0.4';  // this / e.target is the source node.
    dragSrcElement = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) 
{
    if (e.preventDefault) 
        e.preventDefault(); // Necessary. Allows us to drop.
    
    e.dataTransfer.dropEffect = 'move';  // visual feedback whats going to happen on drop
    return false;
}

function handleDragEnter(e) 
{
    this.classList.add('over');
}

function handleDragLeave(e) 
{
    this.classList.remove('over');  // this / e.target is previous target element.
}

function handleDrop(e) 
{
    if (e.stopPropagation)
        e.stopPropagation(); // stops the browser from redirecting.

    if(dragSrcElement != this)
    {
        //dragSrcElement.innerHTML = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
        var result = parseInt(dragSrcElement.dataset.value) + parseInt(this.dataset.value);
        
        this.innerHTML = result;
        this.dataset.value = result;
    }
    
    // See the section on the DataTransfer object.
    return false;
}

function handleDragEnd(e) 
{
    this.style.opacity = '1.0';
    
    for(var i = 0; i < pieces.length; i++)
    {
        pieces[i].classList.remove('over');
    }
}