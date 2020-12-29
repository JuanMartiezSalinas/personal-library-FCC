/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require("mongoose");
const MongoClient = require('mongodb');
mongoose.set('useFindAndModify', false);
var arrBooks=[];
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let bookSchema =new mongoose.Schema({
  title:{type:String,required:true},
  comments:Array,
  commentcount:Number
})

let Book = new mongoose.model("Book",bookSchema)  
module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      res.json(arrBooks)
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      let {title} = req.body;
      if(!title){
        res.send('missing required field title')
      }
      let newBook = new Book({
        title : title,
        comments:[],
        commentcount:0
      })
      newBook.save((err,savedBook) => {
          if(!err){
            let responseObj={};
            responseObj['title']=savedBook.title;
            responseObj["_id"]=savedBook._id;
            res.json(responseObj);
            arrBooks.push(responseObj)
          }
      })
      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      Book.deleteMany(
        {},
        (err,json) =>{
          if(!err){
            return res.json('complete delete successful')
          }
        })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      Book.findById(bookid,
      (err,savedBook)=>{
        if(!savedBook){
         res.send('no book exists')
         console.log('no books exist')
        }
        else if(!err && savedBook){
          res.json(savedBook)
          console.log(savedBook,savedBook.commentcount)
        }
      })
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      if(!comment){
        res.send('missing required field comment')
      }
      else{
      Book.findByIdAndUpdate(
        bookid,
        {$push:{comments:comment}},
        {new:true},
        (err,updatedBook) => {
          if(!err && updatedBook){
            updatedBook.commentcount=updatedBook.comments.length;
            res.json(updatedBook)
            res.end();
          }else{
          res.json('no book exists')
          }
        }
      )
      }
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
        Book.findByIdAndDelete(
          {_id:bookid},
          (err,deletedObject)=>{
            if(!err && deletedObject){
              res.json('delete successful')
            }else{
              res.json('no book exists')
            }
          }
        )

      //if successful response will be 'delete successful'
    });
  
};
