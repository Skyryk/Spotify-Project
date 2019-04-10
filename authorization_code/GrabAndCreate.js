const Class = require('./class.js');
const Song = Class.Song;
const Node = Class.Node;
const BinarySearchTree = Class.BinarySearchTree;

var request = require('request'); // "Request" library
var querystring = require('querystring');
var fs = require('fs');

function grabAndCreate(access_token)
{
     var songArray = []; //An array to hold all of the songs IDS that will be added to the safe playlist
     var playlistID; //The ID of the playlist we will add songs too

     //Gets the users saved music
     getUserTop("tracks", access_token, 50, "short_term", 0, function(res)
     {
          let data_loc = __dirname + '\\JSON_Files\\usersTopSongs.json';

          fs.writeFile(data_loc, res, 'utf8', function(err)
          {
               if (err)
               {
                    throw err;
                    console.log('\x1b[31m%s\x1b[0m', "Failed to save users top 50 songs to a JSON file");
               }
               else
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully Saved users top 50 songs to a JSON file");
               }
          });

          fs.readFile(data_loc, function(err, data)
          {
               // json data
               var jsonData = data;

               // parse json
               var jsonParsed = JSON.parse(jsonData);

               // song and BST objects
               let song;
               let tree = new BinarySearchTree();

               // For each song in file put into BST
               for(var item in jsonParsed.items)
               {
                    //Create a new song object
                    song = new Song(jsonParsed.items[item].name, jsonParsed.items[item].popularity, jsonParsed.items[item].id);
                    tree.insert(song); //Add song to BST
                    songArray.push('spotify:track:' + song.id);
                    //console.log(jsonParsed.items[item].name + " - Popularity=" + jsonParsed.items[item].popularity);
               }

               if(!err)
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully read the JSON data of saved music");
               }
               else
               {
                    console.log('\x1b[31m%s\x1b[0m', "Failed to read the JSON data of saved music");
               }

               //Creates a new playlist to store the saved music
               createNewPlaylist(access_token, function(res)
               {
                    let data_loc = __dirname + '\\JSON_Files\\usersPlaylists.json';

                    fs.writeFile(data_loc, res, 'utf8', function(err)
                    {
                         if (err)
                         {
                              throw err;
                              console.log('\x1b[31m%s\x1b[0m', "Failed to save new playlist object to a JSON file");
                         }
                         else
                         {
                              console.log('\x1b[92m%s\x1b[0m', "Successfully Saved new playlist object to JSON file");
                         }
                    });

                    fs.readFile(data_loc, function(err, data)
                    {
                         // json data
                         var jsonData = data;

                         // parse json
                         var jsonParsed = JSON.parse(jsonData);

                         playlistID = jsonParsed.id;

                         //If there was no error then add songs in the songArray too the new playlist
                         if(!err)
                         {
                              console.log('\x1b[92m%s\x1b[0m', "Successfully read the JSON data of new playlist");
                              console.log('\x1b[95m%s\x1b[0m', "Safe Playlist ID = " + playlistID);
                              console.log('\x1b[95m%s\x1b[0m', "Adding songs to playlist");
                              addSongToPlaylist(playlistID, songArray.toString(), access_token)
                         }
                         else
                         {
                              console.log('\x1b[31m%s\x1b[0m', "Failed to read the JSON data of new playlist");
                         }
                    });
               })
          });
     })
}

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
                    console.log('\x1b[92m%s\x1b[0m', "Successfully retrived top songs from spotify");
                    __callback(body);
               }
               else
               {
                    console.log('\x1b[31m%s\x1b[0m', "Failed to get users top songs");
                    console.log('\x1b[31m%s\x1b[0m', response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

function createNewPlaylist(access_token, __callback=(res)=>{})
{
     if(access_token != null)
     {
          const options =
          {
               url: 'https://api.spotify.com/v1/users/firesquirrel66/playlists',
               headers:
               {
                    'Authorization': 'Bearer ' + access_token,
                    'Content-Type': 'application/json'
               },
               body: "{\"name\":\"Safe Playlist\", \"public\":false}"
          }

          request.post(options, function(error, response, body)
          {
               if (!error && response.statusCode === 200)
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully created a new playlist in spotify");
                    __callback(body);
               }
               else if(!error && response.statusCode === 201)
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully created a new playlist in spotify");
                    __callback(body);
               }
               else
               {
                    console.log('\x1b[31m%s\x1b[0m', "Failed to created a new playlist in spotify");
                    console.log('\x1b[31m%s\x1b[0m', response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

function addSongToPlaylist(playlistID, songID, access_token)
{
     if (access_token != null)
     {
          const options =
          {
               url: 'https://api.spotify.com/v1/playlists/' + playlistID + '/tracks?' + querystring.stringify(
               {
                    "uris": songID
               }),
               headers:
               {
                    'Authorization': 'Bearer ' + access_token
               }
          }

          request.post(options, function(error, response)
          {
               if (!error && response.statusCode === 200)
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully added songs to playlist " + playlistID + " in spotify");
               }
               else if (!error && response.statusCode === 201)
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully added songs to playlist " + playlistID + " in spotify");
               }
               else
               {
                    console.log('\x1b[31m%s\x1b[0m', "Failed to add songs to playlist " + playlistID + " in spotify");
                    console.log('\x1b[31m%s\x1b[0m', response.statusCode + ": " + error );
               }
          });
     }
}

//Exports this grabAndCreate function so it can called in app.js
exports.grabAndCreate = grabAndCreate;