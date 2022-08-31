import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {HeaderMode} from '@app/components/header/header-mode.enum';
import {StorageService} from '@app/services/storage/storage.service';
import {StorageKeyEnum} from '@app/services/storage/storage-key.enum';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy{

    @Input()
    public mode: HeaderMode;

    @Input()
    public refreshHeader$?: Observable<string>;

    @Output()
    public backButtonClickedEvent: EventEmitter<any>;

    public readonly HeaderMode = HeaderMode;

    public readonly appLogoPath = '/assets/img/Logo-HeRa.png';

    public logo: string;

    public readonly backButtonImagePath = '/assets/icon/fleche-gauche.svg';

    public readonly disconnectLogoPath = '/assets/icon/deconnexion.svg';

    private refreshHeaderSubscription;

    public constructor(private storageService: StorageService) {
        this.backButtonClickedEvent = new EventEmitter<any>();
    }

    public backButtonClicked() {
        this.backButtonClickedEvent.emit();
    }

    public disconnectButtonClicked() {
        //Todo open the password check modals and act depending on result
    }

    public ngOnInit(): void {
        this.loadLogo();
    }

    public ngAfterViewInit(): void {
        if(this.refreshHeader$) {
            this.refreshHeaderSubscription = this.refreshHeader$.subscribe((logo) => {
                if(logo) {
                    this.logo = logo;
                } else {
                    this.loadLogo();
                }
            });
        }
    }

    public ngOnDestroy() {
        if(this.refreshHeaderSubscription && !this.refreshHeaderSubscription.closed) {
            this.refreshHeaderSubscription.unsubscribe();
        }
    }

    private loadLogo(): void {
        this.storageService.getValue(StorageKeyEnum.LOGO)
            .subscribe((logo: string) => {
                if(!logo) {
                    throw new Error('logo should not be null');
                }
                this.logo = logo;
            });
    }
}
