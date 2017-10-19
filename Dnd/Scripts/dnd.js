var slots = [];
var pieces = [];
var dragSrcElement = null;

window.onload = function () 
{   
    pieces = document.querySelectorAll('.piece');
    
    for(var i = 0; i < pieces.length; i++)
    {
        pieces[i].addEventListener('dragstart', handleDragStart, false);
        //pieces[i].addEventListener('dragenter', handleDragEnter, false);
        //pieces[i].addEventListener('dragover', handleDragOver, false);
        //pieces[i].addEventListener('dragleave', handleDragLeave, false);
        pieces[i].addEventListener('drop', handleDrop, false);
        pieces[i].addEventListener('dragend', handleDragEnd, false);
    }
    
    slots = document.querySelectorAll('.slot');
    
    for(var i = 0; i < slots.length; i++)
    {
        //pieces[i].addEventListener('dragstart', handleDragStart, false);
        slots[i].addEventListener('dragenter', handleDragEnter, false);
        slots[i].addEventListener('dragover', handleDragOver, false);
        slots[i].addEventListener('dragleave', handleDragLeave, false);
        //pieces[i].addEventListener('drop', handleDrop, false);
        slots[i].addEventListener('dragend', handleDragEnd, false);
        //.classList.add('over');
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