import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {NavService} from '@app/services/nav/nav.service';
import {PagePath} from '@app/services/nav/page-path.enum';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {from, Subscription} from 'rxjs';
import {PasswordCheckModalComponent} from '@app/modals/password-check-modal/password-check-modal.component';
import {ModalController} from '@ionic/angular';
import {App} from '@capacitor/app';
import {BackgroundService} from '@app/services/background.service';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit, OnDestroy {

    @Input()
    public mode: FooterMode;

    @Output()
    public backgroundModeActivated: EventEmitter<any>;

    public readonly footerMode = FooterMode;

    public currentVersionNumber: string;

    private valueGetterSubscription: Subscription;
    private appInfoGetterSubscription: Subscription;
    private isPasswordCheckModalOpen: boolean;

    constructor(private navService: NavService,
                private storage: StorageService,
                private backgroundService: BackgroundService,
                private modalCtrl: ModalController,) {
        this.backgroundModeActivated = new EventEmitter<any>();
    }

    public ngOnInit(): void {
        this.isPasswordCheckModalOpen = false;
        this.appInfoGetterSubscription = from(App.getInfo())
            .subscribe((result) => {
                this.currentVersionNumber = result.version;
            });
    }

    public ngOnDestroy(): void {
        if (this.valueGetterSubscription && !this.valueGetterSubscription.closed) {
            this.valueGetterSubscription.unsubscribe();
        }
        if (this.appInfoGetterSubscription && !this.appInfoGetterSubscription.closed) {
            this.appInfoGetterSubscription.unsubscribe();
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
                        this.backgroundModeActivated.emit();
                        this.backgroundService.activateBackgroundMode();
                    } else {
                        this.navService.push(PagePath.KIOSK_MODE);
                    }
                } else {
                    console.error('Error storage value of key IS_BACKGROUND_MODE_ACTIVE is null -> should be 0 or 1');
                }
            });
    }

    public async parametersButtonClicked() {
        if (this.isPasswordCheckModalOpen) {
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
