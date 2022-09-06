import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KioskModePageRoutingModule } from './kiosk-mode-routing.module';

import { KioskModePage } from './kiosk-mode.page';
import {CommonModules} from "@app/common.modules";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        KioskModePageRoutingModule,
        CommonModules
    ],
  declarations: [KioskModePage]
})
export class KioskModePageModule {}
