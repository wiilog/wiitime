import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DropdownConfig} from '@app/components/form/form-dropdown/dropdown-config';

@Component({
    selector: 'app-form-dropdown',
    templateUrl: './form-dropdown.component.html',
    styleUrls: ['./form-dropdown.component.scss'],
})
export class FormDropdownComponent implements OnInit {

    @Input()
    public fieldName: string;

    @Input()
    public dropdownConfig: DropdownConfig[];

    @Input()
    public currentOption: DropdownConfig;

    @Output()
    public valueChangedEvent: EventEmitter<DropdownConfig>;

    public compareWith: any;

    public constructor() {
        this.valueChangedEvent = new EventEmitter<DropdownConfig>();
    }

    public compareWithFn(o1, o2) {
        return o1 === o2;
    }

    public ngOnInit(): void {
        this.compareWith = this.compareWithFn;
    }

    public handleChange(event) {
        this.currentOption = this.dropdownConfig
            .filter((dropdownOption: DropdownConfig) => dropdownOption.value === event.target.value)[0];
        this.valueChangedEvent.emit(this.currentOption);
    }
}
