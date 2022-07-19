import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GlobalSettingsPageRoutingModule } from './global-settings-routing.module';

import { GlobalSettingsPage } from './global-settings.page';
import {CommonModules} from '@app/common.modules';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        GlobalSettingsPageRoutingModule,
        CommonModules
    ],
  declarations: [GlobalSettingsPage]
})
export class GlobalSettingsPageModule {}
