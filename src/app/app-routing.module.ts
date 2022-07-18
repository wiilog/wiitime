import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
    },
    {
        path: 'account-creation',
        loadChildren: () => import('./pages/account-creation/account-creation.module').then(m => m.AccountCreationPageModule)
    },
    {
        path: 'settings-menu',
        loadChildren: () => import('./pages/settings-menu/settings-menu.module').then(m => m.SettingsMenuPageModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
