import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ThemePage } from './theme.page';

const routes: Routes = [
  {
    path: '',
    component: ThemePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThemePageRoutingModule {}
