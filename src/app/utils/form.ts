import {FormControl, Validators} from '@angular/forms';

export class FormField {
    type: string;
    control: FormControl;

    constructor(type: string, control: FormControl) {
        this.type = type;
        this.control = control;
    }

    setValue(value: any) {
        this.control.setValue(value);
    }
}

export class Form {

    public controls: { [key: string]: FormField };
    public errors: { [key: string]: string };

    constructor(controls: { [key: string]: FormField }) {
        this.controls = controls;
        this.errors = {};
    }

    static create(controls: { [key: string]: FormField }): Form {
        return new Form(controls);
    }

    static checkbox(): FormField {
        return new FormField(`checkbox`, new FormControl(null));
    }

    static text(required: boolean = false): FormField {
        return new FormField(`text`, new FormControl(null, [
            ...(required ? [Validators.required] : []),
        ]));
    }

    static textarea(required: boolean = false): FormField {
        return new FormField(`textarea`, new FormControl(null, [
            ...(required ? [Validators.required] : []),
        ]));
    }

    public static numberField(minimum: number = null, maximum: number = null, required: boolean = false): FormField {
        return new FormField(`number`, new FormControl(null, [
            ...(minimum !== null ? [Validators.min(minimum)] : []),
            ...(maximum !== null ? [Validators.max(maximum)] : []),
            ...(required ? [Validators.required] : []),
        ]));
    }

    static email(required: boolean = false): FormField {
        return new FormField(`email`, new FormControl(null, [
            Validators.email,
            ...(required ? [Validators.required] : []),
        ]));
    }

    static password(required: boolean = false): FormField {
        return new FormField(`password`, new FormControl(null, [
            ...(required ? [Validators.required] : []),
        ]));
    }

    static photo(required: boolean = false): FormField {
        return new FormField(`photo`, new FormControl(null, [
            ...(required ? [Validators.required] : []),
        ]));
    }

    static signature(required: boolean = false): FormField {
        return new FormField(`signature`, new FormControl(null, [
            ...(required ? [Validators.required] : []),
        ]));
    }

    public get(field: string): FormField {
        return this.controls[field];
    }

    public process(): { [key: string]: any } | boolean {
        const data = {};
        const errors = {};

        for (const [name, {type, control}] of Object.entries(this.controls)) {
            let value;
            if ([`text`, `email`].includes(type)) {
                value = (control.value || ``).trim();
            } else if (type === `checkbox`) {
                value = !!control.value;
            } else {
                value = control.value;
            }

            if (control.errors) {
                if (control.errors.required) {
                    errors[name] = `Ce champ est requis`;
                } else if (control.errors.email) {
                    errors[name] = `Ce champ doit être une adresse email valide`;
                } else if (control.errors.min) {
                    const min = control.errors.min.min;
                    errors[name] = `La valeur ne peut être inférieure à ${min}`;
                }
            } else {
                data[name] = control.value;
            }
        }

        this.errors = errors;

        if (Object.keys(errors).length === 0) {
            return data;
        } else {
            return false;
        }
    }

}
