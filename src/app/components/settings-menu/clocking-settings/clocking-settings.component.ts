import {Component, EventEmitter, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Platform} from '@ionic/angular';
import {FormBuilder,Validators} from '@angular/forms';
import {ScreenOrientationService} from '@app/services/screen-orientation.service';
import {WindowSizeService} from '@app/services/window-size.service';
import {SettingsMenuComponent} from '@app/components/settings-menu/settings-menu.component';

@Component({
  selector: 'app-clocking-settings',
  templateUrl: './clocking-settings.component.html',
  styleUrls: ['./clocking-settings.component.scss'],
})
export class ClockingSettingsComponent extends SettingsMenuComponent implements OnInit, OnDestroy{

    constructor(protected screenOrientationService: ScreenOrientationService,
                protected windowSizeService: WindowSizeService,
                private formBuilder: FormBuilder,
                private platform: Platform,
                private ngZone: NgZone,) {
        super(screenOrientationService,
              windowSizeService);
        this.form = this.formBuilder.group({
            kioskMessage: ['', [Validators.required,
            ]],
        });
    }

    public ngOnInit(): void {
        this.isSubmitted = false;
        this.updateViewAfterWindowSizeChanged();
        this.windowSizeSubscription = this.windowSizeService.getWindowResizedObservable().subscribe(
            () => {
                this.ngZone.run(() => {
                    this.updateViewAfterWindowSizeChanged();
                });
            }
        );
    }

    public ngOnDestroy(): void {
        this.windowSizeSubscription.unsubscribe();
        console.log('leave clocking settings');
    }

    public formSubmitted(): void {
        this.isSubmitted = true;
        if (!this.form.valid) {
            console.log('Invalid form content !');
            return;
        }
        this.validFormSubmittedEvent.emit('tmp');
    }
}
