import { Component, OnInit } from '@angular/core';
import { AlertController} from '@ionic/angular';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  constructor(private alertController:AlertController,private router:Router,private storage:Storage) { }

  ngOnInit() {
    //this.storage.set('userPhone',{userPhone:'9099858434',userName:"Shinigami"});

  }

    async logOutConfirmAlert() {
      const alert = await this.alertController.create({
        header: 'Logout',
        message: 'Do you really want to Logout ?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            cssClass: 'secondary',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Yes',
            handler: () => {
            this.logOut();
              console.log('Confirm Okay');
            }
          }
        ]
      });

      await alert.present();
    }

    logOut(){
      this.storage.set('userPhone',null).then(()=>{
        this.router.navigateByUrl('/register');
      })
    }


}
