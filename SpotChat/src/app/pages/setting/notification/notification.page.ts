import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import {Http ,Headers,RequestOptions} from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import {ToastController} from '@ionic/angular'

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPage implements OnInit {
notificationToggle:boolean;
notificationSoundToggle:boolean;
user:any;
  headerOptions: any = { 'Content-Type': 'application/json' };
  headers = new Headers(this.headerOptions);
  constructor(private storage:Storage,private http:Http,private router:Router,private toastController:ToastController) {
    this.storage.get('userPhone').then((data)=>{
      if (data) {
        this.user=data;
        console.log(data);

      }else{
        this.router.navigateByUrl('/register');
      }

    })
  }

  ngOnInit() {
    this.getSettings();
    }
    getSettings(){
      this.storage.get('settings').then(data=>{
          if (data) {
            console.log(data);
            this.notificationToggle=data.notificationToggle;
              this.notificationSoundToggle=data.notificationSoundToggle;
          }
          else{
            this.notificationToggle=true;
            this.notificationSoundToggle=true;
            console.log('default setting');
          }
        })
    }


  toggleNotification(){

    this.http.post('https://spot-chat.herokuapp.com/updateNotification', {phone:this.user.userPhone,notification:this.notificationToggle,notificationSound:this.notificationSoundToggle}, new RequestOptions({ headers: this.headers }))
      .map(res => res.text()).subscribe(data => {
        var response=JSON.parse(data);
        if (response.status=='ok') {

    var settings={
      notificationToggle:this.notificationToggle,
      notificationSoundToggle:this.notificationSoundToggle
    }
    this.storage.set('settings',settings).then(()=>{
      console.log('notification toggled'+this.notificationToggle);
    })
  }
  else{
    this.presentToast('Some error occured. Please try again later',2);
    this.getSettings();
  }
},(err)=>{
  console.log('erro occure',err);
  this.presentToast('Check your connection',2);
  this.getSettings();
})
  }

  async presentToast(text,time) {
   const toast = await this.toastController.create({
     message:text,
     duration: time*1000,
     animated:true,
     color:'dark',
     translucent:true
   });
   toast.present();
 }
 ionViewWillLeave() {
}

}
