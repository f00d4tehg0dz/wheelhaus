
// *** Created by Adrian Chrysanthou *** //
// *** Additional Support by cmandersen88 ***//
// --- Init Variables ---//
reset();
// --- Load DropDowns Before Spin --- //
Category();
Genre();
// --- Reset Wheel --- //
function reset() {
 
    $('.gameImageCopy').children('img').removeClass('show');
    $('.gameImageCopy').children('img').addClass('hide');
    // $('.gameImageCopy').hide();
    $('.gameID').hide();
    $('.appID').hide();
    $('.launchGame').hide();
    $('.gameName').hide();
    $('.gameInfos').hide();
    $('.gameNamePlayTime').hide();
    $('a.gameNamePlayTime').hide();
    $('.gameNameSelectedPlayTime').hide();
    $('.gameNameSelected').hide();
    $('.gameNamePrice').hide();
    $('.gameNameSelectedPrice').hide();
    $('.gameNameSelectedRating').hide();
    $('.gameNameRating').hide();
    $('.appIDDescription').hide();
}
$('#gameWheel').css('background-image', 'none');
//$('.steamHeight').css("height", $(document).height() - 200);
// --- Sound --- //
function playSound(el, soundfile) {
    if (el.mp3) {
        if (el.mp3.paused) el.mp3.play();
        else el.mp3.pause();
    } else {
        el.mp3 = new Audio(soundfile);
        el.mp3.play();
    }
}
 
var _target, _deg = 0;
 
function ordSequential() {
    return _deg = _deg + (45 * 3) + 1080;
}
 
// --- Get Categories --- //
function Category() {
    $.ajax({
        url: 'https://steam.cma.dk/categories',
        method: 'get',
        success: function(catData) {
            $.each(catData, function(index, obj) {
                $('#category').append($('<option>', {
                    text: obj.name,
                    value: obj.id
                }));
            });
        }
    });
}
 
// --- Get Genres --- //
function Genre() {
    $.ajax({
        url: 'https://steam.cma.dk/genres',
        method: 'get',
        success: function(genreData) {
            $.each(genreData, function(index, obj) {
                $('#genre').append($('<option>', {
                    text: obj.name,
                    value: obj.id
                }));
            });
        }
    });
}
 
jQuery(document).ready(function($) {

	$(".skills-wheelbtn").on("click", function(e){
		WheelSpin();
	})
     function WheelSpin() {
        grabGames();
     
        function grabGames() {
              $( ".gameImageCopy" ).fadeOut( "slow", function() {
                 reset();
             });
            
            $(".skills-wheelbtn").text("Loading");
            // --- Genre and Category Selection --- //
            var genreID = $('#genre').val();
            var catID = $('#category :selected').val();
            var catText = $('#category :selected').text();
            // --- Figure out if Free is Checked --- //
            var freeID = $('#free').is(':checked') ? 1 : 0;
            // --- Figure our if Exclude VR is Checked --- //
            var vrID = $('#vr').is(':checked') ? 1 : 0;
            var dataSet = {
                limit: 8,
                random: 1,
                category: catID,
                genre: genreID,
                free: freeID,
                non_vr: vrID
            };
 
            // --- future Array --- //
            //  genre = [];
            // genre[0] = 'hi';
            // genre[1] = 'hello';
            //  data: {genre:info},
            $.ajax({
                url: 'https://steam.cma.dk/apps',
                method: 'get',
                data: dataSet,
                cache: false,
                success: function(data) {
                    $('.wheel').empty();
                    $.each(data, function(i, item) {
                        $('.wheel').append('<li><img id=clipPolygon style="background-image: url(' + item.image + ')";><a class=gameName>' + item.name + '</a><a class=appID>' + item.id + '</a><div class=appDescription>' + item.description + '</div><div class=gameNamePrice>' + item.price + '</div><div class=gameNameRating>' + item.score + '</div></li)>');
 
                    });
                    spinWheel();
                }
            });
        }
 		
        function spinWheel() {
 
            if ($('#audioBtn:contains("Turn Audio On")').length) {} else {
                playSound(this, './music/thewheelhausaudio.mp3');
            }
            ordSequential();
            _target = (_deg - (360 * parseInt(_deg / 360))) / 45;
            // start animation
            // reset opacity of all segments to 1
            $(".gameName").parent("li").velocity({
                opacity: 1
            }, {
                duration: 0,
                complete: function() {
                        $(".skills-wheelbtn").text("Spinning");
                        $(".wheel").velocity({
                            rotateZ: "-" + _deg + "deg"
                        }, {
                            duration: 4000,
                            complete: function(elements) {
                                    // after spinning animation is completed, set opacity of target segment's parent
                                    $(".gameName").parent("li").eq(_target).velocity({
                                        opacity: 0.4
                                    }, {
                                        duration: 100,
                                        // after opacity is completed, fire targeted segment in fancybox
                                        complete: function() {
                                                $('.steamContent').addClass('reveal');
                                                $(".gameName").eq(_target).trigger("click");
                                                // $(".appID").eq(_target).show();
                                                var appIDtext = $(".appID").eq(_target).text();
                                                var appIDDescription = $(".appDescription").eq(_target).text();
                                                     
                                                // take appID and add to url to retrieve game info
                                                var storeUrl = "https://steam.cma.dk/apps/";
                                                //credit to this http://jsfiddle.net/bYMVw/
                                                function addQSParm(name, value) {
                                                    var re = new RegExp("([?&]" + name + "=)[^&]+", "");
 
                                                    function add(sep) {
                                                        storeUrl += sep + name + "=" + value;
                                                    }
 
                                                    function change() {
                                                        storeUrl = storeUrl.replace(re, "$1" + value);
                                                    }
                                                    if (storeUrl.indexOf("?") === -1) {
                                                        add("");
                                                    } else {
                                                        if (re.test(storeUrl)) {
                                                            change();
                                                        } else {
                                                            add("");
                                                        }
                                                    }
                                                }
                                                var removeWhiteSpace = $(".appID").eq(_target).text().replace(/ /g, '');
                                                addQSParm("appids", removeWhiteSpace);
                                                var appIDString = storeUrl;
 
                                             	$('.steamContent').addClass('reveal');
                                                //copy the image for transitions
                                                 var $gameImageCopy = $(".gameName").parent("li").children("#clipPolygon").eq(_target).clone().appendTo( "#gameImageCopy" );
                                                 
                                                 $('.gameImageCopy').html($gameImageCopy);      
                                                 $('.gameImageCopy').children('img').removeAttr('id', 'clipPolygon');  
                                                 // to fix the image border 
                                                 $('.gameImageCopy').children('img').attr('src', 'http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif'); 
                                                 $('.gameImageCopy').children('img').attr('id', 'gameImageCopy');
                                    
 
                                                 $('.gameImageCopy').fadeIn();
                                                 $('.gameImageCopy').children('img').addClass('show')
                                               $(".appIDDescription").text(appIDDescription);
 
                                                $(".appIDDescription").text($(this).text().substr(0, 375)+'...');
                                                var gameNameRating = $(".gameNameRating").eq(_target).text();
                                                var gameNamePrice = $(".gameNamePrice").eq(_target).text();
 
                                                $(".gameNameSelectedRating").text('Meta Critic Rating:  ' +gameNameRating);
 
                                                $(".gameNameSelectedPrice").text('Game Price: ' +gameNamePrice);
 
                                                var gameNametext = $(".gameName").eq(_target).text();
                                                var gameNameplaytime = $(".gameNamePlayTime").eq(_target).text();
 
                                                var appIDscaled = appIDtext.replace(/\s/g, '');
 
                                                $('.appIDDescription').show();
                                                $('.gameNameSelectedPrice').show();
                                                $('.gameNameSelectedRating').show();
                                                $('.gameNameSelected').text(gameNametext);
                                                $('.gameNameSelected').show();
                                                $('.launchGame').show();
                                                $(".skills-wheelbtn").text("Spin");
                                                $('.launchGame').on("click", function(e) {
                                                    window.location.href = "steam://run/" + appIDscaled;
                                                });
                                            } // third animation completed
                                    }); // nested velocity 2
                                } // second animation completed
                        }); // nested velocity 1
                    } // first animation completed
            }); // velocity
            return false;
        }
    }; // click
}); // ready
