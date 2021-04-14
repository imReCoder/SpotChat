
import { Component, OnInit,ViewChild  } from '@angular/core';
import { ModalController,Platform } from '@ionic/angular';
import { IonInput } from '@ionic/angular';
import { ActivatedRoute  } from '@angular/router';
import { Socket  } from 'ng-socket-io';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { ServerService } from '../../services/server.service';
import { ProfilePreviewPage } from '../../modals/profile-preview/profile-preview.page';
import { IonSlides } from '@ionic/angular';
import { AudioService } from '../../services/audio.service';
import { EventsService } from '../../services/events.service';
import { Chooser } from '@ionic-native/chooser/ngx';
import { FileManagerService } from '../../services/file-manager.service';
import { FirebaseStorageService } from '../../services/firebase-storage.service';
import { ImageViewPage } from '../../modals/image-view/image-view.page';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { VideoPlayer } from '@ionic-native/video-player/ngx';
import { File } from '@ionic-native/file/ngx';
import { DomSanitizer } from '@angular/platform-browser';
// import { NativeStorage } from '@ionic-native/native-storage/ngx';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  @ViewChild('inputText', {  static: false })  inputElement: IonInput;
  @ViewChild('slides', { static: true }) slider: IonSlides;
    @ViewChild('content',{static:false}) contentArea;
  segment=0;
  myPhone:string="";
  connection:boolean=false;
  clientPhone:string;
  profileImgP:boolean=false;
  messages = [];
  clientName='ranjit';
  isActive:boolean=false;
  message = '';
  pendingMessage=[];
  conversation = [
  ]
  emojiPanel:string='deactive';
  monthNames = ["January", "February", "March", "April", "May", "June",
 "July", "August", "September", "October", "November", "December"
 ];
  input = '';
  client:any;
  roomId:string;
  chatData=[];
  lastMsgData = null;
  todaysDate;
  deliveredAll=false;
  chatDataOfUser={

  };
  profileImg;
  playingS:boolean=false;
playingR:boolean=false;
chooserUri;
imgPath;
vidPath;
  constructor(private sanitizer:DomSanitizer,private file:File,private videoPlayer: VideoPlayer, private webView:WebView, private fStorage:FirebaseStorageService,private audioService:AudioService,private platform:Platform ,
     private modalCtr:ModalController,private eventsService:EventsService,
    private storage: Storage,public activeRouter:ActivatedRoute, public socket:Socket,
    public server:ServerService,private chooser:Chooser,private fileManager:FileManagerService) {
    var currentTime = new Date()
var month = currentTime.getMonth() + 1
var day = currentTime.getDate()
var year = currentTime.getFullYear();
 this.todaysDate=day+" "+this.monthNames[Number(month)]+" "+year;
//console.log("todays date is ",this.todaysDate);

    }

      async presentModalViewImage(url,time) {

        const modal = await this.modalCtr.create({
          component: ImageViewPage,
          componentProps: {
            data:{url:url,time:time,clientName:this.clientName}
                    }
        });
        return await modal.present();
      }

chooseFile(){
  this.chooser.getFile()
  .then(file => this.saveFileF(file,this.clientPhone))
  .catch((error: any) => alert(error));
}

async saveFileF(file,phone){
  await this.fileManager.saveFile(file,phone).then((data)=>{
    if (data.status=='ok') {
    //  alert('file saved success');
      this.send(file);
    }else{
    //  alert('some error occured in saving file to directory');
    }
  //  alert('file upload started ');
     this.fStorage.uploadFile(file,this.clientPhone,this.myPhone,this.roomId,this.isActive,this.clientName);
    //  .then( (st)=>{
    //   if (st.status=='ok') {
    //     alert('file uploaded with url (message page) '+st.url);
    //   //   var date = new Date();
    //   //   var hours = date.getHours();
    //   //   var minutes = date.getMinutes();
    //   //   var ampm = hours >= 12 ? 'pm' : 'am';
    //   //   hours = hours % 12;
    //   //   hours = hours ? hours : 12; // the hour '0' should be '12'
    //   //   minutes = Number(minutes < 10 ? '0'+minutes : minutes);
    //   //   var strTime = String(hours + ':' + minutes + ' ' + ampm);
    //   //   let id = Math.random().toString(36).substring(7);
    //   //
    //   // //  this.server.sendMessage(file.name,to,myPhone,roomId,isActive,clientName,strTime,id,file.uri,downloadURL);
    //   //
    //   //  await this.server.sendMessage(file.name,this.clientPhone,this.myPhone,this.roomId,this.isActive,this.clientName,strTime,id,file.uri,st.url);
    //     return {status:'ok'};
    //   }else{
    //     alert('error in file uploading');
    //     return {status:false};
    //   }
    // })

  })
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
        //console.log('modal dismissed',data);

      })
    }

    listenResume(){
      this.platform.resume.subscribe(() => {
        this.socket.connect();
        this.server.joinRoom(this.roomId);
    //    //alert('resumed');

      });
    }
    listenMessage(){

      // here this.events.subscribe('refreshConversation',message=>{
      this.eventsService.refreshConversation$.subscribe(message=>{
         console.log('got message in listner ',message);
       //  this.getOldChat();
       var date = new Date();
       var hours = date.getHours();
       var minutes = date.getMinutes();
       var ampm = hours >= 12 ? 'pm' : 'am';
       hours = hours % 12;
       hours = hours ? hours : 12; // the hour '0' should be '12'
       minutes = Number(minutes < 10 ? '0'+minutes : minutes);
       var strTime = String(hours + ':' + minutes + ' ' + ampm);

       console.log('pushed message in ',this.conversation);
       setTimeout(()=>{
         this.conversation.push({ text: message['text'], sender: 0,time:strTime });
         console.log('pushed message updated ',this.conversation);
       },500);


        //alert('msg on other page');
     })
    }

    ngOnInit() {
      this.activeRouter.params.subscribe(extras => {
        this.client = extras;
        this.chatDataOfUser=this.client;
        //alert(JSON.stringify(this.client));
        //console.log(this.client);
        this.myPhone=this.client.myPhone;
        this.clientPhone=this.client.phone;
        this.roomId=String(Math.abs(Number(this.clientPhone)-Number(this.myPhone)));
        this.getOldChat();
        this.listenResume();
    //    this.listenMessage();
            if(this.client.name && this.client.name!='undefined'){
          this.clientName=this.client.name
        }else{
          this.clientName=this.clientPhone;
        }
        this.storage.get('chatData').then((data)=>{


          if (data) {
            //alert(data);
          //console.log("storage chat data is ",data);
        //  data=JSON.parse(data);
          var index= data.findIndex(p => p["phone"] == this.clientPhone);
          //console.log('index is ',index);

          if(index!=-1){
            this.chatDataOfUser=data[index];

            if (this.client.image) {
              this.chatDataOfUser['image']=this.client.image;
            //console.log('images received',this.client.image);
            this.profileImg=this.chatDataOfUser['image'];

          }else{
            //console.log('no imge');
            this.profileImg=this.chatDataOfUser['image'];
          }
            //console.log("chat data of user is ",this.chatDataOfUser);

            //console.log('proile image is ',this.profileImg);

            data[index]['count']=0;
            this.storage.set('chatData',data).then(()=>{
              console.log('data saved succesfully');

            })
          }
          else{
            this.chatDataOfUser=this.client;
            if (this.client.image) {
              this.profileImg=this.client['image'];
            }
            //console.log(this.client['image']);

            //console.log(this.chatDataOfUser);


          }
        }
          else{

          }
        }).catch((err)=>{
          //alert(err);
        })
        this.sendActiveInterval();

        this.server.getOnlineStatus(this.myPhone).subscribe(activeData => {
          ////console.log("online status is");
          ////console.log(activeData);
          if(activeData['active']){
            this.isActive=true;
        //    //console.log('user is online');
          }else{
            //console.log('user is offline');
            this.isActive=false;
          }

        });
        ////console.log("my phone "+this.myPhone);
        ////console.log("client phone "+this.clientPhone);
        ////console.log("room is is",this.roomId);
        ////console.log("socket fed");
        this.server.connectSocket();
        this.socket['connected']=true;
        this.server.joinRoom(this.roomId);

        this.getMsgRead().subscribe(data =>{
          //console.log("got read of ",data);


            /*  var indexes = this.getAllIndexes(this.conversation, false);
              //console.log('msg read false are',indexes);
              for (let index = 0; index < indexes.length; index++) {
                const element = this.conversation[indexes[index]];

                element['sent']=true;
                element['delivered']=true;
                element['read']=true;
              }*/




             var index=this.conversation.findIndex(p =>p['msgId']==data['msgId']);
             if (index!=-1) {
               this.conversation[index]['read']=true;
                this.storeLastConversation();
             }
           })


        this.getReply().subscribe(message => {
          //console.log("reply is in 2");
          //console.log(message);
        //  alert('got reply');
          var date = new Date();
          var hours = date.getHours();
          var minutes = date.getMinutes();
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          minutes = Number(minutes < 10 ? '0'+minutes : minutes);
          var strTime = String(hours + ':' + minutes + ' ' + ampm);
          var filePath;
          if (message['file']) {
           filePath=this.fileManager.getFilePath();
           this.conversation.push({ text: message['text'], sender: 0, image: 'assets/images/sg2.jpg',time:strTime ,fileUrl: filePath+message['text']+'.jpg'});
           this.fileManager.downloadFile(message['file'],message['text'],message['msgId']);

          }else{
            this.conversation.push({ text: message['text'], sender: 0, image: 'assets/images/sg2.jpg',time:strTime,fileUrl:false});
          }


          if (!this.playingR) {
            this.playingR=true;
            this.audioService.play('onReceive');
            setTimeout(()=>{
              this.playingR=false;
            },300);
          }


          //console.log('sending read of','myPhone:',this.myPhone,'clientPhone:',this.clientPhone,'msgId:',message['msgId']);
          this.deliveredAll=false;
          this.socket.emit('msgRead',{myPhone:this.myPhone,clientPhone:this.clientPhone,msgId:message['msgId']});
          if (message['file']) {
            this.server.storeChat({ fileUrl: filePath+message['text']+'.jpg',text: message['text'], sender: 0, image: 'assets/images/sg2.jpg',sent:false,delivered:false,read:false ,msgId:message['msgId']},this.clientName,this.clientPhone,this.roomId);
          }else{
            this.server.storeChat({ text: message['text'], sender: 0, image: 'assets/images/sg2.jpg',sent:false,delivered:false,read:false ,msgId:message['msgId']},this.clientName,this.clientPhone,this.roomId);
          }


          this.lastMsgData={};
          this.lastMsgData['name']=this.clientName;
          this.lastMsgData['phone']=this.clientPhone;
          this.lastMsgData['description']=message['text'];
          this.lastMsgData['time']=message['created'];

          this.lastMsgData['image']=this.chatDataOfUser['image'];
          this.lastMsgData['count']=0;

          setTimeout(() => {
            this.scrollToBottom();

          }, 5)
        });



        this.eventsService.fileDownloaded$.subscribe((data)=>{
          alert('string url is '+JSON.stringify(data['path']+' and id is '+data['msgId']));
          this.imgPath=data['path'];
      //    this.playVideo(data['path']);
        })

        this.server.isActive(this.roomId,this.clientPhone,this.myPhone);
        this.checkSocketConnection();
      });
    }
    getAllIndexes(arr, val) {
var indices = arr.map((e, i) => e['read'] === val ? i : '').filter(String);
return indices;
   }

    //this.storage.set(this.roomId,null);

    getOldChat(){
      this.socket.emit('msgRead',{myPhone:this.myPhone,clientPhone:this.clientPhone,msgId:'all'})
      this.storage.get(this.clientPhone+this.roomId+this.todaysDate).then((data)=>{
      //  data=JSON.parse(data);
        if(data){
          this.conversation=data;
          setTimeout(() => {
            this.scrollToBottom()
          }, 10)
        }
        else{
          //alert('no old chat');
        }
      }).catch((err)=>{
        //alert('error in getting old chat');
        //alert(err);
      })
    }




    ionViewDidEnter() {
      setTimeout(() => {
       this.scrollToBottom()
      }, 10)

      // here
      this.eventsService.msgSended$.subscribe((data)=>{
         console.log('masg sent id is ',data);
         var index = this.conversation.findIndex((p)=> p['msgId']==data);
         if (index!=-1) {
           this.conversation[index]['sent']=true;
           if (!this.playingS) {
             this.audioService.play('onSend');
             this.playingS=true;
             setTimeout(()=>{
               this.playingS=false;
             },300);
           }
         }else{
           //console.log("no msg with this id",data);
         }

       })

      this.socket.on('msgDelivered'+this.myPhone,(data)=>{
        //console.log('msg delivered to user, id is ',data);
        var index = this.conversation.findIndex((p)=> p['msgId']==data);
        if (index!=-1) {
          this.conversation[index]['delivered']=true;
        }else{
          //console.log("no msg with this id",data);
        }
        var indexes = this.getAllIndexes(this.conversation, false);
        //console.log('msg read false are',indexes);
        for (let index = 0; index < indexes.length; index++) {
          const element = this.conversation[indexes[index]];

          element['sent']=true;
          element['delivered']=true;
        }
        this.deliveredAll=true;

        this.storeLastConversation();
      })
    }




    sendActiveInterval(){
      setInterval(() => {
        this.server.sendActiveStatus(this.myPhone);
        ////console.log('active');
        this.server.isActive(this.roomId,this.clientPhone,this.myPhone);


      }, 10000)
    }


    getReply() {
      let observable = new Observable(observer => {
        this.socket.on('reply-message'+this.myPhone, (data) => {
          observer.next(data);
        });
      })
      return observable;
    }

    getMsgRead() {
      //console.log('reading msg  listner on','msgRead'+this.myPhone);

      let observable = new Observable(observer => {
        this.socket.on('msgRead'+this.myPhone, (data) => {
          observer.next(data);
        });
      })
      return observable;
    }



    send(file) {
      ////console.log('sended');
if (!file) {

      if (this.input != '') {
        ////console.log('sended2');
        if (this.emojiPanel!='active') {
          this.inputElement.setFocus();
        }

        let id = Math.random().toString(36).substring(7);
        //console.log("random", id);
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = Number(minutes < 10 ? '0'+minutes : minutes);
        var strTime = String(hours + ':' + minutes + ' ' + ampm);
        //alert('pushing'+this.input);
        this.conversation.push({ text: this.input, sender: 1,sent:false,delivered:false, read:false,image: 'assets/images/sg1.jpg',msgId:id,time:strTime });

        this.deliveredAll=false;



        setTimeout(() => {
          this.scrollToBottom()
        }, 20)
        //alert('sending message'+this.input+this.clientPhone+this.myPhone+this.roomId+this.isActive+this.clientName+strTime+id);
        this.server.sendMessage(this.input,this.clientPhone,this.myPhone,this.roomId,this.isActive,this.clientName,strTime,id,false,false);
         this.lastMsgData={};
         //alert('msg sended');
        this.lastMsgData['name']=this.clientName;
        this.lastMsgData['phone']=this.clientPhone;
        this.lastMsgData['description']=this.input;
        this.lastMsgData['time']=strTime;
        this.lastMsgData['image']=this.chatDataOfUser['image'];
        this.lastMsgData['count']=0;

        this.input = '';


      }
    }
      else{
        ////console.log('sended2');
        if (this.emojiPanel!='active') {
          this.inputElement.setFocus();
        }

        let id = Math.random().toString(36).substring(7);
        //console.log("random", id);
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = Number(minutes < 10 ? '0'+minutes : minutes);
        var strTime = String(hours + ':' + minutes + ' ' + ampm);
        //alert('pushing'+this.input);
        this.conversation.push({ text: file.name,file:file.uri , sender: 1,sent:false,delivered:false, read:false,image: 'assets/images/sg1.jpg',msgId:id,time:strTime });

        this.deliveredAll=false;



        setTimeout(() => {
          this.scrollToBottom()
        }, 20)
        //alert('sending message'+this.input+this.clientPhone+this.myPhone+this.roomId+this.isActive+this.clientName+strTime+id);
         this.lastMsgData={};
         //alert('msg sended');
        this.lastMsgData['name']=this.clientName;
        this.lastMsgData['phone']=this.clientPhone;
        this.lastMsgData['description']=this.input;
        this.lastMsgData['time']=strTime;
        this.lastMsgData['image']=this.chatDataOfUser['image'];
        this.lastMsgData['count']=0;

        this.input = '';


      }
    }

    scrollToBottom(){
      let content = document.getElementById("chat-container");
      let parent = document.getElementById("chat-parent");
      let scrollOptions = {
        left: 0,
        top: content.offsetHeight
      }
      parent.scrollTo(scrollOptions)
       this.contentArea.scrollToBottom();
    }

    async storeLastConversation(){
    await  this.storage.set(this.clientPhone+this.roomId+this.todaysDate,this.conversation).then(()=>{
        //console.log('cnversation saved successfully');

      }).catch((err)=>{

      })
    }


    ionViewWillLeave() {
    //  this.storeLastConversation();
  //  this.socket.removeAllListeners();

  // here this.events.unsubscribe('refreshConversation');

  this.socket.removeListener('msgRead', ()=>{
    //console.log("successfully removed listner my read");
  });

      this.socket.removeListener(this.myPhone, ()=>{
        //console.log("successfully removed listner my phone");
      });
      //this.removeListener('active'+this.clientPhone);
      this.socket.removeListener('active'+this.myPhone, ()=>{
        ////console.log("successfully removed listner ");

      });


      this.socket.emit('leave',{roomId:this.roomId});
      //console.log("last msg is ",this.lastMsgData);

      if(this.lastMsgData ){
        this.server.setChatData(this.lastMsgData,false);
        //console.log('events published');
        setTimeout(()=>{
        // here
          this.eventsService.refreshChatDataF({clientPhone:this.clientPhone,deliveredAll:this.deliveredAll});
        },30)

      }
      else{
      //here
        this.eventsService.refreshChatDataF('');
      }


    }

    checkSocketConnection(){
      this.socket.on( 'connect',()=> {
        //console.log( 'connected to server' );
        this.server.socketConnection(true);
        this.connection=true;
      } );

      this.socket.on( 'disconnect',()=>{
        this.server.socketConnection(false)
        //console.log( 'disconnected to server' );
      } );

    }


    openEmojiPanel() {
      this.eventsService.setEmoji();
      this.getEmoji();
      this.emojiPanel='active';
      console.log('opening');
      setTimeout(() => {
        this.scrollToBottom();
     }, 200)
    }

    closeEmojiPanel() {

      this.emojiPanel='deactive';
      setTimeout(()=>{
        this.inputElement.setFocus();
      },200)

     this.eventsService.emoji.unsubscribe();

      console.log('closing');
    }


focusInput(){
  if (this.emojiPanel=='deactive') {
    this.inputElement.setFocus();
  }
}




    getEmoji(){
      // here
      this.eventsService.emoji$.subscribe(data=>{
        this.input+=data;
      console.log(data);

       })
    }

    playVideo(){
this.vidPath='http://localhost/_app_file/storage/emulated/0/SpotChat/images/VID-20200217-WA0007.mp4';
//       this.videoPlayer.play('http://localhost/_app_file/storage/emulated/0/SpotChat/images/VID-20200217-WA0007.mp4').then(() => {
//
// }).catch(err => {
//  alert(err);
//  alert(JSON.stringify(err));
// });
    }

    getVideo(){
      this.file.readAsDataURL(this.file.externalRootDirectory, 'SpotChat/images/VID-20200204-WA0000.mp4')
         .then((data) => {
            //  const src = data[data.length-1].toInternalURL();
  //    this.file.resolveLocalFilesystemUrl(src).then(data => {
  alert('data url is '+data);
            this.vidPath = this.sanitizer.bypassSecurityTrustUrl(data);;
            alert(JSON.stringify(data));
          //   document.getElementById('video').setAttribute('src', this.content);
             console.log('Content path cahnged ', this.vidPath);
           // }, error => {
           //   alert(error);
           //   alert(JSON.stringify(error));
           // })
         }) .catch(err => {
           alert(err);
           alert(JSON.stringify(err));
         });
    }
  }
