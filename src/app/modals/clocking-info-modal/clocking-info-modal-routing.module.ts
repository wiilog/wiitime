import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ClockingInfoModalPage } from './clocking-info-modal.page';

const routes: Routes = [
  {
    path: '',
    component: ClockingInfoModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClockingInfoModalPageRoutingModule {}
