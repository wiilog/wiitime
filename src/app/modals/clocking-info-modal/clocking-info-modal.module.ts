import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ClockingInfoModalPageRoutingModule } from './clocking-info-modal-routing.module';

import { ClockingInfoModalPage } from './clocking-info-modal.page';
import {CommonModules} from "@app/common.modules";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ClockingInfoModalPageRoutingModule,
        CommonModules
    ],
  declarations: [ClockingInfoModalPage]
})
export class ClockingInfoModalPageModule {}
