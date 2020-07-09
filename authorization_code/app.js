/**
 I:\Spotify-Project\authorization_code
 */

const GrabAndCreate = require('./GrabAndCreate.js');

let express = require('express'); // Express web server framework
let request = require('request'); // "Request" library
let cors = require('cors');
let querystring = require('querystring');
let cookieParser = require('cookie-parser');

let client_id = 'd216da85562b446ab1e4d2511b927ae5'; // Your client id
let client_secret = '64ca3cfa5bb047df8cd7fd916393735e'; // Your secret
let redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
let generateRandomString = function (length)
{
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

let stateKey = 'spotify_auth_state';

let app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function (req, res)
{
    let state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    let scope = 'user-read-private user-read-email user-top-read user-library-read playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify(
        {
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state,
            show_dialog: true
        }
        ));
});

app.get('/callback', function(req, res)
{
     // your application requests refresh and access tokens
     // after checking the state parameter

     let code = req.query.code || null;
     let state = req.query.state || null;
     let storedState = req.cookies ? req.cookies[stateKey] : null;

     if (state === null || state !== storedState)
     {
          res.redirect('/#' +
          querystring.stringify(
          {
               error: 'state_mismatch'
          }));
     }
     else
     {
          res.clearCookie(stateKey);
          let authOptions =
          {
               url: 'https://accounts.spotify.com/api/token',
               form:
               {
                    code: code,
                    redirect_uri: redirect_uri,
                    grant_type: 'authorization_code'
               },
               headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
               json: true
          };

          request.post(authOptions, function(error, response, body)
          {
               if (!error && response.statusCode === 200)
               {
                    let access_token = body.access_token,
                    refresh_token = body.refresh_token;

                    let options =
                    {
                         url: 'https://api.spotify.com/v1/me',
                         headers: { 'Authorization': 'Bearer ' + access_token },
                         json: true
                    };

                    // use the access token to access the Spotify Web API
                    request.get(options, function(error, response, body)
                    {
                         console.log(body);
                    });

                    // we can also pass the token to the browser to make requests from there
                    res.redirect('/safespotify.html#' +
                    querystring.stringify(
                         {
                              access_token: access_token,
                              refresh_token: refresh_token
                         }));
               }
               else
               {
                    res.redirect('/#' +
                    querystring.stringify(
                    {
                              error: 'invalid_token'
                    }));
               }
          });
     }
});

app.get('/refresh_token', function(req, res)
{
     // requesting access token from refresh token
     let refresh_token = req.query.refresh_token;
     let authOptions =
     {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
          form: {
               grant_type: 'refresh_token',
               refresh_token: refresh_token
          },
          json: true
     };

     request.post(authOptions, function(error, response, body)
     {
          if (!error && response.statusCode === 200)
          {
               let access_token = body.access_token;
               res.send(
               {
                    'access_token': access_token
               });
          }
     });
});

app.get('/make-safe-playlist-with-tracks', function(req, res)
{
     //Grab data from user inputs
     let include_explicit = req.query.include_explicit;

     // requesting access token from refresh token
     let refresh_token = req.query.refresh_token;
     let authOptions =
     {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
          form: {
               grant_type: 'refresh_token',
               refresh_token: refresh_token
          },
          json: true
     };

     request.post(authOptions, function(error, response, body)
     {
          if (!error && response.statusCode === 200)
          {
               let access_token = body.access_token;
               let userID;
               let options =
               {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
               };

               // use the access token to access the Spotify Web API
               request.get(options, function(error, response, body)
               {
                    userID = body.id;

                    //Calls a function that gets the users data and creates the safe playlist
                    GrabAndCreate.grabAndCreateWithTracks(access_token, userID, include_explicit);
               });

               res.send(
               {
                    'access_token': access_token
               });
          }
     });
});

app.get('/make-safe-playlist-with-artists', function(req, res)
{
     // requesting access token from refresh token
     let refresh_token = req.query.refresh_token;
     let authOptions =
     {
          url: 'https://accounts.spotify.com/api/token',
          headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
          form: {
               grant_type: 'refresh_token',
               refresh_token: refresh_token
          },
          json: true
     };

     request.post(authOptions, function(error, response, body)
     {
          if (!error && response.statusCode === 200)
          {
               let access_token = body.access_token;
               let userID;
               let options =
               {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
               };

               // use the access token to access the Spotify Web API
               request.get(options, function(error, response, body)
               {
                    userID = body.id;

                    //Calls a function that gets the users data and creates the safe playlist
                    GrabAndCreate.grabAndCreateWithArtists(access_token, userID);
               });

               res.send(
               {
                    'access_token': access_token
               });
          }
     });
});

console.log('\x1b[95m%s\x1b[0m', 'Listening on 8888');
app.listen(8888);
