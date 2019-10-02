<?php include "header.php";
?>
<body class="bg">
    <div class="overlay overlay-data">
        <div class="steamLogo"><img alt="steamLogo" height="282" src="images/steam_logo.png" width="602"></div>
        <div class="centerBox">
            <h1>Choose which Wheel you want to Spin</h1>
            <nav>
                <ul>
                    <li>
                        <a href="./usergames.php">My Steam Library</a>
                    </li>
                    <li>
                        <a href="./allgames.php">All Steam Games</a>
                    </li>
                </ul>
            </nav>
        </div>
    </div>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js">
    </script> 
    <script src="js/bootstrap.min.js">
    </script> 
    <script>
     $( ".overlay" ).addClass('overlay-open');
        $( "#overlay-menu" ).click(function() {
            $( ".overlay" ).addClass('overlay-open');
        });
        $( ".overlay-close" ).click(function() {
            $( ".overlay" ).removeClass('overlay-open');
        });
    </script> 
    <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

    ga('create', 'UA-23840368-17', 'auto');
    ga('send', 'pageview');

    </script>
</body>
</html>