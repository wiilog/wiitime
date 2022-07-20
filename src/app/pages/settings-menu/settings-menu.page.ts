import {Component, OnInit, ViewChild} from '@angular/core';
import {IonMenu, Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';
import {NavService} from '@app/services/nav/nav.service';
import {Subscription} from 'rxjs';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';

@Component({
    selector: 'app-settings-menu',
    templateUrl: './settings-menu.page.html',
    styleUrls: ['./settings-menu.page.scss'],
})
export class SettingsMenuPage implements OnInit, ViewWillEnter, ViewWillLeave {

    @ViewChild('menu', {read: IonMenu})
    public menu: IonMenu;

    public headerMode: HeaderMode = HeaderMode.PARAMETER_MENU;

    private backButtonSubscription: Subscription;

    private isMenuOpen: boolean;

    constructor(private screenOrientation: ScreenOrientation,
                private platform: Platform,
                private navService: NavService,
                private screenOrientationService: ScreenOrientationService) {
        this.screenOrientation.onChange().subscribe(() => {
            this.updateHeaderModeAfterScreenRotation();
        });
    }

    ionViewWillEnter(): void {
        this.menu.ionWillOpen.subscribe(() => {
            this.isMenuOpen = true;
            this.headerMode = HeaderMode.PARAMETER_FULL;
        });

        this.menu.ionWillClose.subscribe(() => {
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
        this.backButtonSubscription.unsubscribe();
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
