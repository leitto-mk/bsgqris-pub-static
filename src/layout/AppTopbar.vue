<script setup>
import { useLayout } from '@/layout/composables/layout';
import router from '@/router';
import AuthService from '@/services/AuthService';

const { onMenuToggle, toggleDarkMode, isDarkTheme } = useLayout();
</script>

<script>
export default {
    data() {
        return {
            hidden: true,
            userPanelItems: [
                {
                    label: null,
                    items: [
                        {
                            label: 'ADMIN'
                        },
                        {
                            label: 'Logout',
                            icon: 'pi pi-fw pi-sign-out',
                            command: async () => {
                                await AuthService.logout(localStorage.getItem('qris-merchant-user-token'));

                                localStorage.removeItem('qris-merchant-user-token');
                                localStorage.removeItem('qris-merchant-user-data');
                                router.push('/login');
                            }
                        }
                    ]
                }
            ]
        };
    },
    mounted() {
        this.userPanelItems[0].label = JSON.parse(localStorage.getItem('qris-merchant-user-data')).name.toUpperCase();

        switch (JSON.parse(localStorage.getItem('qris-merchant-user-data')).level) {
            case 'ADM':
                this.userPanelItems[0].items[0].label = 'ADMIN';
                break;
            case 'CAB_MKR':
                this.userPanelItems[0].items[0].label = 'CABANG MAKER';
                break;
            case 'CAB_CHK':
                this.userPanelItems[0].items[0].label = 'CABANG ARPPROVER';
                break;
            case 'CNT_MKR':
                this.userPanelItems[0].items[0].label = 'PUSAT MAKER';
                break;
            case 'CNT_CHK':
                this.userPanelItems[0].items[0].label = 'PUSAT APPROVER';
                break;
        }
    },
    methods: {
        showUserPanel(event) {
            this.$refs.menu.toggle(event);
        }
    }
};
</script>

<template>
    <div class="layout-topbar">
        <div class="layout-topbar-logo-container">
            <router-link to="/" class="layout-topbar-logo mr-5">
                <div class="flex items-center justify-center mr-2">
                    <img v-if="isDarkTheme" src="@/assets/dashboard-light.png" alt="" class="w-[110%]" />
                    <img v-else-if="!isDarkTheme" src="@/assets/dashboard-dark.png" alt="" class="w-[110%]" />
                    <!-- <img src="@/assets/icon2.png" alt="" class="w-full" /> -->
                </div>
                <!-- <span>BSGqris Merchant</span> -->
            </router-link>
            <button class="layout-menu-button layout-topbar-action" @click="onMenuToggle">
                <i class="pi pi-bars"></i>
            </button>
        </div>

        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" @click="toggleDarkMode">
                    <i :class="['pi', { 'pi-moon': isDarkTheme, 'pi-sun': !isDarkTheme }]"></i>
                </button>
                <!-- <div class="relative">
                    <button
                        v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
                        type="button"
                        class="layout-topbar-action layout-topbar-action-highlight"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <AppConfigurator />
                </div> -->
            </div>

            <!-- <button
                class="layout-topbar-menu-button layout-topbar-action"
                v-styleclass="{ selector: '@next', enterFromClass: 'hidden', enterActiveClass: 'animate-scalein', leaveToClass: 'hidden', leaveActiveClass: 'animate-fadeout', hideOnOutsideClick: true }"
            >
                <i class="pi pi-ellipsis-v"></i>
            </button> -->

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action" @click="showUserPanel">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <Menu ref="menu" id="overlay_menu" :model="userPanelItems" :popup="true" />
                </div>
            </div>
        </div>
    </div>
</template>
