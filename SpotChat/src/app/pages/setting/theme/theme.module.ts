import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThemePageRoutingModule } from './theme-routing.module';

import { ThemePage } from './theme.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThemePageRoutingModule
  ],
  declarations: [ThemePage]
})
export class ThemePageModule {}
