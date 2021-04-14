import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'messages',
    loadChildren: () => import('./pages/messages/messages.module').then( m => m.MessagesPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'contacts',
    loadChildren: () => import('./modals/contacts/contacts.module').then( m => m.ContactsPageModule)
  },
  {
    path: 'setting-home',
    loadChildren: () => import('./pages/setting/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'setting-profile',
    loadChildren: () => import('./pages/setting/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'setting-notification',
    loadChildren: () => import('./pages/setting/notification/notification.module').then( m => m.NotificationPageModule)
  },
  {
    path: 'profile-preview',
    loadChildren: () => import('./modals/profile-preview/profile-preview.module').then( m => m.ProfilePreviewPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'theme',
    loadChildren: () => import('./pages/setting/theme/theme.module').then( m => m.ThemePageModule)
  },
  {
    path: 'image-view',
    loadChildren: () => import('./modals/image-view/image-view.module').then( m => m.ImageViewPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
