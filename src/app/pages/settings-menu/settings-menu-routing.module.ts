import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {SettingsMenuPage} from './settings-menu.page';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'global-settings',
        pathMatch: 'full'
    },
    {
        path: '',
        component: SettingsMenuPage,
        children: [
            {
                path: 'global-settings',
                loadChildren: () => import('@app/pages/global-settings/global-settings.module').then(m => m.GlobalSettingsPageModule)
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class SettingsMenuPageRoutingModule {
}
