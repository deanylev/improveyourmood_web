<?php

$servername = "localhost";
$username = $_SERVER["HTTP_HOST"] == "localhost" ? "root" : "admin";
$password = $_SERVER["HTTP_HOST"] == "localhost" ? "" : "c50514c96d3094955f934a89306ebd2ec8098251829c17d3";
$conn = mysqli_connect($servername, $username, $password);
