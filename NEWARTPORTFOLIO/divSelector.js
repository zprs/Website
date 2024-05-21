function DivSelector(containerIdentifier)
{
    this.containerIdentifier = containerIdentifier;

    //Variable Declirations
    this.elementsOnScreen = 500;
    this.onScreenDivs = [];
    this.divPrefabs = [];
    this.positions = [];
    this.scales = [];


    this.destroy = function()
    {
        var children = $(this.containerIdentifier).children();

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            $(child).hide();
        }
    }

    this.spawn = function(rebuild)
    {
        var children = $(this.containerIdentifier).children();
        var width =  $(this.containerIdentifier).width();
        var edgePadding = 0;
        
        this.elementsOnScreen = children.length;

        // Store the divs as prefabs for future appending
        if(!rebuild)
        {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                this.divPrefabs.push($(child)[0].outerHTML);
            }
        }
        
        var childWidth = $(children[0]).width();
        
        //Set this.positions manually
        var offScreenLeftPosition = -1 * childWidth;
        
        //These need to change depending on how many things there are
        var furthestLeftOnScreenPos = -1 * childWidth / 2;
        var furthestRightOnScreenPos = width - childWidth / 2;
        var middlePosition = width / 2 - childWidth / 2;

        var offScreenRightPosition = width;

        this.positions = [offScreenLeftPosition, furthestLeftOnScreenPos, middlePosition, furthestRightOnScreenPos, offScreenRightPosition];


        //Set the scales for each position
        for (let i = 0; i < this.positions.length; i++) {

            var posX = this.positions[i];

            var centerX = posX + childWidth / 2;
            var ceterPos = width / 2;
            var distanceToCenter = Math.abs(ceterPos - centerX)
            var furthestDistance = width / 2 + childWidth + edgePadding;
            var scale = (furthestDistance - distanceToCenter) / furthestDistance * 1.2;
            this.scales.push(scale);
        }

        //chear the inside of the container div
        $(this.containerIdentifier).html("");

        // Add back the on screen divs and,
        // set the positions of these new elements

        for (let i = 0; i < this.elementsOnScreen; i++) {
            const childPrefab = this.divPrefabs[i];
            
            $(this.containerIdentifier).append(childPrefab);
            var child = $($(this.containerIdentifier).children()[i]);

            child.show();
            this.onScreenDivs.push({html: child, posIndex: i + 1, divIndex: i});

            var scale = this.scales[i + 1];
            var pos = this.positions[i + 1];

            child.css("transform", `scale(${scale}, ${scale})`);
            child.css("left", pos + "px");
            child.css("opacity", scale * scale);

            if(i == 1)
                $(child).css("z-index", 1);
            else
                $(child).css("z-index", 0);
        }

        return this.onScreenDivs[1].divIndex;
    }

    this.rollOverIncriment = function(a, max)
    {
        return (a + 1) % (max + 1);
    }

    this.rollOverDecrement = function(a, max)
    {
        if(a - 1 >= 0)
            return a - 1;
        else
            return max - ((a - 1) % max) - 1;
    }

    this.nextDiv = function(dir)
    {
        //dir == true -> to the right
        //dir == false -> to the left
        
        var incomingDivIndex;

        //Gets the prefab index of the div that is going to come on the screen
        // If the divs go right the left most - 1 will be the index
        // If the divs go left the right most + 1 will be the index
        if(dir)
        {
            var furthestLeftIndex = this.onScreenDivs[0].divIndex;
            incomingDivIndex = this.rollOverDecrement(furthestLeftIndex, this.divPrefabs.length - 1);
        }
        else
        {
            var furthestRightIndex = this.onScreenDivs[this.elementsOnScreen - 1].divIndex;
            incomingDivIndex = this.rollOverIncriment(furthestRightIndex, this.divPrefabs.length - 1);
        }

        //Append or prepend a new div comming in from off screen
        var incomingDiv;

        if(dir)
        {
            $(this.containerIdentifier).prepend(this.divPrefabs[incomingDivIndex]);
            incomingDiv = $($(this.containerIdentifier).children()[0]);
        }
        else
        {
            $(this.containerIdentifier).append(this.divPrefabs[incomingDivIndex]);
            var childs = $($(this.containerIdentifier).children());
            incomingDiv = childs[childs.length - 1];
        }

            
        var newDivPositionIndex = dir ? 0: this.elementsOnScreen + 1;
        var newDivIndex = dir ? 0: this.onScreenDivs.length;

        //Append or prepend a new div comming in from off screen and set its position
        $(incomingDiv).css("left", this.positions[newDivPositionIndex] + "px");
        $(incomingDiv).css("transform", `scale(${this.scales[newDivPositionIndex]}, ${this.scales[newDivPositionIndex]})`);
        $(incomingDiv).css("transition", 'all 0s');

        setTimeout(() => $(incomingDiv).css("transition", 'left .5s, transform .5s, opacity .5s'), 0);

        var newDivObject = {html: incomingDiv, posIndex: newDivPositionIndex, divIndex: incomingDivIndex};

        if(dir)
            this.onScreenDivs.unshift(newDivObject);
        else
            this.onScreenDivs.push(newDivObject);
        
        //Loop through each of these divs and move them one position
        for (let i = 0; i < this.onScreenDivs.length; i++) {
            const slide = this.onScreenDivs[i];

            //Shift every index by one
            if(dir)
                slide.posIndex++;
            else
                slide.posIndex--;
        }

        if(dir)
            setTimeout(() => this.setDivStyles(this.onScreenDivs[newDivIndex]), 20);
        else
            setTimeout(() => this.setDivStyles(this.onScreenDivs[newDivIndex - 1]), 20);

        for (let i = 0; i < this.onScreenDivs.length; i++) {
            const slide = this.onScreenDivs[i];

            if(i != newDivIndex)
            this.setDivStyles(slide);
        }

        //Remove the div that is off screen from both the document and the this.onScreenDivs obejct
        var length = Object.keys(this.onScreenDivs).length;

        if(dir)
        {
            var div = this.onScreenDivs[length - 1];
            setTimeout(() => $(div.html).remove(), 1000);
            this.onScreenDivs.splice(length - 1, 1);
        }
        else
        {
            var div = this.onScreenDivs[0];
            setTimeout(() => $(div.html).remove(), 1000);
            this.onScreenDivs.splice(0, 1);
        }

        return this.onScreenDivs[1].divIndex;
    }

    this.setDivStyles = function(slide)
    {
        // Set the new this.positions and this.scales based on the new pos indexes
        if(slide.posIndex == 2)
            $(slide.html).css("z-index", 2);
        else
            $(slide.html).css("z-index", 0);

        var pos = this.positions[slide.posIndex];
        var scale = this.scales[slide.posIndex];

        $(slide.html).css("left", pos + "px");
        $(slide.html).css("transform", `scale(${scale}, ${scale})`);
        $(slide.html).css("opacity", scale * scale);
    }

}

var divSelector = new DivSelector("#divSelectorContainer");
divSelector.spawn();

function divSelectorRight()
{
    divSelector.nextDiv(true);
}

function divSelectorLeft()
{
    divSelector.nextDiv(false);
}
