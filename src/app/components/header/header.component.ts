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
