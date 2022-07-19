import {Component, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {ScreenOrientation} from '@ionic-native/screen-orientation/ngx';

@Component({
    selector: 'app-settings-menu',
    templateUrl: './settings-menu.page.html',
    styleUrls: ['./settings-menu.page.scss'],
})
export class SettingsMenuPage implements OnInit {

    public onlyDisplayMenu: boolean = this.checkIfPortraitMode();

    public headerMode: HeaderMode = HeaderMode.PARAMETER_MENU;

    public isMenuInToggleState: boolean;

    constructor(private screenOrientation: ScreenOrientation,
                private platform: Platform) {
        this.isMenuInToggleState = false;
        this.screenOrientation.onChange().subscribe(
            () => {
                this.onlyDisplayMenu = this.checkIfPortraitMode();
            }
        );
        this.isMenuInToggleState = this.platform.width() < 768;
    }

    ngOnInit() {
    }

    public updateHeader() {
        this.isMenuInToggleState = this.platform.width() < 768;
    }

    public checkIfPortraitMode(): boolean {
        return this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_SECONDARY
            || this.screenOrientation.type === this.screenOrientation.ORIENTATIONS.PORTRAIT_PRIMARY;
    }

    public jeSuisUnTest(): void {
        this.onlyDisplayMenu = true;
    }

    public changeover(): void {
        this.onlyDisplayMenu = false;
    }

    /*
    <app-header [headerMode]="headerMode"></app-header>
    <ion-content *ngIf="onlyDisplayMenu">
        <ion-item>
            <ion-label (click)="changeover()" class="text">
                Home S
            </ion-label>
        </ion-item>
    </ion-content>

           <ion-menu-toggle menu="g" autoHide="false">
                <ion-item [routerLink]="['global-settings']" routerDirection="root" routerLinkActive="active-link" (click)="jeSuisUnTest()">
                    <ion-label class="text">
                        Home S
                    </ion-label>
                </ion-item>
            </ion-menu-toggle>
     */
}
