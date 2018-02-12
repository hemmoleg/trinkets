window.onload = function () 
{
    //http://jsfiddle.net/mBKP4/2/ Raphael 2.1.0
    
    var createCircle = function (step, posX, posY, radius) 
    {
        var paper = Raphael("R", 500, 500);
        for (var i = 0; i < 360; i = i + step) 
        {
            //var transformString = 'r'+i.toString + ' 100,100';
            var currentRect = paper.rect(posX + radius, posY, 2, 20);
            currentRect.attr({
                'fill': '#ffffff'
                , stroke: 0
            });
            currentRect.rotate(i, posX + radius, posY + radius);
        }
    }
    
    createCircle(3,50,50,94);
}