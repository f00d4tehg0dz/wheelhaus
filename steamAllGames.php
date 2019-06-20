<?php
include "apikey.php";
// session_start();
//     $steamLibrary  = file_get_contents("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001?key={$apikey}&steamid=76561198017902347&include_appinfo=1&include_played_free_games=1");
//     $buffer = fopen("cache/games/76561198017902347.json", "w+");
//     fwrite($buffer, $steamLibrary);
//     fclose($buffer);
$gameLibraryRetrieve = file_get_contents("http://thewheelhaus.com/cache/games/76561198017902347.json");
$gameLibraryDecode   = json_decode($gameLibraryRetrieve, true);
$games               = $gameLibraryDecode['response']['games'];
if (is_array($games)) {
    $i = 1;
    shuffle($games);
    foreach ($games as $gamesList) {
        echo " 
                   
          
       
         <li><img id=clipPolygon src=http://media.steampowered.com/steamcommunity/public/images/apps/" . $gamesList['appid'] . "/" . $gamesList['img_logo_url'] . ".jpg alt= width=218 height=78 /><a class=gameName> " . $gamesList['name'] . "</a><a class=appID> " . $gamesList['appid'] . "</a><a class=gameNamePlayTime>" . $gamesList['playtime_forever'] . "</a></li>";
        if ($i++ == 8)
            break;
    }
}
?>