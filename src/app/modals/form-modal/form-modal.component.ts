import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Subscription} from 'rxjs';
import {ModalController, Platform} from '@ionic/angular';
import {environment} from '../../../environments/environment';
import {FormSize} from '@app/components/form/form-size-enum';

@Component({
    selector: 'app-form-modals',
    templateUrl: './form-modal.component.html',
    styleUrls: ['./form-modal.component.scss'],
})
export class FormModalComponent implements OnInit, OnDestroy {

    @Input()
    public modalTitle: string;

    @Input()
    public adminUsername: string;

    @Input()
    public adminPassword: string;

    public form: FormGroup;
    public isSubmitted: boolean;

    //username field settings
    public readonly usernameFormControlName = 'username';
    public readonly usernameFieldName = 'Nom d\'utilisateur';
    public readonly usernameMaxLength: number = environment.adminUsernameMaxLength;
    public readonly usernameFieldSize = FormSize.NORMAL;

    //password field settings
    public readonly passwordFormControlName = 'password';
    public readonly passwordFieldName = 'Mot de passe';
    public readonly passwordFieldSize = FormSize.NORMAL;
    public readonly passwordMinLength: number = environment.adminPasswordMinLength;
    public readonly passwordMaxLength: number = environment.adminPasswordMaxLength;

    private valueSetterSubscription: Subscription;
    private backButtonSubscription: Subscription;

    public constructor(private modalController: ModalController,
                       private formBuilder: FormBuilder,
                       private platform: Platform) {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required,
                Validators.maxLength(this.usernameMaxLength)]],
            password: ['', [Validators.required,
                Validators.minLength(this.passwordMinLength),
                Validators.maxLength(this.passwordMaxLength)]],
        });
    }

    public ngOnInit(): void {
        this.isSubmitted = false;
        this.form.controls.username.setValue(this.adminUsername);
        this.form.controls.password.setValue(this.adminPassword);

        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(100, () =>
            this.cancelButtonClicked()
        );
    }

    public ngOnDestroy(): void {
        if (this.valueSetterSubscription && !this.valueSetterSubscription.closed) {
            this.valueSetterSubscription.unsubscribe();
        }
        if(this.backButtonSubscription && !this.backButtonSubscription.closed) {
            this.backButtonSubscription.unsubscribe();
        }
    }

    public getErrorControl() {
        return this.form.controls;
    }

    public confirmButtonClicked(): Promise<boolean> {
        this.isSubmitted = true;
        if (!this.form.valid) {
            console.log('form is invalid, respect all the constraints');
            return;
        }
        console.log(this.form.value.username, ' ', this.form.value.password);
        return this.modalController.dismiss({
                username: this.form.value.username,
                password: this.form.value.password
            },
            'confirm');
    }

    public cancelButtonClicked(): Promise<boolean> {
        return this.modalController.dismiss(null, 'cancel');
    }
}
