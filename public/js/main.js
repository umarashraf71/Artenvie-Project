jQuery(document).ready(function(){

    "use strict";

    $('#slider-carousel').caroufredsel({
        responsive:true,
        width:'100%',
        circular:true,
        auto:true,
        scroll:
        {
            items:1,
            duratiom: 500,
            pauseOnHover:true
        },
        items:
        {
            visible:
            {
                min:1,
                max:1
            },
            height:"variable"
        },
        pagination:
        {
            container:".sliderpager",
            pageAnchorBuilder:false
        }
    });

    $(window).scroll(function(){
        var top = $(window).scrollTop();
        if(top >= 60)
        {
            $("header").addClass('secondary');
        }
        else
        {
            if($("header").hasClass('secondary'))
            {
                $("header").removeClass('secondary');
            }
        }
    });

});