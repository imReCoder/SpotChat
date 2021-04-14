const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var serviceAccount = require("./key/serviceAccountKey.json");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))
app.use(function (req, res, next) {
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
res.setHeader('Access-Control-Allow-Credentials', true);
next();
});
const path = require('path');
const db = require("./db");
var admin = require("firebase-admin");

var server = require('http').createServer(app);
//var redisClient = redis.createClient(); //creates a new client
let io = require('socket.io')(server,{ wsEngine: 'ws' });


var dbo;
var activeUsers=[];
var options = {
  priority: "high",
  timeToLive: 60 * 60
};


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://spotchat-9998d.firebaseio.com",
  storageBucket: "gs://spotchat-9998d.appspot.com"
});



var bucket = admin.storage().bucket();


io.on('connection', (socket) => {
  socket.on('disconnect', function(){
       activeUsers.splice(activeUsers.indexOf(socket.phone), 1);
      io.emit('offline', {phone:socket.phone});
    dbo.collection("usersOnline").update({phone:socket.phone},{$set:{phone:socket.phone,active:false}},{upsert:true},(err,result)=>{
      if(err){
      //  //////console.log(err);
      }
      else{
    //  //////console.log(result);

      }
    })
  });

  socket.on('join', (data) => {
    socket.join(data.roomId);
    io.to(data.roomId).emit('reply-message', {msg: 'hello'});
  });


    socket.on('leave', (data) => {
      socket.leave(data.roomId);
        io.to(data.roomId).emit('reply-message', {msg: 'hello'});
    });
    socket.on('deleteDelivered',data=>{
      dbo.collection("users").updateOne({phone:data.myPhone},{$unset:{delivered:0}},(err,result)=>{
         if(err){
           console.log('err in deleting',err);
         }
         else{
         console.log('deleted delivered '+data.myPhone);

         }
       })
    })

    socket.on('getAllStoredDeliveredMsg',(data)=>{
      var sendTo = 'SofflinedeliveredMsg'+data.myPhone;
      console.log('sending delivereg message to',sendTo);
      dbo.collection("users").findOne({phone:data.myPhone},(err,result)=>{
        if(err){
          //////console.log(err);
          io.emit(sendTo,{err:1});

        }
        else{
        if(result){
          //////console.log('got result ',result);
          io.emit(sendTo,result);
        }
        else{
          //////console.log('no result');
          io.emit(sendTo,{err:0});

        }

        }
      })
    })


socket.on('offlineMsgDelivered',(data)=>{
  //console.log(' got delivered  ',data);

  var  delivered =
{
  myPhone:data.myPhone,
  clientPhone:data.clientPhone
}

//console.log('hlo sending ping request to ',data.myPhone);
 io.emit('ping'+data.myPhone,delivered);
  dbo.collection("users").update({phone:data.myPhone},{$addToSet:{delivered}},{upsert:true},(err,result)=>{
    if(err){
      //////console.log(err);
    }
    else{
      //console.log('data base updated');
    }
  })
  //io.emit('msgRead'+message.clientPhone,message);
})

    socket.on('msgRead',(message)=>{
      //console.log('sending read of to ','msgRead'+message.clientPhone);
      io.emit('msgRead'+message.clientPhone,message);
    })

      socket.on('ping-confirm',(message)=>{
        //console.log('got pong back from ',message);
      //  io.emit('msgDelivered'+message.clientPhone,message);
      io.emit('msgDelivered'+message.myPhone,message);

          if (message.message) {

              var clientNumber=0;
            if (io.sockets.adapter.rooms[message.roomId]) {
               clientNumber = io.sockets.adapter.rooms[message.roomId].length;
            }
            else{
           clientNumber=0;
            }
            if(clientNumber<2){
               io.emit(message.clientPhone,{text:message.message,from:message.myPhone,created: message.time,msgId:message.msgId,file:message.file});
                  }
            else if(clientNumber==2){
            var sendTo='reply-message'+message.clientPhone;
              io.to(message.roomId).emit(sendTo, {text: message.message, from: message.myPhone, created: message.time,msgId:message.msgId,file:message.file});
            }

      //  io.emit(message.clientPhone,{text:message.message,from:message.myPhone,created: message.time});
        dbo.collection("users").updateOne({phone:message.clientPhone},{$unset:{messages:0}},(err,result)=>{
           if(err){
             //////console.log(err);
           }
           else{
          //console.log('deleted chat '+message.clientPhone);

           }
         })
       }
      })



  socket.on('send-message', (message) => {
    io.emit('ping'+message.clientPhone,message);

    var  messages =
  {  text:message.message,
    from:message.myPhone,
    created:message.time,
    msgId:message.msgId,
    file:message.file
  }
  var msgDeliveryPending={
    myPhone:message.myPhone,
    clientPhone:message.clientPhone
  }

  var payload = {
    notification: {
      title: message.myPhone,
      body: message.message,
      click_action:"FCM_PLUGIN_ACTIVITY",  //Must be present for Android

    },
    data: {
      account: "Savings",
      balance: "$3020.25"
    },
  };

    dbo.collection("users").update({phone:message.myPhone},{$addToSet:{msgDeliveryPending}},{upsert:true},(err,result)=>{
      if(err){
        //////console.log(err);
      }
      else{
        //console.log('data base updated');
      }
    })
    dbo.collection("users").update({phone:message.clientPhone},{$addToSet:{messages}},{upsert:true},(err,result)=>{
      if(err){
        //////console.log(err);
      }
      else{
        dbo.collection("users").findOne({phone:message.clientPhone},(err,result)=>{
          if(err){


          }
          else{
          if(result){
            ////console.log(result);
            if(result.token && result.notification){

            admin.messaging().sendToDevice(result.token, payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
        console.log("Error sending message:", error);
        });
      }else{
        console.log("token not present or notification false");
      }
          }
          else{
            //////console.log('no result');
          //  io.emit(sendTo,{err:0});

          }

          }
        })

        //console.log('data base updated');
      }
    })
  });

  socket.on('send-message-offline', (message) => {
    ////console.log('activeusers are',activeUsers);

     if(activeUsers.indexOf(message.clientPhone)===-1){
       ////console.log('sending offline message');
       var payload = {
         notification: {
           title: message.myPhone,
           body: message.message,
           click_action:"FCM_PLUGIN_ACTIVITY",  //Must be present for Android

         },
         data: {
           account: "Savings",
           balance: "$3020.25"
         },
       };


    //////console.log("sending offline message  to "+message.clientPhone);
    var  messages =
  {  text:message.message,
    from:message.myPhone,
    created:message.time,
    file:message.file
  }
    var sendTo='messages'+this.myPhone;
    dbo.collection("users").update({phone:message.clientPhone},{$addToSet:{messages}},{upsert:true},(err,result)=>{
      if(err){
        //////console.log(err);
      }
      else{
        dbo.collection("users").findOne({phone:message.clientPhone},(err,result)=>{
          if(err){


          }
          else{
          if(result){
            ////console.log(result);
            if(result.token && result.notification){

            admin.messaging().sendToDevice(result.token, payload, options)
        .then(function(response) {
          console.log("Successfully sent message:", response);
        })
        .catch(function(error) {
        console.log("Error sending message:", error);
        });
      }else{
        console.log("token not present or notification false");
      }
          }
          else{
            //////console.log('no result');
          //  io.emit(sendTo,{err:0});

          }

          }
        })

      }
    })
    //dbo.collection('users').
    //////console.log(message);
}
else{
  //send online message
  ////console.log('sending online message');

        var clientNumber=0;
      if (io.sockets.adapter.rooms[message.roomId]) {
         clientNumber = io.sockets.adapter.rooms[message.roomId].length;
      }else{
     clientNumber=0;
      }

  //////console.log("total client "+clientNumber);
  if(clientNumber<2){
    io.emit(message.clientPhone,{text:message.message,from:message.myPhone,created: message.time,file:message.file});
  }
  else if(clientNumber==2){
  var sendTo='reply-message'+message.clientPhone;

    io.to(message.roomId).emit(sendTo, {text: message.message, from: message.myPhone, created: message.time,file:message.file});
  }
}
  });


  socket.on('Active', (data) => {
    //////console.log('activeusers are',activeUsers);

    ////console.log("got active of "+data.phone);
    if(activeUsers.indexOf(data.phone)===-1){
      activeUsers.push(data.phone);
    }else{

    }

    ////console.log(activeUsers);
    socket.phone=data.phone;
    //socket.clientPhone=data.clientPhone;
    dbo.collection("usersOnline").update({phone:data.phone},{$set:{phone:data.phone,active:true}},{upsert:true},(err,result)=>{
      if(err){
        //////console.log(err);
      }
      else{
      //////console.log('activated user '+data.phone);

      }
    })

  //  //////console.log(data);

  });


    socket.on('register', (data) => {
      //////console.log("got register of "+data.phone);
      dbo.collection("users").insertOne({phone:data.phone,email:data.email,token:data.token,notification:true,notificationSound:true},(err,result)=>{
        if(err){
          console.log(err);
        }
        else{
        console.log('added user '+data.phone);

        }
      })

    });


        socket.on('deleteChat', (data) => {
          //////console.log("got delete  of "+data.myPhone);
         dbo.collection("users").updateOne({phone:data.myPhone},{$unset:{messages:0}},(err,result)=>{
            if(err){
              //////console.log(err);
            }
            else{
            //////console.log('deleted chat '+data.myPhone);

            }
          })

        });

    socket.on('getAllStoredMessages', (data) => {
      //////console.log("getting message of "+data.phone);
      var sendTo = 'storedMessages'+data.myPhone;
      dbo.collection("users").findOne({phone:data.myPhone},(err,result)=>{
        if(err){
          //////console.log(err);
          io.emit(sendTo,{err:1});

        }
        else{
        if(result){
          //////console.log('got result ',result);
          io.emit(sendTo,result);
        }
        else{
          //////console.log('no result');
          io.emit(sendTo,{err:0});

        }

        }
      })


    });

socket.on('profileUpdates',data=>{
  var sendTo='getProfileUpdatesResponse'+data.phone;
  dbo.collection("users").findOne({phone:data.phone},(err,result)=>{
    if(err){
    }
    else{
      if (result) {
        console.log(result);
        console.log('sending to'+data.phone);
        if (result.profileImgUpdate){
          console.log('sending to user', sendTo);
          io.emit(sendTo,{result:result.profileImgUpdate});

        }
        else{
          io.emit('getProfileUpdatesResponse'+sendTo,{result:''});
        }

      }
    }
  })
})

socket.on('deleteProfileUpdate',data=>{
  console.log('got delete of profile img');
  dbo.collection("users").updateOne({phone:data.phone},{$unset:{profileImgUpdate:0}},(err,result)=>{
      if (err) {

      }else{
        console.log('deleted update img');
      }
    })
})

  socket.on('isActive', (data) => {
    //////console.log("checking active of "+data.clientPhone);
    var sendTo ='active'+data.myPhone;//+data.myPhone;
  //  socket.phone=data.phone;
    dbo.collection("usersOnline").findOne({phone:data.clientPhone},(err,result)=>{
      if(err){
        //////console.log(err);
        io.emit(sendTo,{active:false,err:1});

      }
      else{
      if(result){
        //////console.log('got result ',result);
        io.emit(sendTo,result);
      }
      else{
        //////console.log('no result');
        io.emit(sendTo,{active:false,err:0});

      }

      }
    })

  //  //////console.log(data);

  });


});

app.get('/',(req,res)=>{
  res.json({result:"welcome to spotchat chat"});
})
app.post('/checkContact',(req,res)=>{
  var data =req.body;
console.log("data send by user is ",data);
  dbo.collection("users").findOne({phone:data.phone},(err,result)=>{
    if(err){

    }
    else{
      if (result) {
        console.log(result);
      var dataToSend={
        phone:result.phone,
        avatar:result.userAvatar
      }
      res.json(dataToSend);
    }
    else{
      console.log("no user with this phone");
      res.json({status:'no user'});
    }
  }
  })
})

app.post('/updateNotification',(req,res)=>{
  var data =req.body;
  console.log('got notification update ',data);
  dbo.collection("users").update({phone:data.phone},{$set:{notification:data.notification,notificationSound:data.notificationSound}},{upsert:true},(err,result)=>{
    if(err){
    console.log('error');
    res.json({status:err});
  }
  else{
    res.json({status:'ok'})
  }
})
})

  var counter=0;
  function sendProfileUpdate(phone,avatar,numbers,length){
    console.log('sending to '+numbers[counter],'counter is '+counter);
    var numbers=numbers;
    var profileImgUpdate={
      phone:phone,
      newAvatar:avatar
    }
    dbo.collection("users").update({phone:numbers[counter]},{$addToSet:{profileImgUpdate}},{upsert:true},(err,result)=>{
      if(err){
      console.log('errorsend',err);

    }
      else{
        if (counter<=length-1) {
        //  numbers.splice(counter,1);
          sendProfileUpdate(phone,avatar,numbers,length);
          counter++;
        }else{
          counter=0;
          return 0;
        }

      }
    })

  }


app.post('/updateprofile',(req,res)=>{
  console.log(req.body);
  var data =req.body;
console.log("user data is ",data);

    var userPhone=data.userPhone;
    delete data['userPhone'];
    data['phone']=userPhone;
    dbo.collection("users").update({phone:userPhone},{$set:data},{upsert:false},(err,result)=>{
      if(err){
      console.log('error',err);
      res.json({status:err});
    }

      else{
        if (data.profile) {
          if (data.nmbers) {
            var phone=data.userPhone;
            var avatar=data.userAvatar;
            sendProfileUpdate(userPhone,avatar,data.nmbers,data.nmbers.length);
          }

        }

      //  console.log('user data updated sucessfully');
        res.json({status:"ok"});

      }
    })


  })

//connect to database
db.connect((err)=>{
  if(err){
    //////console.log('unable to connect');
    //////console.log(err);
    process.exit(1);
  } //'0.0.0.0',
  else{
    const port=process.env.PORT ||3000;
    server.listen(port,()=>{
    console.log('connected to port :' +port);
      dbo = db.getDB("spot-chat");
  /*    let change_streams = dbo.collection('todo').watch()
        change_streams.on('change', function(change){
          ////console.log("todo changed");
          //////console.log(JSON.stringify(change));
        });*/
    })
  }
})
