import {Component, Input, OnInit} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    @Input()
    public headerMode: HeaderMode;

    public headerModeEnum = HeaderMode;

    constructor() {
    }

    ngOnInit() {
    }

    public hihihih() {
        console.log(5);
    }

}
