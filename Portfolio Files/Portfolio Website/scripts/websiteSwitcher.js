var websiteIndex = 0;

function nextWebsite(direction){
    
    centerSpaceBaseImage();

    $("#websiteStatic").show();
    websiteIndex = nextContent("webContent", "websiteCaptions", websiteIndex, 3, direction);
    $(".slideShowSwitchers").prop('disabled', true);
    
    setTimeout(() => $(".slideShowSwitchers").prop('disabled', false), 500);
    setTimeout(() => $("#websiteStatic").hide(), 150);
}

$('#webWindowContent').on("load", function() {
    setTimeout(() => $("#websiteStatic").hide(), 150);
});