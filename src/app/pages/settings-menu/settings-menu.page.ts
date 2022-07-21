import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {IonMenu, Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {NavService} from '@app/services/nav/nav.service';
import {Subscription} from 'rxjs';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {FooterMode} from '@app/components/footer/footer-mode.enum';

@Component({
    selector: 'app-settings-menu',
    templateUrl: './settings-menu.page.html',
    styleUrls: ['./settings-menu.page.scss'],
})
export class SettingsMenuPage implements OnInit, ViewWillEnter, ViewWillLeave {

    @ViewChild('menu', {read: IonMenu})
    public menu: IonMenu;

    public headerMode: HeaderMode = HeaderMode.PARAMETER_MENU;
    public footerMode: FooterMode = FooterMode.PARAMETER_MENU;

    private backButtonSubscription: Subscription;
    private screenOrientationSubscription: Subscription;
    private menuWillOpenSubscription: Subscription;
    private menuWillCloseSubscription: Subscription;

    private isMenuOpen: boolean;

    constructor(private platform: Platform,
                private navService: NavService,
                private screenOrientationService: ScreenOrientationService,
                private ngZone: NgZone) {
    }

    ionViewWillEnter(): void {
        this.updateHeaderModeAfterScreenRotation();
        this.screenOrientationSubscription = this.screenOrientationService.getOrientationChangeObservable()
            .subscribe(() => {
                this.ngZone.run(() => {
                    this.updateHeaderModeAfterScreenRotation();
                });
            });

        this.menuWillOpenSubscription = this.menu.ionWillOpen.subscribe(() => {
            this.isMenuOpen = true;
            this.headerMode = HeaderMode.PARAMETER_FULL;
        });

        this.menuWillCloseSubscription = this.menu.ionWillClose.subscribe(() => {
            this.isMenuOpen = false;
            this.headerMode = HeaderMode.PARAMETER_MENU;
        });

        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(100, () => {
            this.backButtonAction();
        });

        this.isMenuOpen = true;
        this.menu.open();
    }

    ionViewWillLeave(): void {
        this.menuWillCloseSubscription.unsubscribe();
        this.menuWillOpenSubscription.unsubscribe();
        this.backButtonSubscription.unsubscribe();
        this.screenOrientationSubscription.unsubscribe();
    }

    ngOnInit() {
    }

    public backButtonAction() {
        if (this.isMenuOpen) {
            this.navService.pop();
        } else {
            this.menu.open();
        }
    }

    private updateHeaderModeAfterScreenRotation() {
        if (this.screenOrientationService.isPortraitMode()) {
            this.headerMode = HeaderMode.PARAMETER_FULL;
            this.isMenuOpen = false;
        } else {
            this.headerMode = HeaderMode.PARAMETER_MENU;
            this.isMenuOpen = true;
        }
    }
}
