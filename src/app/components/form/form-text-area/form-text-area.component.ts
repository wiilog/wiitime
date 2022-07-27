import {Component, Input, OnInit} from '@angular/core';
import {FormSize} from '@app/components/form/form-size-enum';

@Component({
    selector: 'app-form-text-area',
    templateUrl: './form-text-area.component.html',
    styleUrls: ['./form-text-area.component.scss'],
})
export class FormTextAreaComponent implements OnInit {

    @Input()
    public fieldName: string;

    @Input()
    public maxLength: number;

    @Input()
    public size: FormSize;

    public formSizeEnum = FormSize;

    constructor() {
    }

    ngOnInit() {
    }

}
