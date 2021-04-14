import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePreviewPageRoutingModule } from './profile-preview-routing.module';

import { ProfilePreviewPage } from './profile-preview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePreviewPageRoutingModule
  ],
  declarations: [ProfilePreviewPage]
})
export class ProfilePreviewPageModule {}
