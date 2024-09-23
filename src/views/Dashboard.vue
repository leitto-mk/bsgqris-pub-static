<script>
import { useLayout } from '@/layout/composables/layout';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';

export default {
    setup() {
        const { isDarkTheme } = useLayout();

        return {
            toast: useToast(),
            isDarkTheme: isDarkTheme
        };
    },
    data() {
        return {
            shown: false,
            skeleton: false,
            transactions_state: false,
            terminal_state: false,

            amount: 0,
            transaction_date: null,
            transactions: []
        };
    },
    mounted() {
        this.toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Testing'
        });
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
        },

        getTransations() {
            console.log('getting transactions...');
            this.transactions = [
                {
                    issuer: '9360091538325669206',
                    customer: 'QRISAJ',
                    rrn: '012442983091',
                    total: 10000000,
                    timestamp: moment(this.transaction_date).format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    issuer: '9360091538325669207',
                    customer: 'QRISAJ',
                    rrn: '012442983092',
                    total: 10000000,
                    timestamp: moment(this.transaction_date).format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    issuer: '9360091538325669208',
                    customer: 'QRISAJ',
                    rrn: '012442983093',
                    total: 10000000,
                    timestamp: moment(this.transaction_date).format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    issuer: '9360091538325669209',
                    customer: 'QRISAJ',
                    rrn: '012442983094',
                    total: 10000000,
                    timestamp: moment(this.transaction_date).format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    issuer: '9360091538325669210',
                    customer: 'QRISAJ',
                    rrn: '012442983095',
                    total: 10000000,
                    timestamp: moment(this.transaction_date).format('YYYY-MM-DD HH:mm:ss')
                },
                {
                    issuer: '9360091538325669211',
                    customer: 'QRISAJ',
                    rrn: '012442983096',
                    total: 10000000,
                    timestamp: moment(this.transaction_date).format('YYYY-MM-DD HH:mm:ss')
                }
            ];
        }
    }
};
</script>

<template>
    <Fluid class="layout-menu dark:bg-zinc-900 min-h-screen md:min-h-0 md:h-auto lg:h-screen">
        <div
            class="h-full w-full fixed"
            style="
                background: rgb(0, 0, 0);
                background: linear-gradient(
                    149deg,
                    rgba(0, 0, 0, 0.9473039215686274) 0%,
                    rgba(84, 15, 5, 0.8660714285714286) 39%,
                    rgba(137, 32, 18, 0.8576680672268908) 55%,
                    rgba(166, 41, 25, 0.8548669467787114) 70%,
                    rgba(201, 34, 13, 0.7204131652661064) 89%,
                    rgba(196, 13, 13, 0.6615896358543417) 100%
                );
                /* clip-path: ellipse(150% 87% at 93% 13%); */
                z-index: -1;
            "
        ></div>
        <div id="home" class="landing-wrapper overflow-hidden">
            <Toast />
            <div class="py-2 px-2 mx-12 lg:mx-20 lg:px-20 flex items-center relative lg:static">
                <a class="flex flex-row justify-center ml-20" href="/">
                    <!-- <img v-if="isDarkTheme" src="@/assets/dashboard-light.png" alt="" class="w-[75%] lg:w-[45%]" />
                    <img v-else src="@/assets/dashboard-dark.png" alt="" class="w-[75%] lg:w-[45%]" /> -->
                    <img src="@/assets/dashboard-light.png" alt="" class="w-[75%] lg:w-[45%]" />
                </a>
                <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-2">
                    <Button label="Logout" severity="contrast" rounded class="w-24"></Button>
                </div>
            </div>

            <div class="flex flex-col justify-between mx-20 gap-2">
                <h1 class="lg:text-4xl font-bold text-slate-100 leading-tight"><span class="font-light block text-3xl">Selamat Datang,</span>MERCHANT_NAME</h1>
                <span class="text-base rounded text-slate-100 text-center uppercase p-1 bg-green-500 w-20">ADMIN</span>
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

            <div class="flex flex-row justify-center mx-8 lg:mx-20 gap-3 lg:gap-14 mt-5 lg:mt-10">
                <Button
                    label="User"
                    icon="pi pi-desktop"
                    :severity="terminal_state ? 'success' : 'secondary'"
                    rounded
                    :class="terminal_state ? 'w-40 h-14 animate-scalein' : 'w-30 h-14'"
                    @click="
                        emptyState();
                        terminal_state = !terminal_state;
                    "
                />
                <Button
                    label="Transaksi Outlet"
                    icon="pi pi-credit-card"
                    :severity="transactions_state ? 'success' : 'secondary'"
                    rounded
                    :class="transactions_state ? 'w-40 h-14 animate-scalein' : 'w-30 h-14'"
                    @click="
                        emptyState();
                        transactions_state = !transactions_state;
                    "
                />
            </div>

            <div v-if="terminal_state" class="flex flex-row justify-center mx-8 lg:mx-20 gap-3 lg:gap-14 mt-10 mb-10">
                <div class="flex flex-wrap w-40">
                    <Button label="Tambah User" icon="pi pi-user-plus" severity="secondary" rounded class="hover:animate-scalein" />
                </div>
            </div>

            <div v-if="terminal_state" class="flex flex-col lg:flex-row lg:row-span-3 justify-center gap-1 lg:gap-16 max-md:mx-12 mt-5">
                <div class="border border-slate-100 rounded-lg p-5 w-5/5 lg:w-[28rem] group hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-xl hover:p-10 hover:border-orange-300 mb-3 lg:mb-20">
                    <div class="flex flex-row justify-between gap-3">
                        <div class="flex flex-col gap-2">
                            <Tag value="A01" severity="info" class="w-16 h-15"></Tag>
                            <Avatar label="S" class="mr-2" size="xlarge" v-tooltip.bottom="'Static'" />
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row-reverse mb-6">
                                <Tag value="USER" severity="warn" class="w-16 h-15 group-hover:text-lg"></Tag>
                            </div>
                            <span class="text-xs font-normal text-slate-100 uppercase text-right">Status:&nbsp;&nbsp;</span>
                            <Tag value="AKTIF" severity="success" class="w-16 h-15 mt-1 text-base group-hover:text-lg"></Tag>
                        </div>
                    </div>
                </div>
                <div class="border border-slate-100 rounded-lg p-5 w-5/5 lg:w-[28rem] group hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-xl hover:p-10 hover:border-orange-300 mb-3 lg:mb-20">
                    <div class="flex flex-row justify-between gap-3">
                        <div class="flex flex-col gap-2">
                            <Tag value="A02" severity="info" class="w-16 h-15"></Tag>
                            <Avatar label="D" class="mr-2" size="xlarge" v-tooltip.bottom="'Dinamis'" />
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row-reverse mb-6">
                                <Tag value="USER" severity="warn" class="w-16 h-15 group-hover:text-lg"></Tag>
                            </div>
                            <span class="text-xs font-normal text-slate-100 uppercase text-right">Status:&nbsp;&nbsp;</span>
                            <Tag value="AKTIF" severity="success" class="w-16 h-15 mt-1 text-base group-hover:text-lg"></Tag>
                        </div>
                    </div>
                </div>
                <div class="border border-slate-100 rounded-lg p-5 w-5/5 lg:w-[28rem] group hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-xl hover:p-10 hover:border-orange-300 mb-3 lg:mb-20">
                    <div class="flex flex-row justify-between gap-3">
                        <div class="flex flex-col gap-2">
                            <Tag value="A03" severity="info" class="w-16 h-15"></Tag>
                            <Avatar label="D" class="mr-2" size="xlarge" v-tooltip.bottom="'Dinamis'" />
                        </div>
                        <div class="flex flex-col">
                            <div class="flex flex-row-reverse mb-6">
                                <Tag value="USER" severity="warn" class="w-16 h-15 group-hover:text-lg"></Tag>
                            </div>
                            <span class="text-xs font-normal text-slate-100 uppercase text-right">Status:&nbsp;&nbsp;</span>
                            <Tag value="AKTIF" severity="success" class="w-16 h-15 mt-1 text-base group-hover:text-lg"></Tag>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="transactions_state" class="flex flex-row justify-center mx-5 lg:mx-1 mt-10 mb-10">
                <span class="text-slate-100 max-md:hidden lg:text-lg lg:font-semibold lg:mt-2 lg:mr-5">Pilih Tanggal:</span>
                <div class="w-96">
                    <DatePicker v-model="transaction_date" dateFormat="dd MM yy" :showButtonBar="true" showIcon fluid :showOnFocus="true" placeholder="Pilih Tanggal" @keydown.enter="getTransations()" />
                </div>
            </div>

            <div v-if="transactions_state && transaction_date" class="flex flex-col justify-center mx-12 lg:mx-80 mt-10 lg:mt-20 lg:mb-28">
                <div
                    v-for="trx in transactions"
                    :key="trx.id"
                    class="flex flex-col hover:transition hover:ease-in-out hover:delay-150 hover:border hover:rounded-2xl hover:p-3 lg:border lg:p-5 lg:rounded-2xl lg:hover:p-10 lg:border-orange-500 hover:border-orange-500 mb-6 lg:mb-12"
                >
                    <div class="flex flex-row justify-between gap-1">
                        <div class="flex flex-row">
                            <div class="mr-6">
                                <Avatar icon="pi pi-check" class="w-10 h-10" shape="circle" style="background-color: rgb(74 222 128); color: white" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase">Issuer</span>
                                <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase">Customer</span>
                                <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase">RRN</span>
                                <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase">Total</span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase text-right">{{ trx.issuer }}</span>
                            <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase text-right">{{ trx.customer }}</span>
                            <span class="text-xs lg:text-xl font-medium text-slate-100 uppercase text-right">{{ trx.rrn }}</span>
                            <span class="text-xs lg:text-xl font-medium text-green-100 uppercase text-right">{{ getAmountFormatting(trx.total) }}</span>
                            <span class="flex flex-col text-xs lg:text-xl mt-1 font-medium text-orange-100 uppercase">{{ trx.timestamp }} WITA</span>
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
