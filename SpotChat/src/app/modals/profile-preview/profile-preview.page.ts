import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-profile-preview',
  templateUrl: './profile-preview.page.html',
  styleUrls: ['./profile-preview.page.scss'],
})
export class ProfilePreviewPage implements OnInit {
profileImg;
name='SpotUser'
userData;
status;
phone;
imgHeight='100px';
profileImgP:boolean=false;
  constructor(private modalController:ModalController) { }

  ngOnInit() {
    console.log(this.userData);
    if (this.userData.image) {
      console.log("image present ",this.userData.image);
      this.profileImg=this.userData.image;
    }else{
      this.profileImg='../assets/images/profile.png';
    }

    this.phone=this.userData.phone;
    if (this.userData.name && this.userData.name!=undefined) {
      this.name=this.userData.name;
    }else{
      this.name='Ranjit';
    }
    if (this.userData.status) {
      this.status=this.userData.status;
    }
    else{
      this.status="Nothing"
    }
  }





    closeModal() {
     // using the injected ModalController this page
     // can "dismiss" itself and optionally pass back data
     this.modalController.dismiss({
       'dismissed': true
     });
   }


   logScrolling(x){
     console.log('scrolling');
   }

   logScrollStart(){
     console.log('scroll start');
   }

   logScrollEnd(){
     console.log("scrolling end");
   }

}
