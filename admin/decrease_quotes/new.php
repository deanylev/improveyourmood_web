<?php

  session_start();
  $id = $_POST["id"];
  $content = $_POST["content"];
  include("../../sql.php");
  $sql = "INSERT INTO yourmood.decrease (active, quote) VALUES (1, '$content')";
  if ($conn->query($sql) === false) {
      echo "Error: " . $sql . "<br>" . $conn->error;
  }
  $conn->close();
  $_SESSION["alert"] = "Successfully created quote.";
  header("location: .");
