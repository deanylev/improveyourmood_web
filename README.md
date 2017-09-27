# Improve Your Mood

**Live Version Here:** http://improveyourmood.xyz

Includes both the back-end and front-end.

To get started, clone the repo into your desired web server, make a new file in the root called `settings.ini` and in it, enter your MySQL credentials in this format:

```
[MYSQL]
username = YourUsername
password = YourPassword
```

Then, make a new table in your DB called `yourmood` and import the provided `yourmood.sql` file.

Make sure your web server is configured to use the provided `.htaccess` file, as it forbids external access to this settings file (otherwise your credentials could be viewed by anyone).

If you would like to point the app to your custom back-end, you simply open the settings panel, go into Advanced Settings, and enter your desired address (this needs to be the folder of wherever you've installed Improve Your Mood, eg. `localhost/improveyourmood_web`). The application will perform an AJAX call to your address to verify its validity.

**NOTE:**

The admin panel has no built in authentication (mainly because I'm lazy), so you'll need to secure it yourself. I simply use Apache Basic Authentication.