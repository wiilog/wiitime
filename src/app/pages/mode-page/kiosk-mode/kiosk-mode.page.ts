import {Component, OnInit} from '@angular/core';
import {ModalController, Platform, ViewWillEnter, ViewWillLeave} from '@ionic/angular';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {Subscription, zip} from 'rxjs';
import {NfcService} from '@app/services/nfc.service';
import {NavService} from '@app/services/nav/nav.service';
import {StorageService} from '@app/services/storage/storage.service';
import {SQLiteService} from '@app/services/sqlite/sqlite.service';
import {WindowService} from '@app/services/window.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {ModePagePage} from '@app/pages/mode-page/mode-page.page';
import {ClockingInfoModalModeEnum} from '@app/modals/clocking-info-modal/clocking-info-modal-mode.enum';
import {HeaderButtonEnum} from '@app/components/header/header-button.enum';
import {PasswordCheckModalComponent} from '@app/modals/password-check-modal/password-check-modal.component';
import {PagePath} from '@app/services/nav/page-path.enum';
import {FooterMode} from '@app/components/footer/footer-mode.enum';
import {ToastService} from "@app/services/toast/toast.service";

@Component({
    selector: 'app-kiosk-mode',
    templateUrl: './kiosk-mode.page.html',
    styleUrls: ['./kiosk-mode.page.scss'],
})
export class KioskModePage extends ModePagePage implements ViewWillEnter, ViewWillLeave, OnInit {

    public headerMode: HeaderMode = HeaderMode.KIOSK_MODE;
    public footerMode: FooterMode = FooterMode.KIOSK_MODE;

    public kioskMessage: string;
    public kioskCommunication: string;

    private isPasswordCheckModalOpen: boolean;
    private backButtonSubscription: Subscription;

    public constructor(protected nfcService: NfcService,
                       private navService: NavService,
                       protected storageService: StorageService,
                       protected sqliteService: SQLiteService,
                       protected windowService: WindowService,
                       protected toastService: ToastService,
                       protected modalCtrl: ModalController,
                       private platform: Platform) {
        super(nfcService,
            storageService,
            sqliteService,
            windowService,
            toastService,
            modalCtrl);
    }

    public ionViewWillEnter(): void {
        this.enterModePage();

        this.isPasswordCheckModalOpen = false;

        this.storageGetterSubscription = zip(
            this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_MESSAGE),
            this.storageService.getValue(StorageKeyEnum.KIOSK_MODE_COMMUNICATION)
        ).subscribe(([kioskMessage, kioskCommunication]) => {
            this.kioskMessage = kioskMessage;
            this.kioskCommunication = kioskCommunication;
        });

        this.backButtonSubscription = this.platform.backButton.subscribeWithPriority(100, () => {
            this.backButtonAction();
        });

        this.nfcSubscription = this.nfcService.nfcTags$.subscribe(
            (data) => this.manageClocking(data.id, ClockingInfoModalModeEnum.KIOSK_MODE));
    }

    public ngOnInit(): void {
    }

    public ionViewWillLeave(): void {
        this.leaveModePage();

        if(this.backButtonSubscription && !this.backButtonSubscription.closed) {
            this.backButtonSubscription.unsubscribe();
        }
    }

    public headerButtonClicked(headerClickedButton: HeaderButtonEnum) {
        //useless to test in theory but just in case
        if (headerClickedButton === HeaderButtonEnum.DISCONNECT_BUTTON) {
            this.backButtonAction();
        }
    }

    private async backButtonAction(): Promise<any> {
        if(this.isPasswordCheckModalOpen) {
            return;
        }
        this.isPasswordCheckModalOpen = true;
        const modal = await this.modalCtrl.create({
            component: PasswordCheckModalComponent,
            keyboardClose: true,
            componentProps: {
                modalTitle: 'Quitter le mode Kiosk',
            },
            cssClass: 'auto-height',
            backdropDismiss: false,
        });
        await modal.present();

        const {role} = await modal.onWillDismiss();
        if (role === 'confirm') {
            this.navService.pop(PagePath.ACTIVE_MODE);
        }
        this.isPasswordCheckModalOpen = false;
    }
}
