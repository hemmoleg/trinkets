var slotsUnordered = [];
var pieces = [];
var counter = 0;
var id;
var amountOfPixels = 2000;

function Piece(val)
{
    var currR;
    var currG;
    var currB;
    
    var incR;
    var incG;
    var incB;
    
    var targetR;
    var targetG;
    var targetB;
    
    var id;
    var x = 0;
    
    var slot = val;
    
    this.SetTargetR = function(val){targetR = val; incR = (targetR - currR) / 100; }
    this.SetTargetG = function(val){targetG = val; incG = (targetG - currG) / 100; }
    this.SetTargetB = function(val){targetB = val; incB = (targetB - currB) / 100; }

    this.GetTargetR = function(){return targetR;}
    this.GetTargetG = function(){return targetG;}
    this.GetTargetB = function(){return targetB;}

    this.SetSlot = function(val){slot = val;}
    this.GetSlot = function(){return slot;}

    this.SetColor = function(r,g,b)
    {
        slot.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
    }
    
    this.Start = function()
    {
        currR = Math.floor(Math.random() * (255 + 1));
        currG = Math.floor(Math.random() * (255 + 1));
        currB = Math.floor(Math.random() * (255 + 1));
    }
    
    this.InitRandom = function()
    {
        this.SetTargetR(Math.floor(Math.random() * (255 + 1)));
        this.SetTargetG(Math.floor(Math.random() * (255 + 1)));
        this.SetTargetB(Math.floor(Math.random() * (255 + 1)));
        
        //slot.innerHTML = targetR + " " + targetG + " " + targetB;
    }
    
    this.IncrementColor = function()
    {
        currR = Math.round(currR + incR);
        currG = Math.round(currG + incG);
        currB = Math.round(currB + incB);

        slot.style.backgroundColor = "rgb(" + currR + "," + currG + "," + currB + ")";

        x++;
    }
}

window.onload = function ()
{
    var board = document.getElementById('board');
    
    for(var i = 0; i < amountOfPixels; i++)
    {
        var div = document.createElement('div');
        div.className = 'slot';
        board.appendChild(div);
    }
    
    slotsUnordered = document.querySelectorAll('.slot');

    for(var i = 0; i < slotsUnordered.length; i++)
    {
        var slot = slotsUnordered[i];
        var p = new Piece(slot);
        p.Start();    
        pieces[pieces.length] = p;
    }
    
    console.log("pieces " + pieces.length);
    
    NewCycle();
}

function NewCycle()
{
    for(var i = 0; i < pieces.length; i++)
    {    
        pieces[i].InitRandom();
    }
    counter = 0;
    id = setInterval(iterate, 10);
    console.log("new cycle")
}

function iterate() 
{
    if (counter == 100) 
    {
        clearInterval(id);
        
        NewCycle();
        return;
    } 
    else 
    {
        for(var i = 0; i < pieces.length; i++)
        {
            pieces[i].IncrementColor();
        }
        counter++;
    }
}
