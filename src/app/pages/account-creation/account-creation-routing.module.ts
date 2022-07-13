import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountCreationPage } from './account-creation.page';

const routes: Routes = [
  {
    path: '',
    component: AccountCreationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountCreationPageRoutingModule {}
