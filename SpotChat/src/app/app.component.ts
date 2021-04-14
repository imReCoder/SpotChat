import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { Storage } from '@ionic/storage';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ServerService } from './services/server.service';
//import {enableProdMode} from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  dark=false;
  constructor(
    private platform: Platform,
    private keyboard: Keyboard,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public fcm:FCM,
    private storage:Storage,
    private server:ServerService,
    ) {
    //  enableProdMode();


    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.splashScreen.hide();
      // this.statusBar.styleDefault();
      this.storage.get('settings').then((data)=>{
        
        if (data.dark) {
          document.body.classList.toggle('dark');
          this.dark=true;
            this.statusBar.backgroundColorByHexString('#32373d');
          }
          else{
            this.statusBar.backgroundColorByHexString('#3880ff');
          }
        })


       this.keyboard.disableScroll(true);
       this.storage.get('userPhone').then(data=>{
         if (data) {
           this.server.getAllStoredMessages(data.userPhone);
         }
       })


  //
  // //    this.getToken();
  // this.fcm.onNotification().subscribe(data => {
  //   console.log(data);
  //   this.storage.set('data',data);
  //   if (data.wasTapped) {
  //
  //   //  this.router.navigate([data.landing_page, data.price]);
  //   } else {
  //   //  this.router.navigate([data.landing_page, data.price]);
  //   }
  // });
    });



  }

}
