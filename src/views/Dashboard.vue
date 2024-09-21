<script>
import moment from 'moment';
import { useLayout } from '@/layout/composables/layout';

export default {
    setup() {
        const { isDarkTheme } = useLayout();

        return {
            isDarkTheme: isDarkTheme
        };
    },
    data() {
        return {
            shown: false,
            skeleton: false,
            qris_state: false,
            transactions_state: false,
            terminal_state: false,

            amount: 0,
            transactions: []
        };
    },
    mounted() {
        this.transactions = [
            {
                issuer: '9360091538325669206',
                customer: 'QRISAJ',
                rrn: '012442983091',
                total: 10000000,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                issuer: '9360091538325669207',
                customer: 'QRISAJ',
                rrn: '012442983092',
                total: 10000000,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                issuer: '9360091538325669208',
                customer: 'QRISAJ',
                rrn: '012442983093',
                total: 10000000,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                issuer: '9360091538325669209',
                customer: 'QRISAJ',
                rrn: '012442983094',
                total: 10000000,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                issuer: '9360091538325669210',
                customer: 'QRISAJ',
                rrn: '012442983095',
                total: 10000000,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
            },
            {
                issuer: '9360091538325669211',
                customer: 'QRISAJ',
                rrn: '012442983096',
                total: 10000000,
                timestamp: moment().format('YYYY-MM-DD HH:mm:ss')
            }
        ];
    },
    methods: {
        emptyState() {
            this.qris_state = false;
            this.transactions_state = false;
            this.terminal_state = false;
        },
        getAmountFormatting(amount) {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR'
            }).format(amount);
        },
        getBalance() {
            if (this.shown) {
                this.shown = false;
                return;
            }

            this.skeleton = true;

            setTimeout(() => {
                this.amount = 5000000;

                this.skeleton = false;
                this.shown = true;
            }, 3000);

            setTimeout(() => {
                this.skeleton = false;
                this.shown = false;
            }, 10000);
        }
    }
};
</script>

<template>
    <FloatingConfigurator />
    <Fluid>
        <div id="home" class="landing-wrapper overflow-hidden">
            <div class="py-2 px-2 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static">
                <a class="flex items-center" href="/dashboard">
                    <div class="flex items-center justify-center mr-3">
                        <img v-if="isDarkTheme" src="@/assets/dashboard-light.png" alt="" class="w-[75%] lg:w-[45%]" />
                        <img v-else src="@/assets/dashboard-dark.png" alt="" class="w-[75%] lg:w-[45%]" />
                    </div>
                    <!-- <span class="text-surface-600 dark:text-surface-0 font-bold text-2xl leading-normal mr-20">BSGQris</span> -->
                </a>
                <!-- <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2">
                    <Button label="Login" rounded class="w-24"></Button>
                </div> -->
            </div>

            <div class="flex flex-row justify-between mx-20">
                <h1 class="lg:text-4xl font-bold text-gray-900 dark:text-slate-300 leading-tight"><span class="font-light block">Selamat Datang</span>MERCHANT_NAME</h1>
            </div>

            <Menubar class="mx-20 lg:mx-20 mt-5 lg:mt-10">
                <template #start>
                    <h1 class="text-sm lg:text-xl font-medium text-gray-900 dark:text-slate-300 leading-tight">Saldo Bisnis</h1>
                </template>
                <template #end>
                    <div class="flex flex-row">
                        <h1 v-if="shown && skeleton == false" class="text-xl font-medium text-gray-900 dark:text-slate-300 pt-2 mr-2">{{ getAmountFormatting(amount) }}</h1>
                        <Skeleton v-else-if="skeleton" width="9rem" class="mt-3 mr-2"></Skeleton>
                        <Button :icon="skeleton && shown == false ? 'pi pi-refresh pi-spin' : 'pi pi-eye'" rounded text :severity="shown ? 'success' : 'secondary'" @click="getBalance()"></Button>
                    </div>
                </template>
            </Menubar>

            <div class="flex flex-row justify-center mx-8 lg:mx-20 gap-3 lg:gap-14 mt-5 lg:mt-10 mb-10 lg:mb-20">
                <Button label="QRIS" icon="pi pi-qrcode" severity="danger" rounded class="w-48" @click="emptyState()" />
                <Button
                    label="Transaksi"
                    icon="pi pi-credit-card"
                    severity="warn"
                    rounded
                    class="w-48"
                    @click="
                        emptyState();
                        transactions_state = !transactions_state;
                    "
                />
                <Button
                    label="Terminal"
                    icon="pi pi-desktop"
                    severity="info"
                    rounded
                    class="w-48"
                    @click="
                        emptyState();
                        terminal_state = !terminal_state;
                    "
                />
            </div>

            <div v-if="transactions_state" class="flex flex-col justify-center mx-12 lg:mx-80 lg:mt-10 lg:mb-28">
                <div v-for="trx in transactions" :key="trx.id" class="flex flex-col hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-2xl hover:p-3 lg:hover:p-10 hover:border-orange-300 mb-6 lg:mb-20">
                    <div class="flex flex-row justify-between gap-1">
                        <div class="flex flex-row">
                            <div class="mr-6">
                                <Avatar icon="pi pi-check" class="w-10 h-10" shape="circle" style="background-color: rgb(74 222 128); color: white" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase">Issuer</span>
                                <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase">Customer</span>
                                <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase">RRN</span>
                                <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase">Total</span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase text-right">{{ trx.issuer }}</span>
                            <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase text-right">{{ trx.customer }}</span>
                            <span class="text-xs lg:text-xl font-medium text-slate-700 dark:text-slate-300 uppercase text-right">{{ trx.rrn }}</span>
                            <span class="text-xs lg:text-xl font-medium text-green-700 dark:text-green-300 uppercase text-right">{{ getAmountFormatting(trx.total) }}</span>
                            <span class="flex flex-col text-xs lg:text-xl mt-1 font-medium text-orange-400 dark:text-orange-300 uppercase">{{ trx.timestamp }} WITA</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="terminal_state" class="grid lg:grid-cols-3 justify-center gap-2 lg:gap-16 lg:mx-80 lg:mt-10">
                <div class="border border-slate-200 rounded-lg p-5 group hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-xl hover:p-10 hover:border-orange-300 mb-3 lg:mb-20">
                    <div class="flex flex-row justify-between gap-3">
                        <div class="flex flex-col gap-2">
                            <Tag value="A01" severity="info" class="w-16 h-15"></Tag>
                            <Avatar icon="pi pi-th-large" class="mr-2" size="xlarge" />
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row-reverse mb-6">
                                <Tag value="USER" severity="warn" class="w-16 h-15 group-hover:text-lg"></Tag>
                            </div>
                            <span class="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase text-right">Device:</span>
                            <span class="group-hover:text-sm text-xl group-hover:font-extrabold hover:text-xs font-medium text-slate-700 dark:text-slate-300 uppercase text-right">Galaxy S24 Ultra</span>
                        </div>
                    </div>
                </div>
                <div class="border border-slate-200 rounded-lg p-5 group hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-xl hover:p-10 hover:border-orange-300 mb-3 lg:mb-20">
                    <div class="flex flex-row justify-between gap-3">
                        <div class="flex flex-col gap-2">
                            <Tag value="A01" severity="info" class="w-16 h-15"></Tag>
                            <Avatar icon="pi pi-th-large" class="mr-2" size="xlarge" />
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row-reverse mb-6">
                                <Tag value="USER" severity="warn" class="w-16 h-15 group-hover:text-lg"></Tag>
                            </div>
                            <span class="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase text-right">Device:</span>
                            <span class="group-hover:text-sm text-xl group-hover:font-extrabold hover:text-xs font-medium text-slate-700 dark:text-slate-300 uppercase text-right">Galaxy S24 Ultra</span>
                        </div>
                    </div>
                </div>
                <div class="border border-slate-200 rounded-lg p-5 group hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-xl hover:p-10 hover:border-orange-300 mb-3 lg:mb-20">
                    <div class="flex flex-row justify-between gap-3">
                        <div class="flex flex-col gap-2">
                            <Tag value="A01" severity="info" class="w-16 h-15"></Tag>
                            <Avatar icon="pi pi-th-large" class="mr-2" size="xlarge" />
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row-reverse mb-6">
                                <Tag value="USER" severity="warn" class="w-16 h-15 group-hover:text-lg"></Tag>
                            </div>
                            <span class="text-xs font-medium text-slate-700 dark:text-slate-300 uppercase text-right">Device:</span>
                            <span class="group-hover:text-sm text-xl group-hover:font-extrabold hover:text-xs font-medium text-slate-700 dark:text-slate-300 uppercase text-right">Galaxy S24 Ultra</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Fluid>
    <!-- <div class="bg-surface-0 h-auto">
    </div> -->
</template>

<style scoped>
.circle {
    position: relative;
    top: -50px;
    left: -50px;
    width: 150px;
    height: 150px;
    background-color: #40e70dbb;
    border-radius: 50%;
    z-index: 0; /* Ensures it's behind the content */
}
</style>
