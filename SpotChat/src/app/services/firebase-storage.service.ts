import { Injectable } from '@angular/core';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import {AlertController,LoadingController,ActionSheetController,ToastController} from '@ionic/angular'
import {Http ,Headers,RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';
//import { ServerService } from '../services/server.service';
import { EventsService } from '../services/events.service';

@Injectable({
  providedIn: 'root'
})
export class FirebaseStorageService {
  todaysDate;
  user;
    headerOptions: any = { 'Content-Type': 'application/json' };
    headers = new Headers(this.headerOptions);
    chatNumbers:any=[];
  constructor(private alertController:AlertController,private storage:Storage,
    private loadingController:LoadingController,private http:Http,
    private fireStorage: AngularFireStorage, private eventsService:EventsService) {
    var currentTime = new Date()
var month = currentTime.getMonth() + 1
var day = currentTime.getDate()
var year = currentTime.getFullYear();
 this.todaysDate=day+"-"+month+"-"+year;
 this.storage.get('userPhone').then((data)=>{
   if (data) {
     this.user=data;
     console.log(data);

   }else{
    // this.router.navigateByUrl('/register');
   }

 })

 this.storage.get('chatData').then(data=>{
    if (data) {
    for(var i=0;i<data.length;i++){
     this.chatNumbers.push(data[i]['phone']);
   }
 }
   else{
     console.log('no chat data');
   }


 })


  }

  async upload(data) {

    this.presentLoading();
   // var random=Math.floor(Math.random() * (100 - 10 + 1) + 10);
   if (data) {
   //  let blob = new Blob([data], { type: "image/jpeg" });
 ///    this.upload(blob);
       var uploadTask:AngularFireUploadTask = this.fireStorage.ref('profileImg/'+this.user.userPhone).child('profile')
       .putString(data,'data_url',{'content-type':'image/jpg'})
       await uploadTask.then((uploadSnapshot) => {
   uploadSnapshot.ref.getDownloadURL().then((downloadURL) => {
     var userData=this.user;
     userData['userAvatar']=downloadURL;
     userData['profile']=true;
     if (this.chatNumbers.length>0) {
       userData['nmbers']=this.chatNumbers;
     }

     this.loaderDismiss();
     this.http.post('https://spot-chat.herokuapp.com/updateprofile', userData, new RequestOptions({ headers: this.headers }))  .map(res => res.text()).subscribe(data => {
       if (data) {
         var response=JSON.parse(data);
         if(response.status=='ok'){
           console.log('data updated');

         }
         else{
           console.log('some error occured',response.status);
           this.loaderDismiss()
          this.presentErrorAlert();
         }
       }
     })
 //    this.loaderDismiss();
   })
 })
}
else{

}
 }


  uploadFile(file,to,myPhone,roomId,isActive,clientName){
  // this.presentLoading();
   var random=Math.floor(Math.random() * (100 - 10 + 1) + 10);
  if (file) {
    var ref='send/'+this.user.userPhone+"/"+this.todaysDate+'/others';
    if (file.mediaType.includes('pdf')) {
      ref='send/'+this.user.userPhone+"/"+this.todaysDate+'/docs';
    }
    else if (file.mediaType.includes('image')) {
      ref='send/'+this.user.userPhone+"/"+this.todaysDate+'/image';
    }
    else if (file.mediaType.includes('video')) {
        ref='send/'+this.user.userPhone+"/"+this.todaysDate+'/videose';
      }

      var uploadTask:AngularFireUploadTask =  this.fireStorage.ref(ref)
      .child(String(random))
      .putString(file.dataURI,'data_url',{'content-type':file.mediaType});
       uploadTask.then((uploadSnapshot) => {
      uploadSnapshot.ref.getDownloadURL().then((downloadURL) => {
      //  alert('other upload success with url '+downloadURL);
        this.eventsService.fileSendedF({fileUri:file.uri,fileName:file.name,fileUrl:downloadURL,clientPhone:to,myPhone:myPhone,roomId:roomId,isActive:isActive,clientName:clientName});
        //   var date = new Date();
        //   var hours = date.getHours();
        //   var minutes = date.getMinutes();
        //   var ampm = hours >= 12 ? 'pm' : 'am';
        //   hours = hours % 12;
        //   hours = hours ? hours : 12; // the hour '0' should be '12'
        //   minutes = Number(minutes < 10 ? '0'+minutes : minutes);
        //   var strTime = String(hours + ':' + minutes + ' ' + ampm);
        //   let id = Math.random().toString(36).substring(7);
        //
        // //  this.server.sendMessage(file.name,to,myPhone,roomId,isActive,clientName,strTime,id,file.uri,downloadURL);

          return {status:'ok',url:downloadURL};
        })
      }).catch((err)=>{
        alert(err);
        return {status:false};
      })
      //alert('other upload success to '+to);
    }else{
      return {status:false,err:'file data not present'};
    }
  }




 loading: any = null;
 async presentLoading() {
   this.loading = await this.loadingController.create({
     spinner: 'circular',
     duration: 12000,
     message: 'Updating your profile...',
     translucent: true,
     showBackdrop: true,
     cssClass: 'custom-class custom-loading'
   });
   return await this.loading.present();
 }

 loaderDismiss(){
   this.loading.dismiss();
 }


     async presentErrorAlert() {
       this.loading.dismiss();

       const alert = await this.alertController.create({
         message: 'Some Error Occured. Please try again.',
         buttons: ['OK']
       });

       await alert.present();
     }

}
