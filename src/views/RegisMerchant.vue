<script>
import axiosInstance from '@/services/AxiosInstance';
import { useVuelidate } from '@vuelidate/core';
import { email, numeric, required, requiredIf } from '@vuelidate/validators';
import { useToast } from 'primevue/usetoast';

export default {
    setup() {
        return {
            toast: useToast(),
            token: localStorage.getItem('qris-merchant-user-token'),
            v$: useVuelidate()
        };
    },
    data() {
        return {
            options: {
                ktpDisabled: false,
                npwpDisabled: false,
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

            inquiry_process: false,
            inquiry_error_message: null,
            formData: {
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
                email: { email },
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
        this.getKriteria();
    },
    methods: {
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
        async getMerchants() {
            this.formData.mcc = null;
            try {
                let result = await axiosInstance(this.token)
                    .get('/merchants')
                    .then((result) => result.data.data);

                result.map((item) => {
                    this.optionValues.merchants.push({
                        name: item.MRCName ?? 'N/A',
                        value: item.XID
                    });
                });
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.message || error,
                    life: 3000
                });
            }
        },
        async getKriteria() {
            try {
                let result = await axiosInstance(this.token)
                    .get('/kriterias')
                    .then((result) => (result = result.data.data));

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
                    detail: error.response.data.message || error,
                    life: 3000
                });
            }
        },
        async getMCC() {
            this.options.mcc = [];
            this.options.mcc_select_state = true;

            try {
                let result = await axiosInstance(this.token)
                    .get('/mccs/' + this.formData.kriteria_merchant)
                    .then((result) => result.data.data);

                result.map((item) => {
                    this.options.mcc.push({
                        name: `${item.mcc} - ${item.ket_indo}`,
                        value: item.mcc,
                        kriteria: item.kriteria_usaha,
                        disabled: false
                    });
                });
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.message || error,
                    life: 3000
                });
            }

            this.options.mcc_select_state = false;
        },
        resetForm() {
            Object.keys(this.formData).forEach((key) => {
                this.formData[key] = null;
            });
        },
        async submit() {
            this.v$.$touch();
            if (this.v$.$invalid) {
                this.$toast.add({ severity: 'error', summary: 'Submission Error', detail: 'Data belum diisi semua', life: 3000 });
                return;
            }

            try {
                await axiosInstance(this.token).post('/merchant', this.formData);
                this.$toast.add({ severity: 'success', summary: 'Success', detail: 'Data berhasil ditambahkan', life: 3000 });
                this.resetForm();
            } catch (error) {
                this.$toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.response.data.message || error,
                    life: 3000
                });
            }
        }
    }
};
</script>

<template>
    <Fluid>
        <Toast />
        <div class="flex lg:flex-row md:flex-col gap-8">
            <div class="lg:w-1/2 lg:order-last md:w-full sticky">
                <div class="sticky top-24">
                    <div class="card p-5 mb-5">
                        <div class="font-semibold text-xl">TIPE USAHA</div>
                    </div>
                    <div class="card mb-5">
                        <div class="font-semibold text-xl mb-5">PEMDA</div>
                        <div class="flex flex-wrap">
                            SKPD/OPD yang merupakan perangkat Pemerintah Daerah (Provinsi maupun Kabupaten/Kota) yang mengelola Penerimaan Daerah. Input Nama Merchant sesuai Jenis Retribusi. Pilih Nama Pemda dan input Nama Dinas yang mengajukan (jika
                            terlalu panjang gunakan singkatan contoh BPKPD
                        </div>
                    </div>
                    <div class="card mb-5">
                        <div class="font-semibold text-xl mb-5">INSTITUSI</div>
                        <div class="flex flex-wrap">
                            Kategori jenis usaha berbentuk CV atau PT atau yayasan dimana institusi ini dibentuk menggunakan Akta Notaris dan memiliki izin usaha sebagai institusi dan bukan termasuk kategori Pemerintah. Usaha kategori ini menggunakan
                            rekening non perorangan pada BSG. Input Nama Institusi sesuai yang tertera pada Akte Pendirian Input Nama Merchant sesuai nama Tempat Usaha ditambah dengan lokasi contoh: Baskin Robbins Malalayang
                        </div>
                    </div>
                    <div class="card mb-5">
                        <div class="font-semibold text-xl mb-5">INDIVIDU</div>
                        <div class="flex flex-wrap">
                            Merupakan kategori jenis usaha yang tidak berbadan hukum dan dikelola secara pribadi dan belum lengkap izin usahanya. Usaha kategori individu menggunakan rekening perorangan pada BSG. Contoh UMKM atau warung makan atau
                            jasa lain. Input Nama Merchant sesuai dengan nama tempat usaha ditambah dengan lokasi contoh: Warung Nyam Manado
                        </div>
                    </div>
                </div>
            </div>
            <div class="lg:w-3/4 md:w-full">
                <form @submit.prevent="submit" class="mb-10">
                    <div class="flex">
                        <div class="card flex flex-col gap-4 w-full">
                            <div class="font-semibold text-xl">TIPE MERCHANT</div>
                            <div>
                                <label class="block mb-3">Tipe Usaha</label>
                                <Select
                                    :disabled="inquiry_process"
                                    id="tipe_usaha"
                                    v-model="formData.tipe_usaha"
                                    :invalid="v$.formData.tipe_usaha.$error"
                                    :options="options.tipe_usaha"
                                    @change="changeFormMeta"
                                    optionLabel="name"
                                    optionValue="value"
                                    showClear
                                    variant="filled"
                                    fluid
                                />
                            </div>
                            <div v-if="formData.tipe_usaha == 'BADAN_USAHA'">
                                <label class="block mb-3">Kategori</label>
                                <Select
                                    :disabled="inquiry_process"
                                    id="kategori"
                                    v-model="formData.kategori"
                                    :invalid="v$.formData.kategori.$error"
                                    :options="options.kategori"
                                    optionLabel="name"
                                    optionValue="value"
                                    @change="changeKriteria"
                                    showClear
                                    variant="filled"
                                    fluid
                                />
                            </div>
                            <div v-if="formData.kategori == 'INSTITUSI'">
                                <label class="block mb-3">Nama Institusi</label>
                                <InputText :disabled="inquiry_process" id="nama_institusi" v-model="formData.nama_institusi" :invalid="v$.formData.nama_institusi.$error" type="text" />
                            </div>
                            <div v-if="formData.kategori == 'PEMDA'" class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-wrap gap-2 w-3/4">
                                    <label>Pemda</label>
                                    <Select
                                        :disabled="inquiry_process"
                                        id="pemda"
                                        v-model="formData.pemda"
                                        :invalid="v$.formData.pemda.$error"
                                        :options="options.pemda"
                                        optionLabel="name"
                                        optionValue="value"
                                        filter
                                        showClear
                                        variant="filled"
                                        class="w-full"
                                        fluid
                                    />
                                </div>
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label>Dinas</label>
                                    <InputText :disabled="inquiry_process" id="dinas" v-model="formData.dinas" :invalid="v$.formData.dinas.$error" type="text" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex mt-5">
                        <div class="card flex flex-col gap-4 w-full">
                            <div class="font-semibold text-xl">INFORMASI MERCHANT</div>

                            <div>
                                <label class="block mb-3">Nama Merchant</label>
                                <InputText :disabled="inquiry_process" id="nama_merchant" v-model="formData.nama_merchant" :invalid="v$.formData.nama_merchant.$error" type="text" />
                                <!-- <div class="font-semibold pl-1 mt-2">Error message</div> -->
                            </div>
                            <div class="flex flex-col md:flex-row gap-4">
                                <div class="flex flex-wrap gap-2 w-1/2">
                                    <label class="block mb-3">Kode Pos</label>
                                    <InputNumber :disabled="inquiry_process" id="kode_pos" v-model="formData.kode_pos" :invalid="v$.formData.kode_pos.$error" :useGrouping="false" />
                                </div>
                                <div class="flex flex-wrap gap-2 w-full">
                                    <label class="block mb-3">Kota/Kabupaten</label>
                                    <InputText :disabled="inquiry_process" id="kota" v-model="formData.kota" :invalid="v$.formData.kota.$error" type="text" />
                                </div>
                            </div>
                            <div>
                                <label class="block mb-3">Alamat Merchant</label>
                                <InputText :disabled="inquiry_process" id="alamat_merchant" v-model="formData.alamat_merchant" :invalid="v$.formData.alamat_merchant.$error" type="text" />
                            </div>
                            <div>
                                <label class="block mb-3">No. KTP</label>
                                <InputText id="no_ktp" v-model="formData.no_ktp" :invalid="v$.formData.no_ktp.$error" :disabled="inquiry_process || formData.tipe_usaha == 'BADAN_USAHA'" type="number" />
                            </div>
                            <div>
                                <label class="block mb-3">NPWP</label>
                                <InputMask id="npwp" v-model="formData.npwp" :invalid="v$.formData.npwp.$error" :value="formData.npwp" :disabled="inquiry_process || formData.tipe_usaha == 'INDIVIDU'" mask="99.999.999.9-999.999" />
                            </div>
                            <div>
                                <label class="block mb-3">No. HP</label>
                                <InputMask :disabled="inquiry_process" id="no_hp" v-model="formData.no_hp" :invalid="v$.formData.no_hp.$error" mask="9999999999?9?9" />
                            </div>
                            <div>
                                <label class="block mb-3">Email</label>
                                <InputText :disabled="inquiry_process" id="email" v-model="formData.email" :invalid="v$.formData.email.$error" type="email" placeholder="name@email.com" />
                            </div>
                            <div>
                                <label class="block mb-3">Legalitas Usaha</label>
                                <Select
                                    :disabled="inquiry_process"
                                    id="legalitas_usaha"
                                    v-model="formData.legalitas_usaha"
                                    :invalid="v$.formData.legalitas_usaha.$error"
                                    :options="options.legalitas_usaha"
                                    optionLabel="name"
                                    optionValue="value"
                                    showClear
                                    variant="filled"
                                    fluid
                                    placeholder="Pilih Legalitas Usaha"
                                />
                            </div>
                            <div v-if="formData.legalitas_usaha !== 'SKMU'">
                                <label class="block mb-3">No. Legalitas Usaha</label>
                                <InputText :disabled="inquiry_process" id="no_legalitas_usaha" v-model="formData.no_legalitas_usaha" :invalid="v$.formData.no_legalitas_usaha.$error" type="text" />
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
                                    :disabled="inquiry_process"
                                    id="kriteria_merchant"
                                    v-model="formData.kriteria_merchant"
                                    :invalid="v$.formData.kriteria_merchant.$error"
                                    :options="options.kriteria_merchant"
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
                                <Select
                                    :disabled="inquiry_process"
                                    id="mcc"
                                    v-model="formData.mcc"
                                    :invalid="v$.formData.mcc.$error"
                                    :options="options.mcc"
                                    :loading="options.mcc_select_state"
                                    optionLabel="name"
                                    optionValue="value"
                                    optionDisabled="disabled"
                                    filter
                                    showClear
                                    variant="filled"
                                    class="w-full"
                                    fluid
                                />
                            </div>
                        </div>
                    </div>
                    <div class="flex mt-5">
                        <div class="card flex flex-col gap-4 w-full">
                            <div class="font-semibold text-xl">DATA CABANG</div>
                            <div>
                                <label class="block mb-3">Tanggal Permohonan</label>
                                <InputText :disabled="inquiry_process" id="tanggal_permohonan" v-model="formData.tanggal_permohonan" :invalid="v$.formData.tanggal_permohonan.$error" type="date" />
                            </div>
                            <div>
                                <label class="block mb-3">NPP CS</label>
                                <InputMask :disabled="inquiry_process" id="cs" mask="9999.9999" v-model="formData.cs" :invalid="v$.formData.cs.$error" />
                            </div>
                            <div>
                                <label class="block mb-3">NPP RO</label>
                                <InputMask :disabled="inquiry_process" id="ro" mask="9999.9999" v-model="formData.ro" :invalid="v$.formData.ro.$error" />
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col md:flex-row gap-4 mt-7">
                        <div class="flex flex-wrap gap-2 w-1/4">
                            <Button icon="pi pi-refresh" label="Reset" severity="secondary" @click="resetForm" />
                        </div>
                        <div class="flex flex-wrap gap-2 w-3/4">
                            <Button type="submit" label="Submit" icon="pi pi-plus" severity="success" class="mr-2 h-12" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </Fluid>
</template>
