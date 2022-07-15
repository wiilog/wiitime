import {Component, ContentChild, OnInit} from '@angular/core';
import {IonInput} from '@ionic/angular';

@Component({
    selector: 'app-password-button',
    templateUrl: './password-button.component.html',
    styleUrls: ['./password-button.component.scss'],
})
export class PasswordButtonComponent implements OnInit {
    @ContentChild(IonInput) input: IonInput;

    public showPassword = false;

    constructor() {
    }

    ngOnInit() {
    }

    public showButtonClicked(): void {
        this.showPassword = !this.showPassword;
        this.input.type = this.showPassword ? 'text' : 'password';
    }
}
