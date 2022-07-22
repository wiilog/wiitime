import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {NavService} from '@app/services/nav/nav.service';
import {PagePath} from '@app/services/nav/page-path.enum';
import {zip} from 'rxjs';

@Component({
    selector: 'app-account-form',
    templateUrl: './account-form.component.html',
    styleUrls: ['./account-form.component.scss'],
})
export class AccountFormComponent implements OnInit {

    @Output()
    public validSubmission: EventEmitter<any>;

    public accountForm: FormGroup;

    public isSubmitted = false;

    public readonly usernameMaxLength: number = 20;

    public readonly passwordMinLength: number = 4;

    public readonly passwordMaxLength: number = 30;

    constructor(public formBuilder: FormBuilder,
                private storageService: StorageService,
                private navService: NavService) {

        this.validSubmission = new EventEmitter<any>();
        this.accountForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.maxLength(this.usernameMaxLength)]],
            password: ['', [Validators.required,
                            Validators.minLength(this.passwordMinLength),
                            Validators.maxLength(this.passwordMaxLength)]
                      ],
        });
    }

    public get errorControl() {
        return this.accountForm.controls;
    }

    ngOnInit() {
    }

    public formSubmitted(): void {
        this.isSubmitted = true;
        if(!this.accountForm.valid) {
            console.log('form is invalid, respect all the constraints');
            return;
        }
        zip(this.storageService.setValue(StorageKeyEnum.ADMIN_USERNAME, this.accountForm.value.username),
            this.storageService.setValue(StorageKeyEnum.ADMIN_PASSWORD, this.accountForm.value.password))
            .subscribe(() => this.navService.setRoot(PagePath.HOME));
        //Todo change the setRoot value to parameter menu
    }
}

/* TODO Could be used to factorise the form creation
        const a: FormControl = new FormControl();
        a.setValidators([Validators.max(2), Validators.required]);
        this.accountForm.addControl('a', a);
        this.accountForm.addControl('bg', ['', [Validators.required]]);
*/
