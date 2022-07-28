import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {TabConfig} from '@app/components/tab/tab-config';

@Component({
    selector: 'app-tab',
    templateUrl: './tab.component.html',
    styleUrls: ['./tab.component.scss'],
})
export class TabComponent implements OnInit {

    @Input()
    public activeKey: number;

    @Input()
    public config: TabConfig[];

    @Output()
    public activeKeyChange: EventEmitter<number>;

    constructor() {
        this.activeKeyChange = new EventEmitter<number>();
    }

    ngOnInit(): void {
        if(!this.config || this.config.length === 0) {
            throw new Error('Invalid config (null or length = 0');
        }
    }

    public onTabClicked(key: number): void {
        if(this.activeKey !== key) {
            this.activeKey = key;
            this.activeKeyChange.emit(key);
        }
    }
}
