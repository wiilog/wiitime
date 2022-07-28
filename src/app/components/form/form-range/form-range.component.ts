import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-form-range',
    templateUrl: './form-range.component.html',
    styleUrls: ['./form-range.component.scss'],
})
export class FormRangeComponent implements OnInit {

    @Input()
    public fieldName: string;

    @Input()
    public defaultValue: number;

    @Input()
    public min?: number;

    @Input()
    public max?: number;

    public ngOnInit(): void {
        if (!this.defaultValue && this.defaultValue !== 0) {
            this.defaultValue = 0;
        } else if (this.defaultValue >= this.min && this.defaultValue <= this.max) {
            throw new Error('Form Range Component should have a default value between min and max');
        }
    }
}
