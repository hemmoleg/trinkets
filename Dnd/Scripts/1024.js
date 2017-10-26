var slotsUnordered = [];
var slots = [];
var pieces = [];
var dragSrcElement = null;

function Piece(initVal)
{
    var Div = "<div class='piece'>"+initVal+"</div>";
    var x;
    var y;
    var value = initVal;
    
    this.GetX = function(){return x;}
    this.SetX = function(val){x = val;}
    
    this.GetY = function(){return y;}
    this.SetY = function(val){y = val;}
    
    this.GetDivInit = function(){return "<div class='piece newPieceAnim'>"+initVal+"</div>"}
    this.GetDiv = function(){return Div;}
    
    this.GetValue = function(){return value;}
    this.SetValue = function(val){value = val;}
    this.SquareValue = function(){value = parseInt(value)+parseInt(value);
                                  Div = "<div class='piece'>"+value+"</div>";}
}

window.onload = function ()
{
    document.body.addEventListener("keydown", processKey);
    
    slotsUnordered = document.querySelectorAll('.slot');
    
    var row = [];
    for(var i = 0; i < slotsUnordered.length; i++)
    {
        console.log("slot " + i);
        row[i % 4] = slotsUnordered[i];
        slotsUnordered[i].innerHTML = "";
    
        if(i % 4 == 3 && i != 0)
        {
            slots[slots.length] = row;
            row = [];
            console.log("new row");
        }
    }
    
    document.getElementById("btnReset").onclick = reset;
    
    initDefaultSetup();
    
    //initDebugingSetup();
}

function initDefaultSetup()
{
    for(var i = 0; i < 2; i++)
    {
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
    
    var newPiece = new Piece(2);
    pieces[pieces.length] = newPiece;
    slots[1][3].innerHTML = newPiece.GetDiv();
    newPiece.SetX(1);
    newPiece.SetY(3);
    
    var newPiece = new Piece(4);
    pieces[pieces.length] = newPiece;
    slots[3][3].innerHTML = newPiece.GetDiv();
    newPiece.SetX(3);
    newPiece.SetY(3);
    
    var newPiece = new Piece(8);
    pieces[pieces.length] = newPiece;
    slots[0][3].innerHTML = newPiece.GetDiv();
    newPiece.SetX(0);
    newPiece.SetY(3);
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
    
    if(e.keyCode != 37 && e.keyCode != 38 && e.keyCode != 39 &&
       e.keyCode != 40)
        return;
    
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

                if(piece.GetY()+1 <= 3 &&
                   slots[piece.GetX()][piece.GetY()+1].innerHTML == "")
                {
                    movePiece(piece.GetX(),piece.GetY(),piece.GetX(),piece.GetY()+1);
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
                    movePiece(piece.GetX(),piece.GetY(),piece.GetX(),piece.GetY()-1);
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
                    movePiece(piece.GetX(),piece.GetY(),piece.GetX()-1,piece.GetY());
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

                if(piece.GetX()+1 <= 3 &&
                   slots[piece.GetX()+1][piece.GetY()].innerHTML == "")
                {
                    movePiece(piece.GetX(),piece.GetY(),piece.GetX()+1,piece.GetY());
                    pieceMoved = true;
                    break;
                }
            }
        }
    }
    
    checkMerge(e);
    
    for(var i = 0; i < pieces.length; i++)
    {
        console.log("Piece: " + i + " x: " + pieces[i].GetX() + " y: " + pieces[i].GetY());   
    }
}

function checkMerge(e)
{
    var keepMoving = false;
    //check piece left
    if(e.keyCode == 39)
    {
        for(var i = 0; i < pieces.length; i++)
        {
            var piece = pieces[i];

            if(piece.GetY()-1 >= 0 &&
               slots[piece.GetX()][piece.GetY()-1].innerHTML != "" &&
               getPieceByCoords(piece.GetX(), piece.GetY()-1).GetValue() == piece.GetValue()
              )
            {
                mergePieces(piece.GetX(), piece.GetY()-1, piece.GetX(), piece.GetY());
                keepMoving = true;
            }
        }
    }
    
    //check piece right
    if(e.keyCode == 37)
    {
        for(var i = 0; i < pieces.length; i++)
        {
            var piece = pieces[i];

            if(piece.GetY()+1 <= 3 &&
               slots[piece.GetX()][piece.GetY()+1].innerHTML != "" &&
               getPieceByCoords(piece.GetX(), piece.GetY()+1).GetValue() == piece.GetValue()
              )
            {
                mergePieces(piece.GetX(), piece.GetY()+1, piece.GetX(), piece.GetY());
                keepMoving = true;
            }
        }
    }
    
    // check piece down
    if(e.keyCode == 38)
    {
       for(var i = 0; i < pieces.length; i++)
       {
           var piece = pieces[i];
           
           if(piece.GetX()+1 <= 3 &&
              slots[piece.GetX()+1][piece.GetY()].innerHTML != "" &&
              getPieceByCoords(piece.GetX()+1, piece.GetY()).GetValue() == piece.GetValue()
              )
           {
               mergePieces(piece.GetX()+1, piece.GetY(), piece.GetX(), piece.GetY());
               keepMoving = true;
           }
       }
    }
    
    // check piece up
    if(e.keyCode == 40)
    {
       for(var i = 0; i < pieces.length; i++)
       {
           var piece = pieces[i];
           
           if(piece.GetX()-1 >= 0 &&
              slots[piece.GetX()-1][piece.GetY()].innerHTML != "" &&
              getPieceByCoords(piece.GetX()-1, piece.GetY()).GetValue() == piece.GetValue()
              )
           {
               mergePieces(piece.GetX()-1, piece.GetY(), piece.GetX(), piece.GetY());
               keepMoving = true;
           }
       }
    }
    
    if(keepMoving) 
        processKey(e);
    else
        addRandomPiece()
}

function addRandomPiece()
{
    do{
        var x = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
        var y = Math.floor(Math.random() * (3 - 0 + 1)) + 0;
    }while(getPieceByCoords(x,y)!=null);

    var newPiece = new Piece(1);
    pieces[pieces.length] = newPiece;
    slots[x][y].innerHTML = newPiece.GetDivInit();
    newPiece.SetX(x);
    newPiece.SetY(y);
}

function movePiece(x1, y1, x2, y2)
{
    var piece = getPieceByCoords(x1,y1);
    slots[x2][y2].innerHTML = piece.GetDiv();
    slots[x1][y1].innerHTML = "";

    piece.SetX(x2);
    piece.SetY(y2);
}

//xy1 = coords for piece to remove
//xy2 = coords for resulting piece
function mergePieces(x1, y1, x2, y2)
{
    removePieceByCoords(x1, y1);
    slots[x1][y1].innerHTML = "";
    getPieceByCoords(x2, y2).SquareValue();
    slots[x2][y2].innerHTML = getPieceByCoords(x2, y2).GetDiv();
}

function removePieceByCoords(x, y)
{
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].GetX() == x && pieces[i].GetY() == y)
        {
            pieces.splice(i, 1);
            return;
        }
    }
}

function getPieceByCoords(x, y)
{
    for(var i = 0; i < pieces.length; i++)
    {
        if(pieces[i].GetX() == x && pieces[i].GetY() == y)
        {
            return pieces[i];
        }
    }
}

function reset()
{
    for(var i = 0; i < slotsUnordered.length; i++)
    {
        slotsUnordered[i].innerHTML = "";
    }
    pieces = [];
    initDefaultSetup();
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