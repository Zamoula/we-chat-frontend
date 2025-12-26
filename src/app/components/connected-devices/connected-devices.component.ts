import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-connected-devices',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    templateUrl: './connected-devices.component.html',
    styleUrl: './connected-devices.component.scss'
})
export class ConnectedDevicesComponent implements OnInit {
    devices: any[] = [];
    loading: boolean = true;

    constructor(
        private router: Router,
        private deviceService: DeviceService
    ) { }

    ngOnInit(): void {
        this.loadDevices();
    }

    loadDevices() {
        this.loading = true;
        this.deviceService.getDevices().subscribe({
            next: (data) => {
                console.warn(data);

                this.devices = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading devices:', err);
                this.loading = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/settings']);
    }

    getDeviceIcon(typeOrOs: string): string {
        const str = typeOrOs?.toLowerCase() || '';

        if (str.includes('windows') || str.includes('desktop') || str.includes('macos') || str.includes('linux')) {
            return 'pi pi-desktop';
        }

        if (str.includes('android') || str.includes('iphone') || str.includes('mobile') || str.includes('ios')) {
            return 'pi pi-mobile';
        }

        if (str.includes('tablet') || str.includes('ipad')) {
            return 'pi pi-tablet';
        }

        return 'pi pi-desktop'; // Default to desktop as it's the safest generic icon
    }

    terminateSession(deviceId: string) {
        // Placeholder for terminating session
        console.log('Terminating session for device:', deviceId);
    }
}
