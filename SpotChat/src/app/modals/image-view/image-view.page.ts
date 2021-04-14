import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.page.html',
  styleUrls: ['./image-view.page.scss'],
})
export class ImageViewPage implements OnInit {
data;
  constructor(private modalController:ModalController) { }

  ngOnInit() {
    console.log(this.data);

  }

      closeModal() {
       // using the injected ModalController this page
       // can "dismiss" itself and optionally pass back data
       this.modalController.dismiss({
         'dismissed': true
       });
     }

}
