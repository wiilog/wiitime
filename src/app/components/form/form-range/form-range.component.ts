import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-form-range',
    templateUrl: './form-range.component.html',
    styleUrls: ['./form-range.component.scss'],
})
export class FormRangeComponent implements OnInit {

    @Input()
    public fieldName: string;

    constructor() {
    }

    ngOnInit() {
    }
}
