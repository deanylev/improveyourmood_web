<?php

  session_start();
  $content = $_POST["content"];
  $value = $_POST["value"];
  $user = $_POST["user"];
  $advanced = $_POST["advanced"];
  $mobile = $_POST["mobile"];
  $input = $_POST["input"];
  $description = $_POST["description"];
  include("../../sql.php");
  $sql = "INSERT INTO yourmood.settings (active, setting, value, user, advanced, mobile, input, description) VALUES (1, '$content', '$value', '$user', '$advanced', '$mobile', '$input', '$description')";
  if ($conn->query($sql) === false) {
      echo "Error: " . $sql . "<br>" . $conn->error;
  }
  $conn->close();
  $_SESSION["alert"] = "Successfully created setting.";
  header("location: .");
