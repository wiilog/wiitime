import {Component, Input, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {NavServices} from '@app/services/nav/nav.services';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    @Input()
    public headerMode: HeaderMode;

    public headerModeEnum = HeaderMode;

    public appLogoPath = '/assets/img/Logo-HeRa.png';

    //TODO replace with storage value when implemented in param
    public defaultLogoPath = '/assets/img/LogoGT.png';

    public backButtonImagePath = '/assets/icon/fleche-gauche.svg';

    public disconnectLogoPath = '/assets/icon/deconnexion.svg';

    constructor(private navService: NavServices) {
    }

    ngOnInit() {
    }

    public backButtonClicked() {
        //Todo maybe something to do to ensure we go back to the right page
        this.navService.pop();
    }

    public disconnectButtonClicked() {
        //Todo open the password check modal and act depending on result
    }
}

/*
<ion-content>
    <div>
        <div class="left-div-logo" *ngIf="headerMode === headerModeEnum.PARAMETER_TAB">
            <img src="{{defaultLogoPath}}"/>
        </div>
 */
