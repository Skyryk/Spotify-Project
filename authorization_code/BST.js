const Hash = require('./hash.js');
const HashTable = Hash.HashTable;

//Class for the song object
class Song
{
     constructor(name, artist, popularity, id, explicit)
     {
          this.name = name;
          this.artist = artist;
          this.popularity = popularity;
          this.id = id;
          this.explicit = explicit;
     }
}

//Class for the BST node
class Node
{
     constructor(data)
     {
          this.data = data;
          this.left = null;
          this.right = null;
     }
}

//A bst for storing the users songs by their popularity
class BinarySearchTree
{
     constructor()
     {
          this.root = null;
          this.songArray = []; //An array to hold all of the songs IDS that will be added to the safe playlist
          this.artistHash = new HashTable(30); //A hashtable used for storing most popular artists
     }

     //Inserts a song into the BST
     insert(song)
     {
          //Creates a new node
          let newNode = new Node(song);

          //If the root is null...
          if(this.root === null)
          {
               this.root = newNode;
          }
          //If not insert the new node into the proper location
          else
          {
               this.insertNode(this.root, newNode);
          }
     }

     //Insert a song node into the BST
     insertNode(node, newNode)
     {
          //If the songs popularity rating is greater or equal move too the left
          if(newNode.data.popularity >= node.data.popularity)
          {
               //If there is not node too the left...
               if(node.left === null)
               {
                    node.left = newNode;
               }
               //If there is a node keep looking for an open space
               else
               {
                    this.insertNode(node.left, newNode);
               }
          }
          //If the songs popularity rating is less then the current node
          else
          {
               //If there is node too the left...
               if(node.right === null)
               {
                    node.right = newNode;
               }
               //If there is a node keep looking for an open space
               else
               {
                    this.insertNode(node.right, newNode);
               }
          }
     }

     //Print the tree in order based off popularity
     /*printInOrder(node)
     {
          if(node !== null)
          {
               this.printInOrder(node.left);
               console.log(node.data.name + "=" + node.data.popularity);
               this.printInOrder(node.right);
          }
     }*/

     //Finds the most popular songs and adds them too an array of string
     findPopularSongs(node, explicit)
     {
          if(node !== null)
          {
               this.findPopularSongs(node.left, explicit);
               if(node.data.popularity >= 70)
               {
                    if(!explicit && !node.data.explicit)
                    {
                         this.songArray.push('spotify:track:' + node.data.id);
                    }
                    else if(explicit)
                    {
                         this.songArray.push('spotify:track:' + node.data.id);
                    }
               }
               this.findPopularSongs(node.right, explicit);
          }

          return this.songArray;
     }

     //Finds the artists of the most popular songs and stores them in a hash table
     findPopularArtists(node)
     {
          if(node !== null)
          {
               this.findPopularArtists(node.left);
               if(node.data.popularity >= 70)
               {
                    this.artistHash.insert(node.data);
               }
               this.findPopularArtists(node.right);
          }

          return this.artistHash;
     }

     //Returns the root node for traversing the tree
     getRootNode()
     {
          return this.root;
     }
}

//Exports the the classes for use in GrabAndCreate.js
exports.Song = Song;
exports.Node = Node;
exports.BinarySearchTree = BinarySearchTree;
