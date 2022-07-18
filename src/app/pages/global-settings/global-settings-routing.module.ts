import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GlobalSettingsPage } from './global-settings.page';

const routes: Routes = [
  {
    path: '',
    component: GlobalSettingsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GlobalSettingsPageRoutingModule {}
