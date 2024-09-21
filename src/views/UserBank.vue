<script>
import axiosInstance from '@/services/AxiosInstance';
import { FilterMatchMode } from '@primevue/core/api';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';

export default {
    setup() {
        return {
            toast: useToast(),
            token: localStorage.getItem('qris-merchant-user-token'),
            v$: useVuelidate()
        };
    },
    validations() {
        return {
            formData: {
                unitkerja: { required },
                username: { required },
                level: { required },
                password: { required },
                confirmPass: { required }
            }
        };
    },
    data() {
        return {
            skeleton: true,
            dt: null,
            filters: {
                global: { value: null, matchMode: FilterMatchMode.CONTAINS }
            },
            userDialog: false,
            submitMode: null,
            deactivateUserDialog: false,
            deactivateUsersDialog: false,
            selectedUser: {},
            columnitems: [],
            options: {
                unitkerja: [],
                level: [
                    { value: 'CAB_MKR', name: 'CABANG MAKER' },
                    { value: 'CAB_CHK', name: 'CABANG CHECKER' },
                    { value: 'CNT_MKR', name: 'PUSAT MAKER' },
                    { value: 'CNT_CHK', name: 'PUSAT CHECKER' },
                    { value: 'MON', name: 'MONITORING' },
                    { value: 'ADM', name: 'ADMIN' }
                ]
            },
            formData: {
                id: null,
                unitkerja: null,
                username: null,
                level: null,
                password: null,
                confirmPass: null
            }
        };
    },
    mounted() {
        this.getList();
        this.getCabangs();
    },
    methods: {
        async getList() {
            this.columnitems = [];
            this.skeleton = true;

            try {
                let rows = await axiosInstance(this.token)
                    .get('/user-list')
                    .then((result) => result.data.data);

                rows.forEach((el, idx) => {
                    this.columnitems.push({
                        no: idx + 1,
                        id: el.id,
                        unitkerja: el.cabang.kode ?? '-',
                        unitket: el.cabang.ket ?? '-',
                        username: el.name,
                        status: +el.status,
                        level: el.level ?? '-'
                    });
                });

                this.skeleton = false;
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? 'Terjadi Kesalahan',
                    life: 3000
                });
            }
        },
        async getCabangs() {
            try {
                let cabangs = await axiosInstance(this.token)
                    .get('/cabangs')
                    .then((result) => result.data.data);

                cabangs.forEach((el) => {
                    this.options.unitkerja.push({
                        value: el.kode,
                        name: `(${el.kode}) ${el.ket}`
                    });
                });
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? 'Terjadi Kesalahan',
                    life: 3000
                });
            }
        },
        getStatusLabel(status) {
            switch (status) {
                case 0:
                    return 'NON-ACTIVE';
                case 1:
                    return 'ACTIVE';
                default:
                    return null;
            }
        },
        getStatusSeverity(status) {
            switch (status) {
                case 0:
                    return 'danger';
                case 1:
                    return 'success';
                default:
                    return null;
            }
        },
        formatCurrency(value) {
            if (value) return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            return;
        },
        exportCSV() {
            this.dt.exportCSV();
        },
        openNew() {
            this.selectedUser = {};
            this.submitMode = 'new';

            this.formData.unitkerja = null;
            this.formData.username = null;
            this.formData.level = null;
            this.formData.password = null;
            this.formData.confirmPass = null;

            this.submitted = false;
            this.userDialog = true;
        },
        openEdit(user) {
            this.userDialog = true;
            this.selectedUser = user;
            this.submitMode = 'edit';

            this.formData.id = this.selectedUser.id;
            this.formData.unitkerja = this.selectedUser.unitkerja;
            this.formData.username = this.selectedUser.username;
            this.formData.level = this.selectedUser.level;
        },
        confirmDeactivateUser(user) {
            this.user = user;
            this.deactivateUserDialog = true;
        },
        async toggleActivationUsers() {
            try {
                await axiosInstance(this.token).post('/toggle-activation', this.user);

                let obj = this.columnitems.find((val) => val.id == this.user.id);
                if (obj) obj.status = this.user.status ^ 1;

                this.deactivateUserDialog = false;
                this.user = {};
                this.toast.add({ severity: 'success', summary: 'Successful', detail: obj.status ? 'Users Activated' : 'User Deactivated', life: 3000 });
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? 'Terjadi Kesalahan',
                    life: 3000
                });
            }
        },
        async submitEdit() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                return;
            }

            try {
                await axiosInstance(this.token).put('/user-bank', this.formData);

                this.userDialog = false;
                this.selectedUser = {};
                this.toast.add({ severity: 'success', summary: 'Successful', detail: 'Users Updated', life: 3000 });
                this.getList();
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? 'Terjadi Kesalahan',
                    life: 3000
                });
            }
        },
        async submitForm() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                return;
            }

            try {
                await axiosInstance(this.token).post('/user-bank', this.formData);

                this.columnitems.push({
                    id: this.columnitems.length + 1,
                    unitkerja: this.formData.unitkerja,
                    username: this.formData.username,
                    status: 1,
                    level: this.formData.level
                });

                this.userDialog = false;
                this.selectedUser = {};
                this.toast.add({ severity: 'success', summary: 'Successful', detail: 'Users Added', life: 3000 });
                this.getList();
            } catch (error) {
                console.log(error);
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response?.data?.message ?? 'Terjadi Kesalahan',
                    life: 3000
                });
            }
        }
    }
};
</script>

<template>
    <Fluid>
        <div class="card">
            <div v-if="skeleton">
                <div class="flex flex-row gap-3 mb-6 justify-between border p-5 rounded border-zinc-600">
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
                </div>
                <div class="flex flex-row gap-10 justify-between">
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
                </div>
                <div class="flex flex-row gap-5 mt-5">
                    <Skeleton width="1rem" class="mb-5"></Skeleton>
                    <Skeleton width="1rem" class="mb-5"></Skeleton>
                    <Skeleton width="1rem" class="mb-5"></Skeleton>
                </div>
            </div>
            <div v-else>
                <Toolbar class="mb-6">
                    <template #start>
                        <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                    </template>

                    <template #end>
                        <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                    </template>
                </Toolbar>

                <DataTable
                    ref="dt"
                    removableSort
                    :value="columnitems"
                    dataKey="id"
                    :paginator="true"
                    :rows="10"
                    :filters="filters"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    :rowsPerPageOptions="[10, 25, 50]"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} users"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Manage Users</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column field="no" header="#" style="width: 3rem" :exportable="false"></Column>
                    <Column field="unitkerja" header="Unit Kerja" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Tag :value="slotProps.data.unitkerja" v-tooltip="slotProps.data.unitket" severity="info" />
                        </template>
                    </Column>
                    <Column field="username" header="Username" sortable style="min-width: 16rem"></Column>
                    <Column field="level" header="Level" sortable style="min-width: 10rem">
                        <template #body="slotProps">
                            <div v-if="slotProps.data.level == 'CAB_MKR'">
                                <Tag value="CABANG MAKER" severity="secondary" />
                            </div>
                            <div v-else-if="slotProps.data.level == 'CAB_CHK'">
                                <Tag value="CABANG APPROVER" severity="secondary" />
                            </div>
                            <div v-else-if="slotProps.data.level == 'CNT_MKR'">
                                <Tag value="KANTOR PUSAT MAKER" severity="secondary" />
                            </div>
                            <div v-else-if="slotProps.data.level == 'CNT_CHK'">
                                <Tag value="KANTOR PUSAT APPROVER" severity="secondary" />
                            </div>
                        </template>
                    </Column>
                    <Column field="status" header="Status" sortable style="min-width: 12rem">
                        <template #body="slotProps">
                            <Tag :value="getStatusLabel(slotProps.data.status)" :severity="getStatusSeverity(slotProps.data.status)" />
                        </template>
                    </Column>
                    <Column :exportable="false" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" outlined rounded severity="success" class="mr-2" @click="openEdit(slotProps.data)" v-tooltip="'Edit User'" />
                            <Button
                                :icon="slotProps.data.status ? 'pi pi-minus' : 'pi pi-plus'"
                                outlined
                                rounded
                                :severity="slotProps.data.status ? 'warn' : 'success'"
                                v-tooltip="slotProps.data.status ? 'Deactivate' : 'Activate'"
                                @click="confirmDeactivateUser(slotProps.data)"
                            />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <Dialog v-model:visible="userDialog" :style="{ width: '450px' }" header="User Details" :modal="true">
            <div class="flex flex-col gap-6">
                <div>
                    <label for="unitkerja" class="block font-bold mb-3">Unit Kerja</label>
                    <Select id="unitkerja" v-model="formData.unitkerja" :invalid="v$.formData.unitkerja.$error" :options="options.unitkerja" filter showClear variant="filled" optionLabel="name" optionValue="value" placeholder="Unit Kerja" fluid />
                    <small v-if="v$.formData.unitkerja.$error" class="text-red-500">Unit Kerja is required.</small>
                </div>
                <div>
                    <label for="username" class="block font-bold mb-3">Username</label>
                    <InputText id="username" v-model="formData.username" :invalid="v$.formData.username.$error" required="true" autofocus fluid />
                    <small v-if="v$.formData.username.$error" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="level" class="block font-bold mb-3">Level</label>
                    <Select id="level" v-model="formData.level" :invalid="v$.formData.level.$error" :options="options.level" showClear variant="filled" optionLabel="name" optionValue="value" placeholder="Level" fluid />
                    <small v-if="v$.formData.level.$error" class="text-red-500">Level is required.</small>
                </div>
                <div>
                    <label for="password" class="block font-bold mb-3">Password</label>
                    <Password id="password" v-model="formData.password" :invalid="v$.formData.password.$error" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="true"></Password>
                    <small v-if="v$.formData.password.$error" class="text-red-500">Password is required.</small>
                </div>
                <div>
                    <label for="confirmpass" class="block font-bold mb-3">Confirm Password</label>
                    <Password id="confirmpass" v-model="formData.confirmPass" :invalid="v$.formData.confirmPass.$error" placeholder="Password" :toggleMask="true" class="mb-4" fluid :feedback="false"></Password>
                    <small v-if="v$.formData.confirmPass.$error" class="text-red-500">Confirm Password is required.</small>
                    <small v-if="formData.password !== formData.confirmPass" class="text-red-500">Confirm Password is not match</small>
                </div>
            </div>

            <template #footer>
                <Button label="Cancel" icon="pi pi-times" text @click="userDialog = false" />
                <Button v-if="submitMode == 'new'" label="Save" icon="pi pi-check" @click="submitForm" />
                <Button v-if="submitMode == 'edit'" label="Update" icon="pi pi-check" @click="submitEdit" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deactivateUserDialog" :style="{ width: '450px' }" header="Deactivate" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="user">
                    Are you sure you want to {{ user.status == 1 ? 'deactivate' : 'activate' }} <b>{{ user.username }}</b> ?
                </span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deactivateUserDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="toggleActivationUsers" />
            </template>
        </Dialog>
    </Fluid>
</template>
