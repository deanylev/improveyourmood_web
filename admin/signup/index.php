<?php

  session_start();

  if (isset($_SESSION["user"])) {
      header("location: ../home");
  }

?>

<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Admin Panel - Sign Up</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/css/bootstrap.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="../assets/css/main.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/js/bootstrap.min.js"></script>
</head>
<body class="container bg-primary">
  <br>
  <?php

    if (isset($_SESSION["message"])) {
        foreach ($_SESSION["message"] as $key => $val): ?>

    <div class="alert alert-<?php echo $key; ?>">
      <?php echo $val; ?>
      <a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>
    </div>

  <?php

    unset($_SESSION["message"]);
        endforeach;
    }

  ?>
  <div class="card">
    <div class="card-body">
      <h1 class="text-center">Sign Up</h1>
      <form class="signup" action="modify.php" method="POST">
        <div class="form-group">
          <label for="username">Username</label>
          <input type="text" name="username" class="form-control" id="user">
        </div>
        <div class="validation-errors text-danger" data-input="user"></div>
        <div class="form-group">
          <label for="password">Password</label>
          <input data-required="true" type="password" name="password" class="form-control" id="password">
        </div>
        <div class="validation-errors text-danger" data-input="password"></div>
        <div class="form-group">
          <label for="password_confirmation">Password Confirmation</label>
          <input type="password" name="password_confirmation" class="form-control" id="password_confirmation">
        </div>
        <div class="validation-errors text-danger" data-input="password_confirmation"></div>
        <p class="response text-danger"></p>
        <button id="save-button" class="btn btn-primary" type="submit" disabled>Sign Up<i class="d-none fa fa-spinner fa-pulse fa-fw"></i></button>
        <a class="btn btn-link" href="../login">Log In</a>
      </form>
    </div>
  </div>
  <script>itemId = null</script>
  <script src="../edit/input_validation.js"></script>
  <script src="signup.js"></script>
</body>

</html>