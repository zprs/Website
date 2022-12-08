
let totalImages = 60;
let maxImages = 19;
let imageClass = "sketchImage"
let imagePath = "images/stickers/";
let imagesLoaded = 0;
let maxWidth = 200;
let minWidth = 150;

$(function() {


    for(let i = 1; i < totalImages + 1; i++)
    {

        let imageIndex = (maxImages + 1) - (i % maxImages + 1);
        let imageName = imageIndex;
        let rotation = -100 + 200 * Math.random();
        let imageHtml = `<img class="${imageClass}" src="${imagePath + imageIndex}.png" style="width:${maxWidth}px; transform: rotate(${rotation}deg);" onLoad="imageLoaded()">`
        $("body").append(imageHtml);
    }

    // $("img").one("load", function() {
    //     imageLoaded();
    //   }).each(function() {
    //     if(this.complete) {
    //         $(this).load(); // For jQuery < 3.0 
    //         // $(this).trigger('load'); // For jQuery >= 3.0 
    //     }
    //   });
});

function imageLoaded()
{
    imagesLoaded++;

    if(imagesLoaded == totalImages)
        reorderAllImages();
}

function reorderAllImages()
{

    console.log("Reordering images")

    let imageInPlace = [];

    let allImages = $("." + imageClass);


    allImages.each(function(){

        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;

        let repititions = 70;
        let counter = 0;
        do
        {
            let imgWidth = (((maxWidth - minWidth) * Math.random()) + minWidth) * ((repititions - counter / 2) / repititions);
            $(this).css({top: Math.random() * windowHeight, left: Math.random() * windowWidth, position:'absolute', width: imgWidth});
            counter++;
        } while(isOverlapping($(this)) && counter < repititions);

        if(counter >= repititions)
        {
            console.log("Too Many Itterations, Removing");
            $(this).remove()
        }


    });
}

function isOverlapping(img)
{
    let otherImages = $("." + imageClass + ", #logoTitle, .siteSelector, .siteSelectorText");
    let isOverlapping = false;



    otherImages.each(function(){
        if($(this).is($(img)))
            return;

        let rect1 = $(img)[0].getBoundingClientRect();
        let rect2 = $(this)[0].getBoundingClientRect();

        let overlap = !(rect1.right < rect2.left || 
            rect1.left > rect2.right || 
            rect1.bottom < rect2.top || 
            rect1.top > rect2.bottom)

        let offscreen = (rect1.right > window.innerWidth || rect1.bottom > window.innerHeight);

        if(overlap || offscreen)
            isOverlapping = true;
    });

    return isOverlapping;
}
