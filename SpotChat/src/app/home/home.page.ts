

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController  } from '@ionic/angular';
import { ContactsPage } from '../modals/contacts/contacts.page';
import { ProfilePreviewPage } from '../modals/profile-preview/profile-preview.page';

import { Socket  } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { ServerService } from '../services/server.service';
import { AudioService } from './../services/audio.service';
import { EventsService } from './../services/events.service';
import {  NgZone } from '@angular/core';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  chatData=[];
  myPhone:string="";
  allContacts;
  spotContacts;
  contactList;
  roomId:string;
  token;
  img;
  imgSrc;
  chatDataPresent=false;
  connection=false;
  listner:boolean=false;
  deliveredList=[];
  chatUpdate:boolean=false;
  click=true;
  selectedPhone=[];
  todaysDate;
  loaded:boolean=false;
  loadedMy:boolean=false;
  monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
delete=false;
selectLength='';
userData={
  userPhone:"",
  userName:'',
  userAbout:"",
  userAvatar:""
};
chatDataLoading:boolean=true;
fakeUsers=[1,2,3,4,5,6,7,8];

constructor(private server:ServerService,private eventsService:EventsService,
  public router: Router,private modalCtr:ModalController,public socket:Socket,
  private storage:Storage,private audioService:AudioService,private zone: NgZone) {
  //  this.toggle = document.querySelector('#themeToggle');
//     this.toggle.addEventListener('ionChange', (ev) => {
//       document.body.classList.toggle('dark', ev['detail'].checked);
//
// //prefersDark.addListener((e) => this.checkToggle(e.matches));
//
//
// // Called by the media query to check/uncheck the toggle
//
//   });

  var currentTime = new Date()
    var month = currentTime.getMonth() + 1
    var day = currentTime.getDate()
    var year = currentTime.getFullYear();
    this.todaysDate=day+" "+this.monthNames[Number(month)]+" "+year;
    //alert('gettig')
    this.storage.get('userPhone').then((data)=>{
        if(data){
      this.userData=data;
        console.log(this.userData);
        this.myPhone=data.userPhone;
        this.initReplyListner();
        this.listner=true;
        console.log('my phone is',this.myPhone);
        this.socket.on('ping'+this.myPhone,(data)=>{
          //console.log("got ping request",data);
          this.socket.emit('ping-confirm',data);
        })

        this.server.setMyPhone(this.myPhone);
        this.server.connectSocket();
        this.server.getChatData(null);
        //this.storage.set('chatData',null);
        this.storage.get('chatData').then((chatD)=>{
//          chatD=JSON.parse(chatD);
          if(chatD){
            //alert(chatD);
            console.log('chatad is ',chatD);
            if (chatD.length>0) {
              this.chatDataPresent=true;
              this.chatData=chatD;
              if (this.deliveredList && !this.chatUpdate) {
                this.chatUpdate=true;
                for (let indexC = 0; indexC < this.deliveredList.length; indexC++) {
                  const index = this.chatData.findIndex(p => p["phone"] == this.deliveredList[indexC]) ;
                  if (index!=-1) {
                    this.chatData[index]['deliveredAll']=true;
                    var c=true;
                  }
                }
                if (c) {
                  this.storage.set('chatData',this.chatData).then(()=>{
                    console.log('updated Chat Data in chat data');
                  })
                }

              }

            }else{
              this.chatDataPresent=false;
              console.log("no chat data");
            }
          }
          else{
            //////console.log("no chat data");
            this.chatDataPresent=false;
            //alert('no chat data')
          }

        }).catch((err)=>{
          //alert('no chat data or error'+err)
        })


      }
      else{
        this.router.navigateByUrl('/register');
      }

    }).catch((err)=>{
      //alert("error in getting "+err);
    })
    this.checkSocketConnection();

    //this.chatData = [];
  }


  imageLoaded(){
    this.loaded=true;
    console.log('loaded image');

  }



  ngOnInit() {
    // here
    this.eventsService.refreshChatData$.subscribe((data)=>{
      console.log('got chat datat refreshd hereeeeeeeeeeeeeeeeeeeeeee',data);

       if (data['deliveredAll']) {
         this.updateChatData(data);
       }
       else{
         console.log('updating chat data');

         this.updateChatData(false);
       }

     })

    // this.platform.resume.subscribe(() => {
      // this.socket.connect();
     //  //alert('resumed');
     //});
setTimeout(()=>{
  this.fileSendedListner();

},1000)
  }


  ionViewDidEnter() {
    this.deleteChat();
    this.audioService.preload('onSend', 'assets/audio/send.mp3');
      this.audioService.preload('onReceive', 'assets/audio/receiveTone.mp3');

  }

  sendActiveInterval(){
    setInterval(() => {
      this.server.sendActiveStatus(this.myPhone);

    }, 10000)
  }



  async initReplyListner(){
    this.server.sendActiveStatus(this.myPhone);

    await this.server.getAllStoredMessagesResponse(this.myPhone).subscribe(data => {
      this.socket.emit('deleteChat',{myPhone:this.myPhone});
    //  this.chatDataLoading=false;
      this.socket.removeListener('getAllStoredMessages', ()=>{
      });


      if(data['messages']){
        var messages=data['messages'];
      //here
         this.eventsService.storedAllStoredMessage$.subscribe(data=>{
         //  alert('stored all message');
           this.chatDataLoading=false;
           console.log('got listner stored all message');

         })
        this.server.storeChatStored(messages);

        for (let i=0; i<messages.length; i++) {
          setTimeout( ()=>{
            var message=messages[i];
            var d={
              myPhone:message['from'],
              clientPhone:this.myPhone
            };
            this.socket.emit('offlineMsgDelivered',d);
            var name=message['name'];
            var from =message['from'];
            var msg=message['text'];
                var chat ={
              name:name,
              phone:from,
              description:msg,
            }
            const index = this.chatData.findIndex(p => p["phone"] == from) ;
            if (index!=-1) {
              chat['image']=this.chatData[index]['image'];
            }else{
                chat['image']='../../assets/images/profile.png'
            }

            var c=0;
            if(index!=-1){
              if(this.chatData[index]["count"]){
                c=this.chatData[index]["count"];
              }
              this.chatData.splice(index,1);
              this.chatData.unshift(chat);

            }
            this.server.setChatData(chat,true);

          }, i*100 );
        }
      }else{
        console.log('no data');
        this.chatDataLoading=false;

      }
    })
    setTimeout(()=>{
      this.chatDataLoading=false;
    },3000);
    this.server.getAllStoredMessagesDeliveredResponse(this.myPhone).subscribe(data=>{
      this.socket.emit('deleteDelivered',{myPhone:this.myPhone});
      this.socket.removeListener('getAllStoredMessagesDelivered');
      if(data['delivered']){
        console.log('got deliverd msg list',data['delivered']);
        for(var i=0;i<data['delivered'].length;i++){
          this.deliveredList.push(data['delivered'][i]['clientPhone']);
          console.log('delivered clients are',this.deliveredList);
        }
        if (this.chatData) {
          this.chatUpdate=true;
          for (let indexC = 0; indexC < this.deliveredList.length; indexC++) {
            const index = this.chatData.findIndex(p => p["phone"] == this.deliveredList[indexC]) ;
            if (index!=-1) {

              this.chatData[index]['deliveredAll']=true;
              var ch=true;
            }
          }
          if (ch) {
            this.storage.set('chatData',this.chatData).then(()=>{
              console.log('updated Chat Data in get');
            })
          }
        }
      }else{
        console.log('no deliverd msg ');

      }


    })

    this.sendActiveInterval();

  //  this.server.getAllStoredMessages(this.myPhone);
    this.server.getAllStoredDeliveredMsg(this.myPhone);


    this.getReply().subscribe(message => {
      console.log("got message from other side ",message);
      if (message['file']) {
          this.server.storeChat({ fileUrl:message['file'],text: message['text'], sender: 0, image: 'assets/images/sg2.jpg' },message['name'],message['from'],null);
      }else{
        this.server.storeChat({ text: message['text'], sender: 0, image: 'assets/images/sg2.jpg' },message['name'],message['from'],null);
      }

       this.eventsService.refreshConversationF(message);
        const index = this.chatData.findIndex(p => p["phone"] == message['from']) ;
      var count=0;
      var img;
      if (this.chatData) {

      }else{
        this.chatData=[];
      }
      if(index!=-1){
        img=this.chatData[index]['image'];
        if (this.chatData[index]["count"]) {
          count=this.chatData[index]['count'];
        }
        this.chatData.splice(index,1);
      }

      var chatData={};
      chatData['description']=message['text'];
      chatData['phone']=message['from'];
      chatData['image']=img;
      chatData['count']=String(Number(count)+1);
      chatData['time']=message['created'];

         this.zone.run(()=>{
           this.chatData.unshift(chatData);
           this.chatDataPresent=true;
        //   this.chatData=[...this.chatData];
         });
         console.log(this.chatData);

      this.storage.set('chatData',this.chatData).then(()=>{

      })
      console.log('stored chat from listner 1');

      setTimeout(() => {
        //  this.scrollToBottom();
      }, 10)
    });
    console.log('my phone is ',this.myPhone);


  }


  goforChat(chat,i) {

    if (this.click && this.currentSelected.length==0) {
      chat['myPhone']=this.myPhone;
      this.router.navigate(['messages', chat]);
    }
    else{
      console.log("selection is going on");

    }
    this.click=true;

  }

  async presentModalContacts() {
    console.log(this.contactList);

    const modal = await this.modalCtr.create({
      component: ContactsPage,
      componentProps: {
        'myPhone': this.myPhone,
      }
    });
    return await modal.present();
  }


  getReply() {
    let observable = new Observable(observer => {
      this.socket.on(this.myPhone, (data) => {
        observer.next(data);
      });
    })
    return observable;
  }

  updateChatData(b){

    //     setInterval(()=>{
    this.storage.get('chatData').then((data)=>{
    //  data=JSON.parse(data);
      if (data) {
          if (data.length!=0) {


        console.log("chat data is ",data);

      this.chatData=data;
      this.chatDataPresent=true;
      console.log('chat data refreshed');
      if (b) {

        if (b.deliveredAll) {
          console.log('chat data refreshed for deliverd all');

          var index=this.chatData.findIndex(p=>p['phone']==b.clientPhone);
          if (index!=-1) {
            this.chatData[index]['deliveredAll']=true;
            console.log('converted to true');

          }
          this.storage.set('chatData',this.chatData);
        }else{
          console.log('chat data refreshed for delivered false');

          var index=this.chatData.findIndex(p=>p['phone']==b.clientPhone);
          if (index!=-1) {
            this.chatData[index]['deliveredAll']=false;
          }
          this.storage.set('chatData',this.chatData);
        }
      }else{

      }
    }
  }
    })
    //  },3000)
  }

  checkSocketConnection(){
    this.socket.on( 'connect',  ()=> {
      if (!this.listner) {
        this.initReplyListner();
        this.listner=true;
      }
      console.log( 'connected to server' );
      this.server.socketConnection(true);
      this.connection=true;
    } );

    this.socket.on( 'disconnect',()=> {
      this.server.socketConnection(false)
      console.log( 'disconnected to server' );
    } );

  }


currentSelected=[];
counter=0;
c=0;
selectedPosition=[];

deleteChat(){
  // here
  // this.events.subscribe('deleteChats',(data)=>{
  //   this.c++;
  //
  //   this.currentSelected=[];
  //   this.counter=0;
  //   this.click=true;
  //   console.log("length is "+this.selectedPhone.length);
  //   for(var t=0;t<this.selectedPhone.length;t++){
  //     this.chatData.splice(this.selectedPosition[t],1)
  //
  //     if (this.chatData.length==0) {
  //       this.chatDataPresent=false;
  //     }
  //     this.storage.set('chatData',this.chatData).then(()=>{
  //       /** thi */  console.log('deleted successfullys');
  //     })
  //     var roomId=String(Math.abs(Number(this.selectedPhone[t])-Number(this.myPhone)));
  //     this.storage.set(this.selectedPhone[t]+roomId+this.todaysDate,null).then(()=>{
  //       console.log('deleted chats');
  //
  //     })
  //   }
  //
  // })

}

pressed(ch,i){
// here  // this.events.subscribe('cancelSelect',(data)=>{
  //   this.currentSelected=[];
  //   this.counter=0;
  //   this.click=true;
  // })
  console.log('pressed',ch,i);
  this.click=false;
  if (this.currentSelected[i]) {
    this.currentSelected[i]=false;
    var index=this.selectedPhone.findIndex(p=>p==ch.phone);
    var index2=this.selectedPhone.findIndex(p=>p==i);

    if (index!=-1) {
      this.selectedPhone.splice(index,1);
    }
    if (index2!=-1) {
      this.selectedPosition.splice(index2,1);
    }


    console.log("unselect");
    this.counter--;
  }
  else{
    this.counter++;
    this.currentSelected[i]=true;
    this.selectedPhone.push(ch.phone);
    this.selectedPosition.push(i);
  }
  this.delete=true;
  this.selectLength=String(this.counter);
  console.log("length is "+this.counter);


}



async viewProfile(data){
  const modal = await this.modalCtr.create({
    component: ProfilePreviewPage,
    componentProps: {
      userData: data
    }
  });
  return await modal.present();
  await modal.dismiss(data=>{
    console.log('modal dismissed',data);

  })
}

cancelSelect(){
     this.currentSelected=[];
     this.counter=0;
     this.click=true;
//here  this.events.publish('cancelSelect','');
  this.delete=false;
  this.selectLength='';
}

deleteChatL(){
  console.log("delete tabs");
  this.c++;

  this.currentSelected=[];
  this.counter=0;
  this.click=true;
  console.log("length is "+this.selectedPhone.length);
  for(var t=0;t<this.selectedPhone.length;t++){
    this.chatData.splice(this.selectedPosition[t],1)

    if (this.chatData.length==0) {
      this.chatDataPresent=false;
    }
    this.storage.set('chatData',this.chatData).then(()=>{
      console.log('deleted successfullys');
    })
    var roomId=String(Math.abs(Number(this.selectedPhone[t])-Number(this.myPhone)));
    this.storage.set(this.selectedPhone[t]+roomId+this.todaysDate,null).then(()=>{
      console.log('deleted chats');

    })
  }

  //   this.events.publish('deleteChats','');
  this.cancelSelect();
}


resetSocketConnection() {
  //  this.leaveSocketRoom();
    this.socket.connect();
  //  this.joinSocketRoom(token);
  }

  leaveSocketRoom() {
    this.socket.removeAllListeners();
    this.socket.disconnect();
  }


  fileSendedListner(){
  //  alert('file listner  startd');
    this.eventsService.fileSended$.subscribe((data)=>{
         var date = new Date();
         var hours = date.getHours();
         var minutes = date.getMinutes();
         var ampm = hours >= 12 ? 'pm' : 'am';
         hours = hours % 12;
         hours = hours ? hours : 12; // the hour '0' should be '12'
         minutes = Number(minutes < 10 ? '0'+minutes : minutes);
         var strTime = String(hours + ':' + minutes + ' ' + ampm);
         let id = Math.random().toString(36).substring(7);
        // alert('event fired for file in home url is '+data['fileUrl']);
        this.server.sendMessage(data['fileName'],data['clientPhone'],data['myPhone'],data['roomId'],data['isActive'],data['clientName'],strTime,id,data['fileUri'],data['fileUrl']);

    })
  }


}
