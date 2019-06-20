<?php
include "apikey.php";
include "openid.php";
$OpenID = new LightOpenID("http://thewheelhaus.com/");
session_start();
if (!$OpenID->mode) {
    if (isset($_GET['login'])) {
        $OpenID->identity = "http://www.steamcommunity.com/openid";
        header("Location: {$OpenID->authUrl()}");
    }
    if (!isset($_SESSION['T2SteamAuth'])) {
        //$login = "<div id=\"login\">Welcome Guest. Please <a href=\"?login\"><img src=\"http://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_small.png\"/></a> to *Website Action*.</div>";
        $login = "<a href=\"?login\"><img src=\"http://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_small.png\"/></a>";
    }
} elseif ($OpenID->mode == "cancel") {
    echo " User has cancelled Authenticiation.";
} else {
    if (!isset($_SESSION['T2SteamAuth'])) {
        $_SESSION['T2SteamAuth'] = $OpenID->validate() ? $OpenID->identity : null;
        $_SESSION['T2SteamID64'] = str_replace("http://steamcommunity.com/openid/id/", "", $_SESSION['T2SteamAuth']);
        if ($_SESSION['T2SteamAuth'] !== null) {
            $Steam64 = str_replace("http://steamcommunity.com/openid/id/", "", $_SESSION['T2SteamAuth']);
            $profile = file_get_contents("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={$apikey}&steamids={$Steam64}");
            $buffer  = fopen("cache/{$Steam64}.json", "w+");
            fwrite($buffer, $profile);
            fclose($buffer);
            $steamLibrary = file_get_contents("http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001?key={$apikey}&steamid={$Steam64}&include_appinfo=1&include_played_free_games=1");
            $buffer       = fopen("cache/games/{$Steam64}.json", "w+");
            fwrite($buffer, $steamLibrary);
            fclose($buffer);
        }
        header("Location: usergames.php");
    }
}
if (isset($_SESSION['T2SteamAuth'])) {
    $login = "<div id=\"login\"><a href=\"?logout\">Logout</a></div>";
    $steam = json_decode(file_get_contents("http://www.thewheelhaus.com/cache/{$_SESSION['T2SteamID64']}.json"));
    echo "<a class=loginInfo href=\"{$steam->response->players[0]->profileurl}\"><img src=\"{$steam->response->players[0]->avatarfull}\"/></a>";
}
if (isset($_GET['logout'])) {
    unset($_SESSION['T2SteamAuth']);
    unset($_SESSION['T2SteamID64']);
    header("Location: index.php");
}
?>