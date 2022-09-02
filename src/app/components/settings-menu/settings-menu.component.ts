import {Component, EventEmitter, Input, NgZone, Output} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {environment} from '../../../environments/environment';
import {WindowService} from '@app/services/window.service';
import {FormGroup} from '@angular/forms';

@Component({template: ''})
export abstract class SettingsMenuComponent {
    @Input()
    public submitForm$: Observable<string>;

    @Output()
    public validFormSubmittedEvent: EventEmitter<string>;

    public form: FormGroup;

    public showTitle: boolean;
    public isSubmitted: boolean;

    public readonly inferiorErrorMessage = 'Ce champ ne peut être inférieur à';

    protected windowSizeSubscription: Subscription;
    protected submitFormSubscription: Subscription;
    protected valueSetterSubscription: Subscription;
    protected saveSubscription: Subscription;

    protected constructor(protected windowService: WindowService,
                          protected ngZone: NgZone,) {
        this.validFormSubmittedEvent = new EventEmitter<any>();
    }

    public updateViewAfterWindowSizeChanged(): void {
        this.showTitle = this.windowService.getWindowWidth() < environment.minWindowWidthForSideMenu
            || this.windowService.isPortraitMode();
    }

    public getErrorControl() {
        return this.form.controls;
    }

    /**
     * Call it in  ngOnInit() of the child component
     */
    protected initSettingsMenu() {
        this.isSubmitted = false;
        this.updateViewAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowService.getWindowResizedObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updateViewAfterWindowSizeChanged();
                });
            }
        );

        this.initContent();
    }

    /**
     * Call it in ngAfterViewInit() of the child component
     */
    protected initSubmitFormSubscription() {
        this.submitFormSubscription = this.submitForm$.subscribe(() => {
            this.formSubmitted();
        });
    }

    /**
     * Call it in ngOnDestroy() of the child component
     */
    protected clearSubscriptionOnDestroy() {
        this.windowSizeSubscription.unsubscribe();

        if (this.valueSetterSubscription && !this.valueSetterSubscription.closed) {
            this.valueSetterSubscription.unsubscribe();
        }

        if (this.saveSubscription && !this.saveSubscription.closed) {
            this.saveSubscription.unsubscribe();
        }

        if (this.submitFormSubscription && !this.submitFormSubscription.closed) {
            this.submitFormSubscription.unsubscribe();
        }
    }

    protected abstract formSubmitted(): void;

    protected abstract initContent(): void;
}

