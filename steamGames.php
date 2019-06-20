<?php
$gameLibraryRetrieve = file_get_contents("http://thewheelhaus.com/cache/games/{$_SESSION['T2SteamID64']}.json");
$gameLibraryDecode   = json_decode($gameLibraryRetrieve, true);
$games               = $gameLibraryDecode['response']['games'];
if (is_array($games)) {
    $i = 1;
    shuffle($games);
    foreach ($games as $gamesList) {
        echo " 
                   
       
         <li><img id=clipPolygon src=http://cdn.akamai.steamstatic.com/steam/apps/" . $gamesList['appid'] . "/" . "header.jpg?t=" . $gamesList['img_logo_url'] . " alt= width=218 height=210px /><a class=gameName> " . $gamesList['name'] . "</a><a class=appID> " . $gamesList['appid'] . "</a></li>";
        if ($i++ == 8)
            break;
    }
}
?>