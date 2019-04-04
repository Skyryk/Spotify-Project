/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
const fs = require('fs');

var client_id = 'd216da85562b446ab1e4d2511b927ae5'; // Your client id
var client_secret = '64ca3cfa5bb047df8cd7fd916393735e'; // Your secret
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length)
{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', function (req, res)
{
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-read-email user-read-recently-played user-top-read user-library-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify(
        {
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }
        ));
});

app.get('/callback', function(req, res)
{
     // your application requests refresh and access tokens
     // after checking the state parameter

     var code = req.query.code || null;
     var state = req.query.state || null;
     var storedState = req.cookies ? req.cookies[stateKey] : null;

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
          var authOptions =
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
                    var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                    var options =
                    {
                         url: 'https://api.spotify.com/v1/me',
                         headers: { 'Authorization': 'Bearer ' + access_token },
                         json: true
                    };

                    // use the access token to access the Spotify Web API
                    request.get(options, function(error, response, body)
                    {
                         //console.log(body);
                    });

                    // we can also pass the token to the browser to make requests from there
                    res.redirect('/#' +
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
     var refresh_token = req.query.refresh_token;
     var authOptions =
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
               var access_token = body.access_token;
               res.send(
               {
                    'access_token': access_token
               });
          }
     });
});

app.get('/grap_top_artists', function(req, res)
{
     // requesting access token from refresh token
     var refresh_token = req.query.refresh_token;
     var authOptions =
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
               var access_token = body.access_token;

               getUserTop("tracks", access_token, 50, "long_term", 0, function(res)
               {
                    let data_loc = __dirname + '\\JSON_Files\\usersTopSongs.json';

                    fs.writeFile(data_loc, res, 'utf8', function(err)
                    {
                         if (err) throw err;
                    });

                    fs.readFile(data_loc, function(err, data)
                    {
                         // json data
                         var jsonData = data;

                         // parse json
                         var jsonParsed = JSON.parse(jsonData);

                         // access elements
                         console.log("Printing Users Top 50 songs");
                         console.log("---------------------");
                         for(var item in jsonParsed.items)
                         {
                              console.log(jsonParsed.items[item].name + " - Popularity=" + jsonParsed.items[item].popularity);
                         }
                         console.log("---------------------");

                         if(!err)
                         {
                              console.log("Parsed the JSON file and printed data succesfully");
                         }
                    });
               })

               getUserPlaylists("firesquirrel66", access_token, 50, 0, function(res)
               {
                    let data_loc = __dirname + '\\JSON_Files\\usersPlaylist.json';

                    fs.writeFile(data_loc, res, 'utf8', function(err)
                    {
                         if (err) throw err;
                    });
               })

               res.send(
               {
                    'access_token': access_token
               });
          }
     });
});

//Thomas Young's AuxJockey repository - https://github.com/thyo9470/AuxJockey.git
function getUserTop(type, access_token, limit, time_range, offset, __callback=(res)=>{})
{
     if (access_token != null)
     {
          const options =
          {
               url: 'https://api.spotify.com/v1/me/top/' + type + "?" + querystring.stringify(
               {
                    "time_range": time_range,
                    "limit": limit,
                    "offset": offset
               }),
               headers:
               {
                    'Authorization': 'Bearer ' + access_token
               }
          }

          request( options, function(error, response, body)
          {
               if (!error && response.statusCode === 200)
               {
                    __callback(body);
               }
               else
               {
                    console.log( response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

function getUserPlaylists(userID ,access_token, limit, offset, __callback=(res)=>{})
{
     if (access_token != null)
     {
          const options =
          {
               url: 'https://api.spotify.com/v1/users/' + userID + '/playlists' + "?" + querystring.stringify(
               {
                    "limit": limit,
                    "offset": offset
               }),
               headers:
               {
                    'Authorization': 'Bearer ' + access_token
               }
          }

          request( options, function(error, response, body)
          {
               if (!error && response.statusCode === 200)
               {
                    __callback(body);
               }
               else
               {
                    console.log( response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

console.log('Listening on 8888');
app.listen(8888);
