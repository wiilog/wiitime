import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActiveModePageRoutingModule } from './active-mode-routing.module';

import { ActiveModePage } from './active-mode.page';
import {CommonModules} from '@app/common.modules';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ActiveModePageRoutingModule,
        CommonModules
    ],
  declarations: [ActiveModePage]
})
export class ActiveModePageModule {}
