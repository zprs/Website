var srcIndex = 0;
var sources = ["http://space-base.io", "https://zprs-tetris99.glitch.me", "https://zacharyrichards.com/COVID-19_Data/index.html"]

function nextWebsite(next){
    
    var newSrcIndex;

    if(next)
        newSrcIndex = (srcIndex + 1) % sources.length;
    else
        {
            if(srcIndex == 0)
                newSrcIndex = sources.length - 1;
            else
                newSrcIndex = srcIndex - 1;
        }
        
    var newSrc = sources[newSrcIndex];

    console.log(newSrc)

    $("#websiteStatic").show();
    $(".slideShowSwitchers").prop('disabled', true);
    
    var captions = $("#websiteCaptions").children().toArray();

    for (let i = 0; i < captions.length; i++) {
        const caption = captions[i];

        if(i == newSrcIndex)
            $(caption).show();
        else
            $(caption).hide();
    }
    
    setTimeout(() => $(".slideShowSwitchers").prop('disabled', false), 1500);
    $("#webWindowContent").attr("src", newSrc);

    srcIndex = newSrcIndex;
}

$('#webWindowContent').on("load", function() {
    setTimeout(() => $("#websiteStatic").hide(), 150);
});