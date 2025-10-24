import { HubConnection, HubConnectionState, HubConnectionBuilder } from '@microsoft/signalr';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Order } from '../../shared/models/order';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private hubUrl = environment.hubUrl;
    private hubConnection?: HubConnection;
    orderSignal = signal<Order | null>(null);

    createHubConnection() {
        this.hubConnection = new HubConnectionBuilder()
            .withUrl(this.hubUrl, { withCredentials: true })
            .withAutomaticReconnect()
            .build();

        this.hubConnection.start()
            .catch(error => console.log(error));

        this.hubConnection.on('OrderCompleteNotification', (order: Order) => {
            this.orderSignal.set(order)
        });
    }

    stopHubConnection() {
        if (this.hubConnection?.state === HubConnectionState.Connected) {
            this.hubConnection.stop().catch(error => console.log(error))
        }
    }
}
