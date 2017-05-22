import { Subject, Observable } from 'rx'

export namespace DeviceManager {

    export interface Lifecycle {
        start(): Observable<any>;
        stop(): Observable<any>;
        getState(): LifecycleState;
    }

    export enum LifecycleState {
        Starting,
        Started,
        Stopping,
        Stopped
    }

    export abstract class LifecycleSupport implements Lifecycle {

        private state: LifecycleState;

        start(): Observable<any> {
            if (this.state == LifecycleState.Started || this.state == LifecycleState.Starting) {
                return Observable.empty();
            }
            this.state = LifecycleState.Starting;
            return this.doStart().finally(() => this.state = LifecycleState.Started);
        }

        stop(): Observable<any> {
            if (this.state == LifecycleState.Stopped || this.state == LifecycleState.Stopping) {
                return Observable.empty();
            }
            this.state = LifecycleState.Stopping;
            return this.doStop().finally(() => this.state = LifecycleState.Stopped);
        }

        getState(): LifecycleState {
            return this.state;
        }

        protected abstract doStart(): Observable<any>;
        protected abstract doStop(): Observable<any>;
    }

}