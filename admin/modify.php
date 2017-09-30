<?php

  session_start();
  $messageType = "success";
  $id = $_POST["id"];
  $table = $_POST["table"];
  $title = $type = $_POST["type"];
  $url = $_SERVER['HTTP_REFERER'];
  include("assets/php/actions.php");
  include("../sql.php");

  if (isset($_POST["new"]) && in_array("create", $actions)) {
      $mysql->query = "INSERT INTO yourmood.${table} () VALUES ()";
      $message = "Successfully created ${type}";
  } elseif (isset($_POST["delete"]) && in_array("delete", $actions)) {
      $mysql->query = "DELETE FROM yourmood.{$table} WHERE id='{$id}'";
      $message = "Successfully deleted ${type}";
      $url = "{$type}s?type=${table}";
  } elseif (isset($_POST["edit"]) && in_array("edit", $actions)) {
      $statement = "";
      foreach ($_POST["values"] as $key => $val) {
          $statement .= $key . " = '" . addslashes($val) . "',";
      }
      $statement = substr($statement, 0, -1);
      $mysql->query = "UPDATE yourmood.${table} SET {$statement} WHERE id = '{$id}'";
      $message = "Successfully updated ${type}";
      $url = in_array("view", $actions) ? "view/?type=${table}&title=${type}&id=${id}" : "{$type}s?type=${table}";
  } elseif (isset($_POST["deleteall"]) && in_array("deleteall", $actions)) {
    $mysql->query = "DELETE FROM yourmood.{$table}";
    $message = "Successfully deleted all ${type}s";
    $url = "{$type}s?type=${table}";
  } else {
    $messageType = "danger";
    $message = "An error occured";
  }

  $mysql->run_query();
  $mysql->disconnect();

  $_SESSION[$messageType] = $message;
  header("location: {$url}");
