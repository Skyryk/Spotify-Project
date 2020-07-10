const BST = require('./BST.js');
const Song = BST.Song;
const BinarySearchTree = BST.BinarySearchTree;

const Hash = require('./hash.js');
const HashTable = Hash.HashTable;

let request = require('request'); // "Request" library
let querystring = require('querystring');
let fs = require('fs');

//Grabs the users saved music and then adds the most popular songs
function grabAndCreateWithTracks(access_token, userID, explicit)
{
     let songArray = []; //An Array to hold all of the songs IDS that will be added to the safe playlist
     let playlistID; //The ID of the playlist we will add songs too
     let tree = new BinarySearchTree();
     let hashTable = new HashTable(100);

     console.log(userID);
     console.log("Explicit : " + explicit);

     //Calls a function that grabs all of the users saved songs
     grabUsersMusic(access_token, tree, hashTable, function()
     {
          songArray = tree.findPopularSongs(tree.getRootNode(), explicit);

          console.log(songArray);

          //Creates a new playlist to store the saved music
          createNewPlaylist(access_token, userID, function(res)
          {
               let data_loc = __dirname + '\\JSON_Files\\usersPlaylists.json';

               //Writes the data too a JSON files
               fs.writeFile(data_loc, res, 'utf8', function(err)
               {
                    if (err)
                    {
                         console.log('\x1b[91m%s\x1b[0m', "Failed to save new playlist object to a JSON file");
                         throw err;
                    }
                    else
                    {
                         console.log('\x1b[92m%s\x1b[0m', "Successfully Saved new playlist object to JSON file");
                    }
               });

               //Reads the data from the JSON file
               fs.readFile(data_loc, function(err, data)
               {
                    // json data
                    let jsonData = data;

                    // parse json
                    let jsonParsed = JSON.parse(jsonData);

                    playlistID = jsonParsed.id; //Id of playlist we will add songs too

                    //If there was no error then add songs in the songArray too the new playlist
                    if(!err)
                    {
                         console.log('\x1b[92m%s\x1b[0m', "Successfully read the JSON data of new playlist");
                         console.log('\x1b[95m%s\x1b[0m', "Safe Playlist ID = " + playlistID);
                         console.log('\x1b[95m%s\x1b[0m', "Adding songs to playlist");
                         if(songArray !== null)
                         {
                              //Splits the song array into more manageable sizes
                              createURIForPlaylist(playlistID, songArray, access_token, true);
                         }
                         else
                         {
                              console.log('\x1b[91m%s\x1b[0m', "No songs in the song array");
                         }
                    }
                    else
                    {
                         console.log('\x1b[91m%s\x1b[0m', "Failed to read the JSON data of new playlist");
                    }
               });
          })
     });
}

//Grabs the users saved music and then adds the most popular artists
function grabAndCreateWithArtists(access_token, userID)
{
     let songArray = []; //An Array to hold all of the songs IDS that will be added to the safe playlist
     let hashOfPopArtists; //A hash table that hold all the popular artists
     let playlistID; //The ID of the playlist we will add songs too
     let tree = new BinarySearchTree();
     let hashTable = new HashTable(100);

     //Calls a function that grabs all of the users saved songs
     grabUsersMusic(access_token, tree, hashTable, function()
     {
          hashOfPopArtists = tree.findPopularArtists(tree.getRootNode());

          //Looks for the artist in the hash table
          for(let artist in hashOfPopArtists.storage)
          {
               for(let llartist in hashOfPopArtists.storage[artist])
               {
                    //console.log(hashTable.get(hashOfPopArtists.storage[artist][llartist].name));
                    let currentArtist = hashTable.get(hashOfPopArtists.storage[artist][llartist].name);
                    songArray.push(currentArtist.songs);
               }
          }

          //console.log(songArray.toString());

          //Creates a new playlist to store the saved music
          createNewPlaylist(access_token, userID, function(res)
          {
               let data_loc = __dirname + '\\JSON_Files\\usersPlaylists.json';

               fs.writeFile(data_loc, res, 'utf8', function(err)
               {
                    if (err)
                    {
                         console.log('\x1b[91m%s\x1b[0m', "Failed to save new playlist object to a JSON file");
                         throw err;
                    }
                    else
                    {
                         console.log('\x1b[92m%s\x1b[0m', "Successfully Saved new playlist object to JSON file");
                    }
               });

               fs.readFile(data_loc, function(err, data)
               {
                    // json data
                    let jsonData = data;

                    // parse json
                    let jsonParsed = JSON.parse(jsonData);

                    playlistID = jsonParsed.id;

                    //If there was no error then add songs in the songArray too the new playlist
                    if(!err)
                    {
                         console.log('\x1b[92m%s\x1b[0m', "Successfully read the JSON data of new playlist");
                         console.log('\x1b[95m%s\x1b[0m', "Safe Playlist ID = " + playlistID);
                         console.log('\x1b[95m%s\x1b[0m', "Adding songs to playlist");
                         if(songArray !== null)
                         {
                              createURIForPlaylist(playlistID, songArray, access_token, false);
                         }
                         else
                         {
                              console.log('\x1b[91m%s\x1b[0m', "No songs in the song array");
                         }
                    }
                    else
                    {
                         console.log('\x1b[91m%s\x1b[0m', "Failed to read the JSON data of new playlist");
                    }
               });
          })
     });
}

//Grabs all of a users saved songs in order
async function grabUsersMusic(access_token, tree, hashTable, __callback)
{
     let offset = 0; //Current offset for next set of saved songs
     let currentBatchTotal;

     //While the current batch of songs is 50 continue getting the users songs
     do
     {
          currentBatchTotal = 0;

          //Runs the getUserSaved music and completes it before continuing.
          let promise = new Promise((resolve, reject) =>
          {
               getUserSaved(access_token, 50, offset, function(res)
               {
                    // json data
                    let jsonData = res;

                    // parse json
                    let jsonParsed = JSON.parse(jsonData);

                    // song object
                    let song;

                    for(let item in jsonParsed.items)
                    {
                         currentBatchTotal++;
                         //Create a new song object
                         song = new Song
                         (
                              jsonParsed.items[item].track.name,
                              jsonParsed.items[item].track.artists[0].name,
                              jsonParsed.items[item].track.popularity,
                              jsonParsed.items[item].track.id,
                              jsonParsed.items[item].track.explicit
                         );
                         tree.insert(song); //Add song to BST
                         hashTable.insert(song); //Add song to Hashtable
                         //console.log(jsonParsed.items[item].track.name + " - Popularity=" + jsonParsed.items[item].track.popularity);
                    }

                    offset += currentBatchTotal;

                    //Resolves the promise
                    setTimeout(() => resolve("done!"))
               });
          });

          //Waits until the get getUserSaved function is done with all its tasks
          let result = await promise;
     }
     while(currentBatchTotal === 50);

     __callback();
}

//Gets a users saved songs
//Limit - # of songs pulled. max = 50
//Offset - Index of saved songs to start at.
function getUserSaved(access_token, limit, offset, __callback=(res)=>{})
{
     if (access_token != null)
     {
          const options =
          {
               url: 'https://api.spotify.com/v1/me/tracks/' + "?" + querystring.stringify(
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
                    console.log('\x1b[92m%s\x1b[0m', "Successfully retrived saved songs from spotify: [OFFSET: " + offset + "]");
                    __callback(body);
               }
               else
               {
                    console.log('\x1b[91m%s\x1b[0m', "Failed to get users saved songs: [OFFSET: " + offset + "]");
                    console.log('\x1b[91m%s\x1b[0m', response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

//Gets a users top songs
//Limit - # of songs pulled. max = 50
//Offset - Index of saved songs to start at.
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
                    console.log('\x1b[91m%s\x1b[0m', "Failed to get users top songs");
                    console.log('\x1b[91m%s\x1b[0m', response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

//Creates a new playlist in the users library
function createNewPlaylist(access_token, userID, __callback=(res)=>{})
{
     if(access_token != null)
     {
          const options =
          {
               url: 'https://api.spotify.com/v1/users/' + userID + '/playlists',
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
                    console.log('\x1b[91m%s\x1b[0m', "Failed to created a new playlist in spotify");
                    console.log('\x1b[91m%s\x1b[0m', response.statusCode + ": " + error );
                    __callback(null)
               }
          });
     }
}

//Splits the songArray to add songs in 50 song intervals
//PlaylistID - The id of the playlist we will add songs too
//SongArray - The array of all the songs found in earlier functions
async function createURIForPlaylist(playlistID, songArray, access_token, tracks)
{
     let limitedSongArray = [];
     let arrayCount = 0;
     let batch = 1;

     //For each list of songs in the songArray...
     for(let song in songArray)
     {
          if(tracks === true)
          {
               limitedSongArray.push(songArray[song]); //Add the song to limited array
               arrayCount++;
               //If the limited array of songs is 50 long...
               if(arrayCount === 50)
               {
                    //Add that batch of 50 songs too the playlist and reset the limited array
                    addSongToPlaylist(playlistID, limitedSongArray.toString(), access_token, batch);
                    limitedSongArray = [];
                    arrayCount = 0;
                    batch++;
                    await new Promise((resolve, reject) => setTimeout(resolve, 500));
               }
          }
          else
          {
               //For each song in the list of songs in the songArray...
               for(let llsong in songArray[song])
               {
                    limitedSongArray.push(songArray[song][llsong]); //Add the song to limited array
                    arrayCount++;
                    //If the limited array of songs is 50 long...
                    if(arrayCount === 50)
                    {
                         //Add that batch of 50 songs too the playlist and reset the limted array
                         addSongToPlaylist(playlistID, limitedSongArray.toString(), access_token, batch);
                         limitedSongArray = [];
                         arrayCount = 0;
                         batch++;
                         await new Promise((resolve, reject) => setTimeout(resolve, 500));
                    }
               }
          }
     }

     //Adds the last batch of songs too the playlist
     if(arrayCount !== 0)
          addSongToPlaylist(playlistID, limitedSongArray.toString(), access_token, batch);
}

//Adds songs to a playlist in the users library
//PlaylistID - the ID of the playlist to add songs too
//SongID - A string containing all the songs you want to add to a playlist
function addSongToPlaylist(playlistID, songID, access_token, batch)
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
                    console.log('\x1b[92m%s\x1b[0m', "Successfully added songs to playlist " + playlistID + " in spotify [Batch:" + batch + "]");
               }
               else if (!error && response.statusCode === 201)
               {
                    console.log('\x1b[92m%s\x1b[0m', "Successfully added songs to playlist " + playlistID + " in spotify [Batch:" + batch + "]");
               }
               else
               {
                    console.log('\x1b[91m%s\x1b[0m', "Failed to add songs to playlist " + playlistID + " in spotify [Batch:" + batch + "]");
                    console.log('\x1b[91m%s\x1b[0m', response.statusCode + ": " + error );
               }
          });
     }
}

//Exports this grabAndCreate function so it can called in app.js
exports.grabAndCreateWithTracks = grabAndCreateWithTracks;
exports.grabAndCreateWithArtists = grabAndCreateWithArtists;
