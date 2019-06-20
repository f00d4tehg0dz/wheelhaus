//* === Global Scripts === *//

$("#audioBtn").click(function() {
        var e = $("span", this).text(function(e, a) {
            return "Turn Audio On" === a ? "Turn Audio Off" : "Turn Audio On"
        });
           "Turn Audio Off" == e.text() ? "Turn Audio On" : "Turn Audio Off"
 });     
