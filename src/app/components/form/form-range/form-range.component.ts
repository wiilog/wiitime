import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {RangeCustomEvent} from '@ionic/angular';

@Component({
    selector: 'app-form-range',
    templateUrl: './form-range.component.html',
    styleUrls: ['./form-range.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: FormRangeComponent
        }
    ]
})
export class FormRangeComponent implements OnInit, ControlValueAccessor {

    @Input()
    public fieldName: string;

    @Input()
    public min?: number;

    @Input()
    public max?: number;

    @Input()
    public value?: number;

    @Output()
    public valueChangeEvent: EventEmitter<number>;

    public disabled: boolean;

    private touched: boolean;

    private onChange: (value: any) => void;

    private onTouched: () => void;

    public constructor() {
        this.touched = false;
        this.disabled = false;
        this.valueChangeEvent = new EventEmitter<number>();
    }

    public ngOnInit(): void {
        if (!this.fieldName) {
            throw new Error('Form Range Component should have a fieldName');
        }
        if (!this.min) {
            this.min = 0;
        }
        if (!this.max) {
            this.max = 100;
        }
        if (!this.value) {
            this.value = this.min;
        }
    }

    public valueChanged(newValue: number) {
        this.value = newValue;
        if (this.onChange) {
            this.onChange(newValue);
        }
    }

    public knobMoveEnd(endValueEvent: Event): void {
        this.valueChangeEvent.emit(Number((endValueEvent as RangeCustomEvent).detail.value));
    }

    public registerOnChange(onChange: any): void {
        this.onChange = onChange;
    }

    public registerOnTouched(onTouched: any): void {
        this.onTouched = onTouched;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
    }

    public writeValue(newValue: number): void {
        if (newValue < this.min || newValue > this.max) {
            throw new Error('Form Range Component => tried to write a value which is not between min and max');
        }
        this.value = newValue;
    }

    public markAsTouched(): void {
        if (!this.touched) {
            if (this.onTouched) {
                this.onTouched();
            }
            this.touched = true;
        }
    }
}
