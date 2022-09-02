import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KioskModePageRoutingModule } from './kiosk-mode-routing.module';

import { KioskModePage } from './kiosk-mode.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KioskModePageRoutingModule
  ],
  declarations: [KioskModePage]
})
export class KioskModePageModule {}
