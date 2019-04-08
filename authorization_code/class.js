class Song
{
     constructor(name, popularity, id)
     {
          this.name = name;
          this.popularity = popularity;
          this.id = id;
     }
}

class Node
{
     constructor(data)
     {
          this.data = data;
          this.left = null;
          this.right = null;
     }
}

class BinarySearchTree
{
     constructor()
     {
          this.root = null;
     }

     insert(song)
     {
          var newNode = new Node(song);

          if(this.root === null)
          {
               this.root = newNode;
          }
          else
          {
               this.insertNode(this.root, newNode);
          }
     }

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

     printInOrder(node)
     {
          if(node !== null)
          {
               this.printInOrder(node.left);
               console.log(node.data.name + "=" + node.data.popularity);
               this.printInOrder(node.right);
          }
     }

     getRootNode()
     {
          return this.root;
     }
}

exports.Song = Song;
exports.Node = Node;
exports.BinarySearchTree = BinarySearchTree
