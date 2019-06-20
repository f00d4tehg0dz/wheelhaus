<?PHP
$APIKEY = XXXXXXXXXXXXXXXXXX
$api = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v1?key=$APIKEY&steamid=$STEAMID&include_appinfo=1&include_played_free_games=1";

$json = file_get_contents($api);

$schema = json_decode($json);

print var_dump($schema);

?>
