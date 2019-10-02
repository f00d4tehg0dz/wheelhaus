<?php
include "header.php";
?>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="smoothScroll navbar-brand" href="http://www.thewheelhaus.com/">The Wheelhaus</a> <button aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation" class="navbar-toggler" data-target="#navbarNav" data-toggle="collapse" type="button"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav">
                <li class="nav-item active">
                    <a class="nav-link" href="#">All Games <span class="sr-only">(current)</span></a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="usergames.php">My Steam Library</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link smoothScroll" href="#steamFaq">FAQ</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="mailto:adrianvfx@gmail.com">Contact</a>
                </li>
            </ul>
        </div>
    </nav>
    <div class="jumbotron">
        <div class="container-fluid no-gutter">
            <div class="row">
                <div class="dropDownSelection col-md-3">
                    <h2>Filter</h2>
                       <select class="form-control selectpicker" id="category" name="category">
                            <option selected value="0">
                                Choose your Category
                            </option>
                        </select>
                        <select class="form-control selectpicker" id="genre" name="genre">
                            <option selected value="0">
                                Choose your Genre
                            </option>
                        </select>
                        <div class="form-check">
                            <label class="form-check-label free" for="free">
                            <input class="form-check-input" id="free" name="free" value="" type="checkbox">Include Free Games</label> 
                        </div>
                </div>
                <div class="col-md-6">
                    <div id="gameWheel">
                        <div class="gameImageCopy"><img class="gameImageCopy" id="gameImageCopy" src="http://upload.wikimedia.org/wikipedia/commons/c/ce/Transparent.gif"></div>
                        <div class="skills-wheel">
                            <ul class="wheel"></ul>
                        </div><a class="skills-wheelbtn" href="#/" title="spin">Spin</a>
                    </div>
                </div>
                <div class="col dropDownSelection col-md-3">
                    <h2>Controls</h2>
                    <div class="audioDiv">
                        <button class="" id="audioBtn"><span class="">Turn Off Audio</span></button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container-fluid no-gutter">
            <div class="col-md-12">
                <div class="steamContent">
                    <ul>
                        <li class="gameNameSelected"></li>
                            <div id="gameInfos">
                                <div class="appIDDescription"></div>
                                <div class="gameNameSelectedPrice"></div>
                                <div class="gameNameSelectedRating"></div>
                            </div>
                        <li class="gameNameSelectedPlayTime">You have played this game for</li>
                        <li style="list-style: none"><button class="launchGame">Launch the Game</button></li>
                    </ul>
                </div>
            </div>
            <div class="col-md-12">
                <div id="steamFaq">
                        <h1>Does this access every Steam Game?</h1>
                        <p>Yes, this list is updated on the fly (thanks to <a href="https://cma.dk" target="_blank">CMAndersen</a>), and includes all Steam Games + Free ones as well.</p>
                        <h1>Why do some Steam Games have no image?</h1>
                        <p>Certain games in the Steam library are missing the image ID. So you will have an empty spot</p>
                        <h1>Can I buy you a beer?</h1>
                        <p>Sure! Beer money is awesome</p>
                        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                            <input name="cmd" type="hidden" value="_s-xclick"> <input name="encrypted" type="hidden" value=
                            "-----BEGIN PKCS7-----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-----END PKCS7----- ">
                             <input alt="PayPal - The safer, easier way to pay online!" name="submit" src=
                            "https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" type="image"> <img alt="" border="0" height="1" src=
                            "https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1">
                        </form>
                        <p></p>
                        <h1>How can I contact you?</h1>
                        <p>You can email me at <a href="mailto:adrianvfx@gmail.com">adrianvfx@gmail.com</a></p>
                </div>
            </div>
        </div>
    <!-- /container -->
    <footer>
        <div class="container-fluid">
            <div class="col-md-12">
                <p>created by <a href="http://www.f00dplays.com" target="_blank">f00d</a> and steamAPI by <a href="https://cma.dk" target="_blank">CMAndersen</a>  powered by <a href="http://www.steampowered.com" target=
                "_blank">Steam, Praise Gaben</a> &copy; 2018</p>
            </div>
        </div>
    </footer>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"> </script> 
    <script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.5/jquery-ui.min.js"></script> 
   <!--  <script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha384-A7FZj7v+d/sdmMqp/nOQwliLvUsJfDHW+k9Omg/a/EheAdgtzNs3hpfag6Ed950n" crossorigin="anonymous"></script> -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tether/1.4.0/js/tether.min.js" integrity="sha384-DztdAPBWPRXSA/3eYEEUWrWCy7G5KFbe8fFjk5JAIxUYHKkDx6Qin1DkWx51bBrb" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-alpha.6/js/bootstrap.min.js" integrity="sha384-vBWWzlZJ8ea9aCX4pEW3rVHjgjt7zpkNpZk+02D9phzyeVkE+jo0ieGizqPLForn" crossorigin="anonymous"></script>
    <script src="js/velocity.min.js">
    </script> 
    <script src="js/smoothscroll.js">
    </script> 
    <script src="js/globalscripts.js">
    </script> 
    <script src="js/funhauswheel.js">
    </script>
</body>
</html>