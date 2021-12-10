var websiteIndex = 0;

function nextWebsite(direction){
    
    $("#websiteStatic").show();
    websiteIndex = nextContent("webContent", "websiteCaptions", websiteIndex, 4, direction);
    $(".slideShowSwitchers").prop('disabled', true);
    
    //Space Base Image
    if(websiteIndex == 0)
        centerSpaceBaseImage();

    setTimeout(() => $(".slideShowSwitchers").prop('disabled', false), 500);
    setTimeout(() => $("#websiteStatic").hide(), 150);
}

$('.webWindowContent').on("load", function() {
    setTimeout(() => $("#websiteStatic").hide(), 150);
});

