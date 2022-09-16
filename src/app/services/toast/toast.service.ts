import {Injectable} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {from, Subscription} from 'rxjs';
import {ToastTypeEnum} from '@app/services/toast/toast-type.enum';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    public static readonly TOAST_DEFAULT_DURATION = 4000;

    private currentToast: HTMLIonToastElement;
    private lastToastDismissSubscription: Subscription;

    public constructor(private toastController: ToastController) {
    }

    public async displayToast(message: string, toastType: ToastTypeEnum) {
        if (!message) {
            return;
        }

        if (this.currentToast) {
            await this.currentToast.dismiss;
            this.lastToastDismissSubscription.unsubscribe();
            this.lastToastDismissSubscription = null;
        }

        this.currentToast = await this.toastController.create({
            message,
            duration: ToastService.TOAST_DEFAULT_DURATION,
            cssClass: toastType.toString()
        });

        this.lastToastDismissSubscription = from(this.currentToast.onDidDismiss()).subscribe(() => {
            this.currentToast = null;
            this.lastToastDismissSubscription.unsubscribe();
            this.lastToastDismissSubscription = null;
        });

        await this.currentToast.present();
    }
}
