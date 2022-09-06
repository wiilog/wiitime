import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ActiveModePage } from './active-mode.page';

const routes: Routes = [
  {
    path: '',
    component: ActiveModePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActiveModePageRoutingModule {}
