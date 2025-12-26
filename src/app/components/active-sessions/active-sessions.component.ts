import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SessionService } from '../../services/session.service';

@Component({
    selector: 'app-active-sessions',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './active-sessions.component.html',
    styleUrl: './active-sessions.component.scss'
})
export class ActiveSessionsComponent implements OnInit {
    sessions: any[] = [];



    constructor(
        private router: Router,
        private sessionService: SessionService
    ) { }

    ngOnInit(): void {
        this.getSessions();
    }

    getSessions() {
        this.sessionService.getSessions().subscribe((res: any) => {
            const data = Array.isArray(res) ? res : (res?.sessions || []);
            this.sessions = data
                .filter((s: any) => !s.revoked)
                .map((session: any) => {
                    const uaInfo = this.parseUserAgent(session.userAgent || session.deviceName);
                    return {
                        ...session,
                        browser: uaInfo.browser,
                        os: uaInfo.os,
                        device: this.getSimplifiedDeviceName(session.userAgent || session.deviceName),
                        lastActive: this.formatRelativeTime(session.lastSeenAt),
                        isCurrent: this.checkIfCurrent(session)
                    };
                });
            console.log(this.sessions);
        });
    }

    private checkIfCurrent(session: any): boolean {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return false;

            const payload = JSON.parse(atob(token.split('.')[1]));
            return session.jti === payload.jti;
        } catch (e) {
            // Fallback to UA matching if token parsing fails
            return session.userAgent === navigator.userAgent && session.revoked === false;
        }
    }

    private parseUserAgent(ua: string) {
        if (!ua) return { os: 'Unknown', browser: 'Browser' };
        const os = ua.includes('Windows') ? 'Windows' :
            ua.includes('Mac OS X') ? 'macOS' :
                ua.includes('Android') ? 'Android' :
                    ua.includes('iPhone') || ua.includes('iPad') ? 'iOS' :
                        ua.includes('Linux') ? 'Linux' : 'Unknown OS';

        const browser = ua.includes('Chrome') ? 'Chrome' :
            ua.includes('Firefox') ? 'Firefox' :
                ua.includes('Safari') && !ua.includes('Chrome') ? 'Safari' :
                    ua.includes('Edge') ? 'Edge' : 'Browser';

        return { os, browser };
    }

    private getSimplifiedDeviceName(ua: string): string {
        if (!ua) return 'Web Session';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('iPad')) return 'iPad';
        if (ua.includes('Android')) {
            const match = ua.match(/\(([^;]+);/);
            return match ? match[1] : 'Android Device';
        }
        if (ua.includes('Macintosh')) return 'MacBook / iMac';
        if (ua.includes('Windows')) return 'Windows PC';
        return 'Web Session';
    }

    private formatRelativeTime(dateString: string): string {
        if (!dateString) return 'Unknown';
        const now = new Date();
        const past = new Date(dateString);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;

        const diffInHours = Math.floor(diffInMins / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return 'Yesterday';
        return `${diffInDays} days ago`;
    }

    goBack() {
        this.router.navigate(['/settings']);
    }

    terminateSession(sessionId: string) {
        this.sessionService.terminateSession(sessionId).subscribe({
            next: () => {
                this.getSessions();
            },
            error: (err) => {
                console.error('Error terminating session:', err);
                // Fallback for demo if service fails
                this.sessions = this.sessions.filter(s => s.id !== sessionId);
            }
        });
    }

    terminateAllOtherSessions() {
        this.sessionService.terminateAllSessions().subscribe({
            next: () => {
                this.getSessions();
            },
            error: (err) => {
                console.error('Error terminating all sessions:', err);
                // Fallback for demo
                this.sessions = this.sessions.filter(s => s.isCurrent);
            }
        });
    }

    getDeviceIcon(os: string): string {
        const str = os?.toLowerCase() || '';
        if (str.includes('macos') || str.includes('windows') || str.includes('linux')) {
            return 'pi pi-desktop';
        }
        if (str.includes('ios') || str.includes('android')) {
            return 'pi pi-mobile';
        }
        return 'pi pi-info-circle';
    }
}
