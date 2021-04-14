import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessagesPageRoutingModule } from './messages-routing.module';
import { MessagesPage } from './messages.page';
import { EmojiComponent } from './../../component/emoji/emoji.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,

    MessagesPageRoutingModule
  ],
    entryComponents: [EmojiComponent],
  declarations: [MessagesPage,EmojiComponent]
})
export class MessagesPageModule {}
