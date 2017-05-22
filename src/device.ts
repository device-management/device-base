import * as lifecycle from './lifecycle';
import { MqttClient, IClientOptions, connect } from 'mqtt';
import { Observable, ReplaySubject } from 'rx';

export namespace DeviceManager {

    export abstract class Device extends lifecycle.DeviceManager.LifecycleSupport {

        private readonly options: IClientOptions;

        protected mqttClient: MqttClient;

        constructor(private mqttConfig: MqttConfig, protected deviceDescription: DeviceDescription) {
            super();
            this.options = {
                clientId: this.deviceDescription.deviceId,
                will: {
                    topic: "devices/" + this.deviceDescription.deviceId + "/state",
                    payload: JSON.stringify({
                        deviceId: this.deviceDescription.deviceId,
                        properties: {
                            isOnline: false
                        }
                    }),
                    qos: 1,
                    retain: true
                }
            };
        }

        protected doStart(): Observable<any> {
            let subject = new ReplaySubject();
            let client = this.mqttClient = connect(this.mqttConfig.brokerAddress, this.options);
            let device = this.deviceDescription;
            client.on('error', function () {
                let message = "Cannot connect to the message broker.";
                console.log(message);
                subject.onError(message);
            });
            client.on('message', this.getMessageHandler());
            client.on('connect', function () {
                console.log("Connected with the message broker. Registering device...")
                client.publish(
                    "devices/" + device.deviceId + "/register",
                    JSON.stringify(device),
                    {
                        qos: 1,
                        retain: true
                    }
                );
                subject.onCompleted();
            });

            return subject;
        }

        protected doStop(): Observable<any> {
            let subject = new ReplaySubject();
            this.mqttClient.end(false, () => {
                subject.onCompleted();
            });
            return subject;
        }

        protected getMessageHandler(): (topic: string, message: string) => void {
            return () => { };
        }
    }

    export interface DeviceDescription {
        deviceId: string;
        properties: any;
    }

    export interface MqttConfig {
        brokerAddress: string
    }
}