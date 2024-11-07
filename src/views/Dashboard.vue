<script>
import { useLayout } from '@/layout/composables/layout';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';
import DashboardLogoDark from '../assets/dashboard-dark.png';
import DashboardLogoLight from '../assets/dashboard-light.png';

export default {
    setup() {
        const { toggleDarkMode, isDarkTheme } = useLayout();

        return {
            moment: moment,
            toast: useToast(),
            DashboardLogoDark: DashboardLogoDark,
            DashboardLogoLight: DashboardLogoLight,
            toggleDarkMode: toggleDarkMode,
            isDarkTheme: isDarkTheme
        };
    },
    data() {
        return {
            merchant_name: null,
            panel: 'Users',

            shown: false,
            skeleton: false,
            transactions_state: false,
            terminal_state: false,

            amount: 0,
            transaction_date: null,

            //Outlet
            outlets: [],
            active_outlet: null,
            outlet_show_terminal_list: false,
            outlet_show_add_dialog: false,

            //Transactions
            trx: {
                years: [],
                months: [],
                dates: [],
                date_type: 'Single',
                date_range_type: null,
                date_range_pos: 'from',
                carousel_position: 0,
                date_compact: null,
                month_start: null, //1 - 12
                year_start: null, //YYYY
                day_start: null, //1 - 9
                month_end: null, //1 - 12
                year_end: null, //YYYY
                day_end: null, //1 - 9
                responsiveOptions: [
                    {
                        breakpoint: '1400px',
                        numVisible: 7,
                        numScroll: 7
                    },
                    {
                        breakpoint: '1199px',
                        numVisible: 7,
                        numScroll: 7
                    },
                    {
                        breakpoint: '767px',
                        numVisible: 7,
                        numScroll: 7
                    },
                    {
                        breakpoint: '575px',
                        numVisible: 7,
                        numScroll: 7
                    }
                ]
            }
        };
    },
    beforeMount() {
        const currentDarkTheme = JSON.parse(localStorage.getItem('qris-merchant-dark'));
        currentDarkTheme ? document.documentElement.classList.add('app-dark') : document.documentElement.classList.remove('app-dark');
    },
    mounted() {
        this.merchant_name = 'MERCHANT_NAME';

        this.getOutlet();
        this.generateCalendar();

        this.trx.carousel_position = this.getCarouselDatePosition;
        this.trx.month_start = +moment().format('M');
        this.trx.year_start = +moment().format('YYYY');
        this.getTrxDates();

        this.trx.date_range_type = 'Hari ini';
    },
    computed: {
        /**
         * Check whether the date is fully specified, that includes date range
         * which requires both start and end date.
         */
        isDateSpecified() {
            switch (this.trx.date_range_type) {
                case 'Hari ini':
                    return this.trx.year_start && this.trx.month_start && this.trx.day_start;
                case '1 Minggu':
                case '1 Bulan':
                case 'Rentang':
                    return moment(`${this.trx.year_start}-${this.trx.month_start}-${this.trx.day_start_start}`, 'YYYY-M-D').isValid() && moment(`${this.trx.year_start}-${this.trx.month_start}-${this.trx.day_start_start}`, 'YYYY-M-D').isValid();
                default:
                    return false;
            }
        },
        /**
         * Carousel page position based on current date
         */
        getCarouselDatePosition() {
            const current_date = +moment().format('D');

            if (current_date <= 7) {
                return 0;
            } else if (current_date > 7 && current_date <= 14) {
                return 1;
            } else if (current_date > 14 && current_date <= 21) {
                return 2;
            } else if (current_date > 21 && current_date <= 28) {
                return 3;
            } else {
                return 4;
            }
        }
    },
    watch: {
        'trx.date_type'() {
            this.trx.year_start = null;
            this.trx.month_start = null;
            this.trx.day_start = null;

            this.trx.year_end = null;
            this.trx.month_end = null;
            this.trx.day_end = null;
        },
        'trx.date_range_type'(value) {
            switch (value) {
                case 'Hari ini':
                    this.trx.year_start = +moment().format('YYYY');
                    this.trx.month_start = +moment().format('M');
                    this.trx.day_start = +moment().format('D');
                    break;
                case '1 Minggu':
                    this.trx.year_start = +moment().subtract(7, 'days').format('YYYY');
                    this.trx.month_start = +moment().subtract(7, 'days').format('M');
                    this.trx.day_start = +moment().subtract(7, 'days').format('D');
                    this.trx.year_end = +moment().format('YYYY');
                    this.trx.month_end = +moment().format('M');
                    this.trx.day_end = +moment().format('D');
                    break;
                case '1 Bulan':
                    this.trx.year_start = +moment().subtract(1, 'month').format('YYYY');
                    this.trx.month_start = +moment().subtract(1, 'month').format('M');
                    this.trx.day_start = +moment().subtract(1, 'month').format('D');
                    this.trx.year_end = +moment().format('YYYY');
                    this.trx.month_end = +moment().format('M');
                    this.trx.day_end = +moment().format('D');
                    break;
                case 'Rentang':
                    this.trx.date_range_pos = 'from';
                    this.trx.year_start = null;
                    this.trx.month_start = null;
                    this.trx.day_start = null;
                    this.trx.year_end = null;
                    this.trx.month_end = null;
                    this.trx.day_end = null;
                    break;
                default:
                    this.trx.year_start = null;
                    this.trx.month_start = null;
                    this.trx.day_start = null;
                    this.trx.year_end = null;
                    this.trx.month_end = null;
                    this.trx.day_end = null;
                    break;
            }
        },
        'trx.date_compact'(value) {
            this.trx.year_start = moment(value[0]).format('YYYY');
            this.trx.month_start = moment(value[0]).format('M');
            this.trx.day_start = moment(value[0]).format('D');
            this.trx.year_end = moment(value[1]).format('YYYY');
            this.trx.month_end = moment(value[1]).format('M');
            this.trx.day_end = moment(value[1]).format('D');
        },
        trx: {
            //Switch Date 'from' and 'to' accordingly
            handler() {
                if (!this.trx.year_start || !this.trx.month_start || !this.trx.day_start) return;

                if (this.trx.date_range_type === 'Rentang' && this.trx.year_start && this.trx.month_start && this.trx.day_start) this.trx.date_range_pos = 'to';

                if (!this.trx.year_end || !this.trx.month_end || !this.trx.day_end) return;

                const date_from = moment(`${this.trx.year_start}-${this.trx.month_start}-${this.trx.day_start}`, 'YYYY-M-D');
                const date_to = moment(`${this.trx.year_end}-${this.trx.month_end}-${this.trx.day_end}`, 'YYYY-M-D');

                if (moment(date_from, 'YYYY-M-D').isAfter(moment(date_to, 'YYYY-M-D'), 'd')) {
                    const year_start = this.trx.year_end;
                    const month_start = this.trx.month_end;
                    const day_start = this.trx.day_end;
                    const year_end = this.trx.year_start;
                    const month_end = this.trx.month_start;
                    const day_end = this.trx.day_start;

                    this.trx.year_start = year_start;
                    this.trx.month_start = month_start;
                    this.trx.day_start = day_start;
                    this.trx.year_end = year_end;
                    this.trx.month_end = month_end;
                    this.trx.day_end = day_end;
                }
            },
            deep: true
        }
    },
    methods: {
        //Outlet
        getOutlet() {
            try {
                this.outlets = [
                    {
                        XID: 1,
                        outlatName: 'Outlet Pertama',
                        outlatAddress: 'Tengah Jalan Raya',
                        tanggal_terdaftar: '2024-11-01',
                        terminal: [
                            {
                                XID: 1,
                                TerminalID: 'A02',
                                type_terminal: 'D',
                                user: {
                                    xid: 1,
                                    kd_user: 'ABC2123',
                                    status: 1
                                }
                            },
                            {
                                XID: 2,
                                TerminalID: 'A03',
                                type_terminal: 'D',
                                user: {
                                    xid: 2,
                                    kd_user: 'ABC3123',
                                    status: 1
                                }
                            },
                            {
                                XID: 3,
                                TerminalID: 'A04',
                                type_terminal: 'D',
                                user: {
                                    xid: 3,
                                    kd_user: 'ABC4123',
                                    status: 2
                                }
                            }
                        ]
                    },
                    {
                        XID: 2,
                        outlatName: 'Outlet Kedua',
                        outlatAddress: 'Tengah Jalan Raya',
                        tanggal_terdaftar: '2024-10-31',
                        terminal: [
                            {
                                XID: 1,
                                TerminalID: 'A02',
                                type_terminal: 'D',
                                user: {
                                    xid: 1,
                                    kd_user: 'ABC2123',
                                    status: 1
                                }
                            },
                            {
                                XID: 2,
                                TerminalID: 'A03',
                                type_terminal: 'D',
                                user: {
                                    xid: 2,
                                    kd_user: 'ABC3123',
                                    status: 1
                                }
                            },
                            {
                                XID: 3,
                                TerminalID: 'A04',
                                type_terminal: 'D',
                                user: {
                                    xid: 3,
                                    kd_user: 'ABC4123',
                                    status: 2
                                }
                            }
                        ]
                    },
                    {
                        XID: 3,
                        outlatName: 'Outlet Ketiga',
                        outlatAddress: 'Tengah Jalan Raya',
                        tanggal_terdaftar: '2024-10-30',
                        terminal: [
                            {
                                XID: 1,
                                TerminalID: 'A02',
                                type_terminal: 'D',
                                user: {
                                    xid: 1,
                                    kd_user: 'ABC2123',
                                    status: 1
                                }
                            },
                            {
                                XID: 2,
                                TerminalID: 'A03',
                                type_terminal: 'D',
                                user: {
                                    xid: 2,
                                    kd_user: 'ABC3123',
                                    status: 1
                                }
                            },
                            {
                                XID: 3,
                                TerminalID: 'A04',
                                type_terminal: 'D',
                                user: {
                                    xid: 3,
                                    kd_user: 'ABC4123',
                                    status: 1
                                }
                            }
                        ]
                    }
                ];
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? error,
                    life: 10000
                });
            }
        },
        getUnregisterdTerminal(outlet) {
            return outlet.terminal.reduce((count, terminal) => {
                return count + (terminal.user.status === 2 ? 1 : 0);
            }, 0);
        },
        confirmReset(user) {
            this.$confirm.require({
                message: `Apakah anda yakin untuk mengganti perangkat untuk user [${user}] ?`,
                header: 'Ganti Perangkat',
                icon: 'pi pi-exclamation-triangle',
                acceptProps: {
                    label: 'Ganti'
                },
                rejectProps: {
                    label: 'Tutup',
                    severity: 'secondary',
                    outlined: true
                },
                accept: () => {
                    this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Perangkat berhasil diganti, silahkan login menggunakan perangkat baru', life: 3000 });
                }
            });
        },
        confirmDelete() {
            this.$confirm.require({
                message: 'Apakah anda yakin untuk menghapus user ini ?',
                header: 'Hapus User',
                icon: 'pi pi-exclamation-triangle',
                acceptProps: {
                    label: 'Hapus'
                },
                rejectProps: {
                    label: 'Tutup',
                    severity: 'secondary',
                    outlined: true
                },
                accept: () => {
                    this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Perangkat berhasil dihapus', life: 3000 });
                }
            });
        },

        //Transactions
        emptySpecifiedDate() {
            this.trx.date_range_pos = 'from';

            this.trx.year_start = null;
            this.trx.month_start = null;
            this.trx.day_start = null;
            this.trx.year_end = null;
            this.trx.month_end = null;
            this.trx.day_end = null;
        },
        generateCalendar() {
            const current_year = this.trx.year_start;

            for (let i = 2023; i <= this.moment().year(); i++) {
                if (i < this.moment().year() - 5) continue; //Stop loop at 5'th Year

                this.trx.years.push(i);
            }

            const monthsData = [
                { name: 'Januari', index: 1, days: 31, startDay: new Date(current_year, 0, 1).getDay() },
                { name: 'Februari', index: 2, days: 29, startDay: new Date(current_year, 1, 1).getDay() },
                { name: 'Maret', index: 3, days: 31, startDay: new Date(current_year, 2, 1).getDay() },
                { name: 'April', index: 4, days: 30, startDay: new Date(current_year, 3, 1).getDay() },
                { name: 'Mei', index: 5, days: 31, startDay: new Date(current_year, 4, 1).getDay() },
                { name: 'Juni', index: 6, days: 30, startDay: new Date(current_year, 5, 1).getDay() },
                { name: 'Juli', index: 7, days: 31, startDay: new Date(current_year, 6, 1).getDay() },
                { name: 'Agustus', index: 8, days: 31, startDay: new Date(current_year, 7, 1).getDay() },
                { name: 'September', index: 9, days: 30, startDay: new Date(current_year, 8, 1).getDay() },
                { name: 'Oktober', index: 10, days: 31, startDay: new Date(current_year, 9, 1).getDay() },
                { name: 'November', index: 11, days: 30, startDay: new Date(current_year, 10, 1).getDay() },
                { name: 'Desember', index: 12, days: 31, startDay: new Date(current_year, 11, 1).getDay() }
            ];

            // Loop through each month and generate the grid structure
            this.trx.months = monthsData.map((month) => {
                const totalDays = month.days;
                const totalWeeks = Math.ceil(totalDays / 7);

                // If Sunday (0), set it to 6 to align with Monday as the start of the week
                const startDay = (month.startDay === 0 ? 7 : month.startDay) - 1;
                const remainingCells = (7 - ((totalDays + startDay) % 7)) % 7;

                // Random start and finish for illumination
                const randomStart = Math.floor(Math.random() * totalDays) + 1;
                const randomFinish = Math.floor(Math.random() * totalDays) + 1;

                return {
                    ...month,
                    startDay,
                    totalWeeks,
                    remainingCells,
                    randomStart,
                    randomFinish
                };
            });
        },
        getTrxDates() {
            this.trx.dates = [];
            const month = this.trx.month_start ?? moment().month();
            const year = this.trx.year_start ?? moment().year();

            const startDate = moment(`${year}-${month}`, 'YYYY-M').startOf('month');
            const endDate = moment(`${year}-${month}`, 'YYYY-M').endOf('month');

            for (let day = startDate.clone(); day.isSameOrBefore(endDate); day.add(1, 'day')) {
                this.trx.dates.push({ date: day.format('YYYY-MM-DD') });
            }
        },
        getTransations() {
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
    <Toast />
    <ConfirmDialog></ConfirmDialog>
    <Fluid class="layout-menu bg-white dark:bg-zinc-900 h-svh">
        <div
            class="h-full w-full fixed"
            style="
                /* background: rgb(0, 0, 0);
                background: linear-gradient(
                    149deg,
                    rgba(0, 0, 0, 0.9473039215686274) 0%,
                    rgba(84, 15, 5, 0.8660714285714286) 48%,
                    rgba(137, 32, 18, 0.8576680672268908) 66%,
                    rgba(166, 41, 25, 0.8548669467787114) 86%,
                    rgba(201, 34, 13, 0.7204131652661064) 100%
                );
                /* clip-path: ellipse(150% 87% at 93% 13%); */
                z-index: -1; */
            "
        ></div>
        <div id="home" class="landing-wrapper overflow-hidden">
            <Toast />
            <div class="py-2 px-2 mx-12 lg:mx-20 lg:px-20 flex items-center relative lg:static">
                <a class="flex flex-row justify-center ml-20" href="/">
                    <!-- <img v-if="isDarkTheme" src="@/assets/dashboard-light.png" alt="" class="w-[75%] lg:w-[45%]" />
                    <img v-else src="@/assets/dashboard-dark.png" alt="" class="w-[75%] lg:w-[45%]" /> -->
                    <img :src="isDarkTheme ? DashboardLogoLight : DashboardLogoDark" alt="" class="w-[75%] lg:w-[45%]" />
                </a>
                <div class="flex border-t lg:border-t-0 border-surface py-4 lg:py-0 mt-4 lg:mt-0 gap-3">
                    <button type="button" class="flex items-center justify-center border rounded-full w-20 h-11 hover:border-slate-500 hover:dark:text-slate-200 group" @click="toggleDarkMode">
                        <i :class="['pi', { 'pi-moon': !isDarkTheme, 'pi-sun': isDarkTheme }, 'group-hover:text-slate-500 group-hover:dark:text-slate-200']"></i>
                    </button>
                    <Button label="Logout" severity="secondary" rounded class="w-24"></Button>
                </div>
            </div>

            <div class="flex flex-col justify-between mx-20 gap-2">
                <h1 class="lg:text-4xl font-bold text-gray-600 dark:text-slate-200 leading-tight"><span class="font-light block text-3xl">Selamat Datang,</span>{{ merchant_name }}</h1>
                <span class="text-base rounded text-slate-50 text-center uppercase p-1 bg-green-500 w-20">ADMIN</span>
            </div>

            <!-- <Menubar class="mx-20 lg:mx-20 mt-5 lg:mt-10">
                <template #start>
                    <h1 class="text-sm lg:text-xl font-medium text-gray-600 dark:text-slate-200 leading-tight">Saldo Bisnis</h1>
                </template>
                <template #end>
                    <div class="flex flex-row">
                        <h1 v-if="shown && skeleton == false" class="text-xl font-medium text-gray-600 dark:text-slate-200 pt-2 mr-2">{{ getAmountFormatting(amount) }}</h1>
                        <Skeleton v-else-if="skeleton" width="9rem" class="mt-3 mr-2"></Skeleton>
                        <Button :icon="skeleton && shown == false ? 'pi pi-refresh pi-spin' : 'pi pi-eye'" rounded text :severity="shown ? 'success' : 'secondary'" @click="getBalance()"></Button>
                    </div>
                </template>
            </Menubar> -->

            <div class="flex flex-row gap-5 mx-10 mb-20">
                <div class="card w-full">
                    <Tabs value="outlet">
                        <TabList>
                            <Tab value="outlet">Outlet</Tab>
                            <Tab value="transaksi">Transaksi</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel value="outlet">
                                <div class="flex flex-row gap-2">
                                    <div :class="['flex flex-col pt-5 gap-5', outlet_show_terminal_list ? 'basis-5/6' : 'w-full']">
                                        <!-- OUTLET LIST -->
                                        <div v-for="outlet in outlets" :key="outlet.XID" :class="[outlet_show_terminal_list && active_outlet.XID !== outlet.XID ? 'hidden' : 'block']">
                                            <div class="'flex flex-col gap-1 justify-between border border-slate-300 p-5 shadow-sm rounded-xl w-full hover:border-2 hover:border-red-300 hover:dark:border-red-400 hover:cursor-pointer'">
                                                <div class="flex flex-row justify-between">
                                                    <!-- OUTLET INFO -->
                                                    <div class="flex flex-row gap-1">
                                                        <span class="font-bold min-w-40 max-w-80 uppercase truncate">{{ outlet.outlatName }}</span>
                                                        <Divider layout="vertical" />
                                                        <div class="flex flex-row gap-2 text-">
                                                            <span class="pi pi-calendar mt-1 text-slate-500 dark:text-slate-300" />
                                                            <span class="text-slate-500 dark:text-slate-200">{{ outlet.tanggal_terdaftar }}</span>
                                                        </div>
                                                        <Divider layout="vertical" />
                                                        <span class="min-w-40 max-w-80 uppercase truncate">{{ outlet.outlatAddress }}</span>
                                                    </div>
                                                    <!-- OUTLET ACTION -->
                                                    <div class="flex flex-wrap gap-2">
                                                        <div
                                                            v-if="getUnregisterdTerminal(outlet)"
                                                            class="flex items-center justify-center -mt-1 -mb-2 w-10 h-10 border border-orange-500 rounded-full text-sm animate-pulse"
                                                            v-tooltip.top="'Menunggu Aktivasi'"
                                                        >
                                                            {{ getUnregisterdTerminal(outlet) }}
                                                        </div>
                                                        <div class="-mt-1 -mb-2" v-tooltip.top="'Tambah Perangkat'">
                                                            <Button
                                                                icon="pi pi-plus"
                                                                severity="success"
                                                                rounded
                                                                size="small"
                                                                outlined
                                                                @click="
                                                                    outlet_show_add_dialog = true;
                                                                    active_outlet = outlet;
                                                                "
                                                            />
                                                        </div>
                                                        <div
                                                            v-if="!outlet_show_terminal_list"
                                                            class="-mt-1 -mb-2"
                                                            v-tooltip.top="'Daftar User/Perangkat'"
                                                            @click="
                                                                outlet_show_terminal_list = true;
                                                                active_outlet = outlet;
                                                            "
                                                        >
                                                            <Button icon="pi pi-list" severity="info" rounded size="small" outlined />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <Divider v-if="outlet_show_terminal_list" layout="vertical" />
                                    <div v-if="outlet_show_terminal_list" class="flex flex-col pt-5 gap-3 basis-2/6">
                                        <!--EXIT TERMINAL LIST -->
                                        <Button icon="pi pi-times" severity="contrast" outlined rounded v-tooltip.top="'Tutup Daftar'" @click="outlet_show_terminal_list = false" />
                                        <!-- TERMINAL LIST -->
                                        <div
                                            v-for="terminal in active_outlet.terminal"
                                            :key="terminal.TerminalID"
                                            :class="[
                                                'flex ',
                                                'flex-row ',
                                                'justify-between ',
                                                'border ',
                                                terminal.user.status === 1 ? 'border-slate-300 ' : 'border-orange-500',
                                                'p-5 ',
                                                'shadow-sm ',
                                                'rounded-2xl ',
                                                'w-full ',
                                                'hover:border-2 ',
                                                'hover:border-red-300 ',
                                                'hover:dark:border-red-400'
                                            ]"
                                        >
                                            <!-- TERMINAL NAME -->
                                            <div class="flex flex-row gap-1">
                                                <div class="flex flex-row gap-2 text-">
                                                    <span class="text-slate-700 dark:text-slate-200 font-bold mt-1" v-tooltip.top="'Username'">{{ terminal.user.kd_user }}</span>
                                                </div>
                                                <Divider layout="vertical" />
                                                <Tag severity="secondary" :value="terminal.TerminalID" v-tooltip.top="'ID Terminal'" />
                                            </div>
                                            <!-- TERMINAL ACTION -->
                                            <div class="flex flex-wrap gap-2">
                                                <div v-if="terminal.user.status === 2" class="-mt-1 -mb-2 animate-pulse" v-tooltip.top="'Menunggu Aktivasi'">
                                                    <Button icon="pi pi-info" severity="warn" size="small" outlined rounded />
                                                </div>
                                                <div v-if="terminal.user.status === 1" class="-mt-1 -mb-2" v-tooltip.top="'Ganti Perangkat'">
                                                    <Button icon="pi pi-clone" severity="info" size="small" outlined rounded @click="confirmReset(terminal.user.kd_user)" />
                                                </div>
                                                <div v-if="terminal.user.status === 1" class="-mt-1 -mb-2" v-tooltip.top="'Hapus User'">
                                                    <Button icon="pi pi-user-minus" severity="danger" size="small" outlined rounded @click="confirmDelete()" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <!-- TRANSACTION PANEL -->
                            <TabPanel value="transaksi">
                                <div :class="['flex flex-row gap-0 my-5', trx.date_range_type !== 'Rentang' ? 'ml-0' : '']">
                                    <!-- RANGE SELECTION -->
                                    <SelectButton v-model="trx.date_range_type" :options="['Hari ini', '1 Minggu', '1 Bulan', 'Rentang']" aria-labelledby="basic" class="shadow-md" />
                                    <Divider v-if="trx.date_range_type === 'Rentang'" layout="vertical" />
                                    <DatePicker
                                        v-if="trx.date_range_type === 'Rentang'"
                                        v-model="trx.date_compact"
                                        class="w-72"
                                        selectionMode="range"
                                        :manualInput="false"
                                        showIcon
                                        fluid
                                        iconDisplay="input"
                                        placeholder="DD/MM/YYYY,  DD/MM/YYYY"
                                        v-tooltip.top="'Pilih Rentang Tanggal'"
                                    >
                                        <template #inputicon="slotProps">
                                            <i class="pi pi-calendar" @click="slotProps.clickCallback" />
                                        </template>
                                    </DatePicker>
                                    <Divider v-if="isDateSpecified && trx.date_range_type === 'Rentang'" layout="vertical" />
                                    <!-- CLOSE SPECIFIED DATE -->
                                    <Button v-if="isDateSpecified && trx.date_range_type === 'Rentang'" icon="pi pi-times" severity="contrast" rounded outlined @click="emptySpecifiedDate()" v-tooltip.top="'Tutup'" />
                                </div>
                                <div class="hidden">
                                    <!-- CAROUSEL -->
                                    <Carousel
                                        v-if="trx.date_range_type === 'Rentang' && !isDateSpecified"
                                        :value="trx.dates"
                                        :numVisible="7"
                                        :numScroll="7"
                                        :circular="true"
                                        v-model:page="trx.carousel_position"
                                        :showIndicators="false"
                                        :showNavigators="true"
                                        :responsiveOptions="trx.responsiveOptions"
                                    >
                                        <template #header>
                                            <!-- DATE RANGE SELECTION -->
                                            <div class="flex flex-row gap-3 mb-5">
                                                <!-- DATE START -->
                                                <div
                                                    class="rounded-xl p-2 border text-slate-500 dark:text-slate-300 text-base 2xl:text-xl text-center hover:border-slate-900 dark:hover:border-slate-100 hover:font-bold shadow-md hover:cursor-pointer"
                                                    :class="[trx.date_range_pos == 'from' ? 'border-2 border-blue-300 dark:border-sky-500' : 'border-slate-300 dark:border-slate-500']"
                                                    v-tooltip.top="'Tanggal Awal'"
                                                    @click="trx.date_range_pos = 'from'"
                                                >
                                                    <div class="flex flex-row">
                                                        <icon class="pi pi-calendar-plus flex items-center justify-center ml-2"></icon>
                                                        <Divider layout="vertical" />
                                                        <div class="text-center font-bold mr-3">
                                                            {{ trx.year_start ? moment(trx.year_start, 'YYYY').format('YYYY') : '??' }} / {{ trx.month_start ? moment(trx.month_start, 'M').format('MM') : '??' }} /
                                                            {{ trx.day_start ? moment(trx.day_start, 'D').format('DD') : '??' }}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span class="pi pi-arrow-right flex items-center justify-center"></span>
                                                <!-- DATE END -->
                                                <div
                                                    class="rounded-xl p-2 border text-slate-500 dark:text-slate-300 text-base 2xl:text-xl text-center hover:border-slate-900 dark:hover:border-slate-100 hover:font-bold shadow-md hover:cursor-pointer"
                                                    :class="[trx.date_range_pos == 'to' ? 'border-2 border-blue-300 dark:border-sky-500' : 'border-slate-300 dark:border-slate-500']"
                                                    v-tooltip.top="'Tanggal Akhir'"
                                                    @click="trx.date_range_pos = 'to'"
                                                >
                                                    <div class="flex flex-row">
                                                        <icon class="pi pi-calendar-plus flex items-center justify-center ml-2"></icon>
                                                        <Divider layout="vertical" />
                                                        <div class="text-center font-bold mr-3">
                                                            {{ trx.year_end ? (moment(trx.year_end, 'YYYY').isValid() ? moment(trx.year_end, 'YYYY').format('YYYY') : '??') : '??' }} /
                                                            {{ trx.month_end ? (moment(trx.month_end, 'M').isValid() ? moment(trx.month_end, 'M').format('MM') : '??') : '??' }} /
                                                            {{ trx.day_end ? (moment(trx.day_end, 'D').isValid() ? moment(trx.day_end, 'D').format('DD') : '??') : '??' }}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- YEARS SELECTION -->
                                            <div v-if="trx.date_range_type === 'Rentang'" class="flex flex-row gap-3">
                                                <div v-for="year in trx.years" :key="year">
                                                    <div
                                                        class="rounded-xl border border-slate-300 dark:border-slate-500 py-2 w-32 text-slate-500 dark:text-slate-300 text-base 2xl:text-xl text-center hover:border-slate-900 dark:hover:border-slate-100 hover:font-bold shadow-md hover:cursor-pointer"
                                                        :class="trx.year_start === year || trx.year_end === year ? 'bg-slate-900 dark:bg-white text-slate-100 dark:text-slate-900' : ''"
                                                        @click="
                                                            if (trx.date_range_pos == 'from') trx.year_start = year;
                                                            else if (trx.date_range_pos == 'to') trx.year_end = year;
                                                            getTrxDates();
                                                        "
                                                    >
                                                        {{ year }}
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- MONTHS SELECTION -->
                                            <div v-if="trx.date_range_type === 'Rentang'" class="flex flex-row gap-3 my-5">
                                                <div
                                                    v-for="month in trx.months"
                                                    :key="month.index"
                                                    class="rounded-xl border border-slate-300 dark:border-slate-500 py-2 w-32 text-slate-500 dark:text-slate-300 text-base 2xl:text-xl text-center hover:border-slate-900 dark:hover:border-slate-100 hover:font-bold shadow-md hover:cursor-pointer"
                                                    :class="trx.month_start === month.index || trx.month_end === month.index ? 'bg-slate-900 dark:bg-white text-slate-100 dark:text-slate-900' : ''"
                                                    @click="
                                                        if (trx.date_range_pos == 'from') trx.month_start = month.index;
                                                        else if (trx.date_range_pos == 'to') trx.month_end = month.index;
                                                        getTrxDates();
                                                    "
                                                >
                                                    {{ month.name }}
                                                </div>
                                            </div>
                                        </template>
                                        <template #item="slotProps">
                                            <!-- DAY SELECTION -->
                                            <div
                                                v-if="trx.date_range_type === 'Rentang' && !isDateSpecified"
                                                :class="[
                                                    'flex',
                                                    'flex-col',
                                                    'p-5',
                                                    'mx-3',
                                                    'shadow-md',
                                                    'rounded-xl',
                                                    'border',
                                                    'group',
                                                    'border-slate-500',
                                                    'hover:cursor-pointer',
                                                    'hover:border-2',
                                                    moment(slotProps.data.date, 'YYYY-MM-DD').isSame(moment(), 'd') ? 'border-2 border-sky-300 dark:border-sky-500 ' : ''
                                                ]"
                                                @click="trx.day_start ? (trx.day_end = +moment(slotProps.data.date, 'YYYY-MM-DD').format('D')) : (trx.day_start = +moment(slotProps.data.date, 'YYYY-MM-DD').format('D'))"
                                            >
                                                <!-- DAY DIGIT -->
                                                <span
                                                    :class="[
                                                        'font-bold',
                                                        'text-center',
                                                        'text-6xl',
                                                        'p-2',
                                                        'group-hover:text-8xl',
                                                        trx.day_start === +moment(slotProps.data.date).format('D') || trx.day_end === +moment(slotProps.data.date).format('D')
                                                            ? 'text-slate-700 dark:text-slate-100 group-hover:text-slate-700 group-hover:dark:text-slate-100'
                                                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 group-hover:dark:text-slate-300'
                                                    ]"
                                                    >{{ moment(slotProps.data.date, 'YYYY-MM-DD').format('DD') }}</span
                                                >
                                                <Divider />
                                                <!-- MONTH + YEAR -->
                                                <span
                                                    :class="[
                                                        'text-slate-400',
                                                        'dark:text-slate-100',
                                                        'font-bold',
                                                        'text-3xl',
                                                        'text-center',
                                                        trx.day_start === +moment(slotProps.data.date).format('D') || trx.day_end === +moment(slotProps.data.date).format('D')
                                                            ? 'text-slate-200 dark:text-slate-700'
                                                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 group-hover:dark:text-slate-300'
                                                    ]"
                                                    >{{ moment(slotProps.data.date, 'YYYY-MM-DD').format('ddd') }}</span
                                                >
                                            </div>
                                        </template>
                                    </Carousel>
                                </div>
                                <div v-if="isDateSpecified" class="flex flex-row gap-7 mt-8">
                                    <!-- LEFT START DATE CARD -->
                                    <div class="flex flex-col gap-3">
                                        <div class="flex flex-col shadow-md rounded-xl p-5 border border-slate-500 hover:border-2 hover:border-slate-500 hover:cursor-pointer hover:bg-slate-500 duration-900 group h-fit">
                                            <div
                                                @click="
                                                    trx.day_start = null;
                                                    trx.date_range_pos = 'from';
                                                "
                                                :class="[
                                                    'absolute',
                                                    'hidden',
                                                    'pi pi-times',
                                                    'opacity-65',
                                                    'items-center',
                                                    'justify-center',
                                                    'transition',
                                                    'duration-700',
                                                    'ease-in-out',
                                                    'group-hover:flex',
                                                    'group-hover:ml-6',
                                                    'group-hover:mt-11',
                                                    'group-hover:text-4xl',
                                                    'group-hover:size-20',
                                                    'group-hover:rounded-full',
                                                    'group-hover:text-white',
                                                    'group-hover:bg-slate-600'
                                                ]"
                                            />
                                            <div class="group-hover:text-slate-400 font-bold text-center text-8xl px-2 py-3 text-slate-700 dark:text-slate-100">
                                                {{ moment(`${trx.year_start}-${trx.month_start}-${trx.day_start}`, 'YYYY-M-D').isValid() ? moment(`${trx.year_start}-${trx.month_start}-${trx.day_start}`, 'YYYY-M-D').format('DD') : '??' }}
                                            </div>
                                            <Divider />
                                            <span class="group-hover:text-slate-400 text-slate-500 font-bold text-lg text-center">{{
                                                moment(`${trx.year_start}-${trx.month_start}-${trx.day_start}`, 'YYYY-M-D').isValid() ? moment(`${trx.year_start}-${trx.month_start}-${trx.day_start}`, 'YYYY-M-D').format('MMM YYYY') : '??'
                                            }}</span>
                                        </div>
                                        <div v-if="trx.date_range_type !== 'Hari ini'" class="pi pi-arrow-down flex items-center justify-center text-2xl"></div>
                                        <!-- LEFT END DATE CARD -->
                                        <div
                                            v-if="trx.date_range_type !== 'Hari ini'"
                                            class="flex flex-col shadow-md rounded-xl p-5 border border-slate-500 hover:border-2 hover:border-slate-500 hover:cursor-pointer hover:bg-slate-500 duration-900 group h-fit"
                                        >
                                            <div
                                                @click="
                                                    trx.day_end = null;
                                                    trx.date_range_pos = 'to';
                                                "
                                                :class="[
                                                    'absolute',
                                                    'hidden',
                                                    'pi pi-times',
                                                    'opacity-65',
                                                    'items-center',
                                                    'justify-center',
                                                    'transition',
                                                    'duration-700',
                                                    'ease-in-out',
                                                    'group-hover:flex',
                                                    'group-hover:ml-6',
                                                    'group-hover:mt-11',
                                                    'group-hover:text-4xl',
                                                    'group-hover:size-20',
                                                    'group-hover:rounded-full',
                                                    'group-hover:text-white',
                                                    'group-hover:bg-slate-600'
                                                ]"
                                            />
                                            <div class="group-hover:text-slate-400 font-bold text-center text-8xl px-2 py-3 text-slate-700 dark:text-slate-100">
                                                {{ moment(`${trx.year_end}-${trx.month_end}-${trx.day_end}`, 'YYYY-M-D').isValid() ? moment(`${trx.year_end}-${trx.month_end}-${trx.day_end}`, 'YYYY-M-D').format('DD') : '??' }}
                                            </div>
                                            <Divider />
                                            <span class="group-hover:text-slate-400 text-slate-500 font-bold text-lg text-center">{{
                                                moment(`${trx.year_end}-${trx.month_end}-${trx.day_end}`, 'YYYY-M-D').isValid() ? moment(`${trx.year_end}-${trx.month_end}-${trx.day_end}`, 'YYYY-M-D').format('MMM YYYY') : '??'
                                            }}</span>
                                        </div>
                                    </div>
                                    <!-- TRANSACTION HISTORY LIST -->
                                    <div v-if="trx.getting_hist" class="flex flex-col gap-4 w-full">
                                        <Skeleton height="1.3rem" />
                                        <Skeleton height="1.3rem" />
                                        <Skeleton height="1.3rem" />
                                        <div class="flex flex-row gap-3">
                                            <Skeleton height="1rem" width="1rem" />
                                            <Skeleton height="1rem" width="1rem" />
                                            <Skeleton height="1rem" width="1rem" />
                                        </div>
                                        <div class="flex flex-row gap-3">
                                            <Skeleton height="1rem" width="1rem" />
                                            <Skeleton height="1rem" width="1rem" />
                                            <Skeleton height="1rem" width="1rem" />
                                        </div>
                                    </div>
                                    <div v-else class="flex flex-col gap-3 w-full">
                                        <div class="flex flex-row gap-5 justify-between shadow-sm rounded-xl border border-slate-300 dark:border-slate-500 w-full p-3">
                                            <div class="pi pi-arrow-down-right text-green-500 mt-1 ml-2"></div>
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Issuer'">9360091538325669206</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Customer'">QRISAJ</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'RRN'">012442983091</span>
                                            <Divider layout="vertical" />
                                            <span class="text-green-500 dark:text-green-400" v-tooltip.top="'Total'">+Rp. 10.000.000</span>
                                            <Divider layout="vertical" />
                                            <div class="flex flex-row gap-2 text-">
                                                <span class="pi pi-clock mt-1 text-slate-500 dark:text-slate-300" />
                                                <span class="text-slate-500 dark:text-slate-200">2024-10-22 04:00:00</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-row gap-5 justify-between shadow-sm rounded-xl border border-slate-300 dark:border-slate-500 w-full p-3">
                                            <div class="pi pi-arrow-down-right text-green-500 mt-1 ml-2"></div>
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Issuer'">9360091538325669206</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Customer'">QRISAJ</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'RRN'">012442983091</span>
                                            <Divider layout="vertical" />
                                            <span class="text-green-500 dark:text-green-400" v-tooltip.top="'Total'">+Rp. 10.000.000</span>
                                            <Divider layout="vertical" />
                                            <div class="flex flex-row gap-2 text-">
                                                <span class="pi pi-clock mt-1 text-slate-500 dark:text-slate-300" />
                                                <span class="text-slate-500 dark:text-slate-200">2024-10-22 04:00:00</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-row gap-5 justify-between shadow-sm rounded-xl border border-slate-300 dark:border-slate-500 w-full p-3">
                                            <div class="pi pi-arrow-down-right text-green-500 mt-1 ml-2"></div>
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Issuer'">9360091538325669206</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Customer'">QRISAJ</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'RRN'">012442983091</span>
                                            <Divider layout="vertical" />
                                            <span class="text-green-500 dark:text-green-400" v-tooltip.top="'Total'">+Rp. 10.000.000</span>
                                            <Divider layout="vertical" />
                                            <div class="flex flex-row gap-2 text-">
                                                <span class="pi pi-clock mt-1 text-slate-500 dark:text-slate-300" />
                                                <span class="text-slate-500 dark:text-slate-200">2024-10-22 04:00:00</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-row gap-5 justify-between shadow-sm rounded-xl border border-slate-300 dark:border-slate-500 w-full p-3">
                                            <div class="pi pi-arrow-down-right text-green-500 mt-1 ml-2"></div>
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Issuer'">9360091538325669206</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Customer'">QRISAJ</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'RRN'">012442983091</span>
                                            <Divider layout="vertical" />
                                            <span class="text-green-500 dark:text-green-400" v-tooltip.top="'Total'">+Rp. 10.000.000</span>
                                            <Divider layout="vertical" />
                                            <div class="flex flex-row gap-2 text-">
                                                <span class="pi pi-clock mt-1 text-slate-500 dark:text-slate-300" />
                                                <span class="text-slate-500 dark:text-slate-200">2024-10-22 04:00:00</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-row gap-5 justify-between shadow-sm rounded-xl border border-slate-300 dark:border-slate-500 w-full p-3">
                                            <div class="pi pi-arrow-down-right text-green-500 mt-1 ml-2"></div>
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Issuer'">9360091538325669206</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'Customer'">QRISAJ</span>
                                            <Divider layout="vertical" />
                                            <span class="text-slate-500 dark:text-slate-200" v-tooltip.top="'RRN'">012442983091</span>
                                            <Divider layout="vertical" />
                                            <span class="text-green-500 dark:text-green-400" v-tooltip.top="'Total'">+Rp. 10.000.000</span>
                                            <Divider layout="vertical" />
                                            <div class="flex flex-row gap-2 text-">
                                                <span class="pi pi-clock mt-1 text-slate-500 dark:text-slate-300" />
                                                <span class="text-slate-500 dark:text-slate-200">2024-10-22 04:00:00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                    <Dialog v-model:visible="outlet_show_add_dialog" modal header="Penambahan Perangkat" :style="{ width: '50rem' }">
                        <div class="card flex justify-center pt-2">
                            <Stepper value="1" class="basis-[50rem]">
                                <StepList>
                                    <Step value="1">Ketentuan</Step>
                                    <Step value="2">Dikirim</Step>
                                </StepList>
                                <StepPanels>
                                    <StepPanel v-slot="{ activateCallback }" value="1">
                                        <div class="flex flex-col gap-3 h-fit">
                                            <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 p-5">
                                                Anda akan melakukan penambahan perangkat pada Outlet <span class="font-bold">{{ active_outlet.outlatName }}</span>
                                                <br />
                                                <br />
                                                Adapun Ketentuan yang <span class="font-bold">perlu diperhatikan</span> adalah sebagai berikut : .
                                                <li>Akses username untuk perangkat baru akan dikirimkan pada email yang telah terdaftar</li>
                                                <li>Akses username yang sudah aktif, <span class="font-bold">hanya dapat</span> digunakan pada perangkat yg terdaftar</li>
                                                <li>QR dibuat per Perangkat yang bersifat Dinamis (Closed Amount)</li>
                                                <br />
                                                Jika telah menyetujui, silahkan menekan tombol <span class="font-bold">Tambah User</span>.
                                            </div>
                                        </div>
                                        <div class="flex pt-6 gap-3 justify-end">
                                            <Button label="Tambah User" icon="pi pi-arrow-right" iconPos="right" @click="activateCallback('2')" />
                                        </div>
                                    </StepPanel>
                                    <StepPanel v-slot="{ activateCallback }" value="2">
                                        <div class="flex flex-col h-48">
                                            <div class="border-2 border-dashed border-surface-200 dark:border-surface-700 rounded bg-surface-50 dark:bg-surface-950 p-5">
                                                Username telah dikirimkan pada email berikut:
                                                <br />
                                                <br />
                                                <div class="flex flex-wrap justify-center items-center font-bold text-lg">your.email@gmail.com</div>
                                                <br />
                                                Silahkan periksa email anda untuk melihat username yang telah dikirimkan. jika email tidak ditemukan, silahkan cek folder spam.
                                            </div>
                                        </div>
                                        <div class="flex pt-6 gap-3 justify-between">
                                            <Button label="Ketentuan" severity="secondary" icon="pi pi-arrow-left" @click="activateCallback('1')" />
                                            <Button label="Tutup" icon="pi pi-times" iconPos="right" @click="outlet_show_add_dialog = false" />
                                        </div>
                                    </StepPanel>
                                </StepPanels>
                            </Stepper>
                        </div>
                    </Dialog>
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
