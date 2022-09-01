import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TabConfig} from '@app/components/tab/tab-config';

@Component({
    selector: 'app-form-toggle',
    templateUrl: './form-toggle.component.html',
    styleUrls: ['./form-toggle.component.scss'],
})
export class FormToggleComponent implements OnInit {

    @Input()
    public fieldName;

    @Input()
    public currentToggleOption: number;

    @Input()
    public tabConfig: TabConfig[];

    @Output()
    public activeKeyChange: EventEmitter<number>;

    public constructor() {
        this.activeKeyChange = new EventEmitter<number>();
    }

    public ngOnInit(): void {
    }

    public activeKeyChanged(key: number): void {
        this.activeKeyChange.emit(key);
    }

}
