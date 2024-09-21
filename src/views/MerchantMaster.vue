<script>
import axiosInstance from '@/services/AxiosInstance';
import { FilterMatchMode } from '@primevue/core/api';
import { useVuelidate } from '@vuelidate/core';
import axios from 'axios';
import moment from 'moment';
import { useToast } from 'primevue/usetoast';

export default {
    setup() {
        return {
            toast: useToast(),
            token: localStorage.getItem('qris-merchant-user-token'),
            session: JSON.parse(localStorage.getItem('qris-merchant-user-data')),
            v$: useVuelidate(),
            backend: import.meta.env.VITE_BASE_URL + '/api/bank'
        };
    },
    validations() {
        return {
            formData: {}
        };
    },
    data() {
        return {
            //States
            skeleton: false,
            pten_download_state: false,
            pten_merchants_ready: false, //True when Merchants ready for PTEN Process for generating zip to SFTP
            aktivasi_import_state: false,
            report_download_state: false,
            approving: false,

            //Merchants:
            merge_dialog: false,
            merge_radio: 'baru',
            merge_state: false,
            merchants: null,
            merchant: null,

            //Datatable
            dt: null,
            selected_outlet: [],
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            page: 0,
            first: 0,
            rows: 10,
            total: 0,
            approveDialog: false,
            approvalData: {
                xid: null,
                outlet: null,
                approval: null,
                rejectDesc: null
            },
            columnitems: [],
            expandedColumn: {},
            formData: {}
        };
    },
    mounted() {
        this.getOutlets();
        this.getMerchants();
    },
    methods: {
        async getOutlets() {
            this.skeleton = true;

            try {
                let result = await axiosInstance(this.token)
                    .get('/outlets', {
                        params: {
                            page: this.page,
                            search: this.filters.global.value,
                            offset: this.first,
                            limit: this.rows
                        }
                    })
                    .then((result) => result.data);

                this.columnitems = [];
                this.total = result.total;

                //Check if there are any merchants that ready for PTEN Process
                const pten_merchants_ready = result.data.filter((item) => item.state_approval === 'REQ_PTEN' && item.status === 'INACTIVE' && item.is_approved === 1).length;
                if (pten_merchants_ready > 0) this.pten_merchants_ready = true;

                result.data.forEach((el, inc) => {
                    this.columnitems.push({
                        //Main
                        xid: el.XID,
                        no: this.first + (inc + 1),
                        outlet: el.outlatName,
                        address: `${el.outlatAddress}, ${el.kota} (${el.kdPost})`,
                        kriteria_merchant: el.kriteria,
                        kriteria_merchant_det: el.merchant_criteria,
                        mcc: el.mcc,
                        tanggal_permohonan: el.tanggal_permohonan,

                        //Expanded
                        merchant: el.merchant,
                        tipe_usaha: el.tipe_usaha,
                        kategori: el.kategori,
                        nama_institusi: el.nama_institusi ?? '-',
                        pemda: el.pemda ?? '-',
                        dinas: el.dinas ?? '-',
                        no_ktp: el.ktp,
                        npwp: el.npwp,
                        no_hp: el.phonenum,
                        email: el.email,
                        legalitas_usaha: el.legalitas_usaha,
                        no_legalitas_usaha: el.no_legalitas_usaha,
                        no_rek: el.acc_no,
                        cs: el.customer_service,
                        ro: el.relationship_officer,
                        terminal: el.terminal,

                        //Extra
                        is_approved: el.is_approved,
                        state_approval: el.state_approval,
                        merchant_category: el.merchant_category
                    });
                });
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.skeleton = false;
        },
        async getMerchants() {
            try {
                let result = await axiosInstance(this.token)
                    .get('/merchants')
                    .then((result) => result.data.data);

                this.merchants = result;
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }
        },
        async merge() {
            this.merge_state = true;
            try {
                await axiosInstance(this.token).post('/merchants/merge', {
                    type: this.merge_radio,
                    merchant: this.merchant,
                    outlets: this.selected_outlet
                });

                this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Merge successful', life: 3000 });

                this.merge_state = false;
                this.merge_dialog = false;
                this.selected_outlet = [];
                this.getOutlets();
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });

                this.merge_state = false;
            }
        },
        async generateFile() {
            this.pten_download_state = true;

            try {
                await axios({
                    url: import.meta.env.VITE_BASE_URL + '/api/bank/merchants/generate/',
                    headers: {
                        'Content-Type': 'application/zip',
                        Authorization: 'Bearer ' + localStorage.getItem('qris-merchant-user-token')
                    },
                    method: 'GET',
                    responseType: 'blob'
                }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'QRIS_NMR_93600127_' + moment().format('YYMMDD') + '.zip';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                });
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.pten_download_state = false;
        },
        onFileSelect(event) {
            const file = event.files[0]; // Get the first (and only) selected file
            if (file) {
                const formData = new FormData();
                formData.append('file', file); // Append the file to the formData
                this.importFile(formData); // Call importFile method to upload the file
            }
        },
        async importFile(formData) {
            this.aktivasi_import_state = true;

            try {
                await axios({
                    url: import.meta.env.VITE_BASE_URL + '/api/bank/merchants/import',
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: 'Bearer ' + localStorage.getItem('qris-merchant-user-token')
                    },
                    method: 'POST',
                    responseType: 'json',
                    data: formData
                }).then((result) => result.data);
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.aktivasi_import_state = false;
        },
        async generateReport() {
            this.report_download_state = true;

            try {
                await axios({
                    url: import.meta.env.VITE_BASE_URL + '/api/bank/merchants/report/' + moment().format('YY-MM-DD'),
                    headers: {
                        'Content-Type': 'application/zip',
                        Authorization: 'Bearer ' + localStorage.getItem('qris-merchant-user-token')
                    },
                    method: 'GET',
                    responseType: 'blob'
                }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'QRIS_DAILY_ACQ-ISS_ON-OFF_' + moment().format('YYMMDD') + '.zip';
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                });
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.report_download_state = false;
        },
        confirmApproval(data, approval) {
            this.approveDialog = true;
            this.approvalData = {
                xid: data.xid,
                outlet: data.outlet,
                approval: approval
            };
        },
        async approve() {
            this.approving = true;

            try {
                let result = await axiosInstance(this.token)
                    .put('/outlet/approve', this.approvalData)
                    .then((result) => result.data);

                this.approvalData = {};
                this.approveDialog = false;

                this.toast.add({ severity: 'success', summary: 'Success', detail: 'Approval Adjusted', life: 3000 });

                let obj = this.columnitems.find((val) => val.xid == this.approvalData.xid);
                if (this.approvalData.approval) {
                    obj.state_approval = result.state_approval;
                } else {
                    const index = this.columnitems.findIndex((data) => data == obj);
                    this.columnitems.splice(index, 1);
                }

                this.getOutlets();
                this.getMerchants();
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.approving = false;
        },
        exportCSV() {
            this.$refs.dt.exportCSV();
        },
        openOutlet() {
            this.outletDialog = true;
        },
        filterPage() {
            this.search = this.filters.global.value;

            this.getOutlets();
        },
        changePage(event) {
            this.search = this.filters.global.value;
            this.page = +event.page;
            this.first = +event.first;
            this.rows = +event.rows;

            this.getOutlets();
        },
        unlistOutlet(xid) {
            this.selected_outlet = this.selected_outlet.filter((val) => val.xid !== xid);

            if (this.selected_outlet.length == 0) {
                this.selected_outlet = [];
                this.merge_dialog = false;
            }
        }
    }
};
</script>

<template>
    <Fluid>
        <div class="card">
            <Tabs value="outlets">
                <TabList>
                    <Tab value="outlets">Outlet</Tab>
                    <Tab value="merchants">Merchants</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel value="outlets">
                        <div v-if="skeleton" class="mt-5">
                            <div class="flex flex-row-reverse gap-3 mb-5 border p-5 rounded border-zinc-600">
                                <Skeleton width="5rem" height="1.65rem" />
                                <Skeleton width="5rem" height="1.65rem" />
                                <Skeleton width="5rem" height="1.65rem" />
                                <Skeleton width="5rem" height="1.65rem" />
                            </div>
                            <div class="flex flex-row-reverse gap-10 justify-between my-7">
                                <Skeleton width="12rem" height="1.65rem" />
                            </div>
                            <div class="flex flex-row gap-10 justify-between">
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                            </div>
                            <div class="flex flex-row gap-10 justify-between">
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                            </div>
                            <div class="flex flex-row gap-10 justify-between">
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                                <Skeleton width="20rem" class="mb-5"></Skeleton>
                            </div>
                            <div class="flex flex-row gap-5 mt-5">
                                <Skeleton width="1rem" class="mb-5"></Skeleton>
                                <Skeleton width="1rem" class="mb-5"></Skeleton>
                                <Skeleton width="1rem" class="mb-5"></Skeleton>
                            </div>
                        </div>
                        <div v-else>
                            <Toolbar class="mt-5 mb-5">
                                <template #start>
                                    <div class="flex flex-row gap-3">
                                        <Button label="CSV" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                                        <Button v-if="selected_outlet.length > 0" label="Merge" icon="pi pi-sitemap" severity="contrast" v-tooltip.top="'Merge Outlet sebagai Merchant'" @click="merge_dialog = true" />
                                    </div>
                                </template>
                                <template #end>
                                    <div class="flex flex-row gap-3">
                                        <Button v-if="pten_merchants_ready" label="PTEN" :icon="pten_download_state ? 'pi pi-refresh pi-spin' : 'pi pi-file-excel'" severity="success" v-tooltip.top="'Generate File'" @click="generateFile()" />
                                        <FileUpload
                                            ref="file"
                                            chooseLabel="Aktivasi"
                                            accept=".xlsx"
                                            mode="basic"
                                            @select="onFileSelect"
                                            :icon="aktivasi_import_state ? 'pi pi-refresh pi-spin' : 'pi pi-user'"
                                            :customUpload="true"
                                            :auto="true"
                                            :multiple="false"
                                            :showUploadButton="false"
                                            :showCancelButton="false"
                                            v-tooltip.top="'Aktivasi Outlet'"
                                        />
                                        <Button label="Report" :icon="report_download_state ? 'pi pi-refresh pi-spin' : 'pi pi-database'" severity="warn" v-tooltip.top="'Report Merchants'" @click="generateReport()" />
                                    </div>
                                </template>
                            </Toolbar>
                            <DataTable
                                rref="dt"
                                dataKey="no"
                                :value="columnitems"
                                v-model:expandedRows="expandedColumn"
                                @keyup.enter="filterPage()"
                                @page="changePage($event)"
                                :filters="filters"
                                :paginator="true"
                                :rowsPerPageOptions="[10, 25, 50]"
                                :first="first"
                                :rows="rows"
                                :totalRecords="total"
                                :lazy="true"
                                v-model:selection="selected_outlet"
                                size="small"
                                exportFilename="MerchantMaster"
                                removableSort
                                resizableColumns
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                                tableStyle="min-width: 5rem;"
                            >
                                <template #header>
                                    <div class="flex flex-wrap gap-2 items-center justify-between mb-3">
                                        <h4 class="m-0">Outlet Master</h4>
                                        <IconField>
                                            <InputIcon>
                                                <i class="pi pi-search" />
                                            </InputIcon>
                                            <InputText v-model="filters['global'].value" placeholder="Search..." class="basis-80" />
                                        </IconField>
                                    </div>
                                </template>
                                <Column expander />
                                <template #expansion="slotProps">
                                    <div class="card">
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Nama Merchant</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full uppercase">
                                                <Tag :value="slotProps.data?.merchant?.MRCName ?? 'N/A'" severity="warn" />
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Nama Outlet</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.outlet }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Tipe Usaha</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.tipe_usaha }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div v-if="slotProps.data.tipe_usaha !== 'INDIVIDU'">
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Kategori</div>
                                                <div class="flex flex-wrap gap-2 text-md w-full">
                                                    {{ slotProps.data.kategori }}
                                                </div>
                                            </div>
                                            <Divider />
                                            <div class="flex flex-col md:flex-row gap-4">
                                                <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Institusi</div>
                                                <div class="flex flex-wrap gap-2 text-md w-full">
                                                    {{ slotProps.data.nama_institusi }}
                                                </div>
                                            </div>
                                            <Divider />
                                            <div v-if="slotProps.data.kategori == 'PEMDA'">
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">PEMDA</div>
                                                    <div class="flex flex-wrap gap-2 text-md w-full">
                                                        {{ slotProps.data.pemda }}
                                                    </div>
                                                </div>
                                                <Divider />
                                                <div class="flex flex-col md:flex-row gap-4">
                                                    <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">DINAS</div>
                                                    <div class="flex flex-wrap gap-2 text-md w-full">
                                                        {{ slotProps.data.dinas }}
                                                    </div>
                                                </div>
                                                <Divider />
                                            </div>
                                        </div>
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Kriteria Merchant</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                <Tag :value="slotProps.data.kriteria_merchant" v-tooltip="slotProps.data.kriteria_merchant_det.ket" severity="contrast" />
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">MCC</div>
                                            <div class="flex flex-row gap-2 text-md w-full">
                                                <Tag :value="slotProps.data.mcc" severity="info" />
                                                /
                                                <Tag :value="slotProps.data.merchant_category.ket_indo" severity="info" />
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Alamat</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.address }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">KTP</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.no_ktp }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">NPWP</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.npwp ?? '-' }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">No. HP</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.no_hp }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Email</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.email }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Legalitas Usaha</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.legalitas_usaha }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">No. Legalitas Usaha</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.no_legalitas_usaha ?? '-' }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">No. Rek</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.no_rek }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">CS</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.cs }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">RO</div>
                                            <div class="flex flex-wrap gap-2 text-md w-full">
                                                {{ slotProps.data.ro }}
                                            </div>
                                        </div>
                                        <Divider />
                                        <div class="flex flex-col md:flex-row gap-4 mt-7">
                                            <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Terminal</div>
                                            <div class="flex flex-wrap gap-5 text-md w-full">
                                                <div v-for="terminal in slotProps.data.terminal" :key="terminal.XID">
                                                    <OverlayBadge :value="terminal.type_terminal" :severity="terminal.type_terminal == 'S' ? 'info' : 'warn'" class="inline-flex">
                                                        <Avatar :label="terminal.TerminalID" size="xlarge" />
                                                    </OverlayBadge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                <Column field="no" header="#" :exportable="false"></Column>
                                <Column field="outlet" header="Outlet" sortable style="max-width: 15rem"></Column>
                                <Column header="Merchant" sortable style="max-width: 25rem">
                                    <template #body="slotProps">
                                        <div v-if="!slotProps.data.merchant" class="text-red-500 font-bold">N/A</div>
                                        <div v-else class="font-bold">{{ slotProps.data.merchant.MRCName }}</div>
                                    </template>
                                </Column>
                                <Column field="kriteria_merchant" header="Kriteria" sortable style="min-width: 3rem">
                                    <template #body="slotProps">
                                        <Tag v-if="slotProps.data.mcc" :value="slotProps.data.kriteria_merchant" v-tooltip="slotProps.data.kriteria_merchant_det.ket" severity="contrast" />
                                    </template>
                                </Column>
                                <Column header="MCC" sortable>
                                    <template #body="slotProps">
                                        <Tag v-if="slotProps.data.mcc" :value="slotProps.data.mcc" v-tooltip="slotProps.data.merchant_category.ket_indo" severity="info" />
                                    </template>
                                </Column>
                                <Column field="tanggal_permohonan" header="Tanggal Permohonan" sortable style="max-width: 7rem"></Column>
                                <Column header="Status Merchant" style="max-width: 7rem">
                                    <template #body="slotProps">
                                        <div v-if="slotProps.data.state_approval == 'CAB_MKR' || slotProps.data.state_approval == 'CAB_CHK'">
                                            <Tag value="Proses Cabang" severity="info" />
                                        </div>
                                        <div v-else-if="slotProps.data.state_approval == 'CNT_MKR'">
                                            <Tag value="Evaluasi Maker" severity="info" />
                                        </div>
                                        <div v-else-if="slotProps.data.state_approval == 'CNT_CHK'">
                                            <Tag value="Evaluasi Checker" severity="info" />
                                        </div>
                                        <div v-else-if="slotProps.data.state_approval == 'REQ_PTEN'">
                                            <Tag value="Proses PTEN" severity="info" />
                                        </div>
                                        <div v-else-if="slotProps.data.state_approval == 'REGISTERED'">
                                            <Tag value="Registered" severity="success" />
                                        </div>
                                    </template>
                                </Column>
                                <Column header="Action" :exportable="false" style="max-width: 10rem">
                                    <template #body="slotProps">
                                        <Button v-if="this.session.level == slotProps.data.state_approval" icon="pi pi-check" class="mr-2" outlined rounded severity="success" v-tooltip="'Approve'" @click="confirmApproval(slotProps.data, true)" />
                                        <Button v-if="this.session.level == slotProps.data.state_approval" icon="pi pi-times" class="mr-2" outlined rounded severity="warn" v-tooltip="'Reject'" @click="confirmApproval(slotProps.data, false)" />
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </TabPanel>
                    <TabPanel value="merchants">
                        <div class="flex flex-row justify-between">
                            <h2 class="text-xl font-semibold mb-4">Daftar Merchants</h2>
                        </div>
                        <div class="grid grid-cols-1 gap-6">
                            <div v-for="merchant in merchants" :key="merchant.XID" :class="['dark:bg-gray-800 bg-slate-300 p-4 rounded-lg', merchant.highlighted ? 'border-2 border-gray-500' : '']">
                                <h3 class="text-lg font-semibold mb-1">{{ merchant.MRCName }}</h3>
                                <p class="mb-8">{{ merchant.outlet.length }} Outlet</p>
                            </div>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
        <Dialog v-model:visible="approveDialog" :style="{ width: '450px' }" header="Approval Merchant" :modal="true">
            <div class="flex flex-wrap items-center gap-4 w-full mb-10">
                <i class="pi pi-exclamation-triangle" />
                <span>
                    {{ this.approvalData.approval ? 'Approve' : 'Reject' }} <b>"{{ this.approvalData.outlet }}"</b>&nbsp;?
                </span>
            </div>
            <div class="flex flex-wrap gap-4 w-full">
                <div v-if="!this.approvalData.approval">
                    <FloatLabel>
                        <Textarea v-model="this.approvalData.rejectDesc" rows="5" cols="52" />
                        <label>Keterangan Penolakan</label>
                    </FloatLabel>
                </div>
            </div>
            <template #footer>
                <Button label="Yes" :icon="approving ? 'pi pi-refresh pi-spin' : 'pi pi-check'" severity="success" @click="approve" />
                <Button label="No" icon="pi pi-times" @click="approveDialog = false" severity="danger" />
            </template>
        </Dialog>
        <Dialog v-model:visible="merge_dialog" :style="{ width: '450px' }" header="Merge Outlet" :modal="true">
            <div class="flex flex-col gap-5">
                <div class="flex flex-wrap gap-4">
                    <div class="flex items-center">
                        <RadioButton v-model="merge_radio" inputId="baru" name="Baru" value="baru" />
                        <label for="baru" class="ml-2">Baru</label>
                    </div>
                    <div class="flex items-center">
                        <RadioButton v-model="merge_radio" inputId="existing" name="Existing" value="existing" />
                        <label for="existing" class="ml-2">Existing</label>
                    </div>
                </div>
                <InputGroup v-if="merge_radio == 'baru'">
                    <InputGroupAddon>
                        <i class="pi pi-sitemap"></i>
                    </InputGroupAddon>
                    <InputText v-model="merchant" placeholder="Nama Merchant" />
                </InputGroup>
                <InputGroup v-if="merge_radio == 'existing'">
                    <InputGroupAddon>
                        <i class="pi pi-sitemap"></i>
                    </InputGroupAddon>
                    <Select v-model="merchant" :options="merchants" filter optionLabel="MRCName" optionValue="XID" placeholder="Pilih existing Merchants" />
                </InputGroup>
                <div v-for="outlet in selected_outlet" :key="outlet.xid" class="dark:bg-gray-800 bg-slate-300 p-4 rounded-lg">
                    <div class="flex flex-row gap-2 justify-between">
                        <h3 class="text-lg font-semibold mb-1">{{ outlet.outlet }}</h3>
                        <Button icon="pi pi-trash" severity="danger" v-tooltip.top="'Unlist'" size="small" rounded outlined @click="unlistOutlet(outlet.xid)" />
                    </div>
                    <div class="flex flex-row gap-2">
                        <Tag :value="outlet.kriteria_merchant" v-tooltip="outlet.kriteria_merchant_det.ket" severity="contrast" />
                        <Tag :value="outlet.mcc" v-tooltip="outlet.merchant_category.ket_indo" severity="info" />
                    </div>
                </div>
            </div>
            <template #footer>
                <Button label="Merge" :icon="merge_state ? 'pi pi-refresh pi-spin' : 'pi pi-check'" severity="success" @click="merge" />
                <Button label="Cancel" icon="pi pi-times" severity="contrast" @click="merge_dialog = false" />
            </template>
        </Dialog>
    </Fluid>
</template>
