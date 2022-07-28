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

    @Input()
    public defaultValue?: string;

    public formSizeEnum = FormSize;

    public ngOnInit(): void {
        if(!this.fieldName) {
            throw new Error('Invalid field name for FormTextAreaComponent');
        }
        if(!this.maxLength) {
            throw new Error('Invalid maxLength for FormTextAreaComponent');
        }
        if(!this.size) {
            throw new Error('Invalid size for FormTextAreaComponent');
        }
        if(!this.defaultValue) {
            this.defaultValue = '';
        }
    }
}
