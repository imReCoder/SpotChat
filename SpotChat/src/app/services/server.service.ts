import { Injectable } from '@angular/core';
import { Socket  } from 'ng-socket-io';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
//import {Events} from '@ionic/angular';
import { FCM } from '@ionic-native/fcm/ngx';

import { File } from '@ionic-native/file/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { EventsService } from './../services/events.service';

// import { NativeStorage } from '@ionic-native/native-storage/ngx';
@Injectable({
  providedIn: 'root'
})
export class ServerService {
  myPhone:string;
  chatData=[];
  pendingMessages=[];
   monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
todaysDate;
imgSrc;
spotContacts;
  connection:boolean=false;
  constructor(private file:File,private _fileTransfer:FileTransfer,private eventsService:EventsService,
    private socket : Socket,public storage:Storage,public router:Router) {

    var currentTime = new Date()
var month = currentTime.getMonth() + 1
var day = currentTime.getDate()
var year = currentTime.getFullYear();
this.todaysDate=day+" "+this.monthNames[Number(month)]+" "+year;
console.log("todays date is ",this.todaysDate);
  this.storage.get('userPhone').then(data=>{
  //  data=JSON.parse(data);
    if (data) {
      console.log(data);
      this.myPhone=data.userPhone;
      console.log('phone is '+data.userPhone);

      this.getProfileUpdatesResponse().subscribe((data)=>{
        console.log('got image update data');
        this.socket.emit('deleteProfileUpdate',{phone:this.myPhone});
        console.log(data);
        this.storage.get('chatData').then((cData)=>{
          if (data) {
            for(var i=0;i<data['result'].length;i++){
              var index = cData.findIndex(p=>p['phone']==data['result'][i]['phone'])
              if (index!=-1) {
                cData[index]['image']=data['result'][i]['newAvatar'];
                  console.log('updaing image of ',data['result'][i]['phone']);

              }
            }

            this.storage.set('chatData',cData).then(()=>{

            })
          }
        })
      })
    }else{
      console.log('no user data');

    }
  })
this.getSpotContacts();
this.profileImgChange();
console.log(this.myPhone);

}


getSpotContacts(){
  this.storage.get('spotContacts').then((data)=>{
  //  data=JSON.parse(data);
    if (data) {
      data = data.filter(function( element ) {
        return element !== undefined;
        });
        data = data.filter(function( element ) {
          return element !== null;
          });
          this.spotContacts=data;
          console.log(data);
        }
      })


}
setMyPhone(phone){
  this.myPhone=phone;
  console.log('service started'+this.myPhone);
}
getChatData(clientPhone){
  this.storage.get('chatData').then((chatD)=>{
    //  console.log(chatD);
//    chatD=JSON.parse(chatD);
    if(chatD){
      this.chatData=chatD;
      if (clientPhone) {
        const index = this.chatData.findIndex(p => p["phone"] == clientPhone) ;
        if(index!=-1){
          this.chatData[index]['count']=0;
          this.storage.set("chatData",this.chatData);
        }
      }
      else{

      }
      this.getProfileUpdates(this.myPhone);
    }
    else{
      console.log('no chat data');

    }
  })
}

async setChatData(data,count){
console.log('previous chat data ',this.chatData);
console.log('adding chat data',data);

  const index = this.chatData.findIndex(p => p["phone"] == data['phone']) ;
  console.log("index is "+index );

  var c=0;
  if(index!=-1){
    if (this.chatData[index]["count"]) {
      c=this.chatData[index]['count'];
    }else{

    }

    this.chatData.splice(index,1);
  }
  if(count){
    data['count']=String(Number(c)+1);
  }

    this.chatData.unshift(data);
    console.log('updated chat data',this.chatData);



   await this.storage.set('chatData',this.chatData).then(()=> {
  //  this.getChatData(null);
  console.log(this.chatData);

  });
}

  getNewAvatar(url,phone){
    console.log(url);
    this.file.checkDir(this.file.externalRootDirectory,'SpotChat').then((data)=>{
    //  //alert('spot chat file present')
                this.file.checkFile(this.file.externalRootDirectory+'/SpotChat/',phone+'.jpg').then((files)=>{
                //  //alert('file found');
                   this.file.removeFile(this.file.externalRootDirectory+'SpotChat',phone+'.jpg').then((data)=>{
                     this.updateDirectory(url,phone);
                   })
                }).catch((err)=>{
                   this.updateDirectory(url,phone);
                  //  //alert('file not found');
                  })
                }).catch((err)=>{
              //    //alert('spotchat file not found');
                  this.createDirectory(url,phone);
                })
  }

  createDirectory(url,phone){

this.file.createDir(this.file.externalRootDirectory, 'SpotChat', false).then(response => {
//alert('folder created');
const _fileTransfer: FileTransferObject = this._fileTransfer.create();
_fileTransfer.download(url, this.file.externalRootDirectory+'/SpotChat/'+phone+'.jpg').then((entry) => {
console.log('download complete: ' + entry.toURL());
//  //alert(entry.toURL());
//  this.events.publish('gotImg',entry.toURL());

//alert('download complete'+ entry.toURL())
}, (error) => {
console.log(error);
////alert(JSON.stringify(error))
});
}).catch((err)=>{
////alert(err);
////alert(JSON.stringify(err));
})
  }
    updateDirectory(url,phone){
      const _fileTransfer: FileTransferObject = this._fileTransfer.create();
      _fileTransfer.download(url, this.file.externalRootDirectory+'/SpotChat/'+phone+'.jpg').then((entry) => {
      console.log('download complete: ' + entry.toURL());
    //  this.events.publish('gotImg',dataurl);

    //  //alert('download complete'+ entry.toURL())
      }, (error) => {
      console.log(error);
    //  //alert(JSON.stringify(error))
      });
    }

i=0;
sendingPending=false;
sendPendingMessages(messages){
  if (!this.sendingPending) {
    this.startSendingPendingMessage(messages);
    console.log("sending pending mess ",messages);

  }else{
    console.log('pending message alread sending');

  }
}



startSendingPendingMessage(messages){

  if(this.connection){
    this.sendingPending=true;
        if (messages) {
          this.socket.emit('send-message',messages[this.i]);
          console.log("semding pending message",messages[this.i]);
          this.i++;

      //  this.pendingMessages=null;
        if(this.i<=messages.length-1){
          this.sendingPending=false;
          this.startSendingPendingMessage(messages);
        }else{

          this.storage.set('pendingMessage',null);
          this.pendingMessageSended();
        }
      }
      else{
        console.log('no pending message ');
      }

  }
  else{
    console.log('pending messages can not be sended due to no connection');

  }
}
  pendingMessageSended(){
    console.log('all pending message sended');
    this.sendingPending=false;
  }




  connectSocket(){
    this.socket.connect();
  }

    getAllStoredMessages(myPhone){
      this.connectSocket();
      console.log('getting stored message ',myPhone);

      this.socket.emit('getAllStoredMessages',{myPhone:myPhone});
    }
    getAllStoredDeliveredMsg(myPhone){
      console.log('getting delivered msges '+ myPhone);
      this.socket.emit('getAllStoredDeliveredMsg',{myPhone:myPhone})
    }


  sendActiveStatus(phone){
    this.socket.emit('Active', { phone: phone });
    this.myPhone=phone;
  }
storedMessageLenght=0;;
counter=0;


async  storeChatStored(newDataAll){
console.log('storing all chats',newDataAll);


if (this.counter<=newDataAll.length-1) {
    var currentTime = new Date()
var month = currentTime.getMonth() + 1
var day = currentTime.getDate()
var year = currentTime.getFullYear();
var todaysDate=day+" "+this.monthNames[Number(month)]+" "+year;
console.log("todays date is ",todaysDate);
  var clientPhone=newDataAll[this.counter]['from'];
  var roomId=String(Math.abs(Number(clientPhone)-Number(this.myPhone)));
    await this.storage.get(clientPhone+roomId+todaysDate).then((oldData)=>{
    //  oldData=JSON.parse(oldData);
      if(oldData){
        if(this.todaysDate!=todaysDate){
          newDataAll[this.counter]['dateChanged']=this.todaysDate;
        }else{
          console.log('date not changed');

        }
        oldData.push(newDataAll[this.counter]);
         this.storage.set(clientPhone+roomId+todaysDate,oldData).then(()=>{
           this.counter++;
           this.storeChatStored(newDataAll);
           //alert('message saved'+JSON.stringify(oldData))
      //  this.storage.set(clientPhone+roomId,null);
    }).catch((err)=>{
      //alert('error in storing'+err);
    })
      }
      else{
        var dataSet=[];
        dataSet.push(newDataAll[this.counter]);
        this.storage.set(clientPhone+roomId+todaysDate,dataSet).then(()=>{
          this.counter++;
          this.storeChatStored(newDataAll)
      //    this.storage.set(clientPhone+roomId,null);
        })
      }
    }).catch((err)=>{
      //alert('eror in storing msg ');
      var dataSet=[];
      dataSet.push(newDataAll[this.counter]);
      this.storage.set(clientPhone+roomId+todaysDate,dataSet).then(()=>{
        this.counter++;
        this.storeChatStored(newDataAll)
    //    this.storage.set(clientPhone+roomId,null);
      })
    })
  }else{
      console.log('storeda ll messages');
    // here
     this.eventsService.storedAllStoredMessageF();
  }
  //  this.counter++;
  }


      async storeChat(newData,clientName,clientPhone,roomId){
        if (roomId) {

        }else{
        //  console.log("newdata is ",newData);

          roomId=String(Math.abs(Number(clientPhone)-Number(this.myPhone)));
      //    console.log("storing chat with room id and clientPhone",roomId,clientPhone);

        }
        var currentTime = new Date()
  var month = currentTime.getMonth() + 1
  var day = currentTime.getDate()
  var year = currentTime.getFullYear();
  var todaysDate=day+" "+this.monthNames[Number(month)]+" "+year;
  console.log("todays date is ",todaysDate);

        await this.storage.get(clientPhone+roomId+todaysDate).then((oldData)=>{
        //  oldData=JSON.parse(oldData);
          if(oldData){
            if(this.todaysDate!=todaysDate){
              newData['dateChanged']=this.todaysDate;
            }else{
              console.log('date not changed');

            }
            oldData.push(newData);
             this.storage.set(clientPhone+roomId+todaysDate,oldData).then(()=>{
               //alert('message saved'+JSON.stringify(oldData))
          //  this.storage.set(clientPhone+roomId,null);
        }).catch((err)=>{
          //alert('error in storing'+err);
        })
          }
          else{
            var dataSet=[];
            dataSet.push(newData);
            this.storage.set(clientPhone+roomId+todaysDate,dataSet).then(()=>{
          //    this.storage.set(clientPhone+roomId,null);
            })
          }
        }).catch((err)=>{
          //alert('eror in storing msg ');
          var dataSet=[];
          dataSet.push(newData);
          this.storage.set(clientPhone+roomId+todaysDate,dataSet).then(()=>{
        //    this.storage.set(clientPhone+roomId,null);
          })
        })


      }
        joinRoom(roomId){
          this.socket.emit('join',{roomId:roomId});
        }

        isActive(roomId,clientPhone,myPhone){
        //  console.log('getting active status of user '+clientPhone);
          this.socket.emit('isActive', {roomId:roomId, myPhone:myPhone,clientPhone: clientPhone });
        }

        socketConnection(status){
          this.connection=status;

          this.storage.get('pendingMessage').then((messages)=>{
            this.sendPendingMessages(messages);
          })


          console.log(this.connection);
        }


      async  sendMessage(message,clientPhone,myPhone,roomId,active,clientName,time,msgId,fileUri,fileUrl){
          console.log(this.connection);


          if (this.connection) {
            if (fileUri) {
              await  this.storeChat({ text:message,fileUri:fileUri, sender: 1,msgId:msgId,sent:true,delivered:false,read:false },clientName,clientPhone,roomId);
            }else{
              await  this.storeChat({ text: message, sender: 1,msgId:msgId,sent:true,delivered:false,read:false },clientName,clientPhone,roomId);
            }

            //alert('connection present');
            console.log('sending active messaged');

          if (active) {
            if (fileUri) {
              this.socket.emit('send-message', { myPhone: myPhone,message:message,clientPhone:clientPhone,roomId:roomId,name:clientName,time:time,msgId:msgId,file:fileUrl })
            }else{
                  this.socket.emit('send-message', { myPhone: myPhone,message:message,clientPhone:clientPhone,roomId:roomId,name:clientName,time:time,msgId:msgId,file:false })
            }

        // here
          this.eventsService.msgSendedF(msgId);
          }
          else{
            if (fileUri) {
              this.socket.emit('send-message-offline', { myPhone: myPhone,message:message,clientPhone:clientPhone,roomId:roomId,name:clientName,time:time,msgId:msgId,file:fileUrl })
            }else{
              this.socket.emit('send-message-offline', { myPhone: myPhone,message:message,clientPhone:clientPhone,roomId:roomId,name:clientName,time:time,msgId:msgId ,file:false})
            }


            // here
            this.eventsService.msgSendedF(msgId);

          }
        }
        else {
            var data;
          if (fileUri) {
            await  this.storeChat({ text:message,fileUri:fileUri, sender: 1,msgId:msgId,sent:false,delivered:false,read:false },clientName,clientPhone,roomId);


          //alert('no connection');
          console.log('no connection pending message');
           data={
             myPhone: myPhone,
             fileUri:fileUri,
             clientPhone:clientPhone,
             roomId:roomId,
             time:time
            }
          }else{
            await  this.storeChat({ text: message, sender: 1,msgId:msgId,sent:false,delivered:false,read:false },clientName,clientPhone,roomId);


          //alert('no connection');
          console.log('no connection pending message');
           data={
             myPhone: myPhone,
             message:message,
             clientPhone:clientPhone,
             roomId:roomId,
             time:time
            }
          }

          this.pendingMessages.unshift(data)
          await  this.storage.set("pendingMessage",this.pendingMessages).then(()=>{
            })

          }
        //  this.setChatData({phone:clientPhone,name:clientName,description:message,time:""})
        }
        getAllStoredMessagesResponse(phone) {
        console.log('listening ');

          let observable = new Observable(observer => {
            this.socket.on('storedMessages'+phone, (data) => {
              observer.next(data);
            });
          })
          return observable;
        }

        getAllStoredMessagesDeliveredResponse(phone) {
          console.log('listening offline msg delivered at ',phone);

          let observable = new Observable(observer => {
            this.socket.on('SofflinedeliveredMsg'+phone, (data) => {
              observer.next(data);
            });
          })
          return observable;
        }

        getOnlineStatus(phone) {
          console.log(phone);

          let observable = new Observable(observer => {
            this.socket.on('active'+phone, (data) => {
              observer.next(data);
            });
          })
          return observable;
        }


        addNewUser(myPhone,email,token){
          this.socket.emit('register', { phone: myPhone,email:email,token:token })
          this.router.navigateByUrl('');
        }


          getProfileUpdates(myPhone){
            this.socket.emit('profileUpdates',{phone:myPhone});
          }


          getProfileUpdatesResponse(){
            console.log('listening update img on'+'getProfileUpdatesResponse'+this.myPhone);
            let observable = new Observable(observer => {
              this.socket.on('getProfileUpdatesResponse'+this.myPhone, (data) => {
                observer.next(data);
              });
            })
            return observable;

          }

          profileImgChange(){
            console.log('listening to profile change');

          // here   this.events.subscribe('profileImgChange',data=>{
          //     if (data['result']!='') {
          //       for(var l=0;l<data['result'].length;l++){
          //         const index = this.spotContacts.findIndex(p => p["phone"] == data['result'][l]['phone']) ;
          //         if (index!=-1) {
          //           this.spotContacts[index]['image']=data['result'][l]['newAvatar'];
          //         }
          //   }
          //   this.storage.set('spotContacts',this.spotContacts);
          // }
          //   })
          }


               //  getToken() {
               //   this.fcm.getToken().then(token => {
               //     this.token=token;
               //  //   alert('got token'+token);
               //     this.storage.set('notificationToken',token).then(()=>{
               //       console.log('token saved');
               //       //this.socket.emit('')
               //     })
               //     // Register your new token in your back-end if you want
               //     // backend.registerToken(token);
               //   });
               // }

}
