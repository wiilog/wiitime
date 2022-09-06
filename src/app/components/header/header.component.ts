import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {Observable} from 'rxjs';
import {HeaderButtonEnum} from '@app/components/header/header-button.enum';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input()
    public mode: HeaderMode;

    @Input()
    public refreshHeader$?: Observable<string>;

    @Output()
    public headerButtonClickedEvent: EventEmitter<any>;

    public logo: string;

    public readonly HeaderMode = HeaderMode;
    public readonly appLogoPath = '/assets/img/Logo-HeRa.png';
    public readonly backButtonImagePath = '/assets/icon/fleche-gauche.svg';
    public readonly disconnectLogoPath = '/assets/icon/deconnexion.svg';

    private isPasswordCheckModalOpen: boolean;
    private refreshHeaderSubscription;

    public constructor(private storageService: StorageService) {
        this.headerButtonClickedEvent = new EventEmitter<HeaderButtonEnum>();
    }

    public ngOnInit(): void {
        this.loadLogo();
        this.isPasswordCheckModalOpen = false;
    }

    public ngAfterViewInit(): void {
        if (this.refreshHeader$) {
            this.refreshHeaderSubscription = this.refreshHeader$.subscribe((logo) => {
                console.log('refresh');
                if (logo) {
                    this.logo = logo;
                } else {
                    this.loadLogo();
                }
            });
        }
    }

    public ngOnDestroy() {
        if (this.refreshHeaderSubscription && !this.refreshHeaderSubscription.closed) {
            this.refreshHeaderSubscription.unsubscribe();
        }
    }

    public backButtonClicked() {
        this.headerButtonClickedEvent.emit(HeaderButtonEnum.BACK_BUTTON);
    }

    public async disconnectButtonClicked() {
        this.headerButtonClickedEvent.emit(HeaderButtonEnum.DISCONNECT_BUTTON);
    }

    private loadLogo(): void {
        this.storageService.getValue(StorageKeyEnum.LOGO)
            .subscribe((logo: string) => {
                if (!logo) {
                    throw new Error('logo should not be null');
                }
                this.logo = logo;
            });
    }
}
