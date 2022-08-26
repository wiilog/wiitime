import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {FormSize} from '@app/components/form/form-size-enum';
import {FormInputTypeEnum} from '@app/components/form/form-input/form-input-type.enum';

@Component({
    selector: 'app-form-password-input',
    templateUrl: './form-password-input.component.html',
    styleUrls: ['./form-password-input.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: FormPasswordInputComponent
        }
    ]
})
export class FormPasswordInputComponent implements OnInit , ControlValueAccessor {

    @Input()
    public fieldName: string;

    @Input()
    public maxLength: number;

    @Input()
    public size: FormSize;

    @Input()
    public titleOnTop?: boolean;

    @Output()
    public valueChangeEvent: EventEmitter<any>;

    public content: string;

    public formSizeEnum = FormSize;

    public readonly formInputTypeEnum = FormInputTypeEnum;

    public disabled: boolean;

    private touched: boolean;

    private onChange: (value: any) => void;

    private onTouched: () => void;

    public constructor() {
        this.touched = false;
        this.disabled = false;
        this.valueChangeEvent = new EventEmitter<any>();
    }

    public ngOnInit(): void {
        if (!this.fieldName) {
            throw new Error('Invalid field name for FormPasswordInputComponent');
        }
        if (!this.maxLength) {
            throw new Error('Invalid maxLength for FormPasswordInputComponent');
        }
        if (!this.size) {
            throw new Error('Invalid size for FormPasswordInputComponent');
        }
    }

    public textChanged(newText: string) {
        this.content = newText;
        if (this.onChange) {
            this.onChange(newText);
        }
        this.valueChangeEvent.emit();
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

    public writeValue(newText: string): void {
        if (newText.length > this.maxLength) {
            throw new Error('Form Text Area Component => tried to write a value whose length is above the field max length');
        }
        this.content = newText;
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
