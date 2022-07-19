import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {SettingsMenuPageRoutingModule} from './settings-menu-routing.module';

import {SettingsMenuPage} from './settings-menu.page';
import {CommonModules} from "@app/common.modules";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SettingsMenuPageRoutingModule,
        CommonModules,
    ],
    declarations: [SettingsMenuPage]
})
export class SettingsMenuPageModule {
}
