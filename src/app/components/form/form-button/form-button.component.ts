import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
    selector: 'app-form-button',
    templateUrl: './form-button.component.html',
    styleUrls: ['./form-button.component.scss'],
})
export class FormButtonComponent implements OnInit {

    @Input()
    public buttonText: string;

    @Input()
    public iconPath: string;

    @Input()
    public isLarge: boolean;

    @Input()
    public fillScreenWidth: boolean;

    @Input()
    public swapColor?: boolean;

    @Output()
    public buttonClickedEvent: EventEmitter<any>;

    public constructor() {
        this.buttonClickedEvent = new EventEmitter<any>();
    }

    public ngOnInit(): void {
        if (!this.swapColor) {
            this.swapColor = false;
        }
    }

    public buttonClicked() {
        this.buttonClickedEvent.emit();
    }

}
