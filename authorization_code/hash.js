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
     constructor()
     {
          this.size = 100;
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

     //Insets a string into the hash table
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
               artist.addSongID(value.id)

               //Adds the artist too the hash table
               artists.push(artist);
               this.storage[index] = artists;
          }
          //If there is already something at that index
          else
          {
               let artist = this.get(value.artist);

               if(artist !== null)
               {
                    artist.addSongID(value.id);
               }
               else
               {
                    //Push back the new artist
                    this.storage[index].push(value);
               }
          }
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
     }
}

exports.HashTable = HashTable;
