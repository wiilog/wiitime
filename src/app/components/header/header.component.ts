import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    @Input()
    public headerMode: HeaderMode;

    @Output()
    public backButtonClickedEvent: EventEmitter<any>;

    public headerModeEnum = HeaderMode;

    public appLogoPath = '/assets/img/Logo-HeRa.png';

    //TODO replace with storage value when implemented in param
    public defaultLogoPath = '/assets/img/LogoGT.png';

    public backButtonImagePath = '/assets/icon/fleche-gauche.svg';

    public disconnectLogoPath = '/assets/icon/deconnexion.svg';

    constructor() {
        this.backButtonClickedEvent = new EventEmitter<any>();
    }

    ngOnInit() {
    }

    public backButtonClicked() {
        //Todo maybe something to do to ensure we go back to the right page since it's not always a pop
        this.backButtonClickedEvent.emit();
    }

    public disconnectButtonClicked() {
        //Todo open the password check modal and act depending on result
    }
}
