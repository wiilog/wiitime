import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {Subscription, zip} from 'rxjs';
import {environment} from '../../../environments/environment';
import {FormSize} from '@app/components/form/form-size-enum';

@Component({
    selector: 'app-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnInit, OnDestroy {

    @Output()
    public validFormSubmittedEvent: EventEmitter<string>;

    public form: FormGroup;
    public isSubmitted: boolean;

    // username field settings
    public readonly usernameFormControlName = 'username';
    public readonly usernameFieldName = 'Nom d\'utilisateur';
    public readonly usernameFieldSize = FormSize.NORMAL;
    public readonly usernameMaxLength: number = environment.adminUsernameMaxLength;

    // password field settings
    public readonly passwordFormControlName = 'password';
    public readonly passwordFieldName = 'Mot de passe';
    public readonly passwordFieldSize = FormSize.NORMAL;
    public readonly passwordMinLength: number = environment.adminPasswordMinLength;
    public readonly passwordMaxLength: number = environment.adminPasswordMaxLength;

    protected saveSubscription: Subscription;

    public constructor(private storageService: StorageService,
                       private formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({
            username: ['', [Validators.required,
                Validators.maxLength(this.usernameMaxLength)]],
            password: ['', [Validators.required,
                Validators.minLength(this.passwordMinLength),
                Validators.maxLength(this.passwordMaxLength)]],
        });
        this.validFormSubmittedEvent = new EventEmitter<any>();
    }

    public ngOnInit(): void {
        this.isSubmitted = false;
    }

    public ngOnDestroy(): void {
        if (this.saveSubscription && !this.saveSubscription.closed) {
            this.saveSubscription.unsubscribe();
        }
    }

    public getErrorControl() {
        return this.form.controls;
    }

    public formSubmitted(): void {
        this.isSubmitted = true;
        if (!this.form.valid) {
            console.log('form is invalid, respect all the constraints');
            return;
        }
        this.saveSubscription = zip(this.storageService.setValue(StorageKeyEnum.ADMIN_USERNAME, this.form.value.username),
            this.storageService.setValue(StorageKeyEnum.ADMIN_PASSWORD, this.form.value.password))
            .subscribe(() => this.validFormSubmittedEvent.emit());
    }
}
