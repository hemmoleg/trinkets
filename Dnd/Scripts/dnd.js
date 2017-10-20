var slotsUnordered = [];
var slots = [];
var pieces = []; 
var dragSrcElement = null;

window.onload = function () 
{   
    slotsUnordered = document.querySelectorAll('.slot');
    pieces = document.querySelectorAll('.piece');
    
    var row = [];
    for(var i = 0; i < slotsUnordered.length; i++)
    {
        console.log("slot " + i);
        row[i % 3] = slotsUnordered[i];
    
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
    
    document.body.addEventListener("keydown", processKey); 

    slots[0][1].querySelector(".piece").style.visibility = "hidden";
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
    if(e.keyCode == 39)
    {
        for(i = 0; i < slots.length; i++)
        {
            for(j = 0; j < slots[i].length; j++)
            {
                if(slots[i][j+1] != null && slots[i][j+1].querySelector(".piece").style.visibility == "hidden")
                {
                    slots[i][j+1].innerHTML == slots[i][j];
                }
            }
        }
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