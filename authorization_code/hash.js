class Artist
{
     constructor(name)
     {
          this.name = name;
          this.songs = [];
     }

     addSongID(songID)
     {
          this.songs.push(songID);
     }
}

//A hashtable for storing artists
class HashTable
{
     constructor(size)
     {
          this.size = size;
          this.storage = new Array(this.SIZE);
     }

     //Gets the hash value to be used as the index of the storage array
     hashCode(string, size)
     {
          var hash = 0;
          if (string.length == 0) return hash;
          for (var i = 0; i < string.length; i++)
          {
               var letter = string.charCodeAt(i);
               hash = ((hash<<5)-hash)+letter;
               hash = hash & hash;
          }
          return Math.abs(hash) % size ;
     }

     //Insets a song object into the hash table
     insert(value)
     {
          //Gets the index value
          let index = this.hashCode(value.artist, this.size);

          //If this index has nothing in it...
          if (!this.storage[index])
          {
               //Create a new aritsts array
               let artists = [];

               //Creates a new artist object
               let artist = new Artist(value.artist)
               artist.addSongID('spotify:track:' + value.id)

               //Adds the artist too the hash table
               artists.push(artist);
               this.storage[index] = artists;
          }
          //If there is already something at that index
          else
          {
               let artist = this.get(value.artist);

               //console.log(artist);
               //console.log(value.id);

               if(artist !== null)
               {
                    artist.addSongID('spotify:track:' + value.id);
               }
               else
               {
                    //Create new artist Object
                    let artist = new Artist(value.artist)
                    artist.addSongID('spotify:track:' + value.id)

                    //Push back the new artist
                    this.storage[index].push(artist);
               }
          }
     }

     //Prints in the console all the contents of storage
     showall()
     {
          console.log(this.storage);
     }

     //Returns an artist
     get(value)
     {
          let index = this.hashCode(value, this.size);

          //Looks for the artist in the hash table
          for(var artist in this.storage[index])
          {
               if(this.storage[index][artist].name === value)
                    return this.storage[index][artist];
          }

          return null;
     }
}

exports.HashTable = HashTable;
