import {Component, Input, OnInit} from '@angular/core';
import {FormSize} from '@app/components/form/form-size-enum';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';

@Component({
    selector: 'app-form-text-area',
    templateUrl: './form-text-area.component.html',
    styleUrls: ['./form-text-area.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            multi: true,
            useExisting: FormTextAreaComponent
        }
    ]
})
export class FormTextAreaComponent implements OnInit, ControlValueAccessor {

    @Input()
    public fieldName: string;

    @Input()
    public maxLength: number;

    @Input()
    public size: FormSize;

    public content: string;

    public formSizeEnum = FormSize;

    public disabled: boolean;

    private touched: boolean;

    private onChange: (value: any) => void;

    private onTouched: () => void;

    public constructor() {
        this.touched = false;
        this.disabled = false;
    }

    public ngOnInit(): void {
        if (!this.fieldName) {
            throw new Error('Invalid field name for FormTextAreaComponent');
        }
        if (!this.maxLength) {
            throw new Error('Invalid maxLength for FormTextAreaComponent');
        }
        if (!this.size) {
            throw new Error('Invalid size for FormTextAreaComponent');
        }
    }

    public textChanged(newText: string) {
        this.content = newText;
        if (this.onChange) {
            this.onChange(newText);
        }
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
