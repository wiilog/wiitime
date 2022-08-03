import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {IonMenu, Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {NavService} from '@app/services/nav/nav.service';
import {Subject, Subscription} from 'rxjs';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {WindowSizeService} from '@app/services/window-size.service';
import {environment} from '../../../environments/environment';

enum SettingsMenu {
    GENERAL = 'Général',
    CLOCKING = 'Traitement du badgeage',
    SFTP = 'Paramétrage SFTP',
}

@Component({
    selector: 'app-settings-menu',
    templateUrl: './settings-menu.page.html',
    styleUrls: ['./settings-menu.page.scss'],
})
export class SettingsMenuPage implements ViewWillEnter, ViewWillLeave, OnInit {

    @ViewChild('menu', {read: IonMenu})
    public menu: IonMenu;

    public readonly rightArrowIconPath = '/assets/icon/fleche-droite.svg';

    public headerMode: HeaderMode = HeaderMode.PARAMETER_MENU;
    public refreshHeader$: Subject<any>;
    public footerMode: FooterMode = FooterMode.PARAMETER_MENU;

    public isPortraitMode: boolean;
    public isMenuOpen: boolean;
    public hideSideMenu: boolean;

    public currentMenu: SettingsMenu;
    public possibleMenu = SettingsMenu;

    public submitButtonClicked$: Subject<any>;
    public hideSubmitButton: boolean;

    private backButtonSubscription: Subscription;
    private windowSizeSubscription: Subscription;
    private keyboardShowSubscription: Subscription;
    private keyboardHideSubscription: Subscription;

    constructor(private platform: Platform,
                private navService: NavService,
                private screenOrientationService: ScreenOrientationService,
                private windowSizeService: WindowSizeService,
                private ngZone: NgZone) {
    }

    public ngOnInit(): void {
        this.refreshHeader$ = new Subject<string>();
        this.submitButtonClicked$ = new Subject<any>();
    }

    public ionViewWillEnter(): void {
        this.isMenuOpen = false;
        this.headerMode = HeaderMode.PARAMETER_FULL;
        this.currentMenu = SettingsMenu.GENERAL;
        this.hideSubmitButton = false;

        this.updatePageAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowSizeService.getWindowResizedObservable().subscribe(() => {
            this.ngZone.run(() => {
                this.updatePageAfterWindowSizeChanged();
            });
        });

        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(100, () => {
            this.backButtonAction();
        });

        this.keyboardShowSubscription = this.platform.keyboardDidShow.subscribe(() => {
            this.ngZone.run(() => {
                this.hideSubmitButton = true;
            });
        });

        this.keyboardHideSubscription = this.platform.keyboardDidHide.subscribe(() => {
            this.ngZone.run(() => {
                this.hideSubmitButton = false;
            });
        });
    }

    public ionViewWillLeave(): void {
        this.backButtonSubscription.unsubscribe();
        this.windowSizeSubscription.unsubscribe();
        this.keyboardShowSubscription.unsubscribe();
        this.keyboardHideSubscription.unsubscribe();
    }

    public backButtonAction(): void {
        if (!this.isMenuOpen || (!this.isPortraitMode && this.isMenuOpen && !this.hideSideMenu)) {
            this.navService.pop();
            console.log('leave page');
        } else {
            this.isMenuOpen = false;
            console.log('back to list');
        }
    }

    public swapMenu(menu: SettingsMenu): void {
        if (menu !== this.currentMenu) {
            this.isMenuOpen = true;
            this.currentMenu = menu;
        }
    }

    public submitButtonClicked() {
        this.submitButtonClicked$.next();
    }

    public refreshPageAfterSubmission(logo: string): void {
        this.refreshHeader$.next(logo);
        console.log('save done');
        //Todo spawn a cool toast
    }

    private updatePageAfterWindowSizeChanged(): void {
        this.isPortraitMode = this.screenOrientationService.isPortraitMode();
        this.hideSideMenu = this.windowSizeService.getWindowWidth() < environment.minWindowWidthForSideMenu;

        if (!this.isMenuOpen) {
            this.isMenuOpen = (!this.isPortraitMode && !this.hideSideMenu);
        }
    }
}
