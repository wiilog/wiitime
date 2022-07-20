import {Injectable} from '@angular/core';
import {NavController, Platform} from '@ionic/angular';
import {from, Observable} from 'rxjs';
import {Router, NavigationStart} from '@angular/router';
import {LoadingController} from '@ionic/angular';
import {PagePath} from '@app/services/nav/page-path.enum';

@Injectable({
    providedIn: 'root'
})
export class NavService {

    public menu: string;

    private paramStack: Array<{ route: PagePath; params: any }> = [];
    private justNavigated: boolean;

    public constructor(private platform: Platform, private loader: LoadingController,
                       private navController: NavController, private router: Router) {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                if (!this.justNavigated && this.paramStack.length) {
                    this.paramStack.pop();
                }

                this.justNavigated = false;
            }
        });
    }

    public push(route: PagePath, params: any = {}): Observable<boolean> {
        this.removeLoaders();

        this.justNavigated = true;
        this.paramStack.push({route, params});

        return from(this.navController.navigateForward(route.toString()));
    }

    public pop(route: PagePath = null, params: any = {}): Observable<void> {
        this.removeLoaders();

        this.justNavigated = true;

        if (route === null) {
            this.paramStack.pop();
            return from(this.navController.pop());
        } else {
            const reversedParamStack = [...this.paramStack].reverse();
            reversedParamStack.shift();

            let index = null;
            for (let i = 0; i < reversedParamStack.length; i++) {
                if (reversedParamStack[i].route === route) {
                    index = i + 1;
                    break;
                }
            }

            if (index === null) {
                throw new Error(`Could not find route ${route}`);
            }

            this.paramStack.splice(this.paramStack.length - index, index);

            const currentParams = this.paramStack[this.paramStack.length - 1].params;
            for (const [key, value] of Object.entries(params)) {
                currentParams[key] = value;
            }

            return from(this.navController.navigateBack(route) as unknown as Observable<void>);
        }
    }

    public setRoot(route: PagePath, params: any = {}): Observable<boolean> {
        this.removeLoaders();

        this.justNavigated = true;
        this.paramStack = [params];

        return from(this.navController.navigateRoot(route));
    }

    public params<T = any>(): T {
        return this.paramStack[this.paramStack.length - 1].params;
    }

    public param<T = any>(key: string): T {
        return this.paramStack[this.paramStack.length - 1].params[key];
    }

    private removeLoaders() {
        this.loader.getTop().then(loader => {
            if(loader) {
                this.loader.dismiss();
            }
        });
    }

}
