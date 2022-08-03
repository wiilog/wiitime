import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SettingsMenuPage} from './settings-menu.page';

const routes: Routes = [
    {
        path: '',
        component: SettingsMenuPage
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettingsMenuPageRoutingModule {
}
