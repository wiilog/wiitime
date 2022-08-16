import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
    selector: 'app-form-input',
    templateUrl: './form-input.component.html',
    styleUrls: ['./form-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: FormInputComponent
        }
    ]
})
export class FormInputComponent implements OnInit, ControlValueAccessor {

    @Input()
    public inputName: string;

    @Input()
    public endText?: string;

    public value: number;

    public disabled: boolean;

    private touched: boolean;

    private onChange: (value: any) => void;

    private onTouched: () => void;

    constructor() {
        this.touched = false;
        this.disabled = false;
    }

    public ngOnInit(): void {
        if (!this.inputName) {
            throw new Error('invalid value for inputName property of FormInputComponent');
        }
    }

    public writeValue(newValue: number): void {
        this.value = newValue;
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

    public valueChange(newValue: number) {
        this.value = newValue;
        if (this.onChange) {
            this.onChange(newValue);
        }
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
