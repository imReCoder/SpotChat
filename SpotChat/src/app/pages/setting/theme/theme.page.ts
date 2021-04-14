import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-theme',
  templateUrl: './theme.page.html',
  styleUrls: ['./theme.page.scss'],
})
export class ThemePage implements OnInit {
  settings={

  };
  dark;
  constructor( private storage:Storage,private statusBar:StatusBar) {
    this.storage.get('settings').then(data=>{
      console.log('stetting data is',data);
      if (data) {
        this.settings=data;
        if (data.dark) {
          this.dark=true;
          this.statusBar.backgroundColorByHexString('#32373d');
       
        }else{
          this.dark=false;
          this.statusBar.backgroundColorByHexString('#3880ff');
        }

      }else{
        console.log("setting data not found");
        this.storage.set('settings',this.settings).then(data=>{
          this.dark=false;
          this.statusBar.backgroundColorByHexString('#3880ff');
        })
      }
    })
  }


  ngOnInit() {
  }
  toggle;
  toggleNotification(){
    this.settings['dark']=this.dark;
      this.storage.set('settings',this.settings).then(()=>{
        console.log('setting saved');
        if (this.dark) {
          this.statusBar.backgroundColorByHexString('#32373d');
          document.body.classList.add('dark');
          alert("dark color activated");

        }else{
          this.statusBar.backgroundColorByHexString('#3880ff');
          document.body.classList.remove('dark');

        }

      })
    }
  }
