import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
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
    {
        path: 'active-mode',
        loadChildren: () => import('./pages/mode-page/active-mode/active-mode.module').then(m => m.ActiveModePageModule)
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'clocking-info-modal',
        loadChildren: () => import('./modals/clocking-info-modal/clocking-info-modal.module').then(m => m.ClockingInfoModalPageModule)
    },
    {
        path: 'kiosk-mode',
        loadChildren: () => import('./pages/mode-page/kiosk-mode/kiosk-mode.module').then(m => m.KioskModePageModule)
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
