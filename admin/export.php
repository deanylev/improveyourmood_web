<?php

  include("assets/php/user.php");

  if ($currentUser["is_admin"] && !$currentUser["read_only"]) {
    $table = $_POST["table"];
    $id = $_POST["id"];
    $key = "chocolateMILK";
    $randomKey = uniqid();
    $value = $mysqli->query("SELECT * FROM yourmood.{$table} WHERE id='{$id}'")->fetch_assoc();
    $value["table"] = $table;
    $value = json_encode($value);
    $value = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($randomKey), $value, MCRYPT_MODE_CBC, md5(md5($randomKey))));
    $object = (object) array("key" => $randomKey, "value" => $value);
    $object = json_encode($object);
    $object = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $object, MCRYPT_MODE_CBC, md5(md5($key))));
    echo $object;
  } else {
    die("unauthorised");
  }
