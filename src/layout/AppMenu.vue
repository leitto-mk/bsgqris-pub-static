<script setup>
import { ref } from 'vue';

import AppMenuItem from './AppMenuItem.vue';

const token = JSON.parse(localStorage.getItem('qris-merchant-user-data'));

const userBank = {
    label: 'User Management',
    items: [{ label: 'User Bank', icon: 'pi pi-fw pi-list', to: '/user-bank' }]
};

const management = {
    label: 'Management',
    items: [
        { label: 'Merchant Master', icon: 'pi pi-fw pi-list', to: '/merchants-master' },
        { label: 'Biling Non-QRIS', icon: 'pi pi-fw pi-calculator', to: '/construction' },
        { label: 'Parameter', icon: 'pi pi-fw pi-bars', to: '/construction' },
        { label: 'Report', icon: 'pi pi-fw pi-database', to: '/construction' },
        { label: 'Monitoring', icon: 'pi pi-fw pi-chart-line', to: '/construction' }
    ]
};

const branch = {
    label: 'Inisialisasi Merchant',
    items: [
        { label: 'Registrasi', icon: 'pi pi-fw pi-desktop', to: '/registrasi-merchant' },
        { label: 'Daftar Merchant', icon: 'pi pi-fw pi-list', to: '/merchants' },
        { label: 'Report', icon: 'pi pi-fw pi-database', to: '/construction' }
    ]
};

let menu = [];

if (token.level == 'ADM') menu = [userBank, management, branch];
else if (token.level == 'CNT_MKR' || token.level == 'CNT_CHK') menu = [management];
else if (token.level == 'CAB_MKR' || token.level == 'CAB_CHK') menu = [branch];

const model = ref(menu);
</script>

<template>
    <ul class="layout-menu">
        <template v-for="(item, i) in model" :key="item">
            <app-menu-item v-if="!item.separator" :item="item" :index="i"></app-menu-item>
            <li v-if="item.separator" class="menu-separator"></li>
        </template>
    </ul>
</template>

<style lang="scss" scoped></style>
