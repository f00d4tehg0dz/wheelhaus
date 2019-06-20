<?php

$theappID         = '';
$url              = $_POST['appIDString'];
$theappID         = $_POST['removeWhiteSpace'];
// $url = "http://store.steampowered.com/api/appdetails?appids=57690";
$gameInfoRetrieve = file_get_contents("$url");
$gameInfoDecode   = json_decode($gameInfoRetrieve, true);
$gameInfo         = $gameInfoDecode[$theappID];

if (is_array($gameInfo)) {
    
    // shuffle($gameInfo);
    foreach ($gameInfo as $gameList) {
        //    echo " 
        // <li><div class=gameDescription> " . $gameList['detailed_description'] . "</div></li>";
        echo "<div class=gameInfo>" . $gameList['about_the_game'] . "</div>";
        
    }
    
}
?>