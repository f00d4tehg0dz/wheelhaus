//load at first
function reset()
{
    $('.gameID').hide();
    $('.appID').hide();
    $('.launchGame').hide();
    $('.gameName').hide();
    $('.gameNamePlayTime').hide();
    $('a.gameNamePlayTime').hide();
    $('.gameNameSelectedPlayTime').hide();
    $('.gameNameSelected').hide();
}
reset();
$(".loginInfo").prependTo(".steamParts");
$('.steamHeight').css("height", $(document).height() - 200);
if ($('.signIn:contains("Logout")').length > 0)
{
    $('.signIn').hide();
    $('.signOut').show();
    $('.loginInfo').show();
}
else
{
    $('.signOut').hide();
    $('.signIn').show();
    $('.loginInfo').hide();
};

function playSound(el, soundfile)
    {
        if (el.mp3)
        {
            if (el.mp3.paused) el.mp3.play();
            else el.mp3.pause();
        }
        else
        {
            el.mp3 = new Audio(soundfile);
            el.mp3.play();
        }
    }
    //random
var _target, _deg = 0;

function ordSequential()
{
    return _deg = _deg + (45 * 3) + 1080;
};
var firstLoad = 0;
jQuery(document).ready(function($)
{
    $(".skills-wheelbtn").on("click", function(e)
    {
        if (firstLoad == 1)
        {
            preLoad();
        }
        else
        {
            spinWheel();
            firstLoad = 1;
            e.preventDefault();
        }

        function preLoad()
        {
            var url = 'usergames.php';
            $('.skills-wheel').load(url + ' .wheel');
            $(".skills-wheelbtn").text("Loading");
            var jqxhr = $.get("usergames.php", function()
            {
                if ($(".skills-wheelbtn").text() == "Loading")
                {}
                spinWheel();
            }).done(function()
            {
                // alert( "second success" );
            }).fail(function()
            {
                // alert( "error" );
            }).always(function()
            {
                // alert( "finished" );
            });
            jqxhr.always(function() {});
        }

        function spinWheel()
        {
            if ($('#audioBtn:contains("Turn Audio On")').length)
            {}
            else
            {
                playSound(this, './music/thewheelhausaudio.mp3');
            };
            // select algorithm sequential, random or preset :
            ordSequential();
            _target = (_deg - (360 * parseInt(_deg / 360))) / 45;
            // start animation
            // reset opacity of all segments to 1
            $(".gameName").parent("li").velocity(
            {
                opacity: 1
            },
            {
                duration: 0,
                complete: function()
                    {
                        $(".skills-wheelbtn").text("Spinning");
                        $(".wheel").velocity(
                        {
                            rotateZ: "-" + _deg + "deg"
                        },
                        {
                            duration: 4000,
                            complete: function(elements)
                                {
                                    // after spinning animation is completed, set opacity of target segment's parent
                                    $(".gameName").parent("li").eq(_target).velocity(
                                    {
                                        opacity: 0.4
                                    },
                                    {
                                        duration: 100,
                                        // after opacity is completed, fire targeted segment in fancybox
                                        complete: function()
                                            {
                                                $('.steamContent').addClass('reveal');
                                                $(".gameName").eq(_target).trigger("click");
                                                // $(".appID").eq(_target).show();
                                                var appIDtext = $(".appID").eq(_target).text();
                                                var gameNametext = $(".gameName").eq(_target).text();
                                                var gameNameplaytime = $(".gameNamePlayTime").eq(_target).text();
                                                var appIDscaled = appIDtext.replace(/\s/g, '');
                                                $('.gameNameSelected').text(gameNametext);
                                                $('.gameNameSelected').show();
                                                // take appID and add to url to retrieve game info
                                                var storeUrl = "http://store.steampowered.com/api/appdetails?";
                                                //credit to this http://jsfiddle.net/bYMVw/
                                                function addQSParm(name, value)
                                                {
                                                    var re = new RegExp("([?&]" + name + "=)[^&]+", "");

                                                    function add(sep)
                                                    {
                                                        storeUrl += sep + name + "=" + value;
                                                    }

                                                    function change()
                                                    {
                                                        storeUrl = storeUrl.replace(re, "$1" + value);
                                                    }
                                                    if (storeUrl.indexOf("?") === -1)
                                                    {
                                                        add("");
                                                    }
                                                    else
                                                    {
                                                        if (re.test(storeUrl))
                                                        {
                                                            change();
                                                        }
                                                        else
                                                        {
                                                            add("");
                                                        }
                                                    }
                                                }
                                                var removeWhiteSpace = $(".appID").eq(_target).text().replace(/ /g, '');
                                                addQSParm("appids", removeWhiteSpace);
                                                var appIDString = storeUrl;
                                                $.ajax(
                                                {
                                                    method: "POST",
                                                    url: "gameInfo.php",
                                                    // data: json,
                                                    data: "{'appIDString', 'removeWhiteSpace'}",
                                                    success: function(data)
                                                    {
                                                        // alert(data);
                                                        $('#gameInfos').html(data);
                                                        ($("#gameInfos").append("<h1 id=gameInfosTitle>Game Info</h1>"));
                                                        $("#gameInfos").text(function(index, currentText)
                                                        {
                                                            return currentText.substr(0, 575);
                                                        });
                                                    }
                                                });
                                                //  if allgames don't show below
                                                $('.gameNameSelectedPlayTime').append(gameNameplaytime);
                                                $('.gameNameSelectedPlayTime').append(' hours!');
                                                $('.gameNameSelectedPlayTime').show();
                                                // end
                                                $('.launchGame').show();
                                                $(".skills-wheelbtn").text("Spin");
                                                $('.launchGame').on("click", function(e)
                                                {
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
    }); // click
}); // ready