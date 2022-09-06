import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KioskModePage } from './kiosk-mode.page';

const routes: Routes = [
  {
    path: '',
    component: KioskModePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KioskModePageRoutingModule {}
