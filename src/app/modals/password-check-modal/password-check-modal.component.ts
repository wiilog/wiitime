import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {FormSize} from '@app/components/form/form-size-enum';
import {Subscription} from 'rxjs';
import {ModalController, Platform} from '@ionic/angular';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {LoadingService} from '@app/services/loading.service';


@Component({
    selector: 'app-password-check-modal',
    templateUrl: './password-check-modal.component.html',
    styleUrls: ['./password-check-modal.component.scss'],
})
export class PasswordCheckModalComponent implements OnInit, OnDestroy {

    @Input()
    public modalTitle: string;

    public form: FormGroup;
    public isSubmitted: boolean;
    public passwordValid: boolean;

    //password field settings
    public readonly passwordFormControlName = 'password';
    public readonly passwordFieldName = 'Mot de passe administrateur';
    public readonly passwordFieldSize = FormSize.NORMAL;
    public readonly passwordMaxLength: number = environment.adminPasswordMaxLength;

    private backButtonSubscription: Subscription;
    private passwordGetterSubscription;
    private adminPassword: string;

    public constructor(private storageService: StorageService,
                       private loadingService: LoadingService,
                       private modalController: ModalController,
                       private formBuilder: FormBuilder,
                       private platform: Platform) {
        this.form = this.formBuilder.group({
            password: ['', [Validators.required,
                Validators.maxLength(this.passwordMaxLength)]],
        });
    }

    public ngOnInit(): void {
        this.isSubmitted = false;
        this.passwordValid = true;

        this.passwordGetterSubscription = this.loadingService.presentLoadingWhile({
            message: 'chargement en cours...',
            event: () => this.storageService.getValue(StorageKeyEnum.ADMIN_PASSWORD)
        }).subscribe((password) => this.adminPassword = password);

        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(100, () =>
            this.cancelButtonClicked()
        );
    }

    public ngOnDestroy(): void {
        if (this.backButtonSubscription && !this.backButtonSubscription.closed) {
            this.backButtonSubscription.unsubscribe();
        }
        if (this.passwordGetterSubscription && !this.passwordGetterSubscription.closed) {
            this.passwordGetterSubscription.unsubscribe();
        }
    }

    public getErrorControl() {
        return this.form.controls;
    }

    public passwordValueChanged() {
        this.passwordValid = true;
    }

    public confirmButtonClicked(): Promise<boolean> {
        this.isSubmitted = true;
        if (!this.form.valid) {
            this.passwordValid = true;
            console.log('form is invalid, respect all the constraints');
            return;
        }
        if (this.adminPassword !== this.form.value.password) {
            this.passwordValid = false;
            return;
        }
        return this.modalController.dismiss({},
            'confirm');
    }

    public cancelButtonClicked(): Promise<boolean> {
        return this.modalController.dismiss(null, 'cancel');
    }
}
