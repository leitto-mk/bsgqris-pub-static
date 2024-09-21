<script>
import axiosInstance from '@/services/AxiosInstance';
import { FilterMatchMode } from '@primevue/core/api';
import { useVuelidate } from '@vuelidate/core';
import { email, numeric, required, requiredIf } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';

export default {
    setup() {
        return {
            toast: useToast(),
            token: localStorage.getItem('qris-merchant-user-token'),
            session: JSON.parse(localStorage.getItem('qris-merchant-user-data')),
            v$: useVuelidate()
        };
    },
    data() {
        return {
            //Component State
            skeleton: false,
            listMode: true,
            editMode: false,
            approving: false,
            breadcrumb: {
                home: {
                    is_home: true,
                    label: 'Daftar Merchant',
                    icon: 'pi pi-list'
                },
                items: [{ label: 'List' }]
            },

            //Datatable
            dt: null,
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            page: 0,
            first: 0,
            rows: 10,
            total: 0,
            approveDialog: false,
            revisiDialog: false,
            approvalData: {
                xid: null,
                outlet: null,
                approval: null,
                rejectDesc: null
            },
            columnitems: [],
            expandedColumn: {},

            //Edit Form
            inquiry_process: false,
            inquiry_error_message: null,
            updating: false,
            options: {
                tipe_usaha: [
                    { name: 'INDIVIDU', value: 'INDIVIDU' },
                    { name: 'BADAN USAHA', value: 'BADAN_USAHA' }
                ],
                kategori: [
                    { name: 'INSTITUTI NON-PEMDA', value: 'INSTITUSI' },
                    { name: 'PEMDA', value: 'PEMDA' }
                ],
                pemda: [
                    { name: 'Pemprov SULUT'.toUpperCase(), value: 'Pemprov Sulut'.toUpperCase() },
                    { name: 'Pemkot Manado'.toUpperCase(), value: 'Pemkot Manado'.toUpperCase() },
                    { name: 'Pemkot Bitung'.toUpperCase(), value: 'Pemkot Bitung'.toUpperCase() },
                    { name: 'Pemkot Kotamobagu'.toUpperCase(), value: 'Pemkot Kotamobagu'.toUpperCase() },
                    { name: 'Pemkot Tomohon'.toUpperCase(), value: 'Pemkot Tomohon'.toUpperCase() },
                    { name: 'Pemkab Minahasa'.toUpperCase(), value: 'Pemkab Minahasa'.toUpperCase() },
                    { name: 'Pemkab MINSEL'.toUpperCase(), value: 'Pemkab Minsel'.toUpperCase() },
                    { name: 'Pemkab MITRA'.toUpperCase(), value: 'Pemkab Mitra'.toUpperCase() },
                    { name: 'Pemkab MINUT'.toUpperCase(), value: 'Pemkab Minut'.toUpperCase() },
                    { name: 'Pemkab BOLMONG'.toUpperCase(), value: 'Pemkab Bolmong'.toUpperCase() },
                    { name: 'Pemkab BOLMUT'.toUpperCase(), value: 'Pemkab Bolmut'.toUpperCase() },
                    { name: 'Pemkab BOLSEL'.toUpperCase(), value: 'Pemkab Bolsel'.toUpperCase() },
                    { name: 'Pemkab BOLTIM'.toUpperCase(), value: 'Pemkab Boltim'.toUpperCase() },
                    { name: 'Pemkab Sangihe'.toUpperCase(), value: 'Pemkab Sangihe'.toUpperCase() },
                    { name: 'Pemkab Talaud'.toUpperCase(), value: 'Pemkab Talaud'.toUpperCase() },
                    { name: 'Pemkab Sitaro'.toUpperCase(), value: 'Pemkab Sitaro'.toUpperCase() },
                    { name: 'Pemprov Gorontalo'.toUpperCase(), value: 'Pemprov Gorontalo'.toUpperCase() },
                    { name: 'Pemkot Gorontalo'.toUpperCase(), value: 'Pemkot Gorontalo'.toUpperCase() },
                    { name: 'Pemkab Gorontalo'.toUpperCase(), value: 'Pemkab Gorontalo'.toUpperCase() },
                    { name: 'Pemkab Gorut'.toUpperCase(), value: 'Pemkab Gorut'.toUpperCase() },
                    { name: 'Pemkab Bone Bolango'.toUpperCase(), value: 'Pemkab Bone Bolango'.toUpperCase() },
                    { name: 'Pemkab Boalemo'.toUpperCase(), value: 'Pemkab Boalemo'.toUpperCase() },
                    { name: 'Pemkab Pohuwato'.toUpperCase(), value: 'Pemkab Pohuwato'.toUpperCase() }
                ],
                legalitas_usaha: [
                    { name: 'Surat Keterangan Memiliki Usaha', value: 'SKMU' },
                    { name: 'SIUP', value: 'SIUP' },
                    { name: 'NIB', value: 'NIB' },
                    { name: 'Lainnya', value: 'Lainnya' }
                ],
                kriteria_merchant: [],
                mcc_select_state: false,
                mcc: []
            },
            formData: {
                xid: null,
                tipe_usaha: null,
                kategori: null,
                nama_institusi: null,
                pemda: null,
                dinas: null,

                nama_merchant: null,
                kota: null,
                kode_pos: null,
                alamat_merchant: null,
                no_ktp: null,
                npwp: null,
                no_hp: null,
                email: null,
                legalitas_usaha: null,
                no_legalitas_usaha: null,
                no_rek: null,

                kriteria_merchant: null,
                mcc: null,

                tanggal_permohonan: null,
                cs: null,
                ro: null
            }
        };
    },
    validations() {
        return {
            formData: {
                tipe_usaha: { required },
                kategori: {
                    requiredIf: requiredIf(() => this.formData.tipe_usaha == 'BADAN_USAHA')
                },
                nama_institusi: {
                    requiredIf: requiredIf(() => this.formData.kategori == 'INSTITUSI')
                },
                pemda: {
                    requiredIf: requiredIf(() => this.formData.kategori == 'PEMDA')
                },
                dinas: {
                    requiredIf: requiredIf(() => this.formData.kategori == 'PEMDA')
                },

                nama_merchant: { required },
                kota: { required },
                kode_pos: { required, numeric },
                alamat_merchant: { required },
                no_ktp: {
                    numeric,
                    requiredIf: requiredIf(() => this.formData.tipe_usaha == 'INDIVIDU')
                },
                npwp: {
                    requiredIf: requiredIf(() => this.formData.tipe_usaha == 'BADAN_USAHA')
                },
                no_hp: { required },
                email: { required, email },
                legalitas_usaha: { required },
                no_legalitas_usaha: {
                    requiredIf: requiredIf(() => this.formData.legalitas_usaha !== 'SKMU')
                },
                no_rek: { required, numeric },

                kriteria_merchant: { required },
                mcc: { required },

                tanggal_permohonan: { required },
                cs: { required, numeric },
                ro: { required, numeric }
            }
        };
    },
    mounted() {
        this.getOutlets();
        this.getKriteria();
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

                result.data.forEach((el, inc) => {
                    this.columnitems.push({
                        //Main
                        xid: el.XID,
                        no: this.first + (inc + 1),
                        outlet: el.outlatName,
                        address: `${el.outlatAddress} ${el.kota} ${el.kdPost}`,
                        kriteria_merchant: el.kriteria,
                        kriteria_merchant_det: el.merchant_criteria,
                        mcc: el.mcc,
                        cs: el.customer_service,
                        ro: el.relationship_officer,
                        tanggal_permohonan: el.tanggal_permohonan,

                        //Expanded
                        revisi: el.reject_desc,
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
                        terminal: el.terminal,

                        //Extra
                        is_approved: el.is_approved,
                        state_approval: el.state_approval,
                        merchant_category: el.merchant_category,

                        raw: el
                    });
                });
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.skeleton = false;
        },
        async getKriteria() {
            try {
                let result = await axiosInstance(this.token)
                    .get('/kriterias')
                    .then((result) => result.data.data);

                result.map((item) => {
                    this.options.kriteria_merchant.push({
                        name: `${item.kode} - ${item.ket}`,
                        value: item.kode,
                        group: item.group,
                        disabled: false
                    });
                });
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }
        },
        async getMCC(kriteria) {
            this.options.mcc = [];
            this.options.mcc_select_state = false;

            try {
                let result = await axiosInstance(this.token)
                    .get('/mccs/' + kriteria)
                    .then((result) => result.data.data);

                result.map((item) => {
                    this.options.mcc.push({
                        name: `${item.mcc} - ${item.ket_indo}`,
                        value: item.mcc,
                        kriteria: item.kriteria_usaha,
                        disabled: false
                    });
                });

                this.options.mcc_select_state = false;
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }
        },
        changeFormMeta() {
            this.formData.kategori = null;
            this.formData.nama_institusi = null;
            this.formData.pemda = null;
            this.formData.dinas = null;
        },
        changeKriteria() {
            this.formData.kriteria_merchant = null;
            this.options.kriteria_merchant.map((obj) => (obj.disabled = this.formData.kategori !== obj.group));
        },
        changeMCC() {
            /** Set Options Disabled */
            // this.options.mcc.map((obj) => {
            //     const hasKriteria = obj.kriteria.some((k) => k.kriteria === this.formData.kriteria_merchant);

            //     return (obj.disabled = hasKriteria ? false : true);
            // });
            this.getMCC(this.formData.kriteria_merchant);
        },
        showRevisi(data) {
            this.revisiDialog = true;
            this.approvalData = {
                xid: data.xid,
                outlet: data.merchant,
                rejectDesc: data.reject_desc
            };
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

                this.toast.add({ severity: 'success', summary: 'Success', detail: 'Approval Adjusted', life: 3000 });

                let obj = this.columnitems.find((val) => val.xid == this.approvalData.xid);
                if (obj) obj.state_approval = result.state_approval;
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.approving = false;
            this.approvalData = {};
            this.approveDialog = false;
        },
        editMerchant(editData) {
            this.toggleComponent();

            this.formData.xid = editData.XID;
            this.formData.tipe_usaha = editData.tipe_usaha;
            this.formData.kategori = editData.kategori;
            this.formData.nama_institusi = editData.nama_institusi;
            this.formData.pemda = editData.pemda;
            this.formData.dinas = editData.dinas;
            this.formData.nama_merchant = editData.outlatName;
            this.formData.kota = editData.kota;
            this.formData.kode_pos = +editData.kdPost;
            this.formData.alamat_merchant = editData.outlatAddress;
            this.formData.no_ktp = editData.ktp;
            this.formData.npwp = editData.npwp;
            this.formData.no_hp = editData.phonenum;
            this.formData.email = editData.email;
            this.formData.legalitas_usaha = editData.legalitas_usaha;
            this.formData.no_legalitas_usaha = editData.no_legalitas_usaha;
            this.formData.no_rek = editData.acc_no;
            this.formData.kriteria_merchant = editData.kriteria;
            this.formData.mcc = editData.mcc;
            this.formData.tanggal_permohonan = editData.tanggal_permohonan;
            this.formData.cs = editData.customer_service;
            this.formData.ro = editData.relationship_officer;

            this.getMCC(editData.kriteria);
        },
        async inquiry() {
            this.inquiry_process = true;

            try {
                let result = await axiosInstance(this.token)
                    .post('/inquiry', {
                        account_no: this.formData.no_rek
                    })
                    .then((result) => result.data.data);

                console.log(result);
            } catch (error) {
                this.inquiry_error_message = error.response.data.message;

                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.message || error.message,
                    life: 3000
                });

                setInterval(() => {
                    this.inquiry_error_message = null;
                }, 10000);
            }

            this.inquiry_process = false;
        },
        async submit() {
            this.updating = true;

            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$toast.add({ severity: 'error', summary: 'Submission Error', detail: 'Data belum lengkap', life: 3000 });
                this.updating = false;
                return;
            }

            try {
                let result = await axiosInstance(this.token)
                    .put(`/merchant/` + this.formData.xid, this.formData)
                    .then((result) => result.data);

                this.$toast.add({ severity: 'success', summary: 'Update Success', detail: result.message, life: 3000 });

                this.resetForm();
                this.toggleComponent();
                this.getOutlets();
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error?.response?.data?.message ?? error,
                    life: 3000
                });
            }

            this.updating = false;
        },
        toggleComponent() {
            if (this.columnitems.length == 0) return;

            this.listMode = !this.listMode;
            this.editMode = !this.editMode;

            this.breadcrumb.items = this.listMode ? [{ label: 'List' }] : [{ label: 'Edit' }];
            if (this.listMode) this.resetForm();
        },
        resetForm() {
            Object.keys(this.formData).forEach((key) => {
                this.formData[key] = null;
            });
        },
        exportCSV() {
            this.dt.exportCSV();
        },
        filterPage() {
            this.search = this.filters.global.value;
            this.page = 0;

            this.getOutlets();
        },
        changePage(event) {
            this.search = this.filters.global.value;
            this.page = +event.page;
            this.first = +event.first;
            this.rows = +event.rows;

            this.getOutlets();
        }
    }
};
</script>

<template>
    <Fluid>
        <Breadcrumb :home="breadcrumb.home" :model="breadcrumb.items" class="rounded mb-4">
            <template #item="{ item }">
                <div v-if="item.is_home">
                    <a class="cursor-pointer" :href="item.url" @click="toggleComponent"> <span :class="item.icon"></span> {{ item.label }} </a>
                </div>
                <div v-else>
                    <a class="cursor-pointer" :href="item.url"> <span :class="item.icon"></span> {{ item.label }} </a>
                </div>
            </template>
            <template #separator> > </template>
        </Breadcrumb>
        <div v-if="listMode" class="card">
            <div v-if="skeleton">
                <div class="flex flex-row-reverse gap-10 justify-between my-7">
                    <Skeleton width="20rem" />
                    <Skeleton width="12rem" height="1.4rem" />
                </div>
                <div class="flex flex-row gap-10 justify-between">
                    <Skeleton width="20rem" class="mb-5"></Skeleton>
                    <Skeleton width="20rem" class="mb-5"></Skeleton>
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
                    selectionMode="single"
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
                            <div v-if="slotProps.data.revisi" class="flex flex-col md:flex-row gap-4 border rounded border-rose-700 p-3 mb-6">
                                <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Catatan Revisi</div>
                                <div class="flex flex-wrap gap-2 text-md w-full uppercase">
                                    {{ slotProps.data.revisi }}
                                </div>
                            </div>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Nama Merchant</div>
                                <div class="flex flex-wrap gap-2 text-md w-full">
                                    {{ slotProps.data.outlet }}
                                </div>
                            </div>
                            <Divider />
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-wrap gap-2 text-md font-bold w-3/4">Tipe Usaha</div>
                                <div class="flex flex-wrap gap-2 text-md w-full">
                                    {{ slotProps.data.tipe_usaha === 'INDIVIDU' ? 'INDIVIDU' : 'BADAN USAHA' }}
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
                                    <div v-if="slotProps.data.terminal.length > 0" class="flex flex-wrap gap-5 text-md w-full">
                                        <div v-for="terminal in slotProps.data.terminal" :key="terminal.XID">
                                            <OverlayBadge :value="terminal.type_terminal" :severity="terminal.type_terminal == 'S' ? 'info' : 'warn'" class="inline-flex">
                                                <Avatar :label="terminal.TerminalID" size="xlarge" />
                                            </OverlayBadge>
                                        </div>
                                    </div>
                                    <div v-else class="font-bold text-orange-500">N/A</div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <Column field="no" header="#" :exportable="false"></Column>
                    <Column field="outlet" header="Merchant" sortable style="max-width: 15rem"></Column>
                    <Column field="address" header="Alamat" sortable style="max-width: 25rem"></Column>
                    <Column field="kriteria_merchant" header="Kriteria" sortable style="max-width: 3rem">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.mcc" :value="slotProps.data.kriteria_merchant" v-tooltip="slotProps.data.kriteria_merchant_det.ket" severity="contrast" />
                        </template>
                    </Column>
                    <Column header="MCC">
                        <template #body="slotProps">
                            <Tag v-if="slotProps.data.mcc" :value="slotProps.data.mcc" v-tooltip="slotProps.data.merchant_category.ket_indo" severity="info" />
                        </template>
                    </Column>
                    <Column field="cs" header="CS" sortable style="max-width: 5rem"></Column>
                    <Column field="ro" header="RO" sortable style="max-width: 5rem"></Column>
                    <Column field="tanggal_permohonan" header="Tanggal Permohonan" sortable style="max-width: 7rem"></Column>
                    <Column header="Status Merchant" style="max-width: 7rem">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.state_approval == 'REVISI'">
                                <Tag value="Butuh Revisi" severity="warn" />
                            </div>
                            <div v-else-if="slotProps.data.state_approval == 'CAB_MKR'">
                                <Tag value="Evaluasi Maker" severity="info" />
                            </div>
                            <div v-else-if="slotProps.data.state_approval == 'CAB_CHK'">
                                <Tag value="Evaluasi Checker" severity="info" />
                            </div>
                            <div v-else-if="slotProps.data.state_approval == 'CNT_MKR' || slotProps.data.state_approval == 'CNT_MKR'">
                                <Tag value="Evaluasi Pusat" severity="info" />
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
                            <Button
                                v-if="session.level == 'CAB_MKR' && (slotProps.data.state_approval == 'REVISI' || slotProps.data.state_approval == 'CAB_MKR')"
                                icon="pi pi-pencil"
                                outlined
                                rounded
                                severity="help"
                                v-tooltip="'Edit'"
                                class="mr-2"
                                @click="editMerchant(slotProps.data.raw)"
                            />
                            <Button v-if="this.session.level == slotProps.data.state_approval" icon="pi pi-check" class="mr-2" outlined rounded severity="success" v-tooltip="'Approve'" @click="confirmApproval(slotProps.data, true)" />
                            <Button v-if="this.session.level == slotProps.data.state_approval" icon="pi pi-times" class="mr-2" outlined rounded severity="danger" v-tooltip="'Reject'" @click="confirmApproval(slotProps.data, false)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>
        <form v-if="editMode" @submit.prevent="submit">
            <div class="flex">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">TIPE MERCHANT</div>
                    <div>
                        <label class="block mb-3">Tipe Usaha</label>
                        <Select id="tipe_usaha" v-model="formData.tipe_usaha" :invalid="v$.formData.tipe_usaha.$error" :options="options.tipe_usaha" @change="changeFormMeta" optionLabel="name" optionValue="value" showClear variant="filled" fluid />
                    </div>
                    <div v-if="formData.tipe_usaha == 'BADAN_USAHA'">
                        <label class="block mb-3">Kategori</label>
                        <Select id="kategori" v-model="formData.kategori" :invalid="v$.formData.kategori.$error" :options="options.kategori" optionLabel="name" optionValue="value" @change="changeKriteria" showClear variant="filled" fluid />
                    </div>
                    <div v-if="formData.kategori == 'INSTITUSI'">
                        <label class="block mb-3">Nama Institusi</label>
                        <InputText id="nama_institusi" v-model="formData.nama_institusi" :invalid="v$.formData.nama_institusi.$error" type="text" />
                    </div>
                    <div v-if="formData.kategori == 'PEMDA'" class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-wrap gap-2 w-3/4">
                            <label>Pemda</label>
                            <Select id="pemda" v-model="formData.pemda" :invalid="v$.formData.pemda.$error" :options="options.pemda" optionLabel="name" optionValue="value" filter showClear variant="filled" class="w-full" fluid />
                        </div>
                        <div class="flex flex-wrap gap-2 w-full">
                            <label>Dinas</label>
                            <InputText id="dinas" v-model="formData.dinas" :invalid="v$.formData.dinas.$error" type="text" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex mt-5">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">INFORMASI MERCHANT</div>

                    <div>
                        <label class="block mb-3">Nama Merchant</label>
                        <InputText id="nama_merchant" v-model="formData.nama_merchant" :invalid="v$.formData.nama_merchant.$error" type="text" />
                        <!-- <div class="font-semibold pl-1 mt-2">Error message</div> -->
                    </div>
                    <div class="flex flex-col md:flex-row gap-4">
                        <div class="flex flex-wrap gap-2 w-1/2">
                            <label class="block mb-3">Kode Pos</label>
                            <InputNumber id="kode_pos" v-model="formData.kode_pos" :invalid="v$.formData.kode_pos.$error" :useGrouping="false" />
                        </div>
                        <div class="flex flex-wrap gap-2 w-full">
                            <label class="block mb-3">Kota/Kabupaten</label>
                            <InputText id="kota" v-model="formData.kota" :invalid="v$.formData.kota.$error" type="text" />
                        </div>
                    </div>
                    <div>
                        <label class="block mb-3">Alamat Merchant</label>
                        <InputText id="alamat_merchant" v-model="formData.alamat_merchant" :invalid="v$.formData.alamat_merchant.$error" type="text" />
                    </div>
                    <div>
                        <label class="block mb-3">No. KTP</label>
                        <InputText id="no_ktp" v-model="formData.no_ktp" :invalid="v$.formData.no_ktp.$error" :disabled="formData.tipe_usaha == 'BADAN_USAHA'" type="number" />
                    </div>
                    <div>
                        <label class="block mb-3">NPWP</label>
                        <InputMask id="npwp" v-model="formData.npwp" :invalid="v$.formData.npwp.$error" :disabled="formData.tipe_usaha == 'INDIVIDU'" mask="99.999.999.9-999.999" />
                    </div>
                    <div>
                        <label class="block mb-3">No. HP</label>
                        <InputMask id="no_hp" v-model="formData.no_hp" :invalid="v$.formData.no_hp.$error" mask="9999-9999-99?9?9" />
                    </div>
                    <div>
                        <label class="block mb-3">Email</label>
                        <InputText id="email" v-model="formData.email" :invalid="v$.formData.email.$error" type="email" placeholder="name@email.com" />
                    </div>
                    <div>
                        <label class="block mb-3">Legalitas Usaha</label>
                        <Select id="legalitas_usaha" v-model="formData.legalitas_usaha" :invalid="v$.formData.legalitas_usaha.$error" :options="options.legalitas_usaha" optionLabel="name" optionValue="value" showClear variant="filled" fluid />
                    </div>
                    <div v-if="formData.legalitas_usaha !== 'SKMU'">
                        <label class="block mb-3">No. Legalitas Usaha</label>
                        <InputText id="no_legalitas_usaha" v-model="formData.no_legalitas_usaha" :invalid="v$.formData.no_legalitas_usaha.$error" type="text" />
                    </div>
                    <div>
                        <label class="block mb-3">No. Rekening</label>
                        <div class="flex flex-row gap-5 mb-5">
                            <InputText :disabled="inquiry_process" id="no_rek" v-model="formData.no_rek" :invalid="v$.formData.no_rek.$error" type="text" class="basis-3/4" />
                            <Button label="Inquiry" severity="info" :icon="inquiry_process ? 'pi pi-refresh pi-spin' : ''" class="basis-1/4" @click="inquiry()" />
                        </div>
                        <Message v-if="inquiry_error_message" severity="error">{{ inquiry_error_message }}</Message>
                    </div>
                </div>
            </div>
            <div class="flex mt-5">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">KATEGORI MERCHANT</div>
                    <div>
                        <label class="block mb-3">Kriteria Merchant</label>
                        <Select
                            id="kriteria_merchant"
                            v-model="formData.kriteria_merchant"
                            :invalid="v$.formData.kriteria_merchant.$error"
                            :options="options.kriteria_merchant"
                            :loading="options.mcc_select_state"
                            optionLabel="name"
                            optionValue="value"
                            optionDisabled="disabled"
                            @change="changeMCC"
                            filter
                            showClear
                            variant="filled"
                            class="w-full"
                            fluid
                        />
                    </div>
                    <div>
                        <label class="block mb-3">MCC</label>
                        <Select id="mcc" v-model="formData.mcc" :invalid="v$.formData.mcc.$error" :options="options.mcc" optionLabel="name" optionValue="value" optionDisabled="disabled" filter showClear variant="filled" class="w-full" fluid />
                    </div>
                </div>
            </div>
            <div class="flex mt-5">
                <div class="card flex flex-col gap-4 w-full">
                    <div class="font-semibold text-xl">DATA CABANG</div>
                    <div>
                        <label class="block mb-3">Tanggal Permohonan</label>
                        <InputText id="tanggal_permohonan" v-model="formData.tanggal_permohonan" :invalid="v$.formData.tanggal_permohonan.$error" type="date" />
                    </div>
                    <div>
                        <label class="block mb-3">NPP CS</label>
                        <InputMask id="cs" mask="9999.9999" v-model="formData.cs" :invalid="v$.formData.cs.$error" />
                    </div>
                    <div>
                        <label class="block mb-3">NPP RO</label>
                        <InputMask id="ro" mask="9999.9999" v-model="formData.ro" :invalid="v$.formData.ro.$error" />
                    </div>
                </div>
            </div>
            <div class="flex flex-col md:flex-row gap-4 mt-7">
                <div class="flex flex-wrap gap-2 w-1/4">
                    <Button icon="pi pi-reply transform rotate-180" label="Back" severity="secondary" @click="toggleComponent" />
                </div>
                <div class="flex flex-wrap gap-2 w-3/4">
                    <Button type="submit" label="Submit" :icon="updating ? 'pi pi-plus' : 'pi pi-refresh pi-spin'" severity="success" class="mr-2 h-12" />
                </div>
            </div>
        </form>
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
        <Dialog v-model:visible="revisiDialog" :style="{ width: '450px' }" header="Approval Merchant" :modal="true">
            <div class="flex flex-wrap items-center gap-4 w-full mb-10">
                <i class="pi pi-exclamation-triangle" />
                <span>
                    Merchant <b>"{{ this.approvalData.outlet }}"</b>&nbsp;?
                </span>
            </div>
            <div class="flex flex-wrap gap-4 w-full">
                <FloatLabel>
                    <Textarea v-model="this.approvalData.rejectDesc" rows="5" cols="52" />
                    <label>Keterangan Penolakan</label>
                </FloatLabel>
            </div>
        </Dialog>
    </Fluid>
</template>
