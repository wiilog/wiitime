import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NavService} from '@app/services/nav/nav.service';
import {PagePath} from '@app/services/nav/page-path.enum';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {Subscription} from 'rxjs';
import {PasswordCheckModalComponent} from '@app/modals/password-check-modal/password-check-modal.component';
import {ModalController} from '@ionic/angular';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {

    @Input()
    public mode: FooterMode;

    public readonly footerMode = FooterMode;

    public currentVersionNumber: string; //TODO get value from storage instead

    private valueGetterSubscription: Subscription;
    private isPasswordCheckModalOpen: boolean;

    constructor(private navService: NavService,
                private storage: StorageService,
                private modalCtrl: ModalController,) {
        this.currentVersionNumber = '0.0.42';
    }

    public ngOnInit(): void {
        this.isPasswordCheckModalOpen = false;
    }

    public ngOnDestroy(): void {
        if (this.valueGetterSubscription && !this.valueGetterSubscription.closed) {
            this.valueGetterSubscription.unsubscribe();
        }
    }

    public quitApplicationButtonClicked() {
        //Todo save important data if any
        App.exitApp();
    }

    public changeModeButtonClicked() {
        this.valueGetterSubscription = this.storage.getValue(StorageKeyEnum.CURRENT_SECONDARY_MODE)
            .subscribe((isActive) => {
                if (isActive != null) {
                    const numberValue: number = parseInt(isActive.toString(), 10);
                    if (numberValue) {
                        // Todo connect to background mode when created
                        this.navService.push(PagePath.KIOSK_MODE);
                    } else {
                        this.navService.push(PagePath.KIOSK_MODE);
                    }
                } else {
                    console.error('Error storage value of key IS_BACKGROUND_MODE_ACTIVE is null -> should be 0 or 1');
                }
            });
    }

    public async parametersButtonClicked() {
        if(this.isPasswordCheckModalOpen) {
            return;
        }
        this.isPasswordCheckModalOpen = true;
        const modal = await this.modalCtrl.create({
            component: PasswordCheckModalComponent,
            keyboardClose: true,
            componentProps: {
                modalTitle: 'Accès au paramétrage',
            },
            cssClass: 'auto-height',
            backdropDismiss: false,
        });
        await modal.present();

        const {role} = await modal.onWillDismiss();
        if (role === 'confirm') {
            this.navService.push(PagePath.SETTINGS_MENU);
        }
        this.isPasswordCheckModalOpen = false;
    }
}

