import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {FormInputTypeEnum} from '@app/components/form/form-input/form-input-type.enum';

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

    @ViewChild('inputField', {read: ElementRef})
    public inputField: ElementRef;

    @Input()
    public inputName: string;

    @Input()
    public inputType?: FormInputTypeEnum;

    @Input()
    public endText?: string;

    public readonly formInputTypeEnum = FormInputTypeEnum;

    public value: number;

    public disabled: boolean;

    private touched: boolean;

    private onChange: (value: any) => void;

    private onTouched: () => void;

    public constructor() {
        this.touched = false;
        this.disabled = false;
    }

    public ngOnInit(): void {
        if (!this.inputName) {
            throw new Error('invalid value for inputName property of FormInputComponent');
        }
        if (!this.inputType) {
            this.inputType = FormInputTypeEnum.NUMBER;
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
