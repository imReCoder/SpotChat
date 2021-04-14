import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfilePreviewPage } from './profile-preview.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePreviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePreviewPageRoutingModule {}
