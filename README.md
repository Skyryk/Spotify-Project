# Spotify-Safe-Playlists
This is a Spotify program that creates “safe” playlists based off the user saved music. The definition of “safe” in the case of this program is songs that are popular enough to be considered mainstream. The program works by grabbing all of a users saved songs from Spotify and then creating a playlist of “safe” music in the users library.

In order to run this program on your computer you will need to do the following.

## Preparing Your Environment

Since this project is meant to be a server-side application, you will need the appropriate software platform. For this, you will use Node.js. If you do not already have Node.js installed, download and install it with the default settings for your environment.

1. Test that Node.js is installed and set up correctly: in your favorite text editor create a simple server.js file with the following code:
```javascript
  /* Load the HTTP library */
  var http = require("http");

  /* Create an HTTP server to handle responses */

  http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
}).listen(8888);
 ```
This code creates a simple HTTP server on your local machine.

2. Save the file in a folder named njtest and then execute the file in the command prompt:
```
cd njtest
node server.js
```

3. Open a browser and go to the URL localhost:8888; the words “Hello World” should appear in your browser window:
image alt text

4. Kill the server with CTRL-C in the command prompt window; you have now completed and checked your set up of Node.js. If you cannot get the example above to work, troubleshoot and fix it before continuing.

## Running the program

Now that you have Node.js running you can procced to running the program

1. Open the authorization_code folder
```
cd Spotify-Project\authorization_code
```

2. Start the server by running the following command at the command prompt:
```
node app.js
```

3. Open a browser and visit the project home page. Now that the server is running, you can use the following URL: http://localhost:8888.

4. Click the Log in button to authorize access to your account.

5. Once you are logged in you can start using the program.
