(function() {
    var mPages = $('#content');
    var mHeader = $('header');
    var index = 0;
    
    var slides = $('#slide-imgs img');
    var slidesWidth = slides.length * slides.outerWidth() + 100;
    var slideImgs = $('#slide-imgs');
   slideImgs.width(slidesWidth);

    var gogo = function() {
        mPages.css('top', '-' + index + '00%');

        if (index === 0) {
            $('#sea').css('opacity', 0);
            mHeader.addClass('expand-h');
        } else {
            $('#sea').css('opacity', 1);
            mHeader.removeClass('expand-h');
        }
        if (index === 4){
            $('#next').css('opacity', 0);
        }  else {
            $('#next').css('opacity', 1);
        }
    };
    var goNext = function(e) {
        if (index == 4) {
            return;
        }
        index++;
        gogo();
    };
    var goPrev = function(e) {
        if (index == 0) {
            return;
        }
        index--;
        gogo();
    };
    
    $('#next img').click(goNext);
    
    
    var slideOffset = 0;    
    setInterval(function() {
        slideImgs.css('margin-left', slideOffset);
        slideOffset = slideOffset - 1;
        if(0 - slideOffset > slidesWidth) {
            slideOffset = 0;
        }
    }, 50);

    $('.page-link').click(function(e) {
        var ele = $(e.currentTarget);
        index = ele.data('index');
        gogo();
        e.preventDefault();
    });
    
    $(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
        event.preventDefault();
        var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
        init_scroll(event, delta);
    });

    var lastAnimation = 0;
    function init_scroll(event, delta) {
        var deltaOfInterest = delta;
        var timeNow = new Date().getTime();
        // Cancel scroll if currently animating or within quiet period
        if(timeNow - lastAnimation < 1000) {
            event.preventDefault();
            return;
        }        
        if (deltaOfInterest < 0) {
            goNext();
        } else {
            goPrev();
        }
        lastAnimation = timeNow;
    }
    $(document).keydown(function(e) {
        var tag = e.target.tagName.toLowerCase();
        switch(e.which) {
        case 38:
            if (tag != 'input' && tag != 'textarea') goPrev();
            break;
        case 40:
            if (tag != 'input' && tag != 'textarea') goNext();
            break;
        case 32: //spacebar
            if (tag != 'input' && tag != 'textarea') goNext();
            break;
        default: return;
        }
    });
})();
