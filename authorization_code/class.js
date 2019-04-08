class Song
{
     constructor(name, popularity)
     {
          this.name = name;
          this.popularity = popularity;
     }
}

class BinarySearchTree
{
     constructor(value)
     {
          this.value = value;
          this.left = null;
          this.right = null;
          this.nodeCount = 1;
     }

     insertSong(value)
     {
          let direction;
          if(value >= this.value.popularity)
          {
               direction = 'left';
          }
          else
          {
               direction = 'right';
          }

          if (direction === 'left' && this.left === null)
          {
               this.nodeCount++;
               this.left = new BinarySearchTree(value);
          }
          else if (direction === 'left' && this.left)
          {
               this.left.insertSong(value);
          }
          else if (direction === 'right' && this.right === null)
          {
               this.nodeCount++;
               this.right = new BinarySearchTree(value);
          }
          else
          {
               this.right.insertSong(value);
          }
     }
}

module.exports = BinarySearchTree;
module.exports = Song;
